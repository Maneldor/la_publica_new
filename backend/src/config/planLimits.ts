// ============================================================================
// CONFIGURACIÓN DE LÍMITES DE PLANES - LA PÚBLICA
// ============================================================================

export enum PlanType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  EMPRESARIAL = 'EMPRESARIAL'
}

export interface PlanLimits {
  planType: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  limits: {
    maxMembers: number;
    maxStorage: bigint; // en bytes
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
    maxFileSize: bigint; // en bytes
  };
}

// Configuración de límites por plan
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.BASIC]: {
    planType: PlanType.BASIC,
    name: 'Plan Básico',
    description: 'Ideal para empresas pequeñas que empiezan',
    price: {
      monthly: 29,
      annual: 290 // 2 meses gratis
    },
    limits: {
      maxMembers: 1,
      maxStorage: BigInt(1 * 1024 * 1024 * 1024), // 1GB
      maxDocuments: 10,
      maxOffers: 3
    },
    features: {
      basicReports: true,
      advancedReports: false,
      prioritySupport: false,
      apiAccess: false,
      customBranding: false,
      sso: false,
      advancedPermissions: false,
      dataExport: false,
      auditLogs: false,
      customIntegrations: false
    },
    storage: {
      documentsAllowed: true,
      imagesAllowed: true,
      videosAllowed: false,
      maxFileSize: BigInt(10 * 1024 * 1024) // 10MB
    }
  },

  [PlanType.STANDARD]: {
    planType: PlanType.STANDARD,
    name: 'Plan Estándar',
    description: 'Para empresas en crecimiento con más necesidades',
    price: {
      monthly: 79,
      annual: 790 // 2 meses gratis
    },
    limits: {
      maxMembers: 3,
      maxStorage: BigInt(5 * 1024 * 1024 * 1024), // 5GB
      maxDocuments: 50,
      maxOffers: 10
    },
    features: {
      basicReports: true,
      advancedReports: true,
      prioritySupport: false,
      apiAccess: false,
      customBranding: false,
      sso: false,
      advancedPermissions: true,
      dataExport: true,
      auditLogs: false,
      customIntegrations: false
    },
    storage: {
      documentsAllowed: true,
      imagesAllowed: true,
      videosAllowed: true,
      maxFileSize: BigInt(50 * 1024 * 1024) // 50MB
    }
  },

  [PlanType.PREMIUM]: {
    planType: PlanType.PREMIUM,
    name: 'Plan Premium',
    description: 'Para empresas establecidas con necesidades avanzadas',
    price: {
      monthly: 149,
      annual: 1490 // 2 meses gratis
    },
    limits: {
      maxMembers: 10,
      maxStorage: BigInt(20 * 1024 * 1024 * 1024), // 20GB
      maxDocuments: 200,
      maxOffers: 25
    },
    features: {
      basicReports: true,
      advancedReports: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      sso: false,
      advancedPermissions: true,
      dataExport: true,
      auditLogs: true,
      customIntegrations: false
    },
    storage: {
      documentsAllowed: true,
      imagesAllowed: true,
      videosAllowed: true,
      maxFileSize: BigInt(100 * 1024 * 1024) // 100MB
    }
  },

  [PlanType.EMPRESARIAL]: {
    planType: PlanType.EMPRESARIAL,
    name: 'Plan Empresarial',
    description: 'Para grandes empresas con necesidades corporativas',
    price: {
      monthly: 299,
      annual: 2990 // 2 meses gratis
    },
    limits: {
      maxMembers: 25,
      maxStorage: BigInt(100 * 1024 * 1024 * 1024), // 100GB
      maxDocuments: 1000,
      maxOffers: 100
    },
    features: {
      basicReports: true,
      advancedReports: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      sso: true,
      advancedPermissions: true,
      dataExport: true,
      auditLogs: true,
      customIntegrations: true
    },
    storage: {
      documentsAllowed: true,
      imagesAllowed: true,
      videosAllowed: true,
      maxFileSize: BigInt(500 * 1024 * 1024) // 500MB
    }
  }
};

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Obtiene los límites de un plan específico
 */
export function getPlanLimits(planType: PlanType): PlanLimits {
  return PLAN_LIMITS[planType];
}

/**
 * Verifica si un plan tiene una característica específica
 */
export function planHasFeature(planType: PlanType, feature: keyof PlanLimits['features']): boolean {
  return PLAN_LIMITS[planType].features[feature];
}

/**
 * Obtiene todos los tipos de planes disponibles
 */
export function getAvailablePlans(): PlanType[] {
  return Object.values(PlanType);
}

/**
 * Verifica si se puede actualizar de un plan a otro
 */
export function canUpgradePlan(fromPlan: PlanType, toPlan: PlanType): boolean {
  const planOrder = [PlanType.BASIC, PlanType.STANDARD, PlanType.PREMIUM, PlanType.EMPRESARIAL];
  const fromIndex = planOrder.indexOf(fromPlan);
  const toIndex = planOrder.indexOf(toPlan);
  return toIndex > fromIndex;
}

/**
 * Verifica si se puede degradar de un plan a otro
 */
export function canDowngradePlan(fromPlan: PlanType, toPlan: PlanType): boolean {
  const planOrder = [PlanType.BASIC, PlanType.STANDARD, PlanType.PREMIUM, PlanType.EMPRESARIAL];
  const fromIndex = planOrder.indexOf(fromPlan);
  const toIndex = planOrder.indexOf(toPlan);
  return toIndex < fromIndex;
}

/**
 * Verifica si un uso actual está dentro de los límites del plan
 */
export interface UsageStats {
  currentMembers: number;
  currentStorage: bigint;
  currentDocuments: number;
  currentOffers: number;
}

export function isWithinPlanLimits(planType: PlanType, usage: UsageStats): {
  isValid: boolean;
  violations: string[];
} {
  const limits = getPlanLimits(planType);
  const violations: string[] = [];

  if (usage.currentMembers > limits.limits.maxMembers) {
    violations.push(`Excedido límite de miembros: ${usage.currentMembers}/${limits.limits.maxMembers}`);
  }

  if (usage.currentStorage > limits.limits.maxStorage) {
    violations.push(`Excedido límite de almacenamiento: ${formatBytes(usage.currentStorage)}/${formatBytes(limits.limits.maxStorage)}`);
  }

  if (usage.currentDocuments > limits.limits.maxDocuments) {
    violations.push(`Excedido límite de documentos: ${usage.currentDocuments}/${limits.limits.maxDocuments}`);
  }

  if (usage.currentOffers > limits.limits.maxOffers) {
    violations.push(`Excedido límite de ofertas: ${usage.currentOffers}/${limits.limits.maxOffers}`);
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Calcula el costo de cambio de plan con prorrateo
 */
export function calculatePlanChangeCost(
  fromPlan: PlanType,
  toPlan: PlanType,
  billingCycle: 'MONTHLY' | 'ANNUAL',
  daysRemaining: number
): {
  refund: number;
  newCharge: number;
  netAmount: number;
} {
  const fromLimits = getPlanLimits(fromPlan);
  const toLimits = getPlanLimits(toPlan);

  const fromPrice = billingCycle === 'MONTHLY' ? fromLimits.price.monthly : fromLimits.price.annual;
  const toPrice = billingCycle === 'MONTHLY' ? toLimits.price.monthly : toLimits.price.annual;

  const totalDays = billingCycle === 'MONTHLY' ? 30 : 365;
  const daysUsed = totalDays - daysRemaining;

  // Calcular reembolso proporcional del plan anterior
  const refund = (fromPrice * daysRemaining) / totalDays;

  // Calcular costo proporcional del nuevo plan
  const newCharge = (toPrice * daysRemaining) / totalDays;

  return {
    refund: Math.round(refund * 100) / 100,
    newCharge: Math.round(newCharge * 100) / 100,
    netAmount: Math.round((newCharge - refund) * 100) / 100
  };
}

/**
 * Formatea bytes a una representación legible
 */
export function formatBytes(bytes: bigint): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Number(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

/**
 * Convierte string de tamaño a bytes
 */
export function parseSize(sizeStr: string): bigint {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  const multipliers: Record<string, bigint> = {
    'B': BigInt(1),
    'KB': BigInt(1024),
    'MB': BigInt(1024 * 1024),
    'GB': BigInt(1024 * 1024 * 1024),
    'TB': BigInt(1024 * 1024 * 1024 * 1024)
  };

  return BigInt(Math.round(value)) * multipliers[unit];
}

/**
 * Obtiene el siguiente plan recomendado para upgrade
 */
export function getNextPlanUpgrade(currentPlan: PlanType): PlanType | null {
  const planOrder = [PlanType.BASIC, PlanType.STANDARD, PlanType.PREMIUM, PlanType.EMPRESARIAL];
  const currentIndex = planOrder.indexOf(currentPlan);

  if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
    return null;
  }

  return planOrder[currentIndex + 1];
}

/**
 * Obtiene recomendaciones de plan basadas en el uso actual
 */
export function getPlanRecommendation(usage: UsageStats): {
  recommendedPlan: PlanType;
  reason: string;
  wouldFitInCurrent?: PlanType;
} {
  const plans = getAvailablePlans();

  // Buscar el plan más pequeño que acomode el uso actual
  for (const plan of plans) {
    const check = isWithinPlanLimits(plan, usage);
    if (check.isValid) {
      return {
        recommendedPlan: plan,
        reason: `Tu uso actual se ajusta perfectamente al plan ${getPlanLimits(plan).name}`,
        wouldFitInCurrent: plan
      };
    }
  }

  // Si ningún plan acomoda el uso, recomendar el más alto
  return {
    recommendedPlan: PlanType.EMPRESARIAL,
    reason: 'Tu uso actual excede nuestros planes estándar. Contacta con nuestro equipo para una solución personalizada.'
  };
}

// ============================================================================
// CONSTANTES ADICIONALES
// ============================================================================

export const DEFAULT_PLAN = PlanType.BASIC;

export const PLAN_COLORS: Record<PlanType, string> = {
  [PlanType.BASIC]: '#10B981',      // verde
  [PlanType.STANDARD]: '#3B82F6',   // azul
  [PlanType.PREMIUM]: '#8B5CF6',    // púrpura
  [PlanType.EMPRESARIAL]: '#F59E0B' // amarillo
};

export const PLAN_FEATURES_DESCRIPTIONS = {
  basicReports: 'Informes básicos de actividad y uso',
  advancedReports: 'Análisis avanzados y métricas detalladas',
  prioritySupport: 'Soporte prioritario con respuesta en 24h',
  apiAccess: 'Acceso completo a la API REST',
  customBranding: 'Personalización con tu marca y colores',
  sso: 'Single Sign-On (SSO) para empresas',
  advancedPermissions: 'Gestión avanzada de permisos y roles',
  dataExport: 'Exportación completa de datos',
  auditLogs: 'Logs de auditoría y trazabilidad',
  customIntegrations: 'Integraciones personalizadas'
};