import { PrismaClient, AIOperation, Lead } from '@prisma/client';
import { AIProcessingQueue } from '../queues/AIProcessingQueue';
import { AIProviderManager } from '../../ai/manager/AIProviderManager';
import { DataExtractor } from '../../scraping/utils/DataExtractor';
import type {
  AIProcessingJobData,
  JobResult,
  WorkerConfig,
  JobData,
  JobError,
  WorkerTimeoutError,
  LeadEnrichmentJobData
} from '../types';

export class AIProcessingWorker {
  private isRunning: boolean = false;
  private queue: AIProcessingQueue;
  private aiManager: AIProviderManager;
  private prisma: PrismaClient;
  private config: WorkerConfig;
  private activeJobs: Set<string> = new Set();
  private workerStats = {
    jobsProcessed: 0,
    jobsCompleted: 0,
    jobsFailed: 0,
    operationsPerformed: {
      ANALYZE: 0,
      SCORE: 0,
      GENERATE_PITCH: 0,
      ENRICH: 0,
      CLASSIFY: 0,
      VALIDATE: 0,
    } as Record<AIOperation, number>,
    averageJobDuration: 0,
    startTime: new Date(),
  };

  constructor(
    queue: AIProcessingQueue,
    aiManager: AIProviderManager,
    prisma: PrismaClient,
    config?: Partial<WorkerConfig>
  ) {
    this.queue = queue;
    this.aiManager = aiManager;
    this.prisma = prisma;
    this.config = {
      concurrency: 5, // Higher concurrency for AI processing
      retryAttempts: 2, // Fewer retries for AI operations
      retryDelay: 3000,
      timeout: 180000, // 3 minutes for AI operations
      ...config
    };

    console.log(`🔧 [AIProcessingWorker] Configurado con concurrencia: ${this.config.concurrency}`);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ [AIProcessingWorker] Worker ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.workerStats.startTime = new Date();
    console.log('🚀 [AIProcessingWorker] Worker IA iniciado');

    // Main processing loop
    while (this.isRunning) {
      try {
        if (this.activeJobs.size < this.config.concurrency) {
          const job = await this.queue.getNext();

          if (job) {
            // Process job asynchronously to maintain concurrency
            this.processJob(job)
              .catch(error => {
                console.error(`[AIProcessingWorker] Error no capturado procesando job ${job.id}:`, error);
              });
          } else {
            // No jobs available, wait before checking again
            await this.sleep(3000); // Shorter wait for AI jobs
          }
        } else {
          // Max concurrency reached, wait for jobs to complete
          await this.sleep(1000);
        }
      } catch (error) {
        console.error('[AIProcessingWorker] Error en loop principal:', error);
        await this.sleep(3000);
      }
    }

    // Wait for active jobs to complete
    await this.waitForActiveJobs();
    console.log('🛑 [AIProcessingWorker] Worker IA detenido');
  }

  stop(): void {
    this.isRunning = false;
    console.log('🔄 [AIProcessingWorker] Deteniendo worker IA...');
  }

  private async processJob(job: JobData): Promise<void> {
    const startTime = Date.now();
    this.activeJobs.add(job.id);
    let retryCount = 0;

    try {
      await this.queue.startProcessing(job.id);
      this.workerStats.jobsProcessed++;

      const data: AIProcessingJobData = job.payload;
      console.log(`🔄 [AIProcessingWorker] Procesando job IA: ${data.operation} para Lead ${data.leadId} (${job.id})`);

      const result = await this.executeAIProcessingWithTimeout(data, job.id);

      await this.queue.complete(job.id, result);
      this.workerStats.jobsCompleted++;
      this.workerStats.operationsPerformed[data.operation]++;
      this.updateAverageJobDuration(Date.now() - startTime);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const isRetryable = this.isRetryableError(error);

      if (isRetryable && retryCount < this.config.retryAttempts) {
        retryCount++;
        console.log(`🔄 [AIProcessingWorker] Reintento ${retryCount}/${this.config.retryAttempts} para job IA ${job.id}`);

        await this.sleep(this.config.retryDelay * retryCount);
        return this.processJob(job); // Recursive retry
      }

      await this.queue.fail(job.id, errorMessage, isRetryable);
      this.workerStats.jobsFailed++;
      console.error(`❌ [AIProcessingWorker] Job IA fallido definitivamente: ${job.id} - ${errorMessage}`);

    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  private async executeAIProcessingWithTimeout(data: AIProcessingJobData, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new WorkerTimeoutError(jobId, this.config.timeout));
      }, this.config.timeout);

