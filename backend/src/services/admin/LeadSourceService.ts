import { PrismaClient, LeadSourceType, ScheduleFrequency } from '@prisma/client';
import { ScraperManager } from '../../scraping/ScraperManager';
import { AIProviderManager } from '../../ai/manager/AIProviderManager';

export class LeadSourceService {
  private prisma: PrismaClient;
  private scraperManager: ScraperManager;
  private aiManager: AIProviderManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.scraperManager = new ScraperManager();
    this.aiManager = AIProviderManager.getInstance();
  }

  // GET /api/admin/sources - Llistar totes les fonts
  async getAllSources(filters?: {
    isActive?: boolean;
    type?: LeadSourceType;
  }) {
    return await this.prisma.leadSource.findMany({
      where: {
        isActive: filters?.isActive,
        type: filters?.type,
      },
      include: {
        aiProvider: {
          select: {
            id: true,
            displayName: true,
            type: true,
            isActive: true,
          }
        },
        _count: {
          select: {
            leads: true,
            jobs: true,
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  // GET /api/admin/sources/:id - Obtenir font per ID
  async getSourceById(id: string) {
    const source = await this.prisma.leadSource.findUnique({
      where: { id },
      include: {
        aiProvider: true,
        leads: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            companyName: true,
            reviewStatus: true,
            aiScore: true,
            createdAt: true,
          }
        },
        jobs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            progress: true,
            leadsGenerated: true,
            createdAt: true,
            completedAt: true,
          }
        }
      }
    });

    if (!source) {
      throw new Error('Lead source not found');
    }

    return source;
  }

  // POST /api/admin/sources - Crear nova font
  async createSource(data: {
    name: string;
    description?: string;
    type: LeadSourceType;
    config: any;
    aiProviderId?: string;
    aiTasks?: any;
    frequency?: ScheduleFrequency;
    isActive?: boolean;
  }) {
    // Validar config segons el tipus
    this.validateSourceConfig(data.type, data.config);

    // Validar que el AI Provider existeix i està actiu
    if (data.aiProviderId) {
      const aiProvider = await this.prisma.aIProvider.findUnique({
        where: { id: data.aiProviderId }
      });

      if (!aiProvider) {
        throw new Error('AI Provider not found');
      }

      if (!aiProvider.isActive) {
        throw new Error('Selected AI Provider is not active');
      }
    }

    // Calcular nextRun si està activa i té frequency
    const nextRun = data.isActive && data.frequency && data.frequency !== 'MANUAL'
      ? this.calculateNextRun(data.frequency)
      : null;

    const source = await this.prisma.leadSource.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        config: data.config,
        aiProviderId: data.aiProviderId,
        aiTasks: data.aiTasks || this.getDefaultAITasks(),
        frequency: data.frequency || 'MANUAL',
        isActive: data.isActive ?? true,
        nextRun,
      },
      include: {
        aiProvider: true,
      }
    });

    // Registrar scraper en el manager si està actiu
    if (source.isActive) {
      await this.registerScraperInManager(source);
    }

    return source;
  }

  // PUT /api/admin/sources/:id - Actualitzar font
  async updateSource(id: string, data: {
    name?: string;
    description?: string;
    config?: any;
    aiProviderId?: string;
    aiTasks?: any;
    frequency?: ScheduleFrequency;
    isActive?: boolean;
  }) {
    const existing = await this.prisma.leadSource.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Lead source not found');
    }

    // Validar config si s'actualitza
    if (data.config) {
      this.validateSourceConfig(existing.type, data.config);
    }

    // Validar AI Provider si s'actualitza
    if (data.aiProviderId) {
      const aiProvider = await this.prisma.aIProvider.findUnique({
        where: { id: data.aiProviderId }
      });

      if (!aiProvider || !aiProvider.isActive) {
        throw new Error('AI Provider not found or inactive');
      }
    }

    // Recalcular nextRun si canvia frequency o isActive
    let nextRun = existing.nextRun;
    if (data.frequency !== undefined || data.isActive !== undefined) {
      const newFrequency = data.frequency || existing.frequency;
      const newIsActive = data.isActive !== undefined ? data.isActive : existing.isActive;

      nextRun = newIsActive && newFrequency !== 'MANUAL'
        ? this.calculateNextRun(newFrequency)
        : null;
    }

    const updated = await this.prisma.leadSource.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        config: data.config,
        aiProviderId: data.aiProviderId,
        aiTasks: data.aiTasks,
        frequency: data.frequency,
        isActive: data.isActive,
        nextRun,
      },
      include: {
        aiProvider: true,
      }
    });

    // Actualitzar en el manager
    if (updated.isActive) {
      await this.registerScraperInManager(updated);
    } else {
      this.scraperManager.removeScraper(updated.id);
    }

    return updated;
  }

  // DELETE /api/admin/sources/:id - Eliminar font
  async deleteSource(id: string) {
    // Verificar si té leads generats
    const source = await this.prisma.leadSource.findUnique({
      where: { id },
      include: {
        _count: {
          select: { leads: true, jobs: true }
        }
      }
    });

    if (!source) {
      throw new Error('Lead source not found');
    }

    if (source._count.leads > 0 || source._count.jobs > 0) {
      throw new Error(
        `Cannot delete source with ${source._count.leads} leads and ${source._count.jobs} jobs. ` +
        'Archive it instead or delete associated data first.'
      );
    }

    // Eliminar del manager
    this.scraperManager.removeScraper(source.id);

    // Eliminar de la DB
    await this.prisma.leadSource.delete({
      where: { id }
    });

    return { success: true };
  }

  // POST /api/admin/sources/:id/test - Test scraping
  async testSource(id: string, options?: { maxResults?: number }) {
    const source = await this.prisma.leadSource.findUnique({
      where: { id },
      include: {
        aiProvider: true,
      }
    });

    if (!source) {
      throw new Error('Lead source not found');
    }

    try {
      const startTime = Date.now();

      // Crear scraper temporal
      const scraperConfig = {
        sourceId: source.id,
        sourceName: source.name,
        type: source.type,
        config: source.config,
        maxResults: options?.maxResults || 5, // Test amb poques dades
        timeout: 30000, // 30s timeout per test
      };

      const scraper = this.scraperManager.createScraper(scraperConfig);

      // Executar scraping
      const results = await scraper.scrape();

      const duration = Date.now() - startTime;

      return {
        success: true,
        duration,
        resultsCount: results.length,
        results: results.slice(0, 3), // Només mostrar 3 resultats de mostra
        message: `Test successful. Found ${results.length} leads in ${duration}ms`
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Test failed'
      };
    }
  }

  // POST /api/admin/sources/:id/execute - Executar scraping ara
  async executeSource(id: string, options?: {
    maxResults?: number;
    runAI?: boolean;
  }) {
    const source = await this.prisma.leadSource.findUnique({
      where: { id },
      include: {
        aiProvider: true,
      }
    });

    if (!source) {
      throw new Error('Lead source not found');
    }

    if (!source.isActive) {
      throw new Error('Lead source is not active');
    }

    // Crear job en la DB
    const job = await this.prisma.scrapingJob.create({
      data: {
        sourceId: source.id,
        status: 'PENDING',
        priority: 'NORMAL',
        scheduledFor: new Date(),
        config: {
          maxResults: options?.maxResults,
          runAI: options?.runAI ?? true,
        }
      }
    });

    // Executar scraping de forma asíncrona (no esperar)
    this.executeScrapingJob(job.id, source).catch(error => {
      console.error(`Job ${job.id} failed:`, error);
    });

    return {
      success: true,
      jobId: job.id,
      message: 'Scraping job started'
    };
  }

  // PUT /api/admin/sources/:id/toggle - Activar/desactivar
  async toggleSource(id: string) {
    const source = await this.prisma.leadSource.findUnique({
      where: { id }
    });

    if (!source) {
      throw new Error('Lead source not found');
    }

    const newState = !source.isActive;

    // Calcular nextRun si s'activa
    const nextRun = newState && source.frequency !== 'MANUAL'
      ? this.calculateNextRun(source.frequency)
      : null;

    const updated = await this.prisma.leadSource.update({
      where: { id },
      data: {
        isActive: newState,
        nextRun,
      },
      include: {
        aiProvider: true,
      }
    });

    if (newState) {
      await this.registerScraperInManager(updated);
    } else {
      this.scraperManager.removeScraper(updated.id);
    }

    return updated;
  }

  // HELPERS PRIVATS

  private validateSourceConfig(type: LeadSourceType, config: any) {
    switch (type) {
      case 'GOOGLE_MAPS':
        if (!config.query) throw new Error('Google Maps source requires query');
        if (!config.location) throw new Error('Google Maps source requires location');
        break;
      case 'WEB_SCRAPING':
        if (!config.url) throw new Error('Web scraping source requires url');
        if (!config.selectors) throw new Error('Web scraping source requires selectors');
        break;
      case 'API':
        if (!config.endpoint) throw new Error('API source requires endpoint');
        break;
      case 'CSV_IMPORT':
        if (!config.filePath && !config.fileUrl) {
          throw new Error('CSV import requires filePath or fileUrl');
        }
        break;
    }
  }

  private getDefaultAITasks() {
    return {
      analyze: true,
      score: true,
      generatePitch: true,
      enrich: true,
      classify: true,
      validate: true,
    };
  }

  private calculateNextRun(frequency: ScheduleFrequency): Date {
    const now = new Date();

    switch (frequency) {
      case 'HOURLY':
        return new Date(now.getTime() + 60 * 60 * 1000); // +1 hora
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 dia
      case 'WEEKLY':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 dies
      case 'MONTHLY':
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth;
      default:
        return now;
    }
  }

  private async registerScraperInManager(source: any) {
    try {
      const scraperConfig = {
        sourceId: source.id,
        sourceName: source.name,
        type: source.type,
        config: source.config,
      };

      this.scraperManager.registerScraper(scraperConfig);
    } catch (error: any) {
      console.error(`Failed to register scraper ${source.name}:`, error);
      throw new Error(`Failed to register scraper: ${error.message}`);
    }
  }

  private async executeScrapingJob(jobId: string, source: any) {
    try {
      // Actualitzar job a RUNNING
      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        }
      });

      // Crear scraper
      const scraperConfig = {
        sourceId: source.id,
        sourceName: source.name,
        type: source.type,
        config: source.config,
      };

      const scraper = this.scraperManager.createScraper(scraperConfig);

      // Executar scraping
      const scrapedData = await scraper.scrape();

      // Crear leads en la DB
      const leads = await Promise.all(
        scrapedData.map(data =>
          this.prisma.lead.create({
            data: {
              sourceId: source.id,
              companyName: data.companyName,
              email: data.email,
              phone: data.phone,
              website: data.website,
              address: data.address,
              city: data.city,
              postalCode: data.postalCode,
              country: data.country || 'ES',
              industry: data.industry,
              reviewStatus: 'PENDING',
              rawData: data.rawData,
              scrapedAt: new Date(),
            }
          })
        )
      );

      // Si cal executar IA
      if (source.aiProvider && source.aiTasks) {
        await this.runAIOnLeads(leads, source);
      }

      // Actualitzar job a COMPLETED
      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          leadsGenerated: leads.length,
          progress: 100,
        }
      });

      // Actualitzar stats de la font
      await this.prisma.leadSource.update({
        where: { id: source.id },
        data: {
          leadsGenerated: { increment: leads.length },
          lastRun: new Date(),
          nextRun: this.calculateNextRun(source.frequency),
        }
      });

    } catch (error: any) {
      // Actualitzar job a FAILED
      await this.prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message,
        }
      });

      throw error;
    }
  }

  private async runAIOnLeads(leads: any[], source: any) {
    const aiProvider = await this.aiManager.getProvider(source.aiProvider.name);

    if (!aiProvider) {
      console.warn(`AI Provider ${source.aiProvider.name} not available`);
      return;
    }

    for (const lead of leads) {
      try {
        // Anàlisi amb IA
        const analysis = await aiProvider.analyzeLead({
          companyName: lead.companyName,
          industry: lead.industry,
          website: lead.website,
          address: lead.address,
        });

        // Actualitzar lead amb resultats d'IA
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: {
            aiScore: analysis.score,
            aiInsights: analysis.insights,
            aiRecommendations: analysis.recommendations,
            aiSuggestedPitch: analysis.suggestedPitch,
            aiProviderId: source.aiProviderId,
            aiProcessedAt: new Date(),
          }
        });

      } catch (error: any) {
        console.error(`AI processing failed for lead ${lead.id}:`, error);
      }
    }
  }
}