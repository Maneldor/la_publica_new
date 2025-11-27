import { PrismaClient } from '@prisma/client';
import { ScrapingQueue } from '../queues/ScrapingQueue';
import { AIProcessingQueue } from '../queues/AIProcessingQueue';
type ScrapingJobData = any;
type SchedulerConfig = any;
type ScheduledJob = any;
type JobListener = any;
type JobEventData = any;
const JOB_PRIORITIES = { NORMAL: 1, HIGH: 2, LOW: 0, URGENT: 3 } as any;
type ScheduleFrequency = any;

export class JobScheduler {
  private prisma: PrismaClient;
  private scrapingQueue: ScrapingQueue;
  private aiQueue: AIProcessingQueue;
  private config: SchedulerConfig;
  private isRunning: boolean = false;
  private checkTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private listeners: JobListener[] = [];
  private scheduledJobs: Map<string, ScheduledJob> = new Map();
  private lastCheck: Date = new Date();

  constructor(
    prisma: PrismaClient,
    scrapingQueue: ScrapingQueue,
    aiQueue: AIProcessingQueue,
    config?: Partial<SchedulerConfig>
  ) {
    this.prisma = prisma;
    this.scrapingQueue = scrapingQueue;
    this.aiQueue = aiQueue;
    this.config = {
      checkInterval: 60000, // 1 minute
      enabled: true,
      timezone: 'Europe/Madrid',
      ...config
    };

    console.log(`🔧 [JobScheduler] Configurado con intervalo: ${this.config.checkInterval}ms`);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ [JobScheduler] Scheduler ya está ejecutándose');
      return;
    }

    if (!this.config.enabled) {
      console.log('⚠️ [JobScheduler] Scheduler deshabilitado en configuración');
      return;
    }

    this.isRunning = true;
    this.lastCheck = new Date();
    console.log('⏰ [JobScheduler] Scheduler iniciado');

    // Load existing scheduled jobs from database
    await this.loadScheduledJobs();

    // Start main checking loop
    this.checkTimer = setInterval(async () => {
      try {
        await this.checkScheduledJobs();
      } catch (error) {
        console.error('[JobScheduler] Error en check de jobs programados:', error);
        this.emit({
          jobId: 'scheduler',
          event: 'failed',
          data: { error: error instanceof Error ? error.message : error },
          timestamp: new Date(),
        });
      }
    }, this.config.checkInterval);

    // Start cleanup timer (run every hour)
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanup();
      } catch (error) {
        console.error('[JobScheduler] Error en cleanup:', error);
      }
    }, 3600000); // 1 hour

    // Initial check
    setTimeout(() => this.checkScheduledJobs(), 5000); // Wait 5 seconds after startup
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = undefined;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    console.log('🛑 [JobScheduler] Scheduler detenido');
  }

  private async loadScheduledJobs(): Promise<void> {
    try {
      console.log('📋 [JobScheduler] Cargando jobs programados desde la base de datos...');

      // Load active lead sources with scheduling
      const activeSources = await (this.prisma as any).leadSource.findMany({
        where: {
          isActive: true,
          frequency: { not: 'MANUAL' },
        },
        include: { user: true },
      });

      console.log(`📋 [JobScheduler] Encontradas ${activeSources.length} fuentes activas programadas`);

      for (const source of activeSources) {
        const scheduledJob: ScheduledJob = {
          id: `source_${source.id}`,
          name: `Scraping: ${source.name}`,
          cron: this.frequencyToCron(source.frequency!),
          jobType: 'SCRAPING',
          payload: {
            sourceId: source.id,
            sourceName: source.name,
            config: source.config,
            maxResults: source.config?.maxResults || 50,
          },
          enabled: source.isActive,
          lastRun: source.lastRun || undefined,
          nextRun: source.nextRun || undefined,
          timezone: this.config.timezone,
        };

        this.scheduledJobs.set(scheduledJob.id, scheduledJob);
      }

      console.log(`✅ [JobScheduler] ${this.scheduledJobs.size} jobs programados cargados`);

    } catch (error) {
      console.error('[JobScheduler] Error cargando jobs programados:', error);
    }
  }

  private async checkScheduledJobs(): Promise<void> {
    const now = new Date();
    this.lastCheck = now;

    console.log(`⏰ [JobScheduler] Verificando jobs programados... (${now.toISOString()})`);

    let jobsScheduled = 0;

    // Check database sources
    try {
      const sourcesDue = await (this.prisma as any).leadSource.findMany({
        where: {
          isActive: true,
          frequency: { not: 'MANUAL' },
          OR: [
            { nextRun: null },
            { nextRun: { lte: now } },
          ],
        },
      });

      for (const source of sourcesDue) {
        try {
          await this.scheduleScrapingJob(source);
          jobsScheduled++;
        } catch (error) {
          console.error(`[JobScheduler] Error programando job para fuente ${source.name}:`, error);
        }
      }

    } catch (error) {
      console.error('[JobScheduler] Error consultando fuentes programadas:', error);
    }

    // Check in-memory scheduled jobs
    for (const [jobId, scheduledJob] of this.scheduledJobs.entries()) {
      if (!scheduledJob.enabled || !scheduledJob.nextRun) continue;

      if (scheduledJob.nextRun <= now) {
        try {
          await this.executeScheduledJob(scheduledJob);
          jobsScheduled++;
        } catch (error) {
          console.error(`[JobScheduler] Error ejecutando job programado ${jobId}:`, error);
        }
      }
    }

    if (jobsScheduled > 0) {
      console.log(`✅ [JobScheduler] ${jobsScheduled} jobs programados ejecutados`);
    }

    // Check for stale AI processing jobs (auto-retry failed AI operations)
    await this.checkStaleAIJobs();
  }

  private async scheduleScrapingJob(source: any): Promise<void> {
    console.log(`⏰ [JobScheduler] Programando job para: ${source.name}`);

    const jobData: ScrapingJobData = {
      sourceId: source.id,
      sourceName: source.name,
      config: source.config || {},
      maxResults: source.config?.maxResults || 50,
    };

    // Add job to scraping queue with higher priority for scheduled jobs
    await this.scrapingQueue.add(jobData, JOB_PRIORITIES.HIGH);

    // Calculate and update next run time
    const now = new Date();
    const nextRun = this.calculateNextRun(source.frequency, now);

    await (this.prisma as any).leadSource?.update({
      where: { id: source.id },
      data: {
        nextRun,
        lastScheduled: new Date(),
      },
    });

    this.emit({
      jobId: `source_${source.id}`,
      event: 'created',
      data: {
        sourceName: source.name,
        frequency: source.frequency,
        nextRun: nextRun?.toISOString(),
      },
      timestamp: new Date(),
    });

    console.log(`✅ [JobScheduler] Job programado para: ${source.name} - Próxima ejecución: ${nextRun?.toISOString()}`);
  }

  private async executeScheduledJob(scheduledJob: ScheduledJob): Promise<void> {
    console.log(`⏰ [JobScheduler] Ejecutando job programado: ${scheduledJob.name}`);

    switch (scheduledJob.jobType) {
      case 'SCRAPING':
        await this.scrapingQueue.add(scheduledJob.payload, JOB_PRIORITIES.HIGH);
        break;

      case 'AI_ANALYSIS':
      case 'AI_SCORING':
      case 'AI_PITCH_GENERATION':
      case 'LEAD_ENRICHMENT':
        await this.aiQueue.add(scheduledJob.payload, JOB_PRIORITIES.HIGH);
        break;

      default:
        console.warn(`[JobScheduler] Tipo de job no soportado: ${scheduledJob.jobType}`);
        return;
    }

    // Update job timing
    scheduledJob.lastRun = new Date();
    scheduledJob.nextRun = this.parseAndCalculateNextRun(scheduledJob.cron);

    this.emit({
      jobId: scheduledJob.id,
      event: 'created',
      data: {
        jobName: scheduledJob.name,
        jobType: scheduledJob.jobType,
        nextRun: scheduledJob.nextRun?.toISOString(),
      },
      timestamp: new Date(),
    });
  }

  private async checkStaleAIJobs(): Promise<void> {
    try {
      // Find leads that have been waiting for AI processing for more than 1 hour
      const staleLeads = await (this.prisma as any).company_leads.findMany({
        where: {
          aiProcessingStatus: 'PENDING',
          createdAt: {
            lt: new Date(Date.now() - 3600000) // 1 hour ago
          }
        },
        take: 10, // Process in batches
      });

      for (const lead of staleLeads) {
        console.log(`🔄 [JobScheduler] Reintentando procesamiento IA para lead: ${lead.companyName}`);

        await this.aiQueue.add({
          leadId: lead.id,
          operation: 'ANALYZE',
        }, JOB_PRIORITIES.NORMAL);

        // Update status to avoid re-processing
        await (this.prisma as any).company_leads.update({
          where: { id: lead.id },
          data: {
            aiProcessingStatus: 'QUEUED',
            updatedAt: new Date(),
          }
        });
      }

      if (staleLeads.length > 0) {
        console.log(`🔄 [JobScheduler] ${staleLeads.length} leads con procesamiento IA pendiente reintentados`);
      }

    } catch (error) {
      console.error('[JobScheduler] Error verificando jobs IA pendientes:', error);
    }
  }

  private calculateNextRun(frequency: ScheduleFrequency, from: Date = new Date()): Date {
    const next = new Date(from);

    switch (frequency) {
      case 'HOURLY':
        next.setHours(next.getHours() + 1);
        break;

      case 'DAILY':
        next.setDate(next.getDate() + 1);
        next.setHours(9, 0, 0, 0); // 9 AM
        break;

      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        next.setHours(9, 0, 0, 0); // Monday 9 AM
        // Set to Monday
        const daysToMonday = (1 - next.getDay() + 7) % 7;
        if (daysToMonday > 0) {
          next.setDate(next.getDate() + daysToMonday);
        }
        break;

      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1); // First day of month
        next.setHours(9, 0, 0, 0);
        break;

      default:
        next.setDate(next.getDate() + 1); // Default to daily
        break;
    }

    return next;
  }

  private frequencyToCron(frequency: ScheduleFrequency): string {
    switch (frequency) {
      case 'HOURLY':
        return '0 * * * *'; // Every hour
      case 'DAILY':
        return '0 9 * * *'; // 9 AM daily
      case 'WEEKLY':
        return '0 9 * * 1'; // 9 AM on Mondays
      case 'MONTHLY':
        return '0 9 1 * *'; // 9 AM on 1st of month
      default:
        return '0 9 * * *'; // Default to daily
    }
  }

  private parseAndCalculateNextRun(cronExpression: string): Date {
    // Simple cron parser for basic expressions
    // In production, you'd use a proper cron library like 'node-cron'
    const now = new Date();

    if (cronExpression === '0 * * * *') {
      // Hourly
      return this.calculateNextRun('HOURLY', now);
    } else if (cronExpression === '0 9 * * *') {
      // Daily at 9 AM
      return this.calculateNextRun('DAILY', now);
    } else if (cronExpression === '0 9 * * 1') {
      // Weekly on Monday at 9 AM
      return this.calculateNextRun('WEEKLY', now);
    } else if (cronExpression === '0 9 1 * *') {
      // Monthly on 1st at 9 AM
      return this.calculateNextRun('MONTHLY', now);
    }

    // Default fallback
    return this.calculateNextRun('DAILY', now);
  }

  async addScheduledJob(job: Omit<ScheduledJob, 'id'>): Promise<string> {
    const jobId = this.generateJobId();

    const scheduledJob: ScheduledJob = {
      ...job,
      id: jobId,
      nextRun: job.nextRun || this.parseAndCalculateNextRun(job.cron),
    };

    this.scheduledJobs.set(jobId, scheduledJob);

    console.log(`✅ [JobScheduler] Job programado añadido: ${job.name} (${jobId})`);

    return jobId;
  }

  removeScheduledJob(jobId: string): boolean {
    const removed = this.scheduledJobs.delete(jobId);

    if (removed) {
      console.log(`🗑️ [JobScheduler] Job programado eliminado: ${jobId}`);
    }

    return removed;
  }

  getScheduledJob(jobId: string): ScheduledJob | undefined {
    return this.scheduledJobs.get(jobId);
  }

  getAllScheduledJobs(): ScheduledJob[] {
    return Array.from(this.scheduledJobs.values());
  }

  async updateJobSchedule(jobId: string, updates: Partial<ScheduledJob>): Promise<boolean> {
    const job = this.scheduledJobs.get(jobId);
    if (!job) return false;

    const updatedJob = { ...job, ...updates };

    if (updates.cron) {
      updatedJob.nextRun = this.parseAndCalculateNextRun(updates.cron);
    }

    this.scheduledJobs.set(jobId, updatedJob);

    console.log(`🔄 [JobScheduler] Job programado actualizado: ${jobId}`);

    return true;
  }

  getSchedulerStats() {
    const now = new Date();
    const jobs = Array.from(this.scheduledJobs.values());

    const enabledJobs = jobs.filter(job => job.enabled);
    const nextJob = enabledJobs
      .filter(job => job.nextRun && job.nextRun > now)
      .sort((a, b) => a.nextRun!.getTime() - b.nextRun!.getTime())[0];

    return {
      isRunning: this.isRunning,
      totalJobs: jobs.length,
      enabledJobs: enabledJobs.length,
      disabledJobs: jobs.length - enabledJobs.length,
      lastCheck: this.lastCheck,
      nextJob: nextJob ? {
        id: nextJob.id,
        name: nextJob.name,
        nextRun: nextJob.nextRun,
        timeUntilNext: nextJob.nextRun ? nextJob.nextRun.getTime() - now.getTime() : null,
      } : null,
      config: this.config,
    };
  }

  private async cleanup(): Promise<void> {
    try {
      console.log('🧹 [JobScheduler] Ejecutando limpieza...');

      // Clean up old scheduled job records (keep last 30 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      // Update scheduled jobs from database (in case they were modified)
      await this.loadScheduledJobs();

      console.log('✅ [JobScheduler] Limpieza completada');

    } catch (error) {
      console.error('[JobScheduler] Error en limpieza:', error);
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
        console.error('[JobScheduler] Error en listener:', error);
      }
    });
  }

  private generateJobId(): string {
    return `scheduled_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  async forceRunSource(sourceId: string): Promise<string> {
    try {
      const source = await (this.prisma as any).leadSource.findUnique({
        where: { id: sourceId }
      });

      if (!source) {
        throw new Error('Fuente no encontrada');
      }

      const jobData: ScrapingJobData = {
        sourceId: source.id,
        sourceName: source.name,
        config: source.config || {},
        maxResults: source.config?.maxResults || 50,
      };

      const jobId = await this.scrapingQueue.add(jobData, JOB_PRIORITIES.URGENT);

      console.log(`🚀 [JobScheduler] Ejecución forzada de fuente: ${source.name} (${jobId})`);

      return jobId;

    } catch (error) {
      console.error(`[JobScheduler] Error en ejecución forzada:`, error);
      throw error;
    }
  }

  isEnabled(): boolean {
    return this.config.enabled && this.isRunning;
  }
}