import { PrismaClient } from '@prisma/client';
import { ScrapingQueue } from './queues/ScrapingQueue';
import { AIProcessingQueue } from './queues/AIProcessingQueue';
import { ScrapingWorker } from './workers/ScrapingWorker';
import { AIProcessingWorker } from './workers/AIProcessingWorker';
import { JobScheduler } from './scheduler/JobScheduler';
import { ScraperManager } from '../scraping/ScraperManager';
import { AIProviderManager } from '../services/admin/AIProviderService';
import type {
  WorkerConfig,
  SchedulerConfig,
  QueueConfig,
  JobListener,
  JobEventData,
  ScrapingJobData,
  AIProcessingJobData,
  LeadEnrichmentJobData,
  BulkJobConfig
} from './types';

export interface JobManagerConfig {
  scraping?: {
    queue?: Partial<QueueConfig>;
    worker?: Partial<WorkerConfig>;
  };
  ai?: {
    queue?: Partial<QueueConfig>;
    worker?: Partial<WorkerConfig>;
  };
  scheduler?: Partial<SchedulerConfig>;
  autoStart?: boolean;
  enableMetrics?: boolean;
  metricsInterval?: number;
}

export class JobManager {
  private prisma: PrismaClient;
  private scraperManager: ScraperManager;
  private aiManager: AIProviderManager;

  // Queues
  private scrapingQueue: ScrapingQueue;
  private aiQueue: AIProcessingQueue;

  // Workers
  private scrapingWorker?: ScrapingWorker;
  private aiWorker?: AIProcessingWorker;

  // Scheduler
  private scheduler?: JobScheduler;

  // Configuration and State
  private config: JobManagerConfig;
  private isStarted: boolean = false;
  private listeners: JobListener[] = [];
  private startTime?: Date;
  private metricsTimer?: NodeJS.Timeout;

  constructor(
    prisma: PrismaClient,
    scraperManager: ScraperManager,
    aiManager: AIProviderManager,
    config?: JobManagerConfig
  ) {
    this.prisma = prisma;
    this.scraperManager = scraperManager;
    this.aiManager = aiManager || AIProviderManager.getInstance();

    this.config = {
      autoStart: true,
      enableMetrics: true,
      metricsInterval: 60000, // 1 minute
      scraping: {
        queue: {
          maxSize: 1000,
          enableMetrics: true,
        },
        worker: {
          concurrency: 3,
          retryAttempts: 3,
          timeout: 300000, // 5 minutes
        },
      },
      ai: {
        queue: {
          maxSize: 2000,
          enableMetrics: true,
        },
        worker: {
          concurrency: 5,
          retryAttempts: 2,
          timeout: 180000, // 3 minutes
        },
      },
      scheduler: {
        enabled: true,
        checkInterval: 60000, // 1 minute
        timezone: 'Europe/Madrid',
      },
      ...config,
    };

    // Initialize queues
    this.scrapingQueue = new ScrapingQueue(prisma, this.config.scraping?.queue);
    this.aiQueue = new AIProcessingQueue(prisma, this.config.ai?.queue);

    // Set up event listeners for cross-queue communication
    this.setupEventListeners();

    console.log('🔧 [JobManager] Inicializado');
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      console.warn('⚠️ [JobManager] Ya está iniciado');
      return;
    }

    this.startTime = new Date();
    console.log('🚀 [JobManager] Iniciando sistema de jobs...');

