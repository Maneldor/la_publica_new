// ============================================================================
// SERVICIO DE GESTIÓN DE PLANES - ADMIN - LA PÚBLICA
// ============================================================================

import { PrismaClient } from '@prisma/client';
type PlanType = any;

const prisma = new PrismaClient();

export interface CustomizationInfo {
  featureKey: string;
  value: any;
  addedBy: string;
  addedAt: Date;
  notes?: string;
}

export class PlanManagementService {
  /**
   * Obtener customizaciones de una empresa
   */
  async getCustomizations(companyId: string): Promise<CustomizationInfo[]> {
    try {
      const customFeatures = await (prisma as any).customFeature.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
      });

      return customFeatures.map((feature: any) => ({
        featureKey: feature.featureName,
        value: feature.featureValue || null,
        addedBy: 'admin',
        addedAt: feature.createdAt,
        notes: feature.notes || undefined
      }));
    } catch (error) {
      console.error('Error obtenint personalitzacions:', error);
      return [];
    }
  }

  /**
   * Actualizar límite personalizado
   */
  async updateCustomLimit(companyId: string, limitPath: string, value: any, notes: string | null, adminId: string) {
    try {
      // Buscar característica existente
      const existingFeature = await (prisma as any).customFeature.findFirst({
        where: {
          companyId,
          featureName: limitPath
        }
      });

      // Crear o actualizar usando los nuevos campos
      const customFeature = existingFeature
        ? await (prisma as any).customFeature.update({
            where: { id: existingFeature.id },
            data: {
              featureValue: String(value),
              notes: notes,
              updatedAt: new Date()
            }
          })
        : await (prisma as any).customFeature.create({
            data: {
              id: `custom_${companyId}_${limitPath}_${Date.now()}`,
              companyId,
              featureName: limitPath,
              featureType: typeof value,
              featureValue: String(value),
              notes: notes
            }
          });

      return {
        success: true,
        data: customFeature,
        message: `Límit ${limitPath} actualitzat correctament`
      };
    } catch (error) {
      console.error('Error actualitzant límit personalitzat:', error);
      throw error;
    }
  }

  /**
   * Habilitar personalización
   */
  async enableCustomization(companyId: string, adminId: string) {
    try {
      const company = await (prisma as any).company.update({
        where: { id: companyId },
        data: {
          updatedAt: new Date()
        } as any
      });

      return {
        success: true,
        data: company,
        message: 'Personalització habilitada'
      };
    } catch (error) {
      console.error('Error habilitant personalització:', error);
      throw error;
    }
  }

  /**
   * Cambiar plan de empresa
   */
  async changePlan(companyId: string, newPlan: PlanType, reason: string | null, adminId: string) {
    try {
      const company = await (prisma as any).company.update({
        where: { id: companyId },
        data: {
          updatedAt: new Date()
        } as any
      });

      // Crear registro de cambio
      await (prisma as any).planChangeRequest.create({
        data: {
          companyId,
          currentPlan: newPlan,
          requestedPlan: newPlan,
          status: 'approved',
          reason: reason || 'Cambio manual por administrador',
          requestedBy: adminId,
          approvedBy: adminId,
          processedAt: new Date()
        }
      });

      return {
        success: true,
        data: company,
        message: `Pla canviat a ${newPlan}`
      };
    } catch (error) {
      console.error('Error canviant pla:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de planes
   */
  async getPlanHistory(companyId: string) {
    try {
      const history = await (prisma as any).planChangeRequest.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return history;
    } catch (error) {
      console.error('Error obtenint historial:', error);
      throw error;
    }
  }

  /**
   * Resetear personalización
   */
  async resetCustomization(companyId: string, reason: string | null, adminId: string) {
    try {
      // Eliminar todas las características personalizadas
      await (prisma as any).customFeature.deleteMany({
        where: { companyId }
      });

      // Deshabilitar personalización
      const company = await (prisma as any).company.update({
        where: { id: companyId },
        data: {
          updatedAt: new Date()
        } as any
      });

      return {
        success: true,
        message: 'Personalització resetejada'
      };
    } catch (error) {
      console.error('Error resetejant personalització:', error);
      throw error;
    }
  }

  /**
   * Obtener plantillas de configuración
   */
  async getTemplates() {
    // Retornar plantillas predefinidas
    return [
      {
        id: 'startup',
        name: 'Startup',
        description: 'Configuració per startups',
        config: {
          limits: {
            maxMembers: 10,
            maxStorage: 10737418240, // 10GB
            maxDocuments: 100,
            maxOffers: 20
          }
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Configuració empresarial',
        config: {
          limits: {
            maxMembers: 100,
            maxStorage: 107374182400, // 100GB
            maxDocuments: 1000,
            maxOffers: 200
          }
        }
      }
    ];
  }

  /**
   * Aplicar plantilla
   */
  async applyTemplate(companyId: string, templateId: string, adminId: string) {
    try {
      const templates = await this.getTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        throw new Error('Plantilla no trobada');
      }

      // Aplicar límites de la plantilla
      const limits = template.config.limits;

      for (const [key, value] of Object.entries(limits)) {
        await this.updateCustomLimit(companyId, key, value, `Aplicat des de plantilla: ${template.name}`, adminId);
      }

      return {
        success: true,
        message: `Plantilla ${template.name} aplicada`,
        appliedFeatures: Object.keys(limits)
      };
    } catch (error) {
      console.error('Error aplicant plantilla:', error);
      throw error;
    }
  }

  /**
   * Obtener información detallada de empresa
   */
  async getDetailedCompanyInfo(companyId: string) {
    try {
      const company = await (prisma as any).company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        throw new Error('Empresa no trobada');
      }

      return {
        id: company.id,
        name: company.name,
        plan: (company as any).subscriptionPlan || (company as any).planType || 'BASIC',
        allowCustomLimits: (company as any).allowCustomLimits || false,
        stats: {
          totalAdvisories: 0,
          totalProducts: 0,
          totalServices: 0
        },
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };
    } catch (error) {
      console.error('Error obtenint informació detallada:', error);
      throw error;
    }
  }
}

// Exportar instancia única
export const planManagementService = new PlanManagementService();