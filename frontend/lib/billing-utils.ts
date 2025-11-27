import { PlanTier } from './plans/planService';

export interface PlanLimits {
  tier: PlanTier;
  name: string;
  basePrice: number;
  price: number;
  maxActiveOffers: number;
  maxTeamMembers: number;
  maxOffers: number;
  features: Record<string, boolean>;
}

// Temporal hardcode while migrating - TODO: Replace with API calls
const TEMP_PLAN_CONFIGS: Record<PlanTier, PlanLimits> = {
  'PIONERES': {
    tier: 'PIONERES',
    name: 'Pioneres',
    basePrice: 0,
    price: 0,
    maxActiveOffers: 2,
    maxTeamMembers: 1,
    maxOffers: 2,
    features: { analytics: true, advancedAnalytics: false, prioritySupport: false }
  },
  'STANDARD': {
    tier: 'STANDARD',
    name: 'Estàndard',
    basePrice: 199,
    price: 99.5, // 50% descuento primer año
    maxActiveOffers: 8,
    maxTeamMembers: 3,
    maxOffers: 8,
    features: { analytics: true, advancedAnalytics: true, prioritySupport: false, customBranding: true }
  },
  'STRATEGIC': {
    tier: 'STRATEGIC',
    name: 'Estratègic',
    basePrice: 399,
    price: 199.5, // 50% descuento primer año
    maxActiveOffers: 25,
    maxTeamMembers: 10,
    maxOffers: 25,
    features: { analytics: true, advancedAnalytics: true, prioritySupport: true, customBranding: true, apiAccess: true }
  },
  'ENTERPRISE': {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    basePrice: 999,
    price: 499.5, // 50% descuento primer año
    maxActiveOffers: -1,
    maxTeamMembers: -1,
    maxOffers: -1,
    features: { analytics: true, advancedAnalytics: true, prioritySupport: true, customBranding: true, apiAccess: true, whiteLabel: true }
  }
};

const isUnlimitedValue = (value: number | string) => value === 'unlimited' || value === -1;

export interface ProrationCalculation {
  creditAmount: number;
  newPlanCost: number;
  dueToday: number;
  nextBillingAmount: number;
  daysRemaining: number;
  daysInPeriod: number;
  currentPeriodEnd: Date;
}

export interface PlanComparison {
  currentPlan: PlanLimits;
  newPlan: PlanLimits;
  upgradedFeatures: string[];
  increasedLimits: {
    label: string;
    current: number | string;
    new: number | string;
    improvement: string;
  }[];
  priceDifference: number;
}

/**
 * Calcula el prorrateo per canvi de pla
 */
export function calculateProration(
  currentPlan: PlanTier,
  newPlan: PlanTier,
  currentPeriodStart: Date = new Date(),
  currentPeriodEnd: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 dies per defecte
): ProrationCalculation {
  const today = new Date();

  // Calcular dies restants i totals del període
  const daysRemaining = Math.max(0, Math.ceil((currentPeriodEnd.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
  const daysInPeriod = Math.ceil((currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / (24 * 60 * 60 * 1000));

  const currentPlanPrice = getPlanPrice(currentPlan);
  const newPlanPrice = getPlanPrice(newPlan);

  // Crèdit proporcional del pla actual pels dies no consumits
  const creditAmount = (currentPlanPrice * daysRemaining) / daysInPeriod;

  // Cost proporcional del nou pla pels dies restants
  const newPlanCost = (newPlanPrice * daysRemaining) / daysInPeriod;

  // Import a pagar avui (diferència)
  const dueToday = Math.max(0, newPlanCost - creditAmount);

  // Següent facturació serà el preu complet del nou pla
  const nextBillingAmount = newPlanPrice;

  return {
    creditAmount: Math.round(creditAmount * 100) / 100, // Arrodonir a 2 decimals
    newPlanCost: Math.round(newPlanCost * 100) / 100,
    dueToday: Math.round(dueToday * 100) / 100,
    nextBillingAmount,
    daysRemaining,
    daysInPeriod,
    currentPeriodEnd
  };
}

/**
 * Obté el preu d'un pla
 */
export function getPlanPrice(plan: PlanTier): number {
  return TEMP_PLAN_CONFIGS[plan].price;
}

/**
 * Obté les característiques d'un pla
 */
export function getPlanFeatures(plan: PlanTier): Record<string, boolean> {
  return TEMP_PLAN_CONFIGS[plan].features;
}

/**
 * Obté la configuració completa d'un pla
 */
export function getPlanConfig(plan: PlanTier): PlanLimits {
  return TEMP_PLAN_CONFIGS[plan];
}

/**
 * Compara dos plans i retorna les diferències
 */
export function comparePlans(currentPlan: PlanTier, newPlan: PlanTier): PlanComparison {
  const current = getPlanConfig(currentPlan);
  const newPlanConfig = getPlanConfig(newPlan);

  // Features que es milloren
  const upgradedFeatures: string[] = [];
  Object.keys(newPlanConfig.features).forEach(feature => {
    if (newPlanConfig.features[feature as keyof typeof newPlanConfig.features] &&
        !current.features[feature as keyof typeof current.features]) {
      upgradedFeatures.push(feature);
    }
  });

  // Límits que augmenten
  const increasedLimits = [
    {
      label: 'Ofertes totals',
      current: current.maxOffers,
      new: newPlanConfig.maxOffers,
      improvement: formatLimitImprovement(current.maxOffers, newPlanConfig.maxOffers)
    },
    {
      label: 'Ofertes actives',
      current: current.maxActiveOffers,
      new: newPlanConfig.maxActiveOffers,
      improvement: formatLimitImprovement(current.maxActiveOffers, newPlanConfig.maxActiveOffers)
    },
    // Cupones no están implementados en PlanLimits actualmente
    // {
    //   label: 'Cupons per mes',
    //   current: current.maxCouponsPerMonth,
    //   new: newPlanConfig.maxCouponsPerMonth,
    //   improvement: formatLimitImprovement(current.maxCouponsPerMonth, newPlanConfig.maxCouponsPerMonth)
    // },
    {
      label: 'Membres d\'equip',
      current: current.maxTeamMembers,
      new: newPlanConfig.maxTeamMembers,
      improvement: formatLimitImprovement(current.maxTeamMembers, newPlanConfig.maxTeamMembers)
    }
  ].filter(item => {
    // Només mostrar els que milloren realment
    if (isUnlimitedValue(item.current) && isUnlimitedValue(item.new)) return false;
    if (isUnlimitedValue(item.new) && !isUnlimitedValue(item.current)) return true;
    if (isUnlimitedValue(item.current) && !isUnlimitedValue(item.new)) return false;
    if (String(item.new) === String(item.current)) return false;

    return typeof item.new === 'number' && typeof item.current === 'number' && item.new > item.current;
  });

  const priceDifference = newPlanConfig.price - current.price;

  return {
    currentPlan: current,
    newPlan: newPlanConfig,
    upgradedFeatures,
    increasedLimits,
    priceDifference
  };
}

/**
 * Formata la millora d'un límit per mostrar-la a l'usuari
 */
function formatLimitImprovement(current: number | string, newLimit: number | string): string {
  if (isUnlimitedValue(newLimit)) {
    return '→ Il·limitat';
  }

  if (typeof current === 'number' && typeof newLimit === 'number') {
    const increase = newLimit - current;
    return `+${increase}`;
  }

  return '';
}

/**
 * Determina si és un upgrade o downgrade
 */
export function isUpgrade(currentPlan: PlanTier, newPlan: PlanTier): boolean {
  const planOrder: PlanTier[] = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const newIndex = planOrder.indexOf(newPlan);

  return newIndex > currentIndex;
}

/**
 * Formata un preu per mostrar-lo a l'usuari
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return `${price.toFixed(2)}€`;
}

/**
 * Formata una data de manera amigable
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Tradueix els noms de les features per mostrar-los a l'usuari
 */
export function getFeatureName(featureKey: string): string {
  const featureNames: Record<string, string> = {
    analytics: 'Analytics Bàsics',
    advancedAnalytics: 'Analytics Avançats',
    prioritySupport: 'Suport Prioritari',
    customBranding: 'Branding Personalitzat',
    aiAssistant: 'Assistent IA Bàsic',
    aiAssistantPro: 'Assistent IA Pro',
    apiAccess: 'Accés API',
    whiteLabel: 'White Label',
    dedicatedManager: 'Gestor Dedicat',
    customIntegrations: 'Integracions Personalitzades',
    bulkOperations: 'Operacions Massives',
    advancedReporting: 'Reportes Avançats',
    exportData: 'Exportació de Dades',
  };

  return featureNames[featureKey] || featureKey;
}