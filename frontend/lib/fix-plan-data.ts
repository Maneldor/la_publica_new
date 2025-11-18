import { prismaClient } from './prisma';

const CORRECTED_PLAN_DATA = [
  {
    slug: 'pioneres',
    tier: 'PIONERES',
    name: 'Empreses Pioneres',
    nameEs: 'Empresas Pioneras',
    nameEn: 'Pioneer Companies',
    description: 'Pla gratuït per començar amb La Pública',
    basePrice: 0,
    firstYearDiscount: 0.5, // 50%
    maxActiveOffers: 2,
    maxTeamMembers: 1,
    maxFeaturedOffers: 0,
    maxStorage: 100,
    hasFreeTrial: true,
    trialDurationDays: 180,
    isActive: true,
    isVisible: true,
    isPioneer: true,
    color: '#FCD34D',
    icono: '🌟',
    badge: 'GRATIS',
    badgeColor: '#FCD34D',
    destacado: false,
    priority: 1,
    displayNote: 'Sempre gratis',
    funcionalidades: 'Analítics bàsics, 2 ofertes actives, 1 membre d\'equip',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: true,
    esSistema: true,
    features: {
      analytics: true,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      aiAssistant: false,
      apiAccess: false,
      whiteLabel: false,
      dedicatedManager: false
    }
  },
  {
    slug: 'estandar',
    tier: 'STANDARD',
    name: 'Estàndard',
    nameEs: 'Estándar',
    nameEn: 'Standard',
    description: 'Pla ideal per empreses en creixement',
    basePrice: 199,
    firstYearDiscount: 0.5, // 50%
    maxActiveOffers: 8,
    maxTeamMembers: 3,
    maxFeaturedOffers: 2,
    maxStorage: 1000,
    hasFreeTrial: false,
    trialDurationDays: null,
    isActive: true,
    isVisible: true,
    isPioneer: false,
    color: '#3B82F6',
    icono: '📊',
    badge: 'RECOMANAT',
    badgeColor: '#3B82F6',
    destacado: true,
    priority: 2,
    displayNote: 'IVA inclòs - 50% descompte primer any',
    funcionalidades: 'Analytics avançats, 8 ofertes actives, branding personalitzat, IA bàsic',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: false,
    esSistema: true,
    features: {
      analytics: true,
      advancedAnalytics: true,
      prioritySupport: false,
      customBranding: true,
      aiAssistant: true,
      apiAccess: false,
      whiteLabel: false,
      dedicatedManager: false
    }
  },
  {
    slug: 'estrategic',
    tier: 'STRATEGIC',
    name: 'Estratègic',
    nameEs: 'Estratégico',
    nameEn: 'Strategic',
    description: 'Per empreses que busquen màxim rendiment',
    basePrice: 399,
    firstYearDiscount: 0.5, // 50%
    maxActiveOffers: 25,
    maxTeamMembers: 10,
    maxFeaturedOffers: 5,
    maxStorage: 5000,
    hasFreeTrial: false,
    trialDurationDays: null,
    isActive: true,
    isVisible: true,
    isPioneer: false,
    color: '#8B5CF6',
    icono: '🚀',
    badge: 'PRO',
    badgeColor: '#8B5CF6',
    destacado: false,
    priority: 3,
    displayNote: 'IVA inclòs - 50% descompte primer any',
    funcionalidades: 'Tot l\'anterior + API access, suport prioritari, 25 ofertes',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: false,
    esSistema: true,
    features: {
      analytics: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      aiAssistant: true,
      apiAccess: true,
      whiteLabel: false,
      dedicatedManager: false
    }
  },
  {
    slug: 'enterprise',
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    nameEs: 'Enterprise',
    nameEn: 'Enterprise',
    description: 'Solució a mida per grans empreses',
    basePrice: 999,
    firstYearDiscount: 0.5, // 50%
    maxActiveOffers: -1, // Il·limitat
    maxTeamMembers: -1, // Il·limitat
    maxFeaturedOffers: -1, // Il·limitat
    maxStorage: -1, // Il·limitat
    hasFreeTrial: false,
    trialDurationDays: null,
    isActive: true,
    isVisible: true,
    isPioneer: false,
    color: '#10B981',
    icono: '👑',
    badge: 'ENTERPRISE',
    badgeColor: '#10B981',
    destacado: false,
    priority: 4,
    displayNote: 'Preu personalitzat - Contacta\'ns',
    funcionalidades: 'Tot inclòs + white label, gestor dedicat, recursos il·limitats',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: false,
    esSistema: true,
    features: {
      analytics: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      aiAssistant: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedManager: true
    }
  }
];

export async function fixPlanData() {
  console.log('🔧 Iniciant correccions de dades de plans...');

  try {
    // Verificar dades actuals
    console.log('\n📋 Dades ABANS de la correcció:');
    const currentData = await prismaClient.planConfig.findMany({
      select: {
        id: true,
        slug: true,
        tier: true,
        name: true,
        basePrice: true,
        firstYearDiscount: true,
        maxActiveOffers: true,
        maxTeamMembers: true,
        isActive: true
      },
      orderBy: { priority: 'asc' }
    });

    currentData.forEach(plan => {
      console.log(`- ${plan.slug}: ${plan.name}, ${plan.basePrice}€, descompte: ${plan.firstYearDiscount}, ofertes: ${plan.maxActiveOffers}`);
    });

    // Aplicar correccions
    console.log('\n🔧 Aplicant correccions...');
    for (const planData of CORRECTED_PLAN_DATA) {
      const existing = await prismaClient.planConfig.findFirst({
        where: { slug: planData.slug }
      });

      if (existing) {
        console.log(`📝 Actualitzant pla: ${planData.name}`);
        await prismaClient.planConfig.update({
          where: { id: existing.id },
          data: planData
        });
      } else {
        console.log(`➕ Creant nou pla: ${planData.name}`);
        await prismaClient.planConfig.create({
          data: {
            ...planData,
            planType: planData.tier
          }
        });
      }
    }

    // Verificar dades DESPRÉS
    console.log('\n✅ Dades DESPRÉS de la correcció:');
    const correctedData = await prismaClient.planConfig.findMany({
      select: {
        id: true,
        slug: true,
        tier: true,
        name: true,
        basePrice: true,
        firstYearDiscount: true,
        maxActiveOffers: true,
        maxTeamMembers: true,
        isActive: true
      },
      orderBy: { priority: 'asc' }
    });

    correctedData.forEach(plan => {
      const firstYearPrice = plan.basePrice === 0 ? 0 : plan.basePrice * (1 - plan.firstYearDiscount);
      console.log(`- ${plan.slug}: ${plan.name}, ${plan.basePrice}€ (primer any: ${firstYearPrice}€), ofertes: ${plan.maxActiveOffers}`);
    });

    console.log('\n🎉 Correccions completades amb èxit!');
    return { success: true, corrected: CORRECTED_PLAN_DATA.length };

  } catch (error) {
    console.error('❌ Error durant les correccions:', error);
    throw error;
  }
}

// Executar directament si es crida l'script
if (require.main === module) {
  fixPlanData()
    .then((result) => {
      console.log('🎉 Correccions finalitzades:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en correccions:', error);
      process.exit(1);
    });
}