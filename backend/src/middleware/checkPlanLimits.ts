// ============================================================================
// MIDDLEWARE DE VALIDACIÓN DE LÍMITES DE PLANES - LA PÚBLICA
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import {
  planLimitsService,
  LimitCheckResult,
  FeatureCheckResult
} from '../services/planLimits.service';
import {
  PlanType,
  PlanLimits,
  getAvailablePlans,
  planHasFeature,
  PLAN_LIMITS
} from '../config/planLimits';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface PlanLimitInfo {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  reason?: string;
}

export interface FeatureAccessInfo {
  hasAccess: boolean;
  feature: string;
  currentPlan: PlanType;
  requiredPlans?: PlanType[];
  reason?: string;
}

// Extender el tipo Request para incluir información de límites
declare global {
  namespace Express {
    interface Request {
      planLimits?: PlanLimitInfo;
      featureAccess?: FeatureAccessInfo;
      companyId?: string;
    }
  }
}

// ============================================================================
// MENSAJES DE ERROR
// ============================================================================

const ERROR_MESSAGES = {
  MEMBER_LIMIT_REACHED: "Has arribat al límit de membres del teu pla",
  PROJECT_LIMIT_REACHED: "Has arribat al límit de projectes del teu pla",
  DOCUMENT_LIMIT_REACHED: "Has arribat al límit de documents del teu pla",
  STORAGE_LIMIT_REACHED: "Has arribat al límit d'emmagatzematge del teu pla",
  FEATURE_NOT_AVAILABLE: "Aquesta funcionalitat no està disponible al teu pla",
  NO_SUBSCRIPTION: "No s'ha trobat una subscripció activa per aquesta empresa",
  INVALID_COMPANY: "No s'ha pogut identificar l'empresa"
};

const RESOURCE_NAMES = {
  member: "membre",
  members: "membres",
  project: "projecte",
  projects: "projectes",
  document: "document",
  documents: "documents",
  storage: "emmagatzematge",
  offer: "oferta",
  offers: "ofertes"
};

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Extrae el companyId del request (desde user.companyId o params)
 */
function getCompanyIdFromRequest(req: Request): string | null {
  // Desde el usuario autenticado
  if (req.user && (req.user as any).companyId) {
    return (req.user as any).companyId;
  }

  // Desde los parámetros de la URL
  if (req.params.companyId) {
    return req.params.companyId;
  }

  // Desde el body
  if (req.body.companyId) {
    return req.body.companyId;
  }

  return null;
}

/**
 * Genera un mensaje de error descriptivo para límites alcanzados
 */
function getLimitMessage(
  reason: string,
  resourceType: keyof typeof RESOURCE_NAMES,
  current: number,
  limit: number
): string {
  const resourceName = RESOURCE_NAMES[resourceType] || resourceType;

  switch (reason) {
    case 'MEMBER_LIMIT_REACHED':
      return `Has arribat al límit de ${current}/${limit} ${resourceName}s del teu pla`;
    case 'PROJECT_LIMIT_REACHED':
      return `Has arribat al límit de ${current}/${limit} ${resourceName}s del teu pla`;
    case 'DOCUMENT_LIMIT_REACHED':
      return `Has arribat al límit de ${current}/${limit} ${resourceName}s del teu pla`;
    case 'STORAGE_LIMIT_REACHED':
      return `Has arribat al límit d'${resourceName} del teu pla`;
    default:
      return ERROR_MESSAGES[reason as keyof typeof ERROR_MESSAGES] || 'Has arribat al límit del teu pla';
  }
}

/**
 * Obtiene los planes que tienen una característica específica
 */
function getPlansWithFeature(feature: keyof PlanLimits['features']): PlanType[] {
  return getAvailablePlans().filter(plan => planHasFeature(plan, feature));
}

/**
 * Genera sugerencias de planes para upgrade
 */
function getSuggestedPlans(currentPlan: PlanType): PlanType[] {
  const planOrder = [PlanType.BASIC, PlanType.STANDARD, PlanType.PREMIUM, PlanType.EMPRESARIAL];
  const currentIndex = planOrder.indexOf(currentPlan);

  if (currentIndex === -1) return [PlanType.STANDARD, PlanType.PREMIUM];

  return planOrder.slice(currentIndex + 1);
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

/**
 * Middleware para verificar acceso a una característica específica
 */
export function requireFeature(feature: keyof PlanLimits['features']) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = getCompanyIdFromRequest(req);

      if (!companyId) {
        return res.status(400).json({
          error: 'INVALID_COMPANY',
          message: ERROR_MESSAGES.INVALID_COMPANY
        });
      }

      const featureCheck = await planLimitsService.hasFeatureAccess(companyId, feature);

      // Añadir información al request para uso posterior
      req.featureAccess = featureCheck;
      req.companyId = companyId;

      if (!featureCheck.hasAccess) {
        const planNames = {
          [PlanType.BASIC]: 'BASIC',
          [PlanType.STANDARD]: 'STANDARD',
          [PlanType.PREMIUM]: 'PREMIUM',
          [PlanType.EMPRESARIAL]: 'EMPRESARIAL'
        };

        return res.status(403).json({
          error: 'FEATURE_NOT_AVAILABLE',
          message: `La funcionalitat '${feature}' no està disponible al teu pla ${planNames[featureCheck.currentPlan]}`,
          currentPlan: featureCheck.currentPlan,
          requiredPlans: featureCheck.requiredPlans || [],
          feature
        });
      }

      next();
    } catch (error) {
      console.error('Error en requireFeature middleware:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error intern del servidor'
      });
    }
  };
}

/**
 * Middleware para verificar límites antes de crear recursos
 */
export function checkCreateLimit(resourceType: 'member' | 'project' | 'document' | 'storage') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = getCompanyIdFromRequest(req);

      if (!companyId) {
        return res.status(400).json({
          error: 'INVALID_COMPANY',
          message: ERROR_MESSAGES.INVALID_COMPANY
        });
      }

      let limitCheck: LimitCheckResult;

      // Verificar el tipo de recurso específico
      switch (resourceType) {
        case 'member':
          limitCheck = await planLimitsService.canAddMember(companyId);
          break;
        case 'project':
          limitCheck = await planLimitsService.canCreateProject(companyId);
          break;
        case 'document':
          limitCheck = await planLimitsService.canCreateDocument(companyId);
          break;
        case 'storage':
          // Para storage necesitamos el tamaño del archivo del request
          const fileSize = req.body.fileSize || req.file?.size || 0;
          limitCheck = await planLimitsService.canUseStorage(companyId, BigInt(fileSize));
          break;
        default:
          return res.status(400).json({
            error: 'INVALID_RESOURCE_TYPE',
            message: 'Tipus de recurs invàlid'
          });
      }

      // Añadir información al request
      req.planLimits = {
        allowed: limitCheck.allowed,
        current: limitCheck.current,
        limit: limitCheck.limit,
        remaining: limitCheck.remaining,
        percentage: limitCheck.percentage,
        reason: limitCheck.reason
      };
      req.companyId = companyId;

      if (!limitCheck.allowed) {
        const companyLimits = await planLimitsService.getCompanyLimits(companyId);
        const currentPlan = companyLimits?.planType || PlanType.BASIC;
        const suggestedPlans = getSuggestedPlans(currentPlan);

        const message = getLimitMessage(
          limitCheck.reason || 'LIMIT_REACHED',
          resourceType as keyof typeof RESOURCE_NAMES,
          limitCheck.current,
          limitCheck.limit
        );

        return res.status(403).json({
          error: limitCheck.reason || 'LIMIT_REACHED',
          message,
          current: limitCheck.current,
          limit: limitCheck.limit,
          currentPlan,
          suggestedPlans,
          resourceType
        });
      }

      next();
    } catch (error) {
      console.error('Error en checkCreateLimit middleware:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error intern del servidor'
      });
    }
  };
}

