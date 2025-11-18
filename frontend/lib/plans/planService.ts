import { prismaClient } from '@/lib/prisma';

export type PlanTier = 'PIONERES' | 'STANDARD' | 'STRATEGIC' | 'ENTERPRISE';

/**
 * Obtener configuración del plan desde BD
 */
export async function getPlanConfigFromDB(tier: PlanTier) {
  const planConfig = await prismaClient.planConfig.findFirst({
    where: { tier }
  });

  if (!planConfig) {
    // Fallback a PIONERES si no se encuentra el plan
    const pioneresPlan = await prismaClient.planConfig.findFirst({
      where: { tier: 'PIONERES' }
    });

    if (!pioneresPlan) {
      throw new Error('No se pudo encontrar configuración de plan');
    }

    return pioneresPlan;
  }

  return planConfig;
}

/**
 * Verificar si se puede crear una oferta
 */
function canCreateOffer(tier: PlanTier, current: number, config: any): boolean {
  if (config.maxActiveOffers === -1) return true; // Ilimitado
  return current < config.maxActiveOffers;
}

/**
 * Verificar si se puede activar una oferta
 */
function canActivateOffer(tier: PlanTier, current: number, config: any): boolean {
  if (config.maxActiveOffers === -1) return true; // Ilimitado
  return current < config.maxActiveOffers;
}

/**
 * Verificar si se puede generar un cupón
 */
function canGenerateCoupon(tier: PlanTier, current: number, config: any): boolean {
  // Los cupones no están implementados en la BD actual, permitir por ahora
  return true;
}

/**
 * Verificar si se puede añadir miembro al equipo
 */
function canAddTeamMember(tier: PlanTier, current: number, config: any): boolean {
  if (config.maxTeamMembers === -1) return true; // Ilimitado
  return current < config.maxTeamMembers;
}

/**
 * Parsear tier del plan desde BD
 */
export function parsePlanTier(tierFromDB: string | null | undefined): PlanTier {
  // Si no hay tier, usar fallback
  if (!tierFromDB) {
    console.warn('⚠️ No tier provided, using PIONERES fallback');
    return 'PIONERES';
  }

  // Normalizar entrada
  const normalized = tierFromDB.toUpperCase().trim();

  // Mapeo exhaustivo (soporta múltiples variantes) - Usando tiers de BD
  const tierMap: Record<string, PlanTier> = {
    // PIONERES
    'PIONERES': 'PIONERES',
    'PIONEER': 'PIONERES',
    'PIONERO': 'PIONERES',
    'FREE': 'PIONERES',
    'GRATIS': 'PIONERES',

    // STANDARD
    'ESTANDAR': 'STANDARD',
    'ESTÀNDARD': 'STANDARD',
    'STANDARD': 'STANDARD',
    'BÁSICO': 'STANDARD',
    'BASICO': 'STANDARD',
    'BASIC': 'STANDARD',

    // STRATEGIC
    'ESTRATEGIC': 'STRATEGIC',
    'ESTRATÈGIC': 'STRATEGIC',
    'STRATEGIC': 'STRATEGIC',
    'PREMIUM': 'STRATEGIC',
    'PRO': 'STRATEGIC',

    // ENTERPRISE
    'ENTERPRISE': 'ENTERPRISE',
    'EMPRESARIAL': 'ENTERPRISE',
    'EMPRESA': 'ENTERPRISE',
    'CORPORATIVO': 'ENTERPRISE',
  };

  const result = tierMap[normalized];

  if (!result) {
    console.warn(`⚠️ Unknown plan tier: "${tierFromDB}", using PIONERES fallback`);
    return 'PIONERES';
  }

  console.log(`✅ Mapped "${tierFromDB}" -> "${result}"`);
  return result;
}

/**
 * Obtener el plan actual de una empresa
 */
export async function getCompanyPlan(companyId: string) {
  const company = await prismaClient.company.findUnique({
    where: { id: companyId },
    include: {
      currentPlan: true,
    },
  });

  if (!company) {
    throw new Error('Empresa no trobada');
  }

  // FALLBACK: Si no tiene plan en BD, usar PIONERES por defecto
  let planTier: PlanTier = 'PIONERES';
  let planData = null;

  if (company.currentPlan) {
    planData = company.currentPlan;
    planTier = parsePlanTier(company.currentPlan.tier || 'PIONERES');
  }

  const config = await getPlanConfigFromDB(planTier);

  return {
    company,
    plan: planData,
    config,
  };
}

