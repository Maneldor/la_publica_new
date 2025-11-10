// ============================================================================
// SERVICIO DE LÍMITES DE PLANES - LA PÚBLICA
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { merge } from 'lodash';
import {
  PlanType,
  getPlanLimits,
  planHasFeature,
  getAvailablePlans,
  PlanLimits,
  PLAN_LIMITS
} from '../config/planLimits';

const prisma = new PrismaClient();

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface CompanyLimitsInfo {
  companyId: string;
  planType: PlanType;
  subscription: {
    id: string;
    status: string;
    // TODO: Añadir isCustom y customConfig en futuras versiones
  };
  limits: {
    maxMembers: number;
    maxStorage: bigint;
    maxDocuments: number;
    maxOffers: number;
  };
  features: {
    basicReports: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    sso: boolean;
    advancedPermissions: boolean;
    dataExport: boolean;
    auditLogs: boolean;
    customIntegrations: boolean;
  };
  storage: {
    documentsAllowed: boolean;
    imagesAllowed: boolean;
    videosAllowed: boolean;
    maxFileSize: bigint;
  };
  usage: {
    currentMembers: number;
    currentStorage: bigint;
    currentDocuments: number;
    currentOffers: number;
  };
  percentages: {
    members: number;
    storage: number;
    documents: number;
    offers: number;
  };
}

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  reason?: string;
}

export interface FeatureCheckResult {
  hasAccess: boolean;
  feature: string;
  currentPlan: PlanType;
  requiredPlans?: PlanType[];
  reason?: string;
}

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

export class PlanLimitsService {