/**
 * Middleware para verificar límites de archivo específico
 */
export function checkFileLimit(maxFileSize?: bigint) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = getCompanyIdFromRequest(req);

      if (!companyId) {
        return res.status(400).json({
          error: 'INVALID_COMPANY',
          message: ERROR_MESSAGES.INVALID_COMPANY
        });
      }

      const fileSize = req.file?.size || req.body.fileSize || 0;
      const companyLimits = await planLimitsService.getCompanyLimits(companyId);

      if (!companyLimits) {
        return res.status(404).json({
          error: 'NO_SUBSCRIPTION',
          message: ERROR_MESSAGES.NO_SUBSCRIPTION
        });
      }

      // Verificar tamaño máximo de archivo del plan
      const planMaxFileSize = companyLimits.storage.maxFileSize;
      if (fileSize > Number(planMaxFileSize)) {
        return res.status(413).json({
          error: 'FILE_TOO_LARGE',
          message: `El fitxer és massa gran. Mida màxima permesa: ${Math.round(Number(planMaxFileSize) / 1024 / 1024)}MB`,
          fileSize,
          maxFileSize: Number(planMaxFileSize),
          currentPlan: companyLimits.planType
        });
      }

      // Verificar límite custom si se proporciona
      if (maxFileSize && fileSize > Number(maxFileSize)) {
        return res.status(413).json({
          error: 'FILE_TOO_LARGE',
          message: `El fitxer és massa gran per aquesta operació`,
          fileSize,
          maxFileSize: Number(maxFileSize)
        });
      }

      // Verificar espacio de almacenamiento disponible
      const storageCheck = await planLimitsService.canUseStorage(companyId, BigInt(fileSize));
      if (!storageCheck.allowed) {
        return res.status(403).json({
          error: 'STORAGE_LIMIT_REACHED',
          message: `No hi ha prou espai d'emmagatzematge disponible`,
          current: storageCheck.current,
          limit: storageCheck.limit,
          required: fileSize,
          currentPlan: companyLimits.planType
        });
      }

      req.companyId = companyId;
      next();
    } catch (error) {
      console.error('Error en checkFileLimit middleware:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error intern del servidor'
      });
    }
  };
}

/**
 * Middleware para añadir información de límites al request (no bloquea)
 */
export function addLimitsInfo(resourceType?: 'member' | 'project' | 'document' | 'storage') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = getCompanyIdFromRequest(req);

      if (companyId) {
        const companyLimits = await planLimitsService.getCompanyLimits(companyId);

        if (companyLimits) {
          req.companyId = companyId;

          if (resourceType) {
            let limitCheck: LimitCheckResult;

            switch (resourceType) {
              case 'member':
                limitCheck = await planLimitsService.canAddMember(companyId);
                break;
              case 'project':
                limitCheck = await planLimitsService.canCreateProject(companyId);
                break;
              case 'document':
                limitCheck = await planLimitsService.canCreateDocument(companyId);
                break;
              case 'storage':
                limitCheck = await planLimitsService.canUseStorage(companyId, BigInt(0));
                break;
              default:
                limitCheck = {
                  allowed: true,
                  current: 0,
                  limit: -1,
                  remaining: -1,
                  percentage: 0
                };
            }

            req.planLimits = {
              allowed: limitCheck.allowed,
              current: limitCheck.current,
              limit: limitCheck.limit,
              remaining: limitCheck.remaining,
              percentage: limitCheck.percentage,
              reason: limitCheck.reason
            };
          }
        }
      }

      next();
    } catch (error) {
      console.error('Error en addLimitsInfo middleware:', error);
      // No bloquear el request en caso de error
      next();
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  getLimitMessage,
  getPlansWithFeature,
  getSuggestedPlans,
  getCompanyIdFromRequest,
  ERROR_MESSAGES,
  RESOURCE_NAMES
};