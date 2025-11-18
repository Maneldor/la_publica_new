import { prismaClient } from './prisma';

const PLAN_DATA = [
  {
    planType: 'PIONERES',
    slug: 'pioneres',
    tier: 'PIONERES',
    name: 'Pioneres',
    nameEs: 'Pioneras',
    nameEn: 'Pioneers',
    description: 'Pla gratuït per començar',
    basePrice: 0,
    firstYearDiscount: 0,
    maxActiveOffers: 2,
    maxTeamMembers: 1,
    maxFeaturedOffers: 0,
    maxStorage: 100,
    features: {
      analytics: true,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      aiAssistant: false,
      apiAccess: false
    },
    badge: 'Gratis',
    badgeColor: '#10B981',
    isPioneer: true,
    color: '#10B981',
    icono: '🌱',
    destacado: false,
    priority: 1,
    hasFreeTrial: false,
    isActive: true,
    isVisible: true,
    displayNote: 'Sempre gratis',
    funcionalidades: 'Analítics bàsics, 2 ofertes actives, 1 membre d\'equip',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: true,
    esSistema: true
  },
  {
    planType: 'STANDARD',
    slug: 'estandar',
    tier: 'STANDARD',
    name: 'Estàndard',
    nameEs: 'Estándar',
    nameEn: 'Standard',
    description: 'Pla ideal per empreses en creixement',
    basePrice: 99,
    firstYearDiscount: 20,
    maxActiveOffers: 8,
    maxTeamMembers: 3,
    maxFeaturedOffers: 2,
    maxStorage: 1000,
    features: {
      analytics: true,
      advancedAnalytics: true,
      prioritySupport: false,
      customBranding: true,
      aiAssistant: true,
      apiAccess: false
    },
    badge: 'Popular',
    badgeColor: '#3B82F6',
    isPioneer: false,
    color: '#3B82F6',
    icono: '📈',
    destacado: true,
    priority: 2,
    hasFreeTrial: true,
    trialDurationDays: 14,
    isActive: true,
    isVisible: true,
    displayNote: 'IVA inclòs',
    funcionalidades: 'Analytics avançats, 8 ofertes actives, branding personalitzat, IA bàsic',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: false,
    esSistema: true
  },
  {
    planType: 'STRATEGIC',
    slug: 'estrategic',
    tier: 'STRATEGIC',
    name: 'Estratègic',
    nameEs: 'Estratégico',
    nameEn: 'Strategic',
    description: 'Per empreses que busquen màxim rendiment',
    basePrice: 299,
    firstYearDiscount: 25,
    maxActiveOffers: 25,
    maxTeamMembers: 10,
    maxFeaturedOffers: 5,
    maxStorage: 5000,
    features: {
      analytics: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      aiAssistant: true,
      apiAccess: true
    },
    badge: 'Pro',
    badgeColor: '#8B5CF6',
    isPioneer: false,
    color: '#8B5CF6',
    icono: '🚀',
    destacado: false,
    priority: 3,
    hasFreeTrial: true,
    trialDurationDays: 30,
    isActive: true,
    isVisible: true,
    displayNote: 'IVA inclòs - Suport prioritari',
    funcionalidades: 'Tot l\'anterior + API access, suport prioritari, 25 ofertes',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: false,
    esSistema: true
  },
  {
    planType: 'ENTERPRISE',
    slug: 'enterprise',
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    nameEs: 'Empresarial',
    nameEn: 'Enterprise',
    description: 'Solució a mida per grans empreses',
    basePrice: 999,
    firstYearDiscount: 30,
    maxActiveOffers: 999999,
    maxTeamMembers: 999999,
    maxFeaturedOffers: 999999,
    maxStorage: 999999,
    features: {
      analytics: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      aiAssistant: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedManager: true
    },
    badge: 'Enterprise',
    badgeColor: '#F59E0B',
    isPioneer: false,
    color: '#F59E0B',
    icono: '👑',
    destacado: false,
    priority: 4,
    hasFreeTrial: true,
    trialDurationDays: 30,
    isActive: true,
    isVisible: true,
    displayNote: 'Preu personalitzat - Contacta\'ns',
    funcionalidades: 'Tot inclòs + white label, gestor dedicat, recursos il·limitats',
    priceIncludesVAT: true,
    durationMonths: 12,
    isDefault: false,
    esSistema: true
  }
];

export async function seedPlans() {
  console.log('🌱 Iniciant seed de plans...');

  try {
    // Verificar si ja existeixen plans
    const existingPlans = await prismaClient.planConfig.count();

    if (existingPlans > 0) {
      console.log(`📋 Ja existeixen ${existingPlans} plans. Actualitzant si cal...`);

      // Actualitzar plans existents
      for (const planData of PLAN_DATA) {
        const existing = await prismaClient.planConfig.findFirst({
          where: {
            OR: [
              { planType: planData.planType },
              { tier: planData.tier }
            ]
          }
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
            data: planData
          });
        }
      }
    } else {
      console.log('📝 Creant plans des de zero...');

      // Crear tots els plans
      for (const planData of PLAN_DATA) {
        console.log(`➕ Creant pla: ${planData.name}`);
        await prismaClient.planConfig.create({
          data: planData
        });
      }
    }

    const finalCount = await prismaClient.planConfig.count();
    console.log(`✅ Seed completat. Total plans: ${finalCount}`);

    return { success: true, count: finalCount };

  } catch (error) {
    console.error('❌ Error durant el seed:', error);
    throw error;
  }
}

// Executar directament si es crida l'script
if (require.main === module) {
  seedPlans()
    .then((result) => {
      console.log('🎉 Seed finalitzat:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en seed:', error);
      process.exit(1);
    });
}