  /**
   * Obtiene la información completa de límites de una empresa
   */
  async getCompanyLimits(companyId: string): Promise<CompanyLimitsInfo | null> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          Subscription: true,
          CompanyStorage: true
        }
      });

      if (!company || !company.Subscription) {
        return null;
      }

      const subscription = company.Subscription;
      const planType = subscription.planType as PlanType;

      // Obtener límites base del plan
      let planLimits = getPlanLimits(planType);

      // Si tiene configuración personalizada, hacer merge
      // TODO: Implementar isCustom y customConfig en el modelo Subscription
      // if (subscription.isCustom && subscription.customConfig) {
      //   planLimits = merge({}, planLimits, subscription.customConfig);
      // }

      // Calcular uso actual con queries separadas
      const [currentMembers, currentDocuments, currentOffers] = await Promise.all([
        // Contar usuarios que pertenecen a esta empresa (excluyendo el owner)
        prisma.user.count({
          where: {
            Company_Company_userIdToUser: {
              id: companyId
            }
          }
        }),
        // Contar documentos de la empresa
        prisma.document.count({
          where: {
            companyId: companyId,
            isLatestVersion: true
          }
        }),
        // Contar ofertas/proyectos - usaremos CompanyService como proxy
        prisma.companyService.count({
          where: {
            companyId: companyId,
            isActive: true
          }
        })
      ]);

      const currentStorage = company.CompanyStorage?.usedBytes || BigInt(0);

      // Calcular porcentajes de uso
      const calculatePercentage = (current: number, limit: number): number => {
        if (limit === -1) return 0; // Ilimitado
        if (limit === 0) return 100;
        return Math.min(Math.round((current / limit) * 100), 100);
      };

      const storagePercentage = (() => {
        if (planLimits.limits.maxStorage === BigInt(-1)) return 0;
        if (planLimits.limits.maxStorage === BigInt(0)) return 100;
        return Math.min(Math.round((Number(currentStorage) / Number(planLimits.limits.maxStorage)) * 100), 100);
      })();

      return {
        companyId,
        planType,
        subscription: {
          id: subscription.id,
          status: subscription.status
          // TODO: Añadir isCustom y customConfig cuando estén disponibles
        },
        limits: planLimits.limits,
        features: planLimits.features,
        storage: planLimits.storage,
        usage: {
          currentMembers,
          currentStorage,
          currentDocuments,
          currentOffers
        },
        percentages: {
          members: calculatePercentage(currentMembers, planLimits.limits.maxMembers),
          storage: storagePercentage,
          documents: calculatePercentage(currentDocuments, planLimits.limits.maxDocuments),
          offers: calculatePercentage(currentOffers, planLimits.limits.maxOffers)
        }
      };

    } catch (error) {
      console.error('Error obteniendo límites de empresa:', error);
      return null;
    }
  }

  /**
   * Obtiene solo los límites del plan (sin uso actual)
   */
  async getCompanyPlanLimits(companyId: string): Promise<PlanLimits | null> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { companyId }
      });

      if (!subscription) {
        return null;
      }

      const planType = subscription.planType as PlanType;
      let planLimits = getPlanLimits(planType);

      // Aplicar configuración personalizada si existe
      // TODO: Implementar isCustom y customConfig en el modelo Subscription
      // if (subscription.isCustom && subscription.customConfig) {
      //   planLimits = merge({}, planLimits, subscription.customConfig);
      // }

      return planLimits;

    } catch (error) {
      console.error('Error obteniendo límites de plan:', error);
      return null;
    }
  }

  /**
   * Verifica si la empresa puede añadir un nuevo miembro
   */
  async canAddMember(companyId: string): Promise<LimitCheckResult> {
    const companyLimits = await this.getCompanyLimits(companyId);

    if (!companyLimits) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        remaining: 0,
        percentage: 100,
        reason: 'NO_SUBSCRIPTION'
      };
    }

    const { usage, limits } = companyLimits;
    const limit = limits.maxMembers;
    const current = usage.currentMembers;

    // -1 significa ilimitado
    if (limit === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1,
        percentage: 0
      };
    }

    const allowed = current < limit;
    const remaining = Math.max(0, limit - current);
    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 100;

    return {
      allowed,
      current,
      limit,
      remaining,
      percentage,
      reason: !allowed ? 'MEMBER_LIMIT_REACHED' : undefined
    };
  }

  /**
   * Verifica si la empresa puede crear un nuevo proyecto/oferta
   */
  async canCreateProject(companyId: string): Promise<LimitCheckResult> {
    const companyLimits = await this.getCompanyLimits(companyId);

    if (!companyLimits) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        remaining: 0,
        percentage: 100,
        reason: 'NO_SUBSCRIPTION'
      };
    }

    const { usage, limits } = companyLimits;
    const limit = limits.maxOffers;
    const current = usage.currentOffers;

    if (limit === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1,
        percentage: 0
      };
    }

    const allowed = current < limit;
    const remaining = Math.max(0, limit - current);
    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 100;

    return {
      allowed,
      current,
      limit,
      remaining,
      percentage,
      reason: !allowed ? 'PROJECT_LIMIT_REACHED' : undefined
    };
  }

  /**
   * Verifica si la empresa puede crear un nuevo documento
   */
  async canCreateDocument(companyId: string): Promise<LimitCheckResult> {
    const companyLimits = await this.getCompanyLimits(companyId);

    if (!companyLimits) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        remaining: 0,
        percentage: 100,
        reason: 'NO_SUBSCRIPTION'
      };
    }

    const { usage, limits } = companyLimits;
    const limit = limits.maxDocuments;
    const current = usage.currentDocuments;

    if (limit === -1) {
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1,
        percentage: 0
      };
    }

    const allowed = current < limit;
    const remaining = Math.max(0, limit - current);
    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 100;

    return {
      allowed,
      current,
      limit,
      remaining,
      percentage,
      reason: !allowed ? 'DOCUMENT_LIMIT_REACHED' : undefined
    };
  }

  /**
   * Verifica si la empresa puede usar almacenamiento adicional
   */
  async canUseStorage(companyId: string, additionalBytes: bigint): Promise<LimitCheckResult> {
    const companyLimits = await this.getCompanyLimits(companyId);

    if (!companyLimits) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        remaining: 0,
        percentage: 100,
        reason: 'NO_SUBSCRIPTION'
      };
    }

    const { usage, limits } = companyLimits;
    const limit = Number(limits.maxStorage);
    const current = Number(usage.currentStorage);
    const newTotal = current + Number(additionalBytes);

    if (limits.maxStorage === BigInt(-1)) {
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1,
        percentage: 0
      };
    }

    const allowed = newTotal <= limit;
    const remaining = Math.max(0, limit - current);
    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 100;

    return {
      allowed,
      current,
      limit,
      remaining,
      percentage,
      reason: !allowed ? 'STORAGE_LIMIT_REACHED' : undefined
    };
  }

  /**
   * Verifica si la empresa tiene acceso a una característica específica
   */
  async hasFeatureAccess(companyId: string, feature: keyof PlanLimits['features']): Promise<FeatureCheckResult> {
    const companyLimits = await this.getCompanyLimits(companyId);

    if (!companyLimits) {
      return {
        hasAccess: false,
        feature,
        currentPlan: PlanType.BASIC,
        reason: 'NO_SUBSCRIPTION'
      };
    }

    const hasAccess = companyLimits.features[feature];

    if (!hasAccess) {
      // Encontrar qué planes tienen esta característica
      const requiredPlans = getAvailablePlans().filter(plan =>
        planHasFeature(plan, feature)
      );

      return {
        hasAccess: false,
        feature,
        currentPlan: companyLimits.planType,
        requiredPlans,
        reason: 'FEATURE_NOT_AVAILABLE'
      };
    }

    return {
      hasAccess: true,
      feature,
      currentPlan: companyLimits.planType
    };
  }

  /**
   * Obtiene el porcentaje de uso de todos los límites
   */
  async getUsagePercentages(companyId: string): Promise<Record<string, number> | null> {
    const companyLimits = await this.getCompanyLimits(companyId);

    if (!companyLimits) {
      return null;
    }

    return companyLimits.percentages;
  }

  /**
   * Verifica si la empresa está cerca de alcanzar algún límite (>80%)
   */
  async isNearingLimits(companyId: string, threshold = 80): Promise<{
    isNearing: boolean;
    warnings: Array<{
      type: string;
      current: number;
      limit: number;
      percentage: number;
    }>;
  }> {
    const companyLimits = await this.getCompanyLimits(companyId);

    if (!companyLimits) {
      return { isNearing: false, warnings: [] };
    }

    const warnings: Array<{
      type: string;
      current: number;
      limit: number;
      percentage: number;
    }> = [];

    const { usage, limits, percentages } = companyLimits;

    // Verificar miembros
    if (limits.maxMembers !== -1 && percentages.members >= threshold) {
      warnings.push({
        type: 'members',
        current: usage.currentMembers,
        limit: limits.maxMembers,
        percentage: percentages.members
      });
    }

    // Verificar almacenamiento
    if (limits.maxStorage !== BigInt(-1) && percentages.storage >= threshold) {
      warnings.push({
        type: 'storage',
        current: Number(usage.currentStorage),
        limit: Number(limits.maxStorage),
        percentage: percentages.storage
      });
    }

    // Verificar documentos
    if (limits.maxDocuments !== -1 && percentages.documents >= threshold) {
      warnings.push({
        type: 'documents',
        current: usage.currentDocuments,
        limit: limits.maxDocuments,
        percentage: percentages.documents
      });
    }

    // Verificar ofertas
    if (limits.maxOffers !== -1 && percentages.offers >= threshold) {
      warnings.push({
        type: 'offers',
        current: usage.currentOffers,
        limit: limits.maxOffers,
        percentage: percentages.offers
      });
    }

    return {
      isNearing: warnings.length > 0,
      warnings
    };
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

export const planLimitsService = new PlanLimitsService();
export default planLimitsService;