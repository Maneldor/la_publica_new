import { PrismaClient, PlanTier } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🌱 Seeding plans de La Pública...');

  // ============================================
  // PLAN 1: EMPRESES PIONERES
  // ============================================
  const planPioneres = await prisma.planConfig.upsert({
    where: { slug: 'empreses-pioneres' },
    update: {},
    create: {
      // Identificadores únicos
      slug: 'empreses-pioneres',
      tier: PlanTier.PIONERES,
      planType: 'PIONERES',

      // Nombres
      name: 'Empreses Pioneres',
      nameEs: 'Empresas Pioneras',
      nameEn: 'Pioneer Companies',
      nombre: 'Empreses Pioneres',
      nombreCorto: 'Pioneres',
      description: 'Pla especial per a empreses pioneres amb 6 mesos gratuïts i avantatges exclusius',
      descripcion: 'Plan especial para empresas pioneras con 6 meses gratuitos y ventajas exclusivas',

      // Precios
      basePrice: 0, // Gratis 6 meses
      precioMensual: 0,
      precioAnual: 500, // Después de 6 meses, 500€/año con 50% desc
      durationMonths: 6,
      firstYearDiscount: 0.5,

      // Límites
      maxActiveOffers: 5,
      maxTeamMembers: 1,
      maxFeaturedOffers: 0,
      maxStorage: 10,

      // Features JSON
      features: {
        offers: {
          maxActive: 5,
          editable: true,
          featured: 0,
          priority: 'high'
        },
        team: {
          maxMembers: 1,
          roles: ['owner']
        },
        analytics: {
          level: 'standard',
          reports: ['basic_stats', 'offer_performance'],
          segmentation: false
        },
        ai: {
          agents: [
            { type: 'commercial', level: 'basic' }
          ]
        },
        support: {
          channels: ['email'],
          priority: 'normal',
          dedicatedManager: true
        },
        marketing: {
          newsletter: true,
          monthlyPublications: 2,
          blog: false
        },
        directory: {
          badge: 'Empreses Pioneres',
          featured: true,
          priority: 100
        }
      },

      // Backward compatibility
      limitesJSON: JSON.stringify({
        maxMembers: 1,
        maxStorage: 10,
        maxProjects: 10,
        maxPosts: 200
      }),
      caracteristicas: 'Ficha empresarial completa, ofertas editables, estadísticas básicas, newsletter, 1 agente IA comercial básico, soporte por email, gestor comercial',

      // Badges
      badge: 'Empreses Pioneres',
      badgeColor: '#FFD700',
      isPioneer: true,
      isDefault: true,

      // Visibilidad
      color: '#FFD700',
      icono: '🌟',
      isActive: true,
      isVisible: true,
      activo: true,
      visible: true,
      destacado: true,
      esSistema: false,
      priority: 100,
      orden: 1,

      // Trial
      hasFreeTrial: true,
      trialDurationDays: 180,

      // IVA
      priceIncludesVAT: true,
      displayNote: '6 mesos gratuïts, després 250€/any (IVA inclòs)'
    }
  });

  console.log('✅ Plan Pioneres creado:', planPioneres.id);

  // ============================================
  // PLAN 2: ESTÀNDARD
  // ============================================
  const planEstandard = await prisma.planConfig.upsert({
    where: { slug: 'estandard' },
    update: {},
    create: {
      // Identificadores únicos
      slug: 'estandard',
      tier: PlanTier.STANDARD,
      planType: 'STANDARD',

      // Nombres
      name: 'Estàndard',
      nameEs: 'Estándar',
      nameEn: 'Standard',
      nombre: 'Pla Estàndard',
      nombreCorto: 'Estàndard',
      description: 'Pla ideal per empreses que volen començar amb totes les funcionalitats bàsiques',
      descripcion: 'Plan ideal para empresas que quieren empezar con todas las funcionalidades básicas',

      // Precios
      basePrice: 500,
      precioMensual: 41.67, // 500/12
      precioAnual: 500,
      durationMonths: 12,
      firstYearDiscount: 0.5,

      // Límites
      maxActiveOffers: 5,
      maxTeamMembers: 1,
      maxFeaturedOffers: 0,
      maxStorage: 20,

      // Features JSON
      features: {
        offers: {
          maxActive: 5,
          editable: true,
          featured: 0,
          priority: 'normal'
        },
        team: {
          maxMembers: 1,
          roles: ['owner']
        },
        analytics: {
          level: 'basic',
          reports: ['basic_stats'],
          segmentation: false
        },
        ai: {
          agents: [
            { type: 'commercial', level: 'basic' }
          ]
        },
        support: {
          channels: ['email'],
          priority: 'normal',
          dedicatedManager: true
        },
        marketing: {
          newsletter: true,
          monthlyPublications: 0,
          blog: false
        }
      },

      // Backward compatibility
      limitesJSON: JSON.stringify({
        maxMembers: 1,
        maxStorage: 20,
        maxProjects: 20,
        maxPosts: 500
      }),
      caracteristicas: 'Ficha empresarial completa, ofertas editables, estadísticas básicas, newsletter, 1 agente IA comercial básico, soporte por email, gestor comercial',

      // Visibilidad
      color: '#3B82F6',
      icono: '📘',
      isActive: true,
      isVisible: true,
      activo: true,
      visible: true,
      destacado: false,
      esSistema: false,
      priority: 50,
      orden: 2,

      // IVA
      priceIncludesVAT: true,
      displayNote: '250€ primer any, després 500€/any (IVA inclòs)'
    }
  });

  console.log('✅ Plan Estàndard creado:', planEstandard.id);

  // ============================================
  // PLAN 3: ESTRATÈGIC
  // ============================================
  const planEstrategic = await prisma.planConfig.upsert({
    where: { slug: 'estrategic' },
    update: {},
    create: {
      // Identificadores únicos
      slug: 'estrategic',
      tier: PlanTier.STRATEGIC,
      planType: 'STRATEGIC',

      // Nombres
      name: 'Estratègic',
      nameEs: 'Estratégico',
      nameEn: 'Strategic',
      nombre: 'Pla Estratègic',
      nombreCorto: 'Estratègic',
      description: 'Pla avançat amb més ofertes, equip ampli i posicionament preferent',
      descripcion: 'Plan avanzado con más ofertas, equipo amplio y posicionamiento preferente',

      // Precios
      basePrice: 1000,
      precioMensual: 83.33, // 1000/12
      precioAnual: 1000,
      durationMonths: 12,
      firstYearDiscount: 0.5,

      // Límites
      maxActiveOffers: 10,
      maxTeamMembers: 3,
      maxFeaturedOffers: 1,
      maxStorage: 50,

      // Features JSON
      features: {
        offers: {
          maxActive: 10,
          editable: true,
          featured: 1,
          priority: 'high'
        },
        team: {
          maxMembers: 3,
          roles: ['owner', 'admin', 'member']
        },
        analytics: {
          level: 'advanced',
          reports: ['basic_stats', 'offer_performance', 'geographic_analysis'],
          segmentation: true
        },
        ai: {
          agents: [
            { type: 'commercial', level: 'basic' },
            { type: 'marketing', level: 'basic' }
          ]
        },
        support: {
          channels: ['email', 'internal_messaging'],
          priority: 'high',
          dedicatedManager: true
        },
        marketing: {
          newsletter: true,
          monthlyPublications: 2,
          blog: true,
          campaigns: ['sectorial']
        },
        branding: {
          report: true
        }
      },

      // Backward compatibility
      limitesJSON: JSON.stringify({
        maxMembers: 3,
        maxStorage: 50,
        maxProjects: 50,
        maxPosts: 1000
      }),
      caracteristicas: 'Tot el d\'Estàndard + posicionament preferent, 1 oferta destacada, publicació sectorial, informe branding, estadístiques ampliades, 2 agentes IA, newsletter ampliada',

      // Visibilidad
      color: '#8B5CF6',
      icono: '🚀',
      isActive: true,
      isVisible: true,
      activo: true,
      visible: true,
      destacado: true,
      esSistema: false,
      priority: 75,
      orden: 3,

      // IVA
      priceIncludesVAT: true,
      displayNote: '500€ primer any, després 1.000€/any (IVA inclòs)'
    }
  });

  console.log('✅ Plan Estratègic creado:', planEstrategic.id);

  // ============================================
  // PLAN 4: ENTERPRISE
  // ============================================
  const planEnterprise = await prisma.planConfig.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      // Identificadores únicos
      slug: 'enterprise',
      tier: PlanTier.ENTERPRISE,
      planType: 'ENTERPRISE',

      // Nombres
      name: 'Enterprise',
      nameEs: 'Enterprise',
      nameEn: 'Enterprise',
      nombre: 'Pla Enterprise',
      nombreCorto: 'Enterprise',
      description: 'Solució completa per grans empreses amb ofertes il·limitades i analítiques Pro',
      descripcion: 'Solución completa para grandes empresas con ofertas ilimitadas y analíticas Pro',

      // Precios
      basePrice: 2000,
      precioMensual: 166.67, // 2000/12
      precioAnual: 2000,
      durationMonths: 12,
      firstYearDiscount: 0.5,

      // Límites
      maxActiveOffers: null, // Ilimitado
      maxTeamMembers: 5,
      maxFeaturedOffers: 3,
      maxStorage: 200,

      // Features JSON
      features: {
        offers: {
          maxActive: null, // Ilimitado
          editable: true,
          featured: 3,
          priority: 'maximum'
        },
        team: {
          maxMembers: 5,
          roles: ['owner', 'admin', 'manager', 'member']
        },
        analytics: {
          level: 'pro',
          reports: ['all'],
          segmentation: true,
          geographic: true,
          comparative: true,
          professional: true
        },
        ai: {
          agents: [
            { type: 'commercial', level: 'pro' },
            { type: 'marketing', level: 'pro' }
          ]
        },
        support: {
          channels: ['email', 'internal_messaging', 'priority'],
          priority: 'urgent',
          dedicatedManager: true,
          annualMeeting: true
        },
        marketing: {
          newsletter: true,
          monthlyPublications: 'unlimited',
          blog: true,
          campaigns: ['exclusive'],
          editorial: true
        },
        integrations: {
          api: true,
          smartLinks: true,
          tracking: true
        },
        dashboard: {
          type: 'pro'
        }
      },

      // Backward compatibility
      limitesJSON: JSON.stringify({
        maxMembers: 5,
        maxStorage: 200,
        maxProjects: 999999,
        maxPosts: 999999
      }),
      caracteristicas: 'Tot el d\'Estratègic + ofertes il·limitades, 3 ofertes destacades, analítiques Pro, Dashboard Pro, integració API, 2 Agents IA Pro, campañes exclusives, suport prioritari',

      // Visibilidad
      color: '#EF4444',
      icono: '⚡',
      isActive: true,
      isVisible: true,
      activo: true,
      visible: true,
      destacado: true,
      esSistema: false,
      priority: 90,
      orden: 4,

      // IVA
      priceIncludesVAT: true,
      displayNote: '1.000€ primer any, després 2.000€/any (IVA inclòs)'
    }
  });

  console.log('✅ Plan Enterprise creado:', planEnterprise.id);

  console.log('\n✅ Tots els plans de La Pública creats correctament!\n');
}

// Ejecutar
seedPlans()
  .catch((e) => {
    console.error('❌ Error en seed de plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });