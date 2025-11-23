import { PrismaClient, JobStatus } from '@prisma/client';
import type {
  JobData,
  ScrapingJobData,
  JobResult,
  JobListener,
  QueueStats,
  JobEventData,
  JOB_PRIORITIES,
  JOB_EVENTS,
  QueueConfig,
  JobMetrics
} from '../types';

export class ScrapingQueue {
  private queue: Map<string, JobData> = new Map();
  private processing: Set<string> = new Set();
  private completed: Map<string, JobResult> = new Map();
  private failed: Map<string, { error: string; timestamp: Date }> = new Map();
  private listeners: JobListener[] = [];
  private prisma: PrismaClient;
  private config: QueueConfig;
  private metrics: JobMetrics;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(prisma: PrismaClient, config?: Partial<QueueConfig>) {
    this.prisma = prisma;
    this.config = {
      maxSize: 1000,
      defaultPriority: JOB_PRIORITIES.NORMAL,
      enableMetrics: true,
      cleanupInterval: 300000, // 5 minutes
      maxAge: 86400000, // 24 hours
      ...config
    };

    this.metrics = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageExecutionTime: 0,
      throughput: 0,
      errorRate: 0,
      peakConcurrency: 0,
      queueLatency: 0
    };

    if (this.config.enableMetrics) {
      this.startCleanupTimer();
    }
  }

  async add(data: ScrapingJobData, priority: number = this.config.defaultPriority): Promise<string> {
    if (this.queue.size >= this.config.maxSize) {
      throw new Error(`Queue is full (max: ${this.config.maxSize})`);
    }

    try {
      const scrapingJob = await this.prisma.scrapingJob.create({
        data: {
          sourceId: data.sourceId,
          status: 'QUEUED',
          priority,
          config: data.config || {},
          maxResults: data.maxResults || 100,
        },
      });

      const jobData: JobData = {
        id: scrapingJob.id,
        type: 'SCRAPING',
        payload: data,
        createdAt: new Date(),
        priority,
      };

      this.queue.set(jobData.id, jobData);
      this.updateMetrics('created');

      this.emit({
        jobId: jobData.id,
        event: 'created',
        data: { sourceName: data.sourceName, priority },
        timestamp: new Date(),
      });

      console.log(`✅ [ScrapingQueue] Job creado: ${data.sourceName} (${jobData.id}) - Prioridad: ${priority}`);

      return jobData.id;

    } catch (error) {
      console.error('[ScrapingQueue] Error creando job:', error);
      throw error;
    }
  }

  async addBulk(jobs: Array<{ data: ScrapingJobData; priority?: number }>): Promise<string[]> {
    const jobIds: string[] = [];

    for (const job of jobs) {
      try {
        const jobId = await this.add(job.data, job.priority);
        jobIds.push(jobId);
      } catch (error) {
        console.error(`[ScrapingQueue] Error en job bulk para ${job.data.sourceName}:`, error);
      }
    }

    console.log(`✅ [ScrapingQueue] ${jobIds.length}/${jobs.length} jobs bulk añadidos`);
    return jobIds;
  }

  async getNext(): Promise<JobData | null> {
    const jobs = Array.from(this.queue.values())
      .filter(job => !this.processing.has(job.id))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const nextJob = jobs[0] || null;

    if (nextJob && this.config.enableMetrics) {
      const queueTime = Date.now() - nextJob.createdAt.getTime();
      this.metrics.queueLatency = (this.metrics.queueLatency + queueTime) / 2;
    }

    return nextJob;
  }

  async startProcessing(jobId: string): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue`);
    }

    this.processing.add(jobId);
    this.updateMetrics('started');

    try {
      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      this.emit({
        jobId,
        event: 'started',
        timestamp: new Date(),
      });

      console.log(`🔄 [ScrapingQueue] Job iniciado: ${jobId}`);

    } catch (error) {
      console.error(`[ScrapingQueue] Error actualizando status a RUNNING para ${jobId}:`, error);
      this.processing.delete(jobId);
      throw error;
    }
  }

  async updateProgress(jobId: string, percentage: number, message: string): Promise<void> {
    try {
      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          progress: percentage,
          statusMessage: message,
          updatedAt: new Date(),
        },
      });

      this.emit({
        jobId,
        event: 'progress',
        data: { percentage, message },
        timestamp: new Date(),
      });

    } catch (error) {
      console.error(`[ScrapingQueue] Error actualizando progreso para ${jobId}:`, error);
    }
  }

  async complete(jobId: string, result: JobResult): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) {
      console.warn(`[ScrapingQueue] Job ${jobId} no encontrado al completar`);
      return;
    }

    this.queue.delete(jobId);
    this.processing.delete(jobId);
    this.completed.set(jobId, result);
    this.updateMetrics('completed', result.duration);

    try {
      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          leadsFound: result.data?.totalFound || 0,
          leadsCreated: result.data?.totalCreated || result.data?.totalScraped || 0,
          duration: Math.round(result.duration / 1000),
          progress: 100,
          statusMessage: 'Completado exitosamente',
          results: result.data || {},
        },
      });

      this.emit({
        jobId,
        event: 'completed',
        data: result,
        timestamp: new Date(),
      });

      console.log(`✅ [ScrapingQueue] Job completado: ${jobId} - ${result.data?.totalCreated || 0} leads creados`);

    } catch (error) {
      console.error(`[ScrapingQueue] Error actualizando job completado ${jobId}:`, error);
    }
  }

  async fail(jobId: string, error: string, retryable: boolean = true): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) {
      console.warn(`[ScrapingQueue] Job ${jobId} no encontrado al fallar`);
      return;
    }

    this.queue.delete(jobId);
    this.processing.delete(jobId);
    this.failed.set(jobId, { error, timestamp: new Date() });
    this.updateMetrics('failed');

    try {
      const updateData: any = {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error.substring(0, 1000), // Limit error message length
        statusMessage: `Error: ${error.substring(0, 100)}...`,
      };

      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: updateData,
      });

      this.emit({
        jobId,
        event: 'failed',
        data: { error, retryable },
        timestamp: new Date(),
      });

      console.error(`❌ [ScrapingQueue] Job fallido: ${jobId} - ${error}`);

      if (retryable) {
        console.log(`🔄 [ScrapingQueue] Job ${jobId} marcado como reintentable`);
      }

    } catch (dbError) {
      console.error(`[ScrapingQueue] Error actualizando job fallido ${jobId}:`, dbError);
    }
  }

  async cancel(jobId: string): Promise<boolean> {
    const job = this.queue.get(jobId);

    if (this.processing.has(jobId)) {
      console.warn(`[ScrapingQueue] No se puede cancelar job en proceso: ${jobId}`);
      return false;
    }

    if (job) {
      this.queue.delete(jobId);
    }

    try {
      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
          statusMessage: 'Cancelado por el usuario',
        },
      });

      this.emit({
        jobId,
        event: 'cancelled',
        timestamp: new Date(),
      });

      console.log(`🛑 [ScrapingQueue] Job cancelado: ${jobId}`);
      return true;

    } catch (error) {
      console.error(`[ScrapingQueue] Error cancelando job ${jobId}:`, error);
      return false;
    }
  }

  async getStats(): Promise<QueueStats> {
    try {
      const dbStats = await this.prisma.scrapingJob.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const stats = {
        waiting: this.queue.size - this.processing.size,
        active: this.processing.size,
        completed: dbStats.find(s => s.status === 'COMPLETED')?._count || 0,
        failed: dbStats.find(s => s.status === 'FAILED')?._count || 0,
        total: this.queue.size,
      };

      return stats;

    } catch (error) {
      console.error('[ScrapingQueue] Error obteniendo estadísticas:', error);
      return {
        waiting: this.queue.size - this.processing.size,
        active: this.processing.size,
        completed: this.completed.size,
        failed: this.failed.size,
        total: this.queue.size,
      };
    }
  }

  async getJob(jobId: string): Promise<JobData | null> {
    return this.queue.get(jobId) || null;
  }

  async getJobResult(jobId: string): Promise<JobResult | null> {
    return this.completed.get(jobId) || null;
  }

  async getJobsByStatus(status: 'waiting' | 'active' | 'completed' | 'failed'): Promise<JobData[]> {
    switch (status) {
      case 'waiting':
        return Array.from(this.queue.values()).filter(job => !this.processing.has(job.id));
      case 'active':
        return Array.from(this.queue.values()).filter(job => this.processing.has(job.id));
      case 'completed':
        return []; // Could implement if needed
      case 'failed':
        return []; // Could implement if needed
      default:
        return [];
    }
  }

  on(listener: JobListener): void {
    this.listeners.push(listener);
  }

  off(listener: JobListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private emit(event: JobEventData): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[ScrapingQueue] Error en listener:', error);
      }
    });
  }

  private updateMetrics(event: 'created' | 'started' | 'completed' | 'failed', duration?: number): void {
    if (!this.config.enableMetrics) return;

    switch (event) {
      case 'created':
        this.metrics.totalJobs++;
        break;
      case 'completed':
        this.metrics.completedJobs++;
        if (duration) {
          const totalTime = this.metrics.averageExecutionTime * (this.metrics.completedJobs - 1) + duration;
          this.metrics.averageExecutionTime = totalTime / this.metrics.completedJobs;
        }
        break;
      case 'failed':
        this.metrics.failedJobs++;
        break;
    }

    this.metrics.peakConcurrency = Math.max(this.metrics.peakConcurrency, this.processing.size);
    this.metrics.errorRate = this.metrics.totalJobs > 0 ?
      (this.metrics.failedJobs / this.metrics.totalJobs) * 100 : 0;
    this.metrics.lastProcessedAt = new Date();
  }

  getMetrics(): JobMetrics {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Calculate throughput (jobs completed in last minute)
    const recentCompleted = Array.from(this.completed.values())
      .filter(result => now - result.processedAt.getTime() < oneMinute).length;

    this.metrics.throughput = recentCompleted;

    return { ...this.metrics };
  }

  async cleanup(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    try {
      const result = await this.prisma.scrapingJob.deleteMany({
        where: {
          status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
          completedAt: { lt: cutoffDate },
        },
      });

      // Clean up in-memory data
      const cutoffTime = cutoffDate.getTime();
      for (const [jobId, result] of this.completed.entries()) {
        if (result.processedAt.getTime() < cutoffTime) {
          this.completed.delete(jobId);
        }
      }

      for (const [jobId, failure] of this.failed.entries()) {
        if (failure.timestamp.getTime() < cutoffTime) {
          this.failed.delete(jobId);
        }
      }

      console.log(`🧹 [ScrapingQueue] Limpiados ${result.count} jobs antiguos`);
      return result.count;

    } catch (error) {
      console.error('[ScrapingQueue] Error en cleanup:', error);
      return 0;
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(console.error);
    }, this.config.cleanupInterval);
  }

  async shutdown(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Wait for active jobs to complete (with timeout)
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.processing.size > 0 && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.processing.size > 0) {
      console.warn(`[ScrapingQueue] Shutdown con ${this.processing.size} jobs aún en proceso`);
    }

    this.listeners.length = 0;
    console.log('🛑 [ScrapingQueue] Queue cerrada');
  }

  size(): number {
    return this.queue.size;
  }

  isProcessing(jobId: string): boolean {
    return this.processing.has(jobId);
  }

  isEmpty(): boolean {
    return this.queue.size === 0;
  }

  isFull(): boolean {
    return this.queue.size >= this.config.maxSize;
  }
}