    try {
      // Initialize workers
      this.scrapingWorker = new ScrapingWorker(
        this.scrapingQueue,
        this.scraperManager,
        this.aiManager,
        this.prisma,
        this.config.scraping?.worker
      );

      this.aiWorker = new AIProcessingWorker(
        this.aiQueue,
        this.aiManager,
        this.prisma,
        this.config.ai?.worker
      );

      // Initialize scheduler
      this.scheduler = new JobScheduler(
        this.prisma,
        this.scrapingQueue,
        this.aiQueue,
        this.config.scheduler
      );

      // Start all components (non-blocking)
      const startPromises = [
        this.scrapingWorker.start(),
        this.aiWorker.start(),
        this.scheduler.start(),
      ];

      // Start them in parallel but don't await
      startPromises.forEach(promise =>
        promise.catch(error => {
          console.error('[JobManager] Error iniciando componente:', error);
        })
      );

      // Start metrics collection if enabled
      if (this.config.enableMetrics) {
        this.startMetricsCollection();
      }

      this.isStarted = true;

      this.emit({
        jobId: 'job-manager',
        event: 'started',
        data: {
          components: ['scraping-worker', 'ai-worker', 'scheduler'],
          config: this.config
        },
        timestamp: new Date(),
      });

      console.log('✅ [JobManager] Sistema de jobs iniciado correctamente');

    } catch (error) {
      console.error('[JobManager] Error iniciando:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isStarted) {
      console.warn('⚠️ [JobManager] No está iniciado');
      return;
    }

    console.log('🛑 [JobManager] Deteniendo sistema de jobs...');

    try {
      // Stop metrics collection
      if (this.metricsTimer) {
        clearInterval(this.metricsTimer);
        this.metricsTimer = undefined;
      }

      // Stop all components
      this.scrapingWorker?.stop();
      this.aiWorker?.stop();
      this.scheduler?.stop();

      // Shutdown queues
      await Promise.all([
        this.scrapingQueue.shutdown(),
        this.aiQueue.shutdown(),
      ]);

      this.isStarted = false;

      this.emit({
        jobId: 'job-manager',
        event: 'completed',
        data: { message: 'JobManager detenido' },
        timestamp: new Date(),
      });

      console.log('✅ [JobManager] Sistema de jobs detenido');

    } catch (error) {
      console.error('[JobManager] Error deteniendo:', error);
      throw error;
    }
  }

  // SCRAPING JOBS
  async addScrapingJob(data: ScrapingJobData, priority?: number): Promise<string> {
    if (!this.isStarted) {
      throw new Error('JobManager no está iniciado');
    }

    return this.scrapingQueue.add(data, priority);
  }

  async addBulkScrapingJobs(jobs: Array<{ data: ScrapingJobData; priority?: number }>): Promise<string[]> {
    if (!this.isStarted) {
      throw new Error('JobManager no está iniciado');
    }

    return this.scrapingQueue.addBulk(jobs);
  }

  // AI PROCESSING JOBS
  async addAIProcessingJob(data: AIProcessingJobData, priority?: number): Promise<string> {
    if (!this.isStarted) {
      throw new Error('JobManager no está iniciado');
    }

    return this.aiQueue.add(data, priority);
  }

  async addBulkAIAnalysis(leadIds: string[], operation = 'ANALYZE' as const, priority?: number): Promise<string[]> {
    if (!this.isStarted) {
      throw new Error('JobManager no está iniciado');
    }

    return this.aiQueue.addBulkAnalysis(leadIds, operation, priority);
  }

  async addLeadEnrichment(data: LeadEnrichmentJobData, priority?: number): Promise<string> {
    if (!this.isStarted) {
      throw new Error('JobManager no está iniciado');
    }

    return this.aiQueue.addLeadEnrichment(data, priority);
  }

