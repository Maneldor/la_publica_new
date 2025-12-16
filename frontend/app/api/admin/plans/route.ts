import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Verificar accés admin
async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { authorized: false, error: 'No autenticat' }
  }
  const role = session.user.role as string
  if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
    return { authorized: false, error: 'No autoritzat' }
  }
  return { authorized: true, userId: session.user.id }
}

// GET - Obtenir tots els plans
export async function GET() {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    const plans = await prismaClient.planConfig.findMany({
      orderBy: [
        { orden: 'asc' },
        { priority: 'desc' }
      ]
    })

    // Transformar a format esperat per la UI
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      tier: plan.tier,
      description: plan.description || plan.descripcion,
      basePrice: plan.basePrice,
      precioMensual: plan.precioMensual,
      precioAnual: plan.precioAnual,
      firstYearDiscount: plan.firstYearDiscount,
      maxTeamMembers: plan.maxTeamMembers,
      maxActiveOffers: plan.maxActiveOffers,
      maxFeaturedOffers: plan.maxFeaturedOffers,
      maxStorage: plan.maxStorage,
      hasFreeTrial: plan.hasFreeTrial,
      trialDurationDays: plan.trialDurationDays,
      isActive: plan.isActive,
      isVisible: plan.isVisible,
      destacado: plan.destacado,
      color: plan.color,
      funcionalidades: plan.funcionalidades,
      features: plan.features
    }))

    return NextResponse.json({ success: true, data: formattedPlans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ success: false, error: 'Error obtenint plans' }, { status: 500 })
  }
}

// POST - Crear nou pla o seed plans base
export async function POST(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if (!access.authorized) {
      return NextResponse.json({ success: false, error: access.error }, { status: 401 })
    }

    const body = await request.json()

    // Si és una petició de seed
    if (body.action === 'seed') {
      return await seedBasePlans()
    }

    // Resta del codi existent per crear un pla individual
    const newPlan = await prismaClient.planConfig.create({
      data: {
        planType: body.planType || body.slug,
        nombre: body.nombre || body.name,
        nombreCorto: body.nombreCorto || body.name,
        descripcion: body.descripcion || body.description || '',
        precioMensual: body.precioMensual || body.basePrice || 0,
        precioAnual: body.precioAnual,
        limitesJSON: body.limitesJSON || '{}',
        caracteristicas: body.caracteristicas || '',
        color: body.color || '#3B82F6',
        icono: body.icono || 'package',
        orden: body.orden || 0,
        destacado: body.destacado || false,
        activo: body.activo ?? true,
        visible: body.visible ?? true,
        basePrice: body.basePrice || 0,
        description: body.description,
        features: body.features || {},
        firstYearDiscount: body.firstYearDiscount || 0,
        hasFreeTrial: body.hasFreeTrial || false,
        isActive: body.isActive ?? true,
        isVisible: body.isVisible ?? true,
        maxActiveOffers: body.maxActiveOffers,
        maxFeaturedOffers: body.maxFeaturedOffers || 0,
        maxStorage: body.maxStorage,
        maxTeamMembers: body.maxTeamMembers || 1,
        name: body.name,
        slug: body.slug,
        tier: body.tier || 'STANDARD',
        trialDurationDays: body.trialDurationDays,
        funcionalidades: body.funcionalidades
      }
    })

    return NextResponse.json({ success: true, data: newPlan }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 })
  }
}