/**
 * Verificar si la empresa puede crear una oferta
 */
export async function checkCanCreateOffer(companyId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number | 'unlimited';
}> {
  const { config } = await getCompanyPlan(companyId);

  const currentOffers = await prismaClient.offer.count({
    where: { companyId },
  });

  const allowed = canCreateOffer(config.tier, currentOffers, config);

  return {
    allowed,
    reason: allowed ? undefined : `Has arribat al límit de ${config.maxActiveOffers} ofertes del teu pla ${config.name}`,
    current: currentOffers,
    limit: config.maxActiveOffers,
  };
}

/**
 * Verificar si la empresa puede activar una oferta
 */
export async function checkCanActivateOffer(companyId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number | 'unlimited';
}> {
  const { config } = await getCompanyPlan(companyId);

  const activeOffers = await prismaClient.offer.count({
    where: {
      companyId,
      status: 'PUBLISHED',
    },
  });

  const allowed = canActivateOffer(config.tier, activeOffers, config);

  return {
    allowed,
    reason: allowed ? undefined : `Has arribat al límit de ${config.maxActiveOffers} ofertes actives del teu pla ${config.name}`,
    current: activeOffers,
    limit: config.maxActiveOffers,
  };
}

/**
 * Verificar límite de cupones del mes
 */
export async function checkCanGenerateCoupon(companyId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number | 'unlimited';
}> {
  const { config } = await getCompanyPlan(companyId);

  // Contar cupones generados este mes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // FIX: Usar generatedAt en lugar de createdAt + proteger con try-catch
  const couponsThisMonth = await prismaClient.coupon.count({
    where: {
      offer: {
        companyId,
      },
      generatedAt: {
        gte: startOfMonth,
      },
    },
  }).catch((err) => {
    console.warn('⚠️ Coupon table not found or error in checkCanGenerateCoupon:', err.message);
    return 0;
  });

  const allowed = canGenerateCoupon(config.tier, couponsThisMonth, config);

  return {
    allowed,
    reason: allowed ? undefined : 'Cupons il·limitats disponibles',
    current: couponsThisMonth,
    limit: 'unlimited',
  };
}

/**
 * Verificar si se puede añadir miembro al equipo
 */
export async function checkCanAddTeamMember(companyId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number | 'unlimited';
}> {
  const { config } = await getCompanyPlan(companyId);

  // FIX: User no tiene companyId directo, usar ownedCompanyId o memberCompanyId
  const currentMembers = await prismaClient.user.count({
    where: {
      OR: [
        { ownedCompanyId: companyId },
        { memberCompanyId: companyId },
      ],
    },
  });

  const allowed = canAddTeamMember(config.tier, currentMembers, config);

  return {
    allowed,
    reason: allowed ? undefined : `Has arribat al límit de ${config.maxTeamMembers} membres d'equip del teu pla ${config.name}`,
    current: currentMembers,
    limit: config.maxTeamMembers,
  };
}

/**
 * Obtener estadísticas de uso del plan
 */
