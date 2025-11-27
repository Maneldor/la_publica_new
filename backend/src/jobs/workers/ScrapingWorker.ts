import { PrismaClient } from '@prisma/client';
type LeadSource = any;
import { ScrapingQueue } from '../queues/ScrapingQueue';
import { ScraperManager } from '../../scraping/ScraperManager';
import { DataExtractor } from '../../scraping/utils/DataExtractor';
type ScrapingJobData = any;
type JobResult = any;
type WorkerConfig = any;
type JobData = any;
type JobErrorType = any;
class WorkerTimeoutError extends Error {
  constructor(jobId: string, timeout: number) {
    super(`Job ${jobId} timed out after ${timeout}ms`);
    this.name = 'WorkerTimeoutError';
  }
}
import { AIProviderManager } from '../../services/admin/AIProviderService';

export class ScrapingWorker {
  private isRunning: boolean = false;
  private queue: ScrapingQueue;
  private scraperManager: ScraperManager;
  private aiManager: AIProviderManager;
  private prisma: PrismaClient;
  private config: WorkerConfig;
  private activeJobs: Set<string> = new Set();
  private workerStats = {
    jobsProcessed: 0,
    jobsCompleted: 0,
    jobsFailed: 0,
    totalLeadsCreated: 0,
    averageJobDuration: 0,
    startTime: new Date(),
  };

  constructor(
    queue: ScrapingQueue,
    scraperManager: ScraperManager,
    aiManager: AIProviderManager,
    prisma: PrismaClient,
    config?: Partial<WorkerConfig>
  ) {
    this.queue = queue;
    this.scraperManager = scraperManager;
    this.aiManager = aiManager;
    this.prisma = prisma;
    this.config = {
      concurrency: 3,
      retryAttempts: 3,
      retryDelay: 5000,
      timeout: 300000, // 5 minutes
      ...config
    };

    console.log(`🔧 [ScrapingWorker] Configurado con concurrencia: ${this.config.concurrency}`);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ [ScrapingWorker] Worker ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.workerStats.startTime = new Date();
    console.log('🚀 [ScrapingWorker] Worker iniciado');

    // Main processing loop
    while (this.isRunning) {
      try {
        if (this.activeJobs.size < this.config.concurrency) {
          const job = await this.queue.getNext();

          if (job) {
            // Process job asynchronously to maintain concurrency
            this.processJob(job)
              .catch(error => {
                console.error(`[ScrapingWorker] Error no capturado procesando job ${job.id}:`, error);
              });
          } else {
            // No jobs available, wait before checking again
            await this.sleep(5000);
          }
        } else {
          // Max concurrency reached, wait for jobs to complete
          await this.sleep(1000);
        }
      } catch (error) {
        console.error('[ScrapingWorker] Error en loop principal:', error);
        await this.sleep(5000);
      }
    }

    // Wait for active jobs to complete
    await this.waitForActiveJobs();
    console.log('🛑 [ScrapingWorker] Worker detenido');
  }

  stop(): void {
    this.isRunning = false;
    console.log('🔄 [ScrapingWorker] Deteniendo worker...');
  }

  private async processJob(job: JobData): Promise<void> {
    const startTime = Date.now();
    this.activeJobs.add(job.id);
    let retryCount = 0;

    try {
      await this.queue.startProcessing(job.id);
      this.workerStats.jobsProcessed++;

      const data: ScrapingJobData = job.payload;
      console.log(`🔄 [ScrapingWorker] Procesando job: ${data.sourceName} (${job.id})`);

      const result = await this.executeScrapingWithTimeout(data, job.id);

      await this.queue.complete(job.id, result);
      this.workerStats.jobsCompleted++;
      this.workerStats.totalLeadsCreated += result.data?.totalCreated || 0;
      this.updateAverageJobDuration(Date.now() - startTime);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const isRetryable = this.isRetryableError(error);

      if (isRetryable && retryCount < this.config.retryAttempts) {
        retryCount++;
        console.log(`🔄 [ScrapingWorker] Reintento ${retryCount}/${this.config.retryAttempts} para job ${job.id}`);

        await this.sleep(this.config.retryDelay * retryCount);
        return this.processJob(job); // Recursive retry
      }

      await this.queue.fail(job.id, errorMessage, isRetryable);
      this.workerStats.jobsFailed++;
      console.error(`❌ [ScrapingWorker] Job fallido definitivamente: ${job.id} - ${errorMessage}`);

    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  private async executeScrapingWithTimeout(data: ScrapingJobData, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new WorkerTimeoutError(jobId, this.config.timeout));
      }, this.config.timeout);

      try {
        await this.queue.updateProgress(jobId, 10, 'Obteniendo configuración de la fuente');

        // 1. Get source configuration from database
        // TODO: Implement leadSource table
        const leadSource = {
          type: 'MANUAL' as LeadSource,
          searchQuery: data.sourceName || 'default',
          config: {
            location: data.location || 'Spain',
            industry: data.industry || 'Technology',
            keywords: data.keywords || [],
            maxResults: data.maxResults || 50
          },
          userId: 'system',
          isActive: true,
          frequency: 'MANUAL'
        };

        await this.queue.updateProgress(jobId, 20, 'Ejecutando scraping');

        // 2. Execute scraping using ScraperManager
        const scrapingResult = await this.scraperManager.scrapeBySource(
          leadSource.type as LeadSource,
          leadSource.searchQuery || '',
          {
            location: leadSource.config?.location,
            industry: leadSource.config?.industry,
            keywords: leadSource.config?.keywords,
          },
          {
            maxResults: data.maxResults || leadSource.config?.maxResults || 50,
            timeout: Math.min(this.config.timeout - 30000, 120000), // Leave 30s buffer
          }
        );

        if (!scrapingResult.success || scrapingResult.data.length === 0) {
          throw new JobError(
            `Scraping failed: ${scrapingResult.errors.join(', ')}`,
            'SCRAPING_FAILED'
          );
        }

        await this.queue.updateProgress(jobId, 50, `${scrapingResult.data.length} leads encontrados. Procesando con IA...`);

        // 3. Process each lead with AI and save to database
        const processedLeads = [];
        const errors = [];

        for (let i = 0; i < scrapingResult.data.length; i++) {
          const scrapedData = scrapingResult.data[i];

          try {
            // Update progress
            const progressPercentage = 50 + Math.round((i / scrapingResult.data.length) * 40);
            await this.queue.updateProgress(
              jobId,
              progressPercentage,
              `Procesando lead ${i + 1}/${scrapingResult.data.length}: ${scrapedData.name}`
            );

            // Analyze with AI if available
            let aiResult = null;
            try {
              aiResult = await this.aiManager.analyzeLead({
                companyName: scrapedData.name,
                description: scrapedData.description || '',
                website: scrapedData.website,
                industry: scrapedData.industry,
              });
            } catch (aiError) {
              console.warn(`[ScrapingWorker] AI analysis failed for ${scrapedData.name}:`, aiError);
              // Continue without AI analysis
            }

            // Extract additional data quality insights
            const dataQuality = DataExtractor.calculateDataQuality(scrapedData);
            const geoData = DataExtractor.extractGeographicData(scrapedData.address || '');
            const companySize = DataExtractor.estimateCompanySize(scrapedData.description || '');

            // Create lead in database
            const lead = await (this.prisma as any).company_leads.create({
              data: {
                id: require('crypto').randomBytes(16).toString('hex'),
                companyName: scrapedData.name,
                contactName: scrapedData.contactName || scrapedData.name || 'Unknown',
                email: scrapedData.email || '',
                phone: scrapedData.phone,
                source: 'AI_PROSPECTING' as any,
                website: scrapedData.website,
                address: geoData.address || '',
                city: geoData.city,
                state: geoData.state,
                country: geoData.country || 'ES',
                zipCode: geoData.zipCode,
                industry: scrapedData.industry,
                description: scrapedData.description,
                linkedinProfile: scrapedData.socialMedia?.linkedin,
                twitterProfile: scrapedData.socialMedia?.twitter,
                facebookProfile: scrapedData.socialMedia?.facebook,
                estimatedSize: companySize.category,
                employeeCount: companySize.estimatedEmployees,
                sourceId: data.sourceId,
                userId: leadSource.userId,
                generationMethod: 'AI_SCRAPING',
                rawData: JSON.stringify(scrapedData),

                // AI-related fields
                aiProviderId: aiResult?.metadata?.providerId,
                aiScore: aiResult?.score,
                aiScoreReasoning: aiResult?.reasoning,
                aiInsights: aiResult?.insights,
                aiSummary: aiResult?.summary,
                suggestedPitch: aiResult?.suggestedPitch,
                targetAudience: aiResult?.targetAudience,

                // Data quality fields
                dataQualityScore: dataQuality.score,
                confidence: scrapedData.metadata.confidence,

                // Default status
                reviewStatus: dataQuality.score >= 80 ? 'APPROVED' : 'PENDING',
                stage: 'NEW',
                status: 'NEW',

                // Metadata
                scrapedAt: scrapedData.metadata.scrapedAt,

                tags: this.generateLeadTags(scrapedData, aiResult),
              },
            });

            processedLeads.push(lead);

          } catch (error) {
            const errorMsg = `Error procesando lead ${scrapedData.name}: ${error instanceof Error ? error.message : error}`;
            errors.push(errorMsg);
            console.error(`[ScrapingWorker]`, errorMsg);
          }
        }

        await this.queue.updateProgress(jobId, 95, 'Actualizando estadísticas de la fuente');

        // 4. Update source statistics
        // TODO: Implement leadSource table updates
        console.log(`[ScrapingWorker] Leads generados: ${processedLeads.length}`);

        clearTimeout(timeout);

        const result: JobResult = {
          success: true,
          data: {
            totalScraped: scrapingResult.data.length,
            totalCreated: processedLeads.length,
            leads: processedLeads,
            errors: errors,
            sourceStats: {
              type: leadSource.type,
              query: leadSource.searchQuery,
              successRate: processedLeads.length / scrapingResult.data.length,
            }
          },
          duration: Date.now() - startTime,
          processedAt: new Date(),
        };

        resolve(result);

      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private generateLeadTags(scrapedData: any, aiResult: any): string[] {
    const tags: string[] = [];

    // Add industry tag
    if (scrapedData.industry) {
      tags.push(`industry:${scrapedData.industry}`);
    }

    // Add quality tags
    if (scrapedData.metadata.confidence > 80) {
      tags.push('high-quality');
    } else if (scrapedData.metadata.confidence > 60) {
      tags.push('medium-quality');
    } else {
      tags.push('low-quality');
    }

    // Add AI tags
    if (aiResult?.score > 80) {
      tags.push('ai-high-score');
    }

    if (aiResult?.insights?.isHighValue) {
      tags.push('high-value-prospect');
    }

    // Add data completeness tags
    const hasContact = !!(scrapedData.email || scrapedData.phone);
    if (hasContact) {
      tags.push('has-contact');
    }

    if (scrapedData.website) {
      tags.push('has-website');
    }

    return tags;
  }

  private async calculateAverageLeadsPerRun(sourceId: string, currentRunCount: number): Promise<number> {
    // TODO: Implement with actual leadSource table
    return currentRunCount;
  }

  private calculateNextRun(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'HOURLY':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'WEEKLY':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'MONTHLY':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof WorkerTimeoutError) {
      return false; // Timeouts are usually not retryable
    }

    if (error instanceof JobError) {
      return error.retryable;
    }

    if (error?.code) {
      const nonRetryableCodes = [
        'SOURCE_NOT_FOUND',
        'INVALID_CONFIGURATION',
        'VALIDATION_ERROR',
        'AUTHENTICATION_FAILED'
      ];
      return !nonRetryableCodes.includes(error.code);
    }

    // Network errors and rate limits are typically retryable
    if (error?.message) {
      const retryableKeywords = ['network', 'timeout', 'rate limit', 'temporary', 'service unavailable'];
      return retryableKeywords.some(keyword =>
        error.message.toLowerCase().includes(keyword)
      );
    }

    return true; // Default to retryable for unknown errors
  }

  private async waitForActiveJobs(): Promise<void> {
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.activeJobs.size > 0 && (Date.now() - startTime) < timeout) {
      await this.sleep(1000);
    }

    if (this.activeJobs.size > 0) {
      console.warn(`[ScrapingWorker] Shutdown con ${this.activeJobs.size} jobs aún activos`);
    }
  }

  private updateAverageJobDuration(duration: number): void {
    if (this.workerStats.jobsCompleted === 1) {
      this.workerStats.averageJobDuration = duration;
    } else {
      this.workerStats.averageJobDuration =
        (this.workerStats.averageJobDuration * (this.workerStats.jobsCompleted - 1) + duration) /
        this.workerStats.jobsCompleted;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    const uptime = Date.now() - this.workerStats.startTime.getTime();

    return {
      ...this.workerStats,
      activeJobs: this.activeJobs.size,
      isRunning: this.isRunning,
      uptime,
      successRate: this.workerStats.jobsProcessed > 0 ?
        (this.workerStats.jobsCompleted / this.workerStats.jobsProcessed) * 100 : 0,
      averageLeadsPerJob: this.workerStats.jobsCompleted > 0 ?
        this.workerStats.totalLeadsCreated / this.workerStats.jobsCompleted : 0,
      config: this.config,
    };
  }

  isProcessing(): boolean {
    return this.activeJobs.size > 0;
  }

  getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  canAcceptMoreJobs(): boolean {
    return this.isRunning && this.activeJobs.size < this.config.concurrency;
  }
}

class JobError extends Error {
  constructor(message: string, public code: string, public retryable: boolean = false) {
    super(message);
    this.name = 'JobError';
  }
}