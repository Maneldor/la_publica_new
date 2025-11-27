import { PrismaClient } from '@prisma/client';
type JobData = any;
type AIProcessingJobData = any;
type JobResult = any;
type JobListener = any;
type QueueStats = any;
type JobEventData = any;
const JOB_PRIORITIES = { NORMAL: 1, HIGH: 2, LOW: 0 } as any;
type QueueConfig = any;
type JobMetrics = any;
type LeadEnrichmentJobData = any;
type AIOperation = any;

export class AIProcessingQueue {
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
      maxSize: 2000, // Larger queue for AI processing
      defaultPriority: JOB_PRIORITIES.NORMAL,
      enableMetrics: true,
      cleanupInterval: 600000, // 10 minutes
      maxAge: 172800000, // 48 hours
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

  async add(data: AIProcessingJobData, priority: number = this.config.defaultPriority): Promise<string> {
    if (this.queue.size >= this.config.maxSize) {
      throw new Error(`AI Queue is full (max: ${this.config.maxSize})`);
    }

    const jobId = this.generateJobId('ai');

    const jobData: JobData = {
      id: jobId,
      type: this.mapOperationToJobType(data.operation),
      payload: data,
      createdAt: new Date(),
      priority,
    };

    this.queue.set(jobData.id, jobData);
    this.updateMetrics('created');

    this.emit({
      jobId: jobData.id,
      event: 'created',
      data: {
        operation: data.operation,
        leadId: data.leadId,
        priority
      },
      timestamp: new Date(),
    });

    console.log(`✅ [AIProcessingQueue] Job IA creado: ${data.operation} para Lead ${data.leadId} (${jobData.id})`);

    return jobData.id;
  }

  async addBulkAnalysis(leadIds: string[], operation: AIOperation, priority?: number): Promise<string[]> {
    const jobIds: string[] = [];

    for (const leadId of leadIds) {
      try {
        const jobData: AIProcessingJobData = {
          leadId,
          operation,
        };

        const jobId = await this.add(jobData, priority);
        jobIds.push(jobId);
      } catch (error) {
        console.error(`[AIProcessingQueue] Error en job bulk para Lead ${leadId}:`, error);
      }
    }

    console.log(`✅ [AIProcessingQueue] ${jobIds.length}/${leadIds.length} jobs IA bulk añadidos`);
    return jobIds;
  }

  async addLeadEnrichment(data: LeadEnrichmentJobData, priority?: number): Promise<string> {
    const jobData: AIProcessingJobData = {
      leadId: data.leadId,
      operation: 'ENRICH',
      providerId: data.providerId,
      options: {
        enrichmentType: data.enrichmentType,
        validateData: data.validateData,
      }
    };

    return this.add(jobData, priority);
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

  async getNextByOperation(operation: AIOperation): Promise<JobData | null> {
    const jobs = Array.from(this.queue.values())
      .filter(job =>
        !this.processing.has(job.id) &&
        job.payload.operation === operation
      )
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return jobs[0] || null;
  }

  async startProcessing(jobId: string): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) {
      throw new Error(`AI Job ${jobId} not found in queue`);
    }

    this.processing.add(jobId);
    this.updateMetrics('started');

