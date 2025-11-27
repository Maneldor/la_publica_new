import { PrismaClient } from '@prisma/client';
type AIProviderType = any;

// Stubs para módulos faltantes
export class AIProviderManager {
  private static instance: AIProviderManager;

  static getInstance(): AIProviderManager {
    if (!this.instance) {
      this.instance = new AIProviderManager();
    }
    return this.instance;
  }

  async processOperation(operation: string, data: any): Promise<any> {
    throw new Error('AIProviderManager not implemented');
  }

  async analyzeLead(data: any): Promise<any> {
    // Mock implementation for AI lead analysis
    return {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      insights: `Mock AI analysis for ${data.companyName || 'company'}`,
      reasoning: 'Mock reasoning based on company data',
      summary: 'Mock summary of lead analysis',
      metadata: {
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        processingTime: Math.floor(Math.random() * 1000) + 500
      }
    };
  }

  async validateLeadData(data: any): Promise<any> {
    // Mock implementation for lead validation
    return {
      isValid: Math.random() > 0.2, // 80% valid
      issues: Math.random() > 0.7 ? ['Missing phone number'] : [],
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      suggestions: ['Add more contact information', 'Verify company website']
    };
  }

  async classifyLead(data: any): Promise<any> {
    const categories = ['PROSPECT', 'QUALIFIED', 'WARM', 'HOT'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];

    return {
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      confidence: Math.random() * 0.3 + 0.7,
      segment: 'B2B_SME',
      tags: ['technology', 'growth-stage'],
      reasoning: 'Mock classification reasoning'
    };
  }

  async scoreConversionProbability(data: any): Promise<any> {
    return {
      score: Math.floor(Math.random() * 40) + 40, // 40-80
      probability: Math.random() * 0.5 + 0.3, // 0.3-0.8
      confidence: Math.random() * 0.3 + 0.6,
      reasoning: 'Mock conversion scoring',
      factors: [
        'Company size matches target market',
        'Industry alignment is strong',
        'Contact information quality is good'
      ]
    };
  }

  async generatePitch(data: any): Promise<any> {
    const pitches = [
      'Transform your business with our innovative solutions',
      'Boost your productivity with our cutting-edge platform',
      'Scale your operations with our enterprise-grade tools'
    ];

    return {
      pitch: pitches[Math.floor(Math.random() * pitches.length)],
      confidence: Math.random() * 0.3 + 0.7,
      targetAudience: 'Business decision makers',
      keyPoints: [
        'Cost reduction',
        'Efficiency improvement',
        'Scalability'
      ],
      tone: 'professional'
    };
  }

  async getCompanyInsights(data: any): Promise<any> {
    return {
      insights: `Mock insights for ${data.companyName || 'company'}`,
      score: Math.floor(Math.random() * 30) + 70,
      revenue: Math.floor(Math.random() * 10000000) + 1000000,
      foundedYear: Math.floor(Math.random() * 20) + 2004,
      description: 'Mock company description from AI analysis',
      industry: data.industry || 'Technology',
      employees: Math.floor(Math.random() * 500) + 50
    };
  }
}

class AIProviderFactory {
  static create(type: string): any {
    throw new Error('AIProviderFactory not implemented');
  }
}