// Funció per crear els 4 plans base
async function seedBasePlans() {
  try {
    // Eliminar plans existents (opcional, per evitar duplicats)
    await prismaClient.planConfig.deleteMany({
      where: {
        slug: { in: ['pioneres', 'estandard', 'estrategic', 'enterprise'] }
      }
    })

    const basePlans = [
      {
        // PIONERES
        planType: 'PIONERES',
        slug: 'pioneres',
        name: 'Empreses Pioneres',
        nombre: 'Empreses Pioneres',
        nombreCorto: 'Pioneres',
        tier: 'PIONERES',
        descripcion: 'Pla promocional gratuït durant 6 mesos per a les primeres empreses',
        description: 'Pla promocional gratuït durant 6 mesos per a les primeres empreses',
        precioMensual: 0,
        precioAnual: 0,
        basePrice: 0,
        firstYearDiscount: 50,
        durationMonths: 6,
        maxActiveOffers: 5,
        maxFeaturedOffers: 0,
        maxTeamMembers: 1,
        hasFreeTrial: true,
        trialDurationDays: 180,
        isActive: true,
        isVisible: true,
        activo: true,
        visible: true,
        destacado: true,
        isPioneer: true,
        color: '#10B981',
        icono: 'rocket',
        orden: 1,
        priority: 100,
        badge: 'PROMOCIÓ',
        badgeColor: '#10B981',
        limitesJSON: JSON.stringify({ ofertas: 5, miembros: 1, storage: 1024 }),
        caracteristicas: 'Fins 5 ofertes actives, Fitxa empresarial completa, Estadístiques bàsiques, Newsletter, 1 agent IA comercial bàsic, Suport per email, Distintiu permanent Empreses Pioneres, Espai destacat al directori',
        funcionalidades: 'Fins 5 ofertes actives|Ofertes editables|Fitxa empresarial completa|Estadístiques bàsiques|Newsletter nova col·laboració i ofertes|1 agent IA comercial bàsic|Suport per email|Gestor comercial d\'administració|Distintiu permanent "Empreses Pioneres"|Espai destacat al directori|Prioritat de visualització',
        features: {
          ofertas: 5,
          miembros: 1,
          estadisticas: 'basicas',
          soporte: 'email',
          agentesIA: 1,
          distintivo: 'Empreses Pioneres',
          posicionamiento: 'destacado'
        }
      },
      {
        // ESTÀNDARD
        planType: 'STANDARD',
        slug: 'estandard',
        name: 'Estàndard',
        nombre: 'Estàndard',
        nombreCorto: 'Estàndard',
        tier: 'STANDARD',
        descripcion: 'Pla bàsic per a empreses que volen promocionar les seves ofertes',
        description: 'Pla bàsic per a empreses que volen promocionar les seves ofertes',
        precioMensual: 41.67,
        precioAnual: 500,
        basePrice: 500,
        firstYearDiscount: 50,
        durationMonths: 12,
        maxActiveOffers: 5,
        maxFeaturedOffers: 0,
        maxTeamMembers: 1,
        hasFreeTrial: false,
        isActive: true,
        isVisible: true,
        activo: true,
        visible: true,
        destacado: false,
        color: '#3B82F6',
        icono: 'package',
        orden: 2,
        priority: 50,
        limitesJSON: JSON.stringify({ ofertas: 5, miembros: 1, storage: 2048 }),
        caracteristicas: 'Fitxa empresarial completa, Ofertes editables, Estadístiques bàsiques, Newsletter, 1 agent IA comercial bàsic, Suport per email, Gestor comercial d\'administració',
        funcionalidades: 'Fitxa empresarial completa|Ofertes editables|Estadístiques i analítiques bàsiques|Newsletter (nova col·laboració i noves ofertes)|1 agent IA comercial bàsic|Suport per email|Gestor comercial d\'administració',
        features: {
          ofertas: 5,
          miembros: 1,
          estadisticas: 'basicas',
          soporte: 'email',
          agentesIA: 1
        }
      },
      {
        // ESTRATÈGIC
        planType: 'STRATEGIC',
        slug: 'estrategic',
        name: 'Estratègic',
        nombre: 'Estratègic',
        nombreCorto: 'Estratègic',
        tier: 'STRATEGIC',
        descripcion: 'Pla intermedi amb funcionalitats avançades i millor posicionament',
        description: 'Pla intermedi amb funcionalitats avançades i millor posicionament',
        precioMensual: 83.33,
        precioAnual: 1000,
        basePrice: 1000,
        firstYearDiscount: 50,
        durationMonths: 12,
        maxActiveOffers: 10,
        maxFeaturedOffers: 1,
        maxTeamMembers: 3,
        hasFreeTrial: false,
        isActive: true,
        isVisible: true,
        activo: true,
        visible: true,
        destacado: true,
        color: '#8B5CF6',
        icono: 'target',
        orden: 3,
        priority: 75,
        badge: 'POPULAR',
        badgeColor: '#8B5CF6',
        limitesJSON: JSON.stringify({ ofertas: 10, miembros: 3, storage: 5120 }),
        caracteristicas: 'Tot del pla Estàndard + Posicionament preferent, 1 oferta destacada, Publicació sectorial, Informe branding web, Estadístiques ampliades, Suport per email i missatgeria, 2 agents IA, Newsletter ampliada, Gestor comercial dedicat',
        funcionalidades: 'Tot del pla Estàndard|Posicionament preferent|1 oferta destacada|Publicació sectorial|Informe branding web|Estadístiques i analítiques ampliades|Suport per email i missatgeria interna|2 agents IA bàsics (Comercial + Marketing)|Newsletter ampliada 2 publicacions mensuals|Gestor comercial dedicat',
        features: {
          ofertas: 10,
          miembros: 3,
          ofertasDestacadas: 1,
          estadisticas: 'ampliadas',
          soporte: 'email+chat',
          agentesIA: 2,
          gestorDedicado: true,
          posicionamiento: 'preferente'
        }
      },
      {
        // ENTERPRISE
        planType: 'ENTERPRISE',
        slug: 'enterprise',
        name: 'Enterprise',
        nombre: 'Enterprise',
        nombreCorto: 'Enterprise',
        tier: 'ENTERPRISE',
        descripcion: 'Pla premium amb totes les funcionalitats i suport prioritari',
        description: 'Pla premium amb totes les funcionalitats i suport prioritari',
        precioMensual: 166.67,
        precioAnual: 2000,
        basePrice: 2000,
        firstYearDiscount: 50,
        durationMonths: 12,
        maxActiveOffers: 999,
        maxFeaturedOffers: 3,
        maxTeamMembers: 5,
        hasFreeTrial: false,
        isActive: true,
        isVisible: true,
        activo: true,
        visible: true,
        destacado: false,
        color: '#F59E0B',
        icono: 'crown',
        orden: 4,
        priority: 90,
        badge: 'PREMIUM',
        badgeColor: '#F59E0B',
        limitesJSON: JSON.stringify({ ofertas: -1, miembros: 5, storage: 10240 }),
        caracteristicas: 'Tot del pla Estratègic + 3 ofertes destacades, Posicionament màxim, Analítiques Pro, Dashboard Pro, API, 2 Agents IA Pro, Campanyes exclusives, Suport prioritari, Reunió estratègica anual, Presència editorial, SmartLinks',
        funcionalidades: 'Tot del pla Estratègic|3 ofertes destacades|Posicionament preferent màxim|Analítiques e informes Pro (segmentació per cossos, anàlisi geogràfic, comparativa sectorial)|Dashboard Pro|Integració API|2 Agents IA Pro (Comercial Pro + Marketing Pro)|Campanyes exclusives|Suport prioritari|Reunió estratègica anual|Presència editorial garantida en blogs|SmartLinks amb tracking',
        features: {
          ofertas: -1,
          miembros: 5,
          ofertasDestacadas: 3,
          estadisticas: 'pro',
          soporte: 'prioritario',
          agentesIA: 2,
          agentesIAPro: true,
          gestorDedicado: true,
          posicionamiento: 'maximo',
          api: true,
          dashboardPro: true,
          smartLinks: true
        }
      }
    ]

    let created = 0
    for (const planData of basePlans) {
      await prismaClient.planConfig.create({ data: planData as any })
      created++
    }

    return NextResponse.json({
      success: true,
      message: `S'han creat ${created} plans base correctament.`,
      created
    })
  } catch (error) {
    console.error('Error seeding plans:', error)
    return NextResponse.json({ success: false, error: 'Error creant plans base' }, { status: 500 })
  }
}