    try {
      // Update lead with AI processing status if applicable
      const data: AIProcessingJobData = job.payload;

      if (data.leadId && data.operation) {
        await (this.prisma as any).company_leads.update({
          where: { id: data.leadId },
          data: {
            aiProcessingStatus: 'PROCESSING',
            aiProcessingStartedAt: new Date(),
          },
        });
      }

      this.emit({
        jobId,
        event: 'started',
        data: { operation: data.operation, leadId: data.leadId },
        timestamp: new Date(),
      });

      console.log(`🔄 [AIProcessingQueue] Job IA iniciado: ${jobId} - ${data.operation}`);

    } catch (error) {
      console.error(`[AIProcessingQueue] Error actualizando status para ${jobId}:`, error);
      this.processing.delete(jobId);
      throw error;
    }
  }

  async updateProgress(jobId: string, percentage: number, message: string, data?: any): Promise<void> {
    try {
      const job = this.queue.get(jobId);
      if (job?.payload.leadId) {
        await (this.prisma as any).company_leads.update({
          where: { id: job.payload.leadId },
          data: {
            aiProcessingProgress: percentage,
            aiProcessingMessage: message,
            updatedAt: new Date(),
          },
        });
      }

      this.emit({
        jobId,
        event: 'progress',
        data: { percentage, message, ...data },
        timestamp: new Date(),
      });

    } catch (error) {
      console.error(`[AIProcessingQueue] Error actualizando progreso para ${jobId}:`, error);
    }
  }

  async complete(jobId: string, result: JobResult): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) {
      console.warn(`[AIProcessingQueue] Job ${jobId} no encontrado al completar`);
      return;
    }

    this.queue.delete(jobId);
    this.processing.delete(jobId);
    this.completed.set(jobId, result);
    this.updateMetrics('completed', result.duration);

    try {
      // Update lead with AI results
      const data: AIProcessingJobData = job.payload;

      if (data.leadId && result.success) {
        const updateData: any = {
          aiProcessingStatus: 'COMPLETED',
          aiProcessingCompletedAt: new Date(),
          aiProcessingProgress: 100,
          aiProcessingMessage: 'Procesamiento completado',
          updatedAt: new Date(),
        };

        // Update specific fields based on operation
        switch (data.operation) {
          case 'ANALYZE':
            updateData.aiScore = result.data?.score;
            updateData.aiScoreReasoning = result.data?.reasoning;
            updateData.aiInsights = result.data?.insights;
            updateData.aiSummary = result.data?.summary;
            break;

          case 'GENERATE_PITCH':
            updateData.suggestedPitch = result.data?.pitch;
            updateData.targetAudience = result.data?.targetAudience;
            break;

          case 'ENRICH':
            if (result.data?.enrichedData) {
              const enriched = result.data.enrichedData;
              Object.assign(updateData, {
                email: enriched.email || updateData.email,
                phone: enriched.phone || updateData.phone,
                website: enriched.website || updateData.website,
                linkedinProfile: enriched.linkedinProfile,
                twitterProfile: enriched.twitterProfile,
                facebookProfile: enriched.facebookProfile,
                description: enriched.description || updateData.description,
                employeeCount: enriched.employeeCount,
                annualRevenue: enriched.annualRevenue,
                foundedYear: enriched.foundedYear,
              });
            }
            break;

          case 'SCORE':
            updateData.qualityScore = result.data?.qualityScore;
            updateData.conversionProbability = result.data?.conversionProbability;
            break;
        }

        await (this.prisma as any).company_leads.update({
          where: { id: data.leadId },
          data: updateData,
        });
      }

      this.emit({
        jobId,
        event: 'completed',
        data: result,
        timestamp: new Date(),
      });

      console.log(`✅ [AIProcessingQueue] Job IA completado: ${jobId} - ${data.operation} para Lead ${data.leadId}`);

    } catch (error) {
      console.error(`[AIProcessingQueue] Error actualizando lead después de completar ${jobId}:`, error);
    }
  }

  async fail(jobId: string, error: string, retryable: boolean = true): Promise<void> {
    const job = this.queue.get(jobId);
    if (!job) {
      console.warn(`[AIProcessingQueue] Job ${jobId} no encontrado al fallar`);
      return;
    }

    this.queue.delete(jobId);
    this.processing.delete(jobId);
    this.failed.set(jobId, { error, timestamp: new Date() });
    this.updateMetrics('failed');

    try {
      const data: AIProcessingJobData = job.payload;

      if (data.leadId) {
        await (this.prisma as any).company_leads.update({
          where: { id: data.leadId },
          data: {
            aiProcessingStatus: 'FAILED',
            aiProcessingCompletedAt: new Date(),
            aiProcessingMessage: `Error: ${error.substring(0, 200)}`,
            updatedAt: new Date(),
          },
        });
      }

      this.emit({
        jobId,
        event: 'failed',
        data: { error, retryable, operation: data.operation, leadId: data.leadId },
        timestamp: new Date(),
      });

      console.error(`❌ [AIProcessingQueue] Job IA fallido: ${jobId} - ${data.operation} - ${error}`);

      if (retryable) {
        console.log(`🔄 [AIProcessingQueue] Job ${jobId} marcado como reintentable`);
      }

    } catch (dbError) {
      console.error(`[AIProcessingQueue] Error actualizando job fallido ${jobId}:`, dbError);
    }
  }

  async cancel(jobId: string): Promise<boolean> {
    const job = this.queue.get(jobId);

    if (this.processing.has(jobId)) {
      console.warn(`[AIProcessingQueue] No se puede cancelar job IA en proceso: ${jobId}`);
      return false;
    }

    if (job) {
      this.queue.delete(jobId);

      try {
        const data: AIProcessingJobData = job.payload;
        if (data.leadId) {
          await (this.prisma as any).company_leads.update({
            where: { id: data.leadId },
            data: {
              aiProcessingStatus: 'CANCELLED',
              aiProcessingMessage: 'Cancelado por el usuario',
              updatedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`[AIProcessingQueue] Error actualizando lead al cancelar ${jobId}:`, error);
      }
    }

    this.emit({
      jobId,
      event: 'cancelled',
      timestamp: new Date(),
    });

    console.log(`🛑 [AIProcessingQueue] Job IA cancelado: ${jobId}`);
    return true;
  }

  async getStats(): Promise<QueueStats> {
    const stats = {
      waiting: this.queue.size - this.processing.size,
      active: this.processing.size,
      completed: this.completed.size,
      failed: this.failed.size,
      total: this.queue.size,
    };

    return stats;
  }

  async getStatsByOperation(): Promise<Record<AIOperation, QueueStats>> {
    const operationStats: Record<string, QueueStats> = {};

    // Initialize all operations
    const operations: AIOperation[] = ['ANALYZE', 'SCORE', 'GENERATE_PITCH', 'ENRICH', 'CLASSIFY', 'VALIDATE'];

    operations.forEach(op => {
      operationStats[op] = {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        total: 0
      };
    });

    // Count waiting and active jobs
    Array.from(this.queue.values()).forEach(job => {
      const operation = job.payload.operation;
      if (operationStats[operation]) {
        if (this.processing.has(job.id)) {
          operationStats[operation].active++;
        } else {
          operationStats[operation].waiting++;
        }
        operationStats[operation].total++;
      }
    });

    // Count completed and failed jobs
    Array.from(this.completed.values()).forEach(result => {
      // Note: We'd need to track operation in the result to make this accurate
      // For now, just add to a general pool
    });

    return operationStats as Record<AIOperation, QueueStats>;
  }

  async getJob(jobId: string): Promise<JobData | null> {
    return this.queue.get(jobId) || null;
  }

  async getJobsByLead(leadId: string): Promise<JobData[]> {
    return Array.from(this.queue.values())
      .filter(job => job.payload.leadId === leadId);
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
        console.error('[AIProcessingQueue] Error en listener:', error);
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

  private generateJobId(prefix: string = 'job'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private mapOperationToJobType(operation: AIOperation): JobData['type'] {
    const mapping: Record<AIOperation, JobData['type']> = {
      'ANALYZE': 'AI_ANALYSIS',
      'SCORE': 'AI_SCORING',
      'GENERATE_PITCH': 'AI_PITCH_GENERATION',
      'ENRICH': 'LEAD_ENRICHMENT',
      'CLASSIFY': 'AI_ANALYSIS',
      'VALIDATE': 'AI_ANALYSIS'
    };

    return mapping[operation] || 'AI_ANALYSIS';
  }

  getMetrics(): JobMetrics {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    const recentCompleted = Array.from(this.completed.values())
      .filter(result => now - result.processedAt.getTime() < oneMinute).length;

    this.metrics.throughput = recentCompleted;

    return { ...this.metrics };
  }

  async cleanup(olderThanDays: number = 2): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffTime = cutoffDate.getTime();

    let cleanedCount = 0;

    for (const [jobId, result] of this.completed.entries()) {
      if (result.processedAt.getTime() < cutoffTime) {
        this.completed.delete(jobId);
        cleanedCount++;
      }
    }

    for (const [jobId, failure] of this.failed.entries()) {
      if (failure.timestamp.getTime() < cutoffTime) {
        this.failed.delete(jobId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 [AIProcessingQueue] Limpiados ${cleanedCount} jobs IA antiguos`);
    }

    return cleanedCount;
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

    const timeout = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.processing.size > 0 && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.processing.size > 0) {
      console.warn(`[AIProcessingQueue] Shutdown con ${this.processing.size} jobs IA aún en proceso`);
    }

    this.listeners.length = 0;
    console.log('🛑 [AIProcessingQueue] Queue IA cerrada');
  }

  size(): number {
    return this.queue.size;
  }

  activeJobs(): number {
    return this.processing.size;
  }

  isEmpty(): boolean {
    return this.queue.size === 0;
  }

  isFull(): boolean {
    return this.queue.size >= this.config.maxSize;
  }
}