  // BULK OPERATIONS
  async processBulkLeads(
    leadIds: string[],
    operations: Array<{ operation: 'ANALYZE' | 'SCORE' | 'GENERATE_PITCH' | 'ENRICH' | 'CLASSIFY' | 'VALIDATE'; priority?: number }>,
    config?: BulkJobConfig
  ): Promise<{ jobIds: string[]; sessionId: string }> {
    if (!this.isStarted) {
      throw new Error('JobManager no está iniciado');
    }

    const sessionId = this.generateSessionId();
    const allJobIds: string[] = [];

    console.log(`🔄 [JobManager] Iniciando procesamiento bulk: ${leadIds.length} leads, ${operations.length} operaciones (${sessionId})`);

    const batchSize = config?.batchSize || 50;
    let completed = 0;
    const total = leadIds.length * operations.length;

    // Process leads in batches
    for (let i = 0; i < leadIds.length; i += batchSize) {
      const batch = leadIds.slice(i, Math.min(i + batchSize, leadIds.length));

      for (const operation of operations) {
        try {
          const jobIds = await this.aiQueue.addBulkAnalysis(batch, operation.operation, operation.priority);
          allJobIds.push(...jobIds);

          completed += batch.length;

          // Report progress
          if (config?.onProgress) {
            config.onProgress(completed, total);
          }

        } catch (error) {
          console.error(`[JobManager] Error en batch operation ${operation.operation}:`, error);

          if (config?.onError) {
            config.onError(error as Error, {
              id: sessionId,
              type: 'BULK_IMPORT',
              payload: { operation: operation.operation, batch },
              createdAt: new Date(),
            });
          }
        }
      }

      // Small delay between batches to avoid overwhelming
      if (i + batchSize < leadIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ [JobManager] Procesamiento bulk iniciado: ${allJobIds.length} jobs creados (${sessionId})`);

    return { jobIds: allJobIds, sessionId };
  }

  // SCHEDULING
  async scheduleSourceRun(sourceId: string): Promise<string> {
    if (!this.scheduler) {
      throw new Error('Scheduler no está disponible');
    }

    return this.scheduler.forceRunSource(sourceId);
  }

  getScheduledJobs() {
    if (!this.scheduler) return [];
    return this.scheduler.getAllScheduledJobs();
  }

  getSchedulerStats() {
    if (!this.scheduler) return null;
    return this.scheduler.getSchedulerStats();
  }

  // JOB MANAGEMENT
  async cancelJob(jobId: string, type: 'scraping' | 'ai'): Promise<boolean> {
    switch (type) {
      case 'scraping':
        return this.scrapingQueue.cancel(jobId);
      case 'ai':
        return this.aiQueue.cancel(jobId);
      default:
        throw new Error(`Tipo de job no soportado: ${type}`);
    }
  }

  async getJobStatus(jobId: string, type: 'scraping' | 'ai') {
    switch (type) {
      case 'scraping':
        return {
          job: await this.scrapingQueue.getJob(jobId),
          result: await this.scrapingQueue.getJobResult(jobId),
          isProcessing: this.scrapingQueue.isProcessing(jobId),
        };
      case 'ai':
        return {
          job: await this.aiQueue.getJob(jobId),
          isProcessing: this.aiQueue.activeJobs() > 0, // Simplified check
        };
      default:
        throw new Error(`Tipo de job no soportado: ${type}`);
    }
  }

  // METRICS AND MONITORING
  async getMetrics() {
    const scrapingStats = await this.scrapingQueue.getStats();
    const aiStats = await this.aiQueue.getStats();
    const scrapingMetrics = this.scrapingQueue.getMetrics();
    const aiMetrics = this.aiQueue.getMetrics();

    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;

    return {
      uptime,
      isRunning: this.isStarted,
      startTime: this.startTime,
      scraping: {
        stats: scrapingStats,
        metrics: scrapingMetrics,
        worker: this.scrapingWorker?.getStats(),
      },
      ai: {
        stats: aiStats,
        metrics: aiMetrics,
        worker: this.aiWorker?.getStats(),
      },
      scheduler: this.scheduler?.getSchedulerStats(),
      system: {
        totalActiveJobs: scrapingStats.active + aiStats.active,
        totalQueuedJobs: scrapingStats.waiting + aiStats.waiting,
        totalCompletedJobs: scrapingStats.completed + aiStats.completed,
        totalFailedJobs: scrapingStats.failed + aiStats.failed,
      },
    };
  }

  async getDetailedStats() {
    const metrics = await this.getMetrics();

    // Get AI stats by operation
    const aiStatsByOperation = await this.aiQueue.getStatsByOperation();

    // Get recent database stats
    const dbStats = await this.getDatabaseStats();

    return {
      ...metrics,
      ai: {
        ...metrics.ai,
        byOperation: aiStatsByOperation,
      },
      database: dbStats,
      performance: {
        avgScrapingJobDuration: metrics.scraping.metrics?.averageExecutionTime || 0,
        avgAIJobDuration: metrics.ai.metrics?.averageExecutionTime || 0,
        scrapingThroughput: metrics.scraping.metrics?.throughput || 0,
        aiThroughput: metrics.ai.metrics?.throughput || 0,
        errorRates: {
          scraping: metrics.scraping.metrics?.errorRate || 0,
          ai: metrics.ai.metrics?.errorRate || 0,
        },
      },
    };
  }

  private async getDatabaseStats() {
    try {
      const [totalLeads, todayLeads, scrapingJobs] = await Promise.all([
        this.prisma.companyLead.count(),
        this.prisma.companyLead.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        (this.prisma as any).scrapingJob?.groupBy({
          by: ['status'],
          _count: true,
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }) || Promise.resolve([]),
      ]);

      return {
        totalLeads,
        todayLeads,
        scrapingJobs: (scrapingJobs || []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      console.error('[JobManager] Error obteniendo stats de BD:', error);
      return null;
    }
  }

  // HEALTH CHECK
  async healthCheck() {
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      components: {
        scrapingQueue: this.scrapingQueue.size() < 500, // Healthy if queue not too full
        aiQueue: this.aiQueue.size() < 1000,
        scrapingWorker: this.scrapingWorker?.canAcceptMoreJobs() || false,
        aiWorker: this.aiWorker?.canAcceptMoreJobs() || false,
        scheduler: this.scheduler?.isEnabled() || false,
      },
      issues: [] as string[],
    };

    // Check for issues
    if (this.scrapingQueue.isFull()) {
      health.issues.push('Scraping queue is full');
      health.status = 'degraded';
    }

    if (this.aiQueue.isFull()) {
      health.issues.push('AI queue is full');
      health.status = 'degraded';
    }

    if (!this.isStarted) {
      health.issues.push('JobManager is not started');
      health.status = 'unhealthy';
    }

    const unhealthyComponents = Object.values(health.components).filter(c => !c).length;
    if (unhealthyComponents > 1) {
      health.status = 'unhealthy';
    } else if (unhealthyComponents > 0 && health.status === 'healthy') {
      health.status = 'degraded';
    }

    return health;
  }

  // CLEANUP
  async cleanup(olderThanDays: number = 7): Promise<{ scrapingCleaned: number; aiCleaned: number }> {
    const [scrapingCleaned, aiCleaned] = await Promise.all([
      this.scrapingQueue.cleanup(olderThanDays),
      this.aiQueue.cleanup(olderThanDays),
    ]);

    console.log(`🧹 [JobManager] Cleanup completado: ${scrapingCleaned} scraping jobs, ${aiCleaned} AI jobs`);

    return { scrapingCleaned, aiCleaned };
  }

  // EVENT SYSTEM
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
        console.error('[JobManager] Error en listener:', error);
      }
    });
  }

  private setupEventListeners(): void {
    // Listen to scraping queue events
    this.scrapingQueue.on((event: any) => {
      // Re-emit with context
      this.emit({
        ...event,
        data: { ...event.data, queue: 'scraping' },
      });

      // Auto-trigger AI processing for completed scraping jobs
      if (event.event === 'completed' && event.data?.leads) {
        const leads = event.data.leads;
        setTimeout(async () => {
          try {
            const leadIds = leads.map((lead: any) => lead.id);
            await this.addBulkAIAnalysis(leadIds, 'ANALYZE');
            console.log(`🔄 [JobManager] Auto-triggered AI analysis for ${leadIds.length} leads`);
          } catch (error) {
            console.error('[JobManager] Error auto-triggering AI analysis:', error);
          }
        }, 1000);
      }
    });

    // Listen to AI queue events
    this.aiQueue.on((event: any) => {
      this.emit({
        ...event,
        data: { ...event.data, queue: 'ai' },
      });
    });

    // Listen to scheduler events
    // Note: We'll add this when scheduler is created
  }

  private startMetricsCollection(): void {
    if (!this.config.enableMetrics || this.metricsTimer) return;

    this.metricsTimer = setInterval(async () => {
      try {
        const metrics = await this.getMetrics();

        // Log important metrics
        console.log(`📊 [JobManager] Metrics - Activos: ${metrics.system.totalActiveJobs}, Cola: ${metrics.system.totalQueuedJobs}, Completados: ${metrics.system.totalCompletedJobs}`);

        // You could send to monitoring system here
        // await sendMetricsToMonitoringSystem(metrics);

      } catch (error) {
        console.error('[JobManager] Error recopilando métricas:', error);
      }
    }, this.config.metricsInterval);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // GETTERS
  getScrapingQueue(): ScrapingQueue {
    return this.scrapingQueue;
  }

  getAIQueue(): AIProcessingQueue {
    return this.aiQueue;
  }

  getScheduler(): JobScheduler | undefined {
    return this.scheduler;
  }

  isRunning(): boolean {
    return this.isStarted;
  }

  getConfig(): JobManagerConfig {
    return { ...this.config };
  }
}