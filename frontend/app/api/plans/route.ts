import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// GET - Listar todos los planes disponibles (público)
export async function GET(request: NextRequest) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();

    // NO requiere autenticación - endpoint público
    const planes = await prismaClient.planConfig.findMany({
      where: {
        isActive: true,
        isVisible: true
      },
      orderBy: {
        priority: 'desc' // Pioneres primero (priority 100)
      },
      select: {
        id: true,
        slug: true,
        tier: true,
        name: true,
        nameEs: true,
        nameEn: true,
        description: true,

        // Precios
        basePrice: true,
        precioMensual: true,
        precioAnual: true,
        durationMonths: true,
        firstYearDiscount: true,

        // Límites
        maxActiveOffers: true,
        maxTeamMembers: true,
        maxFeaturedOffers: true,
        maxStorage: true,

        // Features
        features: true,
        funcionalidades: true,

        // Visualización
        badge: true,
        badgeColor: true,
        isPioneer: true,
        color: true,
        icono: true,
        destacado: true,
        priority: true,

        // Trial
        hasFreeTrial: true,
        trialDurationDays: true,

        // IVA
        displayNote: true,
        priceIncludesVAT: true,

        // Backward compatibility
        planType: true,
        nombre: true,
        nombreCorto: true,
        descripcion: true,
        limitesJSON: true,
        caracteristicas: true,
        orden: true,
        activo: true,
        visible: true
      }
    });

    // Parsear features JSON
    const plansWithFeatures = planes.map(plan => {
      let features = {};
      try {
        features = typeof plan.features === 'string'
          ? JSON.parse(plan.features as string)
          : plan.features || {};
      } catch (e) {
        console.error(`Error parsing features for plan ${plan.id}:`, e);
      }

      // Calcular precio efectivo primer año
      const firstYearPrice = plan.firstYearDiscount
        ? plan.basePrice * (1 - plan.firstYearDiscount)
        : plan.basePrice;

      return {
        ...plan,
        features,
        pricing: {
          basePrice: plan.basePrice,
          firstYearPrice,
          firstYearDiscount: plan.firstYearDiscount,
          precioMensual: plan.precioMensual,
          precioAnual: plan.precioAnual,
          displayNote: plan.displayNote,
          priceIncludesVAT: plan.priceIncludesVAT
        },
        limits: {
          maxActiveOffers: plan.maxActiveOffers,
          maxTeamMembers: plan.maxTeamMembers,
          maxFeaturedOffers: plan.maxFeaturedOffers,
          maxStorage: plan.maxStorage
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: plansWithFeatures
    });

  } catch (error) {
    console.error('Error al obtener planes:', error);
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}

// POST - Crear nuevo plan
export async function POST(request: NextRequest) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Validar campos requeridos
    if (!data.nombre || data.precioMensual === undefined || !data.limites || !data.caracteristicas) {
      return NextResponse.json(
        { error: 'Falten camps obligatoris' },
        { status: 400 }
      );
    }

    // Verificar si el planType ya existe
    if (data.planType) {
      const existingPlan = await prismaClient.planConfig.findUnique({
        where: { planType: data.planType }
      });

      if (existingPlan) {
        return NextResponse.json(
          { error: 'Aquest tipus de pla ja existeix' },
          { status: 400 }
        );
      }
    }

    // Obtener el próximo número de orden
    const maxOrden = await prismaClient.planConfig.aggregate({
      _max: { orden: true }
    });

    const nextOrden = (maxOrden._max.orden || 0) + 1;

    // Crear nuevo plan en la base de datos
    const nuevoPlan = await prismaClient.planConfig.create({
      data: {
        planType: data.planType || `CUSTOM_${Date.now()}`,
        nombre: data.nombre,
        nombreCorto: data.nombreCorto || data.nombre,
        descripcion: data.descripcion || 'Sin descripción',
        precioMensual: parseFloat(data.precioMensual),
        precioAnual: data.precioAnual ? parseFloat(data.precioAnual) : null,
        limitesJSON: JSON.stringify(data.limites),
        caracteristicas: JSON.stringify(data.caracteristicas),
        color: data.color || '#3B82F6',
        icono: data.icono || '📦',
        orden: data.orden || nextOrden,
        destacado: data.destacado || false,
        activo: data.activo !== false,
        visible: data.visible !== false,
        esSistema: false
      }
    });

    return NextResponse.json(nuevoPlan, { status: 201 });

  } catch (error) {
    console.error('Error al crear plan:', error);
    return NextResponse.json(
      { error: 'Error al crear pla' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}
