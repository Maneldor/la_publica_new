import { PrismaClient } from '@prisma/client';

/**
 * Adaptador temporal para manejar modelos de Lead Generation
 * que no existen en el schema actual de Prisma
 */

export class LeadGenerationAdapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Métodos mock para leadSource (no existe en BD)
   * Se puede implementar usando company_leads.source
   */
  async getLeadSources() {
    // Usar company_leads para obtener fuentes únicas
    const sources = await this.prisma.company_leads.groupBy({
      by: ['source'],
      where: {
        source: {
          not: undefined
        }
      }
    });

    return sources.map(s => ({
      id: s.source,
      type: s.source,
      name: s.source,
      isActive: true,
      config: {}
    }));
  }

  /**
   * Mock para AIProvider (no existe en BD)
   */
  async getAIProviders() {
    // Retornar configuración hardcoded por ahora
    return [
      {
        id: 'openai',
        name: 'OpenAI',
        type: 'OPENAI',
        isActive: true,
        config: {}
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'ANTHROPIC',
        isActive: true,
        config: {}
      }
    ];
  }

  /**
   * Mock para ScrapingJob (no existe en BD)
   */
  async getScrapingJobs(_status?: string[]) {
    // Por ahora retornar array vacío
    return [];
  }

  /**
   * Usar company_leads en lugar de lead
   */
  async getLeads(filters?: any) {
    return this.prisma.company_leads.findMany(filters);
  }

  async createLead(data: any) {
    return this.prisma.company_leads.create({ data });
  }

  async updateLead(id: string, data: any) {
    return this.prisma.company_leads.update({
      where: { id },
      data
    });
  }

  async getLeadCount(where?: any) {
    return this.prisma.company_leads.count({ where });
  }
}