// lib/plan-limits/check-limits.ts
import { prismaClient } from '@/lib/prisma';

/**
 * Tipos de límites que se pueden validar
 */
export type LimitType =
  | 'activeOffers'
  | 'teamMembers'
  | 'featuredOffers'
  | 'storage';

/**
 * Resultado de la validación de límites
 */
export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  limitType: LimitType;
  message?: string;
}

/**
 * Verificar si una empresa puede realizar una acción según los límites de su plan
 */
export async function checkCompanyLimit(
  companyId: string,
  limitType: LimitType
): Promise<LimitCheckResult> {

  // Obtener empresa con plan y subscription
  const company = await prismaClient.company.findUnique({
    where: { id: companyId },
    include: {
      currentPlan: true,
      subscriptions: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!company) {
    throw new Error('Empresa no encontrada');
  }

  if (!company.currentPlan) {
    throw new Error('Empresa sin plan asignado');
  }

  // Obtener límite del plan
  const limit = getLimitValue(company.currentPlan, limitType);

  if (limit === -1) {
    // Ilimitado
    return {
      allowed: true,
      current: 0,
      limit: -1,
      remaining: -1,
      limitType,
      message: 'Límite ilimitado'
    };
  }

  // Obtener uso actual
  const current = await getCurrentUsage(companyId, limitType);

  const remaining = Math.max(0, limit - current);
  const allowed = current < limit;

  return {
    allowed,
    current,
    limit,
    remaining,
    limitType,
    message: allowed
      ? `Uso: ${current}/${limit}`
      : `Has alcanzado el límite de ${limit} ${getLimitLabel(limitType)}`
  };
}

/**
 * Verificar múltiples límites a la vez
 */
export async function checkMultipleLimits(
  companyId: string,
  limitTypes: LimitType[]
): Promise<Record<LimitType, LimitCheckResult>> {
  const results = await Promise.all(
    limitTypes.map(type => checkCompanyLimit(companyId, type))
  );

  return limitTypes.reduce((acc, type, index) => {
    acc[type] = results[index];
    return acc;
  }, {} as Record<LimitType, LimitCheckResult>);
}

/**
 * Obtener el valor del límite desde el plan
 */
function getLimitValue(plan: any, limitType: LimitType): number {
  switch (limitType) {
    case 'activeOffers':
      return plan.maxActiveOffers ?? -1;
    case 'teamMembers':
      return plan.maxTeamMembers ?? -1;
    case 'featuredOffers':
      return plan.maxFeaturedOffers ?? -1;
    case 'storage':
      return plan.maxStorage ?? -1;
    default:
      return -1;
  }
}

/**
 * Obtener uso actual de la empresa
 */
async function getCurrentUsage(companyId: string, limitType: LimitType): Promise<number> {
  switch (limitType) {
    case 'activeOffers':
      // TODO: Implementar cuando tengas modelo de ofertas
      // return await prismaClient.offer.count({
      //   where: { companyId, isActive: true }
      // });
      return 0;

    case 'teamMembers':
      return await prismaClient.user.count({
        where: {
          OR: [
            { ownedCompanyId: companyId },
            { memberCompanyId: companyId }
          ]
        }
      });

    case 'featuredOffers':
      // TODO: Implementar cuando tengas modelo de ofertas
      // return await prismaClient.offer.count({
      //   where: { companyId, isFeatured: true }
      // });
      return 0;

    case 'storage':
      // TODO: Implementar cálculo de storage usado
      // Suma de tamaños de archivos subidos
      return 0;

    default:
      return 0;
  }
}

/**
 * Obtener etiqueta legible del tipo de límite
 */
function getLimitLabel(limitType: LimitType): string {
  const labels: Record<LimitType, string> = {
    activeOffers: 'ofertas activas',
    teamMembers: 'miembros del equipo',
    featuredOffers: 'ofertas destacadas',
    storage: 'GB de almacenamiento'
  };
  return labels[limitType];
}

/**
 * Verificar si una empresa puede añadir N elementos más
 */
export async function canAddMore(
  companyId: string,
  limitType: LimitType,
  quantity: number = 1
): Promise<LimitCheckResult> {
  const check = await checkCompanyLimit(companyId, limitType);

  if (check.limit === -1) {
    return check; // Ilimitado
  }

  const wouldExceed = (check.current + quantity) > check.limit;

  return {
    ...check,
    allowed: !wouldExceed,
    message: wouldExceed
      ? `No puedes añadir ${quantity} más. Límite: ${check.limit}, Actual: ${check.current}`
      : `Puedes añadir ${quantity} más. Quedarían ${check.remaining - quantity} disponibles.`
  };
}