export async function getPlanUsageStats(companyId: string) {
  const planInfo = await getCompanyPlan(companyId);
  const config = planInfo.config;

  // DEBUG: Log para ver qué está pasando
  console.log('📊 getPlanUsageStats - Plan info:', {
    companyId,
    hasPlan: !!planInfo.plan,
    planTier: planInfo.plan?.tier,
    configTier: config?.tier,
    configName: config?.name,
  });

  // FALLBACK: Si config es undefined, usar PIONERES
  if (!config) {
    console.warn('⚠️ Config is undefined, using PIONERES fallback');
    const fallbackConfig = await getPlanConfigFromDB('PIONERES');
    
    return {
      offers: {
        current: 0,
        limit: fallbackConfig.maxActiveOffers,
        percentage: 0,
      },
      activeOffers: {
        current: 0,
        limit: fallbackConfig.maxActiveOffers,
        percentage: 0,
      },
      coupons: {
        current: 0,
        limit: 'unlimited', // Los cupones no están implementados
        percentage: 0,
      },
      team: {
        current: 0,
        limit: fallbackConfig.maxTeamMembers,
        percentage: 0,
      },
    };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Usar try-catch para evitar errores si las tablas no existen
  const [
    totalOffers,
    activeOffers,
    couponsThisMonth,
    teamMembers,
  ] = await Promise.all([
    // Ofertas (siempre disponible)
    prismaClient.offer.count({ where: { companyId } }).catch(() => 0),
    prismaClient.offer.count({ where: { companyId, status: 'PUBLISHED' } }).catch(() => 0),

    // Cupones (puede no existir la tabla)
    prismaClient.coupon.count({
      where: {
        offer: { companyId },
        generatedAt: { gte: startOfMonth },
      },
    }).catch((err) => {
      console.warn('⚠️ Coupon table not found or error:', err.message);
      return 0;
    }),

    // Miembros del equipo
    prismaClient.user.count({
      where: {
        OR: [
          { ownedCompanyId: companyId },
          { memberCompanyId: companyId },
        ],
      },
    }).catch(() => 1), // Al menos debe haber 1 (el owner)
  ]);

  return {
    offers: {
      current: totalOffers,
      limit: config.maxActiveOffers === -1 ? 'unlimited' : config.maxActiveOffers,
      percentage: config.maxActiveOffers === -1 ? 0 : Math.round((totalOffers / config.maxActiveOffers) * 100),
    },
    activeOffers: {
      current: activeOffers,
      limit: config.maxActiveOffers === -1 ? 'unlimited' : config.maxActiveOffers,
      percentage: config.maxActiveOffers === -1 ? 0 : Math.round((activeOffers / config.maxActiveOffers) * 100),
    },
    coupons: {
      current: couponsThisMonth,
      limit: 'unlimited', // Los cupones no están implementados
      percentage: 0,
    },
    team: {
      current: teamMembers,
      limit: config.maxTeamMembers === -1 ? 'unlimited' : config.maxTeamMembers,
      percentage: config.maxTeamMembers === -1 ? 0 : Math.round((teamMembers / config.maxTeamMembers) * 100),
    },
  };
}

/**
 * Verificar si la empresa puede hacer upgrade a un plan específico
 */
export async function canUpgradeToPlan(companyId: string, targetTier: PlanTier): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const { config: currentConfig } = await getCompanyPlan(companyId);

  // Orden de planes para verificar upgrade
  const planOrder: PlanTier[] = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
  const currentIndex = planOrder.indexOf(currentConfig.tier);
  const targetIndex = planOrder.indexOf(targetTier);

  if (currentIndex === -1) {
    return { allowed: false, reason: 'Pla actual no reconegut' };
  }

  if (targetIndex === -1) {
    return { allowed: false, reason: 'Pla destí no reconegut' };
  }

  if (targetIndex === currentIndex) {
    return { allowed: false, reason: 'Ja tens aquest pla actiu' };
  }

  if (targetIndex < currentIndex) {
    return { allowed: false, reason: 'No es poden fer downgrades automàtics' };
  }

  return { allowed: true };
}

/**
 * Realizar el upgrade del plan
 */
export async function upgradePlan(companyId: string, newTier: PlanTier): Promise<{
  success: boolean;
  message: string;
  newPlan?: any;
}> {
  try {
    const company = await prismaClient.company.findUnique({
      where: { id: companyId },
      include: {
        currentPlan: true,
      },
    });

    if (!company) {
      return { success: false, message: 'Empresa no trobada' };
    }

    const newConfig = await getPlanConfigFromDB(newTier);

    if (company.currentPlan) {
      // Actualitzar pla existent
      await prismaClient.subscription.update({
        where: { id: company.currentPlan.id },
        data: {
          tier: newTier,
          updatedAt: new Date(),
        },
      });
    } else {
      // Crear nou pla
      await prismaClient.subscription.create({
        data: {
          companyId: company.id,
          tier: newTier,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      message: `Pla actualitzat a ${newConfig.name}`,
      newPlan: {
        tier: newTier,
        name: newConfig.name,
        price: newConfig.basePrice,
      },
    };

  } catch (error) {
    console.error('Error upgrading plan:', error);
    return { success: false, message: 'Error actualitzant el pla' };
  }
}