      try {
        await this.queue.updateProgress(jobId, 10, 'Obteniendo datos del lead');

        // 1. Get lead data from database
        const lead = await this.prisma.lead.findUnique({
          where: { id: data.leadId },
          include: { user: true, source: true }
        });

        if (!lead) {
          throw new JobError('Lead no encontrado', 'LEAD_NOT_FOUND');
        }

        await this.queue.updateProgress(jobId, 30, `Ejecutando operación: ${data.operation}`);

        // 2. Execute AI operation based on type
        let result: JobResult;

        switch (data.operation) {
          case 'ANALYZE':
            result = await this.performAnalysis(lead, jobId);
            break;
          case 'SCORE':
            result = await this.performScoring(lead, jobId);
            break;
          case 'GENERATE_PITCH':
            result = await this.generatePitch(lead, jobId);
            break;
          case 'ENRICH':
            result = await this.enrichLead(lead, data.options, jobId);
            break;
          case 'CLASSIFY':
            result = await this.classifyLead(lead, jobId);
            break;
          case 'VALIDATE':
            result = await this.validateLead(lead, jobId);
            break;
          default:
            throw new JobError(`Operación IA no soportada: ${data.operation}`, 'UNSUPPORTED_OPERATION');
        }

        clearTimeout(timeout);
        resolve(result);

      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async performAnalysis(lead: Lead, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    try {
      await this.queue.updateProgress(jobId, 50, 'Analizando lead con IA');

      const analysisData = {
        companyName: lead.companyName,
        description: lead.description || '',
        website: lead.website || '',
        industry: lead.industry || '',
        address: lead.address || '',
        email: lead.email || '',
        phone: lead.phone || '',
      };

      const aiResult = await this.aiManager.analyzeLead(analysisData);

      await this.queue.updateProgress(jobId, 90, 'Guardando resultados del análisis');

      // Update lead with analysis results
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          aiScore: aiResult.score,
          aiScoreReasoning: aiResult.reasoning,
          aiInsights: aiResult.insights,
          aiSummary: aiResult.summary,
          aiProcessingCompletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          leadId: lead.id,
          score: aiResult.score,
          reasoning: aiResult.reasoning,
          insights: aiResult.insights,
          summary: aiResult.summary,
          metadata: aiResult.metadata,
        },
        duration: Date.now() - startTime,
        processedAt: new Date(),
      };

    } catch (error) {
      throw new JobError(
        `Error en análisis IA: ${error instanceof Error ? error.message : error}`,
        'AI_ANALYSIS_FAILED'
      );
    }
  }

  private async performScoring(lead: Lead, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    try {
      await this.queue.updateProgress(jobId, 50, 'Calculando puntuación de calidad');

      // Calculate data quality score
      const dataQuality = DataExtractor.calculateDataQuality({
        name: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        address: lead.address,
        description: lead.description,
        industry: lead.industry,
      });

      // Calculate conversion probability using AI
      const conversionResult = await this.aiManager.scoreConversionProbability({
        companyName: lead.companyName,
        industry: lead.industry || '',
        website: lead.website || '',
        description: lead.description || '',
        hasContact: !!(lead.email || lead.phone),
        hasWebsite: !!lead.website,
      });

      await this.queue.updateProgress(jobId, 90, 'Guardando puntuaciones');

      // Update lead with scoring results
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          dataQualityScore: dataQuality.score,
          qualityScore: Math.round((dataQuality.score + conversionResult.score) / 2),
          conversionProbability: conversionResult.probability,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          leadId: lead.id,
          dataQualityScore: dataQuality.score,
          qualityScore: Math.round((dataQuality.score + conversionResult.score) / 2),
          conversionProbability: conversionResult.probability,
          reasoning: conversionResult.reasoning,
          factors: conversionResult.factors,
        },
        duration: Date.now() - startTime,
        processedAt: new Date(),
      };

    } catch (error) {
      throw new JobError(
        `Error en scoring IA: ${error instanceof Error ? error.message : error}`,
        'AI_SCORING_FAILED'
      );
    }
  }

  private async generatePitch(lead: Lead, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    try {
      await this.queue.updateProgress(jobId, 50, 'Generando pitch personalizado');

      const pitchData = {
        companyName: lead.companyName,
        industry: lead.industry || '',
        description: lead.description || '',
        website: lead.website || '',
        targetAudience: lead.targetAudience || '',
      };

      const pitchResult = await this.aiManager.generatePitch(pitchData);

      await this.queue.updateProgress(jobId, 90, 'Guardando pitch generado');

      // Update lead with generated pitch
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          suggestedPitch: pitchResult.pitch,
          targetAudience: pitchResult.targetAudience || lead.targetAudience,
          pitchGeneratedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          leadId: lead.id,
          pitch: pitchResult.pitch,
          targetAudience: pitchResult.targetAudience,
          keyPoints: pitchResult.keyPoints,
          tone: pitchResult.tone,
        },
        duration: Date.now() - startTime,
        processedAt: new Date(),
      };

    } catch (error) {
      throw new JobError(
        `Error generando pitch: ${error instanceof Error ? error.message : error}`,
        'PITCH_GENERATION_FAILED'
      );
    }
  }

  private async enrichLead(lead: Lead, options: any, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    try {
      const enrichmentType = options?.enrichmentType || 'FULL';

      await this.queue.updateProgress(jobId, 30, `Enriqueciendo lead: ${enrichmentType}`);

      const enrichmentData: any = {};

      // Extract additional contact information if missing
      if ((!lead.email || !lead.phone) && (enrichmentType === 'EMAIL' || enrichmentType === 'PHONE' || enrichmentType === 'FULL')) {
        const websiteText = lead.website ? `Visit ${lead.website} for ${lead.companyName}` : '';
        const contacts = DataExtractor.extractAllContacts(`${lead.description} ${websiteText}`);

        if (!lead.email && contacts.emails.length > 0) {
          enrichmentData.email = contacts.emails[0];
        }

        if (!lead.phone && contacts.phones.length > 0) {
          enrichmentData.phone = contacts.phones[0];
        }

        if (contacts.socialMedia) {
          if (!lead.linkedinProfile && contacts.socialMedia.linkedin) {
            enrichmentData.linkedinProfile = contacts.socialMedia.linkedin;
          }
          if (!lead.twitterProfile && contacts.socialMedia.twitter) {
            enrichmentData.twitterProfile = contacts.socialMedia.twitter;
          }
          if (!lead.facebookProfile && contacts.socialMedia.facebook) {
            enrichmentData.facebookProfile = contacts.socialMedia.facebook;
          }
        }
      }

      // Enrich company information
      if (enrichmentType === 'COMPANY_INFO' || enrichmentType === 'FULL') {
        await this.queue.updateProgress(jobId, 60, 'Enriqueciendo información de empresa');

        const industryInfo = DataExtractor.extractIndustry(lead.companyName, lead.description || '');
        if (industryInfo.confidence > 70) {
          enrichmentData.industry = industryInfo.primary;
        }

        const companySize = DataExtractor.estimateCompanySize(lead.description || '');
        enrichmentData.estimatedSize = companySize.category;
        if (companySize.estimatedEmployees) {
          enrichmentData.employeeCount = companySize.estimatedEmployees;
        }

        // Use AI to get additional company insights
        try {
          const companyInsights = await this.aiManager.getCompanyInsights({
            companyName: lead.companyName,
            website: lead.website || '',
            description: lead.description || '',
            industry: lead.industry || '',
          });

          if (companyInsights.revenue) {
            enrichmentData.annualRevenue = companyInsights.revenue;
          }
          if (companyInsights.foundedYear) {
            enrichmentData.foundedYear = companyInsights.foundedYear;
          }
          if (companyInsights.description && !lead.description) {
            enrichmentData.description = companyInsights.description;
          }
        } catch (aiError) {
          console.warn(`[AIProcessingWorker] AI company insights failed for ${lead.companyName}:`, aiError);
        }
      }

      await this.queue.updateProgress(jobId, 90, 'Guardando datos enriquecidos');

      // Update lead with enriched data
      if (Object.keys(enrichmentData).length > 0) {
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: {
            ...enrichmentData,
            enrichedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      return {
        success: true,
        data: {
          leadId: lead.id,
          enrichedData: enrichmentData,
          enrichmentType,
          fieldsEnriched: Object.keys(enrichmentData),
          validationRequired: options?.validateData || false,
        },
        duration: Date.now() - startTime,
        processedAt: new Date(),
      };

    } catch (error) {
      throw new JobError(
        `Error enriqueciendo lead: ${error instanceof Error ? error.message : error}`,
        'LEAD_ENRICHMENT_FAILED'
      );
    }
  }

  private async classifyLead(lead: Lead, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    try {
      await this.queue.updateProgress(jobId, 50, 'Clasificando lead por categoría');

      // Extract industry classification
      const industryInfo = DataExtractor.extractIndustry(lead.companyName, lead.description || '');

      // Use AI to determine lead category and priority
      const classificationResult = await this.aiManager.classifyLead({
        companyName: lead.companyName,
        industry: lead.industry || industryInfo.primary,
        description: lead.description || '',
        website: lead.website || '',
        size: lead.estimatedSize || '',
      });

      await this.queue.updateProgress(jobId, 90, 'Guardando clasificación');

      // Update lead with classification
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          priority: classificationResult.priority,
          category: classificationResult.category,
          segment: classificationResult.segment,
          tags: classificationResult.tags || [],
          classifiedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          leadId: lead.id,
          priority: classificationResult.priority,
          category: classificationResult.category,
          segment: classificationResult.segment,
          tags: classificationResult.tags,
          confidence: classificationResult.confidence,
          reasoning: classificationResult.reasoning,
        },
        duration: Date.now() - startTime,
        processedAt: new Date(),
      };

    } catch (error) {
      throw new JobError(
        `Error clasificando lead: ${error instanceof Error ? error.message : error}`,
        'LEAD_CLASSIFICATION_FAILED'
      );
    }
  }

  private async validateLead(lead: Lead, jobId: string): Promise<JobResult> {
    const startTime = Date.now();

    try {
      await this.queue.updateProgress(jobId, 30, 'Validando datos del lead');

      const validationIssues: string[] = [];
      const suggestions: string[] = [];

      // Validate data quality
      const dataQuality = DataExtractor.calculateDataQuality({
        name: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        address: lead.address,
        description: lead.description,
      });

      await this.queue.updateProgress(jobId, 60, 'Validando información de contacto');

      // Validate contact information
      if (lead.email && !DataExtractor.extractEmails(lead.email).length) {
        validationIssues.push('Email format appears invalid');
        suggestions.push('Verify email address format');
      }

      if (lead.phone && !DataExtractor.extractPhones(lead.phone).length) {
        validationIssues.push('Phone format appears invalid');
        suggestions.push('Verify phone number format');
      }

      if (lead.website && !DataExtractor.extractWebsites(lead.website).length) {
        validationIssues.push('Website URL format appears invalid');
        suggestions.push('Verify website URL');
      }

      // Use AI for additional validation
      await this.queue.updateProgress(jobId, 80, 'Validación avanzada con IA');

      try {
        const aiValidation = await this.aiManager.validateLeadData({
          companyName: lead.companyName,
          industry: lead.industry || '',
          website: lead.website || '',
          description: lead.description || '',
        });

        if (!aiValidation.isValid) {
          validationIssues.push(...aiValidation.issues);
          suggestions.push(...aiValidation.suggestions);
        }
      } catch (aiError) {
        console.warn(`[AIProcessingWorker] AI validation failed for ${lead.companyName}:`, aiError);
      }

      await this.queue.updateProgress(jobId, 95, 'Guardando resultados de validación');

      // Determine validation status
      const isValid = validationIssues.length === 0 && dataQuality.score >= 60;

      // Update lead with validation results
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          validationStatus: isValid ? 'VALID' : 'NEEDS_REVIEW',
          validationIssues: validationIssues,
          dataQualityScore: dataQuality.score,
          validatedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          leadId: lead.id,
          isValid,
          dataQualityScore: dataQuality.score,
          validationIssues,
          suggestions,
          validatedFields: ['email', 'phone', 'website', 'companyName', 'industry'],
        },
        duration: Date.now() - startTime,
        processedAt: new Date(),
      };

    } catch (error) {
      throw new JobError(
        `Error validando lead: ${error instanceof Error ? error.message : error}`,
        'LEAD_VALIDATION_FAILED'
      );
    }
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof WorkerTimeoutError) {
      return false;
    }

    if (error instanceof JobError) {
      const nonRetryableCodes = ['LEAD_NOT_FOUND', 'UNSUPPORTED_OPERATION'];
      return !nonRetryableCodes.includes(error.code);
    }

    // AI-related errors might be retryable
    if (error?.message) {
      const retryableKeywords = ['rate limit', 'temporary', 'service unavailable', 'timeout'];
      return retryableKeywords.some(keyword =>
        error.message.toLowerCase().includes(keyword)
      );
    }

    return true; // Default to retryable for AI operations
  }

  private async waitForActiveJobs(): Promise<void> {
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.activeJobs.size > 0 && (Date.now() - startTime) < timeout) {
      await this.sleep(1000);
    }

    if (this.activeJobs.size > 0) {
      console.warn(`[AIProcessingWorker] Shutdown con ${this.activeJobs.size} jobs IA aún activos`);
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
  constructor(message: string, public code: string, public retryable: boolean = true) {
    super(message);
    this.name = 'JobError';
  }
}