export class AIProviderService {
  private prisma: PrismaClient;
  private aiManager: AIProviderManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.aiManager = AIProviderManager.getInstance();
  }

  // GET /api/admin/ai-providers - Llistar tots els providers
  async getAllProviders(filters?: {
    isActive?: boolean;
    type?: any;
  }) {
    return await (this.prisma as any).aIProvider.findMany({
      where: {
        isActive: filters?.isActive,
        type: filters?.type,
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            leadSources: true,
            leads: true,
            aiLogs: true,
          }
        }
      }
    });
  }

  // GET /api/admin/ai-providers/:id - Obtenir provider per ID
  async getProviderById(id: string) {
    const provider = await (this.prisma as any).aIProvider.findUnique({
      where: { id },
      include: {
        leadSources: {
          select: {
            id: true,
            name: true,
            isActive: true,
          }
        },
        aiLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            operation: true,
            success: true,
            latency: true,
            cost: true,
            createdAt: true,
          }
        }
      }
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    return provider;
  }

  // POST /api/admin/ai-providers - Crear nou provider
  async createProvider(data: {
    name: string;
    displayName: string;
    type: any;
    config: any;
    capabilities?: any;
    isActive?: boolean;
    isDefault?: boolean;
  }) {
    // Si és default, desactivar altres defaults del mateix tipus
    if (data.isDefault) {
      await (this.prisma as any).aIProvider.updateMany({
        where: {
          type: data.type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        }
      });
    }

    // Validar config segons el tipus
    this.validateProviderConfig(data.type, data.config);

    const provider = await (this.prisma as any).aIProvider.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        type: data.type,
        config: data.config,
        capabilities: data.capabilities || this.getDefaultCapabilities(data.type),
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
      }
    });

    // Si està actiu, registrar-lo en el AIProviderManager
    if (provider.isActive) {
      await this.registerProviderInManager(provider);
    }

    return provider;
  }

  // PUT /api/admin/ai-providers/:id - Actualitzar provider
  async updateProvider(id: string, data: {
    displayName?: string;
    config?: any;
    capabilities?: any;
    isActive?: boolean;
    isDefault?: boolean;
  }) {
    const existing = await (this.prisma as any).aIProvider.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Provider not found');
    }

    // Si passa a ser default, desactivar altres
    if (data.isDefault && !existing.isDefault) {
      await (this.prisma as any).aIProvider.updateMany({
        where: {
          type: existing.type,
          isDefault: true,
          id: { not: id }
        },
        data: {
          isDefault: false,
        }
      });
    }

    // Validar config si s'actualitza
    if (data.config) {
      this.validateProviderConfig(existing.type, data.config);
    }

    const updated = await (this.prisma as any).aIProvider.update({
      where: { id },
      data: {
        displayName: data.displayName,
        config: data.config,
        capabilities: data.capabilities,
        isActive: data.isActive,
        isDefault: data.isDefault,
      }
    });

    // Actualitzar en el manager
    if (updated.isActive) {
      await this.registerProviderInManager(updated);
    } else {
      // Si es desactiva, eliminar del manager
      (this.aiManager as any).removeProvider(updated.name);
    }

    return updated;
  }

  // DELETE /api/admin/ai-providers/:id - Eliminar provider
  async deleteProvider(id: string) {
    // Verificar si té fonts assignades
    const provider = await (this.prisma as any).aIProvider.findUnique({
      where: { id },
      include: {
        _count: {
          select: { leadSources: true }
        }
      }
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    if (provider._count.leadSources > 0) {
      throw new Error(
        `Cannot delete provider with ${provider._count.leadSources} assigned lead sources. ` +
        'Reassign or delete the sources first.'
      );
    }

    // Eliminar del manager
    (this.aiManager as any).removeProvider(provider.name);

    // Eliminar de la DB
    await (this.prisma as any).aIProvider.delete({
      where: { id }
    });

    return { success: true };
  }

  // POST /api/admin/ai-providers/:id/test - Test connexió
  async testProvider(id: string) {
    const provider = await (this.prisma as any).aIProvider.findUnique({
      where: { id }
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    try {
      // Crear instància temporal del provider
      const providerInstance = (AIProviderFactory as any).createProvider(
        provider.type,
        provider.name,
        provider.config
      );

      // Test simple: verificar disponibilitat
      const isAvailable = await providerInstance.isAvailable();

      if (!isAvailable) {
        throw new Error('Provider is not available');
      }

      // Test real: fer una petita anàlisi
      const testResult = await providerInstance.analyzeLead({
        companyName: 'Test Company',
        industry: 'Technology',
      });

      // Actualitzar stats si el test va bé
      await (this.prisma as any).aIProvider.update({
        where: { id },
        data: {
          successfulRequests: { increment: 1 },
          totalRequests: { increment: 1 },
        }
      });

      return {
        success: true,
        available: true,
        latency: testResult.metadata?.processingTime || 0,
        message: 'Provider connection successful'
      };

    } catch (error: any) {
      // Actualitzar stats si falla
      await (this.prisma as any).aIProvider.update({
        where: { id },
        data: {
          failedRequests: { increment: 1 },
          totalRequests: { increment: 1 },
        }
      });

      return {
        success: false,
        available: false,
        error: error.message,
        message: 'Provider connection failed'
      };
    }
  }

  // PUT /api/admin/ai-providers/:id/toggle - Activar/desactivar
  async toggleProvider(id: string) {
    const provider = await (this.prisma as any).aIProvider.findUnique({
      where: { id }
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    const newState = !provider.isActive;

    const updated = await (this.prisma as any).aIProvider.update({
      where: { id },
      data: { isActive: newState }
    });

    if (newState) {
      await this.registerProviderInManager(updated);
    } else {
      (this.aiManager as any).removeProvider(updated.name);
    }

    return updated;
  }

  // HELPERS PRIVATS

  private validateProviderConfig(type: any, config: any) {
    switch (type) {
      case ('CLAUDE' as any):
        if (!config.apiKey) throw new Error('Claude requires apiKey in config');
        if (!config.model) throw new Error('Claude requires model in config');
        break;
      case 'OPENAI':
        if (!config.apiKey) throw new Error('OpenAI requires apiKey in config');
        if (!config.model) throw new Error('OpenAI requires model in config');
        break;
      case ('GEMINI' as any):
        if (!config.apiKey) throw new Error('Gemini requires apiKey in config');
        if (!config.model) throw new Error('Gemini requires model in config');
        break;
      case ('AZURE_OPENAI' as any):
        if (!config.apiKey) throw new Error('Azure OpenAI requires apiKey');
        if (!config.endpoint) throw new Error('Azure OpenAI requires endpoint');
        if (!config.deployment) throw new Error('Azure OpenAI requires deployment name');
        break;
    }
  }

  private getDefaultCapabilities(type: any) {
    return {
      leadAnalysis: true,
      scoring: true,
      pitchGeneration: true,
      dataEnrichment: true,
      classification: true,
      validation: true,
    };
  }

  private async registerProviderInManager(provider: any) {
    try {
      const providerInstance = (AIProviderFactory as any).createProvider(
        provider.type,
        provider.name,
        provider.config
      );
      (this.aiManager as any).registerProvider(providerInstance, provider.isDefault);
    } catch (error: any) {
      console.error(`Failed to register provider ${provider.name}:`, error);
      throw new Error(`Failed to register provider: ${error.message}`);
    }
  }
}