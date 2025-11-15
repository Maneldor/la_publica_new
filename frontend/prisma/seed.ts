import { PrismaClient, UserType, CompanyRole, SubscriptionStatus, PlanTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// SEED: EXTRAS - CATÁLOGO DE SERVICIOS
// ============================================

async function seedExtras() {
  console.log('🎨 Creando extras...');

  const extras = [
    // WEB_MAINTENANCE
    {
      name: 'Manteniment Web Bàsic',
      slug: 'manteniment-web-basic',
      description: 'Actualitzacions mensuals, còpies de seguretat i monitoratge bàsic del lloc web.',
      category: 'WEB_MAINTENANCE',
      basePrice: 49.00,
      priceType: 'MONTHLY',
      active: true,
      featured: true,
      icon: '🔧',
      order: 1,
    },
    {
      name: 'Manteniment Web Premium',
      slug: 'manteniment-web-premium',
      description: 'Incloure tot el bàsic + optimització SEO mensual + suport prioritari.',
      category: 'WEB_MAINTENANCE',
      basePrice: 99.00,
      priceType: 'MONTHLY',
      active: true,
      featured: true,
      icon: '⚙️',
      order: 2,
    },

    // BRANDING
    {
      name: 'Disseny de Logotip',
      slug: 'disseny-logotip',
      description: 'Disseny profesional de logotip amb 3 propostes i revisions il·limitades.',
      category: 'BRANDING',
      basePrice: 450.00,
      priceType: 'FIXED',
      active: true,
      featured: true,
      icon: '🎨',
      order: 3,
    },
    {
      name: 'Manual de Marca Complet',
      slug: 'manual-marca-complet',
      description: 'Logotip + paleta de colors + tipografies + guia d\'ús en PDF professional.',
      category: 'BRANDING',
      basePrice: 890.00,
      priceType: 'FIXED',
      active: true,
      featured: false,
      icon: '📘',
      order: 4,
    },

    // MARKETING
    {
      name: 'Gestió Xarxes Socials',
      slug: 'gestio-xarxes-socials',
      description: 'Gestió professional de 3 xarxes socials amb 12 posts mensuals.',
      category: 'MARKETING',
      basePrice: 299.00,
      priceType: 'MONTHLY',
      active: true,
      featured: true,
      icon: '📱',
      order: 5,
    },
    {
      name: 'Campanya Google Ads',
      slug: 'campanya-google-ads',
      description: 'Configuració i gestió de campanya Google Ads per 1 mes.',
      category: 'MARKETING',
      basePrice: 350.00,
      priceType: 'MONTHLY',
      active: true,
      featured: false,
      icon: '🎯',
      order: 6,
    },

    // SEO
    {
      name: 'Auditoria SEO',
      slug: 'auditoria-seo',
      description: 'Anàlisi complet del lloc web amb informe detallat i recomanacions.',
      category: 'SEO',
      basePrice: 250.00,
      priceType: 'FIXED',
      active: true,
      featured: false,
      icon: '🔍',
      order: 7,
    },
    {
      name: 'SEO Mensual',
      slug: 'seo-mensual',
      description: 'Optimització contínua, link building i informes mensuals de posicionament.',
      category: 'SEO',
      basePrice: 199.00,
      priceType: 'MONTHLY',
      active: true,
      featured: true,
      icon: '📈',
      order: 8,
    },

    // CONTENT
    {
      name: 'Redacció de Contingut',
      slug: 'redaccio-contingut',
      description: 'Redacció professional de contingut optimitzat per SEO (per 1000 paraules).',
      category: 'CONTENT',
      basePrice: 80.00,
      priceType: 'FIXED',
      active: true,
      featured: false,
      icon: '✍️',
      order: 9,
    },
    {
      name: 'Pack 10 Articles Blog',
      slug: 'pack-articles-blog',
      description: '10 articles de blog professionals de 800-1000 paraules cadascun.',
      category: 'CONTENT',
      basePrice: 650.00,
      priceType: 'FIXED',
      active: true,
      featured: false,
      icon: '📝',
      order: 10,
    },

    // CONSULTING
    {
      name: 'Consultoria Estratègica',
      slug: 'consultoria-estrategica',
      description: 'Sessió de consultoria estratègica personalitzada (2 hores).',
      category: 'CONSULTING',
      basePrice: 180.00,
      priceType: 'HOURLY',
      active: true,
      featured: false,
      icon: '💡',
      order: 11,
    },

    // TRAINING
    {
      name: 'Formació WordPress',
      slug: 'formacio-wordpress',
      description: 'Curs personalitzat de WordPress per a l\'equip (4 hores).',
      category: 'TRAINING',
      basePrice: 320.00,
      priceType: 'FIXED',
      active: true,
      featured: false,
      icon: '🎓',
      order: 12,
    },

    // DEVELOPMENT
    {
      name: 'Desenvolupament Custom',
      slug: 'desenvolupament-custom',
      description: 'Desenvolupament a mida segons necessitats específiques (per hora).',
      category: 'DEVELOPMENT',
      basePrice: 65.00,
      priceType: 'HOURLY',
      active: true,
      featured: false,
      icon: '💻',
      order: 13,
    },

    // SUPPORT
    {
      name: 'Suport Tècnic Premium',
      slug: 'suport-tecnic-premium',
      description: 'Suport tècnic prioritari amb temps de resposta < 2 hores.',
      category: 'SUPPORT',
      basePrice: 79.00,
      priceType: 'MONTHLY',
      active: true,
      featured: false,
      icon: '🛟',
      order: 14,
    },
  ];

  for (const extra of extras) {
    await prisma.extra.upsert({
      where: { slug: extra.slug },
      update: {},
      create: extra,
    });
  }

  console.log(`✅ ${extras.length} extras creados`);
}

// ============================================
// SEED: BUDGETS - SISTEMA DE PRESUPUESTOS
// ============================================

async function seedBudgets() {
  console.log('💰 Creando presupuestos de ejemplo...');

  // Obtener empresa y extras para los ejemplos
  const company = await prisma.company.findFirst({
    where: { name: 'Empresa de Prova SL' }
  });

  const extras = await prisma.extra.findMany({
    where: { active: true }
  });

  if (!company || extras.length === 0) {
    console.log('❌ No se encontró empresa o extras para crear presupuestos');
    return;
  }

  // Seleccionar extras específicos para los ejemplos
  const mantenimentWeb = extras.find(e => e.slug === 'manteniment-web-premium');
  const dissenyLogotip = extras.find(e => e.slug === 'disseny-logotip');
  const gestioXarxes = extras.find(e => e.slug === 'gestio-xarxes-socials');
  const auditoriaSEO = extras.find(e => e.slug === 'auditoria-seo');
  const redaccioContingut = extras.find(e => e.slug === 'redaccio-contingut');

  // Presupuesto 1: APPROVED - Proyecto completo de branding
  const budget1 = await prisma.budget.create({
    data: {
      budgetNumber: 'PRE-2024-001',
      companyId: company.id,
      issueDate: new Date('2024-10-15'),
      validUntil: new Date('2024-12-15'),
      status: 'APPROVED',
      approvedAt: new Date('2024-10-20'),
      clientName: 'Restaurant Ca la Maria',
      clientEmail: 'info@calamaria.cat',
      clientPhone: '+34 934 567 890',
      clientNIF: '45678901B',
      notes: 'Projecte integral de renovació de marca per restaurant familiar.',
      terms: 'Pagament 50% al començament, 50% a l\'entrega. Termini d\'execució: 3 setmanes.',
      subtotal: 1339.00, // Se calculará después
      taxRate: 21.00,
      taxAmount: 281.19,
      total: 1620.19,
    }
  });

  // Items del presupuesto 1
  await prisma.budgetItem.createMany({
    data: [
      {
        budgetId: budget1.id,
        order: 1,
        itemType: 'EXTRA',
        extraId: dissenyLogotip?.id,
        description: 'Disseny professional de logotip amb 3 propostes',
        quantity: 1,
        unitPrice: 450.00,
        subtotal: 450.00,
        billingCycle: 'ONE_TIME'
      },
      {
        budgetId: budget1.id,
        order: 2,
        itemType: 'EXTRA',
        extraId: mantenimentWeb?.id,
        description: 'Manteniment web premium durant 6 mesos',
        quantity: 6,
        unitPrice: 99.00,
        subtotal: 594.00,
        billingCycle: 'MONTHLY'
      },
      {
        budgetId: budget1.id,
        order: 3,
        itemType: 'CUSTOM',
        description: 'Disseny de carta digital personalitzada',
        quantity: 1,
        unitPrice: 295.00,
        subtotal: 295.00,
        billingCycle: 'ONE_TIME'
      }
    ]
  });

  // Presupuesto 2: SENT - Propuesta de marketing digital
  const budget2 = await prisma.budget.create({
    data: {
      budgetNumber: 'PRE-2024-002',
      companyId: company.id,
      issueDate: new Date('2024-11-01'),
      validUntil: new Date('2024-11-30'),
      status: 'SENT',
      clientName: 'Clínica Dental Barcelona',
      clientEmail: 'admin@clinicadental.cat',
      clientPhone: '+34 933 456 789',
      clientNIF: '34567890A',
      notes: 'Proposta de marketing digital integral per clínica dental.',
      terms: 'Setup inicial 100% per avançat. Serveis mensuals facturats al mes vencido.',
      subtotal: 1478.00,
      taxRate: 21.00,
      taxAmount: 310.38,
      discountAmount: 50.00,
      total: 1738.38,
    }
  });

  // Items del presupuesto 2
  await prisma.budgetItem.createMany({
    data: [
      {
        budgetId: budget2.id,
        order: 1,
        itemType: 'EXTRA',
        extraId: auditoriaSEO?.id,
        description: 'Auditoria SEO completa del lloc web',
        quantity: 1,
        unitPrice: 250.00,
        subtotal: 250.00,
        billingCycle: 'ONE_TIME'
      },
      {
        budgetId: budget2.id,
        order: 2,
        itemType: 'EXTRA',
        extraId: gestioXarxes?.id,
        description: 'Gestió xarxes socials durant 3 mesos',
        quantity: 3,
        unitPrice: 299.00,
        subtotal: 897.00,
        billingCycle: 'MONTHLY'
      },
      {
        budgetId: budget2.id,
        order: 3,
        itemType: 'EXTRA',
        extraId: redaccioContingut?.id,
        description: 'Redacció de 4 articles per al blog',
        quantity: 4,
        unitPrice: 80.00,
        subtotal: 320.00,
        billingCycle: 'ONE_TIME'
      },
      {
        budgetId: budget2.id,
        order: 4,
        itemType: 'DISCOUNT',
        description: 'Descompte client nou',
        quantity: 1,
        unitPrice: -50.00,
        discountPercent: 5.00,
        subtotal: -50.00,
        billingCycle: 'ONE_TIME'
      }
    ]
  });

  // Presupuesto 3: DRAFT - Borrador de consultoría
  const budget3 = await prisma.budget.create({
    data: {
      budgetNumber: 'PRE-2024-003',
      companyId: company.id,
      issueDate: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
      status: 'DRAFT',
      clientName: 'Associació Cultural Gràcia',
      clientEmail: 'info@associaciogracia.org',
      clientPhone: '+34 932 345 678',
      notes: 'Borrador per projecte de digitalització de l\'associació.',
      internalNotes: 'Pendent definir detalls amb el client. Revisar preus abans d\'enviar.',
      subtotal: 980.00,
      taxRate: 21.00,
      taxAmount: 205.80,
      total: 1185.80,
    }
  });

  // Items del presupuesto 3 (solo algunos básicos por ser borrador)
  await prisma.budgetItem.createMany({
    data: [
      {
        budgetId: budget3.id,
        order: 1,
        itemType: 'CUSTOM',
        description: 'Consultoria estratègica digitalització (4 hores)',
        quantity: 4,
        unitPrice: 180.00,
        subtotal: 720.00,
        billingCycle: 'ONE_TIME'
      },
      {
        budgetId: budget3.id,
        order: 2,
        itemType: 'CUSTOM',
        description: 'Formació equip en eines digitals (2 sessions)',
        quantity: 2,
        unitPrice: 130.00,
        subtotal: 260.00,
        billingCycle: 'ONE_TIME'
      }
    ]
  });

  console.log('✅ 3 presupuestos de ejemplo creados');
  console.log(`   📋 ${budget1.budgetNumber} - ${budget1.status} (${budget1.clientName})`);
  console.log(`   📋 ${budget2.budgetNumber} - ${budget2.status} (${budget2.clientName})`);
  console.log(`   📋 ${budget3.budgetNumber} - ${budget3.status} (${budget3.clientName})`);
}

async function main() {
  console.log('🌱 Iniciando seed...');

  // ============================================
  // 1. PLANES REALES DE LA PÚBLICA
  // ============================================
  console.log('📦 Creando planes reales de La Pública...');

  const planPioneres = await prisma.planConfig.upsert({
    where: { slug: 'empreses-pioneres' },
    update: {},
    create: {
      name: 'Empreses Pioneres',
      nameEs: 'Empresas Pioneras',
      nameEn: 'Pioneer Companies',
      slug: 'empreses-pioneres',
      description: 'Per a empreses pioneres que aposten per la innovació. 6 mesos GRATUÏTS i després 50% de descompte el primer any.',
      tier: PlanTier.PIONERES,
      planType: 'PIONERES',
      nombre: 'Empreses Pioneres',
      nombreCorto: 'Pioneres',
      descripcion: 'Per a empreses pioneres que aposten per la innovació. 6 mesos GRATUÏTS i després 50% de descompte el primer any.',
      basePrice: 500.0,
      precioMensual: 41.67,
      precioAnual: 500.0,
      durationMonths: 12,
      firstYearDiscount: 50.0,
      hasFreeTrial: true,
      trialDurationDays: 180, // 6 meses gratuitos
      isPioneer: true,
      isActive: true,
      isVisible: true,
      isDefault: false,
      priority: 1,
      maxTeamMembers: 10,
      maxActiveOffers: 50,
      maxFeaturedOffers: 10,
      maxStorage: 20,
      badge: 'PIONEER',
      badgeColor: '#10B981',
      color: '#10B981',
      icono: '🚀',
      activo: true,
      visible: true,
      esSistema: false,
      destacado: false,
      orden: 1,
      features: JSON.stringify({
        hosting: true,
        ssl: true,
        basicSupport: true,
        monthlyReports: true,
        customDomain: true,
        seoOptimization: false,
        prioritySupport: false,
        advancedAnalytics: false,
        multipleAdmins: true,
        apiAccess: false
      }),
      limitesJSON: JSON.stringify({
        maxUsuarios: 10,
        maxStorage: 20,
        maxDocumentos: 100,
        maxOfertas: 50
      }),
      caracteristicas: JSON.stringify([
        '6 mesos GRATUÏTS',
        '50% descompte primer any',
        'Fins a 10 membres',
        '20 GB d\'emmagatzematge',
        '50 ofertes actives',
        'Suport bàsic'
      ]),
      funcionalidades: `Fitxa empresarial completa
Ofertes editables
Estadístiques bàsiques
Newsletter col·laboracions i ofertes
1 agent IA comercial bàsic
Suport per email
Gestor comercial d'administració
Distintiu permanent "Empreses Pioneres"
Espai destacat en el directori
Prioritat de visualització`
    }
  });

  const planStandard = await prisma.planConfig.upsert({
    where: { slug: 'estandard' },
    update: {},
    create: {
      name: 'Estàndard',
      nameEs: 'Estándar',
      nameEn: 'Standard',
      slug: 'estandard',
      description: 'El pla ideal per a la majoria d\'empreses. Inclou totes les funcionalitats essencials amb 50% de descompte el primer any.',
      tier: PlanTier.STANDARD,
      planType: 'STANDARD',
      nombre: 'Estàndard',
      nombreCorto: 'Estàndard',
      descripcion: 'El pla ideal per a la majoria d\'empreses. Inclou totes les funcionalitats essencials amb 50% de descompte el primer any.',
      basePrice: 500.0,
      precioMensual: 41.67,
      precioAnual: 500.0,
      durationMonths: 12,
      firstYearDiscount: 50.0,
      hasFreeTrial: false,
      isPioneer: false,
      isActive: true,
      isVisible: true,
      isDefault: true,
      priority: 2,
      maxTeamMembers: 15,
      maxActiveOffers: 100,
      maxFeaturedOffers: 20,
      maxStorage: 50,
      badge: 'POPULAR',
      badgeColor: '#3B82F6',
      color: '#3B82F6',
      icono: '⭐',
      activo: true,
      visible: true,
      esSistema: false,
      destacado: true,
      orden: 2,
      features: JSON.stringify({
        hosting: true,
        ssl: true,
        basicSupport: true,
        monthlyReports: true,
        customDomain: true,
        seoOptimization: true,
        prioritySupport: false,
        advancedAnalytics: true,
        multipleAdmins: true,
        apiAccess: false
      }),
      limitesJSON: JSON.stringify({
        maxUsuarios: 15,
        maxStorage: 50,
        maxDocumentos: 200,
        maxOfertas: 100
      }),
      caracteristicas: JSON.stringify([
        '500€/any amb 50% descompte primer any',
        'Fins a 15 membres',
        '50 GB d\'emmagatzematge',
        '100 ofertes actives',
        'Optimització SEO',
        'Analítiques avançades'
      ]),
      funcionalidades: `Fitxa empresarial completa
Ofertes editables
Estadístiques bàsiques
Newsletter col·laboracions i ofertes
1 agent IA comercial bàsic
Suport per email
Gestor comercial d'administració`
    }
  });

  const planStrategic = await prisma.planConfig.upsert({
    where: { slug: 'estrategic' },
    update: {},
    create: {
      name: 'Estratègic',
      nameEs: 'Estratégico',
      nameEn: 'Strategic',
      slug: 'estrategic',
      description: 'Per a empreses que necessiten funcionalitats avançades i suport prioritari. 50% de descompte el primer any.',
      tier: PlanTier.STRATEGIC,
      planType: 'PREMIUM',
      nombre: 'Estratègic',
      nombreCorto: 'Estratègic',
      descripcion: 'Per a empreses que necessiten funcionalitats avançades i suport prioritari. 50% de descompte el primer any.',
      basePrice: 1000.0,
      precioMensual: 83.33,
      precioAnual: 1000.0,
      durationMonths: 12,
      firstYearDiscount: 50.0,
      hasFreeTrial: false,
      isPioneer: false,
      isActive: true,
      isVisible: true,
      isDefault: false,
      priority: 3,
      maxTeamMembers: 25,
      maxActiveOffers: 200,
      maxFeaturedOffers: 50,
      maxStorage: 100,
      badge: 'STRATEGIC',
      badgeColor: '#8B5CF6',
      color: '#8B5CF6',
      icono: '🎯',
      activo: true,
      visible: true,
      esSistema: false,
      destacado: false,
      orden: 3,
      features: JSON.stringify({
        hosting: true,
        ssl: true,
        basicSupport: true,
        monthlyReports: true,
        customDomain: true,
        seoOptimization: true,
        prioritySupport: true,
        advancedAnalytics: true,
        multipleAdmins: true,
        apiAccess: true,
        customIntegrations: true,
        dedicatedManager: false,
        whiteLabel: false
      }),
      limitesJSON: JSON.stringify({
        maxUsuarios: 25,
        maxStorage: 100,
        maxDocumentos: 500,
        maxOfertas: 200
      }),
      caracteristicas: JSON.stringify([
        '1000€/any amb 50% descompte primer any',
        'Fins a 25 membres',
        '100 GB d\'emmagatzematge',
        '200 ofertes actives',
        'Suport prioritari',
        'API access',
        'Integracions personalitzades'
      ]),
      funcionalidades: `Tot d'ESTÀNDARD, més:
Posicionament preferent
1 oferta destacada
Publicació sectorial
Informe branding web
Estadístiques ampliades
Suport per email i missatgeria interna
2 agents IA bàsics (Comercial + Marketing)
Newsletter ampliada (2 publicacions/mes)
Gestor comercial dedicat`
    }
  });

  const planEnterprise = await prisma.planConfig.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      nameEs: 'Empresarial',
      nameEn: 'Enterprise',
      slug: 'enterprise',
      description: 'Solució completa per a grans empreses amb necessitats específiques. Inclou gestor dedicat i personalitzacions.',
      tier: PlanTier.ENTERPRISE,
      planType: 'EMPRESARIAL',
      nombre: 'Enterprise',
      nombreCorto: 'Enterprise',
      descripcion: 'Solució completa per a grans empreses amb necessitats específiques. Inclou gestor dedicat i personalitzacions.',
      basePrice: 2000.0,
      precioMensual: 166.67,
      precioAnual: 2000.0,
      durationMonths: 12,
      firstYearDiscount: 50.0,
      hasFreeTrial: false,
      isPioneer: false,
      isActive: true,
      isVisible: true,
      isDefault: false,
      priority: 4,
      maxTeamMembers: -1, // Ilimitado (usamos -1)
      maxActiveOffers: -1, // Ilimitado (usamos -1)
      maxFeaturedOffers: -1, // Ilimitado (usamos -1)
      maxStorage: -1, // Ilimitado (usamos -1)
      badge: 'ENTERPRISE',
      badgeColor: '#6366F1',
      color: '#6366F1',
      icono: '💎',
      activo: true,
      visible: true,
      esSistema: false,
      destacado: false,
      orden: 4,
      features: JSON.stringify({
        hosting: true,
        ssl: true,
        basicSupport: true,
        monthlyReports: true,
        customDomain: true,
        seoOptimization: true,
        prioritySupport: true,
        advancedAnalytics: true,
        multipleAdmins: true,
        apiAccess: true,
        customIntegrations: true,
        dedicatedManager: true,
        whiteLabel: true,
        onPremise: true,
        sla: true,
        customTraining: true
      }),
      limitesJSON: JSON.stringify({
        maxUsuarios: 999,
        maxStorage: 999,
        maxDocumentos: 9999,
        maxOfertas: 9999
      }),
      caracteristicas: JSON.stringify([
        '2000€/any amb 50% descompte primer any',
        'Membres il·limitats',
        'Emmagatzematge il·limitat',
        'Ofertes il·limitades',
        'Gestor dedicat',
        'White label',
        'On-premise',
        'SLA garantit'
      ]),
      funcionalidades: `Tot d'ESTRATÈGIC, més:
3 ofertes destacades
Posicionament preferent màxim
Analítiques i informes Pro
Dashboard Pro
Integració API
2 Agents IA Pro (Comercial Pro + Marketing Pro)
Campanyes exclusives
Suport prioritari
Reunió estratègica anual
Presència editorial garantida
SmartLinks amb tracking`
    }
  });

  console.log('✅ Planes de La Pública creados correctamente');

  // ============================================
  // 2. GESTOR LA PÚBLICA (Account Manager)
  // ============================================
  console.log('👤 Creant Gestor La Pública...');

  const hashedPasswordManager = await bcrypt.hash('gestora123', 10);

  const accountManager = await prisma.user.upsert({
    where: { email: 'maria.garcia@lapublica.cat' },
    update: {},
    create: {
      email: 'maria.garcia@lapublica.cat',
      password: hashedPasswordManager,
      name: 'Maria García',
      userType: UserType.ACCOUNT_MANAGER,
      isActive: true
    }
  });

  console.log('✅ Gestor La Pública creat:', accountManager.email);

  // ============================================
  // 3. EMPRESA DE EJEMPLO
  // ============================================
  console.log('🏢 Creant empresa de prova...');

  const company = await prisma.company.upsert({
    where: { cif: 'B12345678' },
    update: {},
    create: {
      name: 'Empresa de Prova SL',
      cif: 'B12345678',
      email: 'info@empresadeprova.cat',
      phone: '+34 933 123 456',
      address: 'Carrer de la Innovació, 123, Barcelona',
      description: 'Empresa tecnològica especialitzada en solucions digitals per al sector públic',
      website: 'https://empresadeprova.cat',
      isActive: true,
      currentPlanId: planStandard.id,
      accountManagerId: accountManager.id
    }
  });

  console.log('✅ Empresa creada:', company.name);

  // ============================================
  // 4. GESTOR PRINCIPAL DE LA EMPRESA (Owner)
  // ============================================
  console.log('👤 Creant gestor principal...');

  const hashedPasswordOwner = await bcrypt.hash('owner123', 10);

  const companyOwner = await prisma.user.upsert({
    where: { email: 'joan.perez@empresadeprova.cat' },
    update: {},
    create: {
      email: 'joan.perez@empresadeprova.cat',
      password: hashedPasswordOwner,
      name: 'Joan Pérez',
      userType: UserType.COMPANY_OWNER,
      ownedCompanyId: company.id,
      companyRole: CompanyRole.OWNER,
      cargo: 'Director de RRHH',
      isActive: true
    }
  });

  console.log('✅ Gestor principal creat:', companyOwner.email);

  // ============================================
  // 5. MIEMBROS DEL EQUIPO
  // ============================================
  console.log('👥 Creant membres de l\'equip...');

  const hashedPasswordMember = await bcrypt.hash('member123', 10);

  const member1 = await prisma.user.upsert({
    where: { email: 'anna.marti@empresadeprova.cat' },
    update: {},
    create: {
      email: 'anna.marti@empresadeprova.cat',
      password: hashedPasswordMember,
      name: 'Anna Martí',
      userType: UserType.COMPANY_MEMBER,
      memberCompanyId: company.id,
      companyRole: CompanyRole.MEMBER,
      cargo: 'Responsable de Comunicació',
      isActive: true
    }
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'pere.soler@empresadeprova.cat' },
    update: {},
    create: {
      email: 'pere.soler@empresadeprova.cat',
      password: hashedPasswordMember,
      name: 'Pere Soler',
      userType: UserType.COMPANY_MEMBER,
      memberCompanyId: company.id,
      companyRole: CompanyRole.MEMBER,
      cargo: 'Analista de Marketing',
      isActive: true
    }
  });

  console.log('✅ Membres creats:', member1.email, member2.email);

  // ============================================
  // 6. SUSCRIPCIÓN ACTIVA
  // ============================================
  console.log('📋 Creant subscripció activa...');

  // Verificar si ya existe una suscripción para esta empresa
  const existingSubscription = await prisma.subscription.findFirst({
    where: { companyId: company.id }
  });

  const subscription = existingSubscription || await prisma.subscription.create({
    data: {
      companyId: company.id,
      planId: planStandard.id,
      status: SubscriptionStatus.ACTIVE,
      precioMensual: Math.round(planStandard.basePrice / 12 * 100) / 100,
      precioAnual: planStandard.basePrice,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 año
      isAutoRenew: true,
      limites: {
        maxTeamMembers: 15,
        maxActiveOffers: 100,
        maxFeaturedOffers: 20,
        maxStorage: 50
      }
    }
  });

  console.log('✅ Subscripció creada:', subscription.id);

  // ============================================
  // 7. EMPLEADO PÚBLICO DE EJEMPLO
  // ============================================
  console.log('👔 Creant empleat públic...');

  const hashedPasswordEmployee = await bcrypt.hash('empleat123', 10);

  const employee = await prisma.user.upsert({
    where: { email: 'laura.garcia@generalitat.cat' },
    update: {},
    create: {
      email: 'laura.garcia@generalitat.cat',
      password: hashedPasswordEmployee,
      name: 'Laura García',
      userType: UserType.EMPLOYEE,
      cargo: 'Tècnica d\'Administració',
      isActive: true
    }
  });

  console.log('✅ Empleat públic creat:', employee.email);

  // ============================================
  // 8. ADMIN DE LA PLATAFORMA
  // ============================================
  console.log('⚙️ Creant admin de la plataforma...');

  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lapublica.cat' },
    update: {},
    create: {
      email: 'admin@lapublica.cat',
      password: hashedPasswordAdmin,
      name: 'Admin La Pública',
      userType: UserType.ADMIN,
      isActive: true
    }
  });

  console.log('✅ Admin creat:', admin.email);

  // ============================================
  // 9. EXTRAS Y PRESUPUESTOS
  // ============================================
  console.log('\n🎨 Inicializando catálogo y presupuestos...');

  // Crear extras (catálogo de servicios)
  await seedExtras();

  // Crear presupuestos de ejemplo
  await seedBudgets();

  // ============================================
  // RESUMEN
  // ============================================
  console.log('\n🎉 Seed completat amb èxit!\n');
  console.log('📊 Resum:');
  console.log('  ✅ 4 Plans de La Pública (Pioneres, Estàndard, Estratègic, Enterprise)');
  console.log('  ✅ 14 Extras (serveis addicionals)');
  console.log('  ✅ 3 Presupuestos d\'exemple');
  console.log('  ✅ 1 Empresa: Empresa de Prova SL');
  console.log('  ✅ 1 Gestor Principal:', companyOwner.email, '(password: owner123)');
  console.log('  ✅ 2 Membres:', member1.email, member2.email, '(password: member123)');
  console.log('  ✅ 1 Gestor La Pública:', accountManager.email, '(password: gestora123)');
  console.log('  ✅ 1 Subscripció activa (Pla Estàndard - 500€/any, 50% primer any)');
  console.log('  ✅ 1 Empleat públic:', employee.email, '(password: empleat123)');
  console.log('  ✅ 1 Admin:', admin.email, '(password: admin123)');
  console.log('\n🔑 Credencials de prova:');
  console.log('  👤 Gestor Principal: joan.perez@empresadeprova.cat / owner123');
  console.log('  👥 Membre: anna.marti@empresadeprova.cat / member123');
  console.log('  🤝 Gestor La Pública: maria.garcia@lapublica.cat / gestora123');
  console.log('  👔 Empleat públic: laura.garcia@generalitat.cat / empleat123');
  console.log('  ⚙️  Admin: admin@lapublica.cat / admin123');
  console.log('\n💰 Presupuestos de ejemplo:');
  console.log('  📋 PRE-2024-001 - APPROVED (Restaurant Ca la Maria)');
  console.log('  📋 PRE-2024-002 - SENT (Clínica Dental Barcelona)');
  console.log('  📋 PRE-2024-003 - DRAFT (Associació Cultural Gràcia)');
}

main()
  .catch((e) => {
    console.error('❌ Error durant el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });