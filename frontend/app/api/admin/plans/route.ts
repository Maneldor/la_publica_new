import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos los planes (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todos los planes activos de la base de datos ordenados por 'priority'
    const planes = await prisma.planConfig.findMany({
      where: {
        isActive: true,
        isVisible: true
      },
      select: {
        id: true,
        slug: true,
        tier: true,
        name: true,
        nameEs: true,
        nameEn: true,
        description: true,
        basePrice: true,
        firstYearDiscount: true,
        maxActiveOffers: true,
        maxTeamMembers: true,
        maxFeaturedOffers: true,
        maxStorage: true,
        features: true,
        badge: true,
        badgeColor: true,
        isPioneer: true,
        color: true,
        icono: true,
        destacado: true,
        priority: true,
        hasFreeTrial: true,
        trialDurationDays: true,
        isActive: true,
        isVisible: true,
        displayNote: true,
        funcionalidades: true,
        priceIncludesVAT: true,
        durationMonths: true,
        isDefault: true,
        planType: true,
        esSistema: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { priority: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: planes
    });

  } catch (error) {
    console.error('Error al obtener planes:', error);
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Validar campos requeridos
    if (!data.name || data.basePrice === undefined || !data.features) {
      return NextResponse.json(
        { error: 'Falten camps obligatoris (name, basePrice, features)' },
        { status: 400 }
      );
    }

    // Verificar si el planType ya existe
    if (data.planType) {
      const existingPlan = await prisma.planConfig.findUnique({
        where: { planType: data.planType }
      });

      if (existingPlan) {
        return NextResponse.json(
          { error: 'Aquest tipus de pla ja existeix' },
          { status: 400 }
        );
      }
    }

    // Obtener el próximo número de prioridad
    const maxPriority = await prisma.planConfig.aggregate({
      _max: { priority: true }
    });

    const nextPriority = (maxPriority._max.priority || 0) + 1;

    // Crear nuevo plan en la base de datos
    const slug =
      data.slug ||
      (data.name || `plan-${Date.now()}`)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');

    const nombre = data.nombre || data.name;
    const nombreCorto = data.nombreCorto || data.name;
    const descripcion = data.descripcion || data.description || 'Sin descripción';
    const precioMensual = parseFloat(
      data.precioMensual ?? data.basePrice ?? data.precioAnual ?? '0'
    );
    const precioAnual =
      data.precioAnual !== undefined && data.precioAnual !== null
        ? parseFloat(data.precioAnual)
        : null;

    const nuevoPlan = await prisma.planConfig.create({
      data: {
        planType: data.planType || `CUSTOM_${Date.now()}`,
        slug,
        tier: data.tier || 'CUSTOM',
        nombre: nombre || slug,
        nombreCorto: nombreCorto || nombre || slug,
        descripcion,
        precioMensual,
        precioAnual,
        limitesJSON: JSON.stringify(data.limites || data.limitesJSON || {}),
        caracteristicas: JSON.stringify(
          data.caracteristicas || data.features || {}
        ),
        color: data.color || '#3B82F6',
        icono: data.icono || data.icon || '📦',
        orden: data.orden ?? nextPriority,
        destacado: Boolean(data.destacado),
        activo: data.activo ?? data.isActive ?? true,
        visible: data.visible ?? data.isVisible ?? true,
        esSistema: false,

        displayNote: data.displayNote || 'IVA incluido',
        priceIncludesVAT: data.priceIncludesVAT ?? true,
        badge: data.badge || null,
        badgeColor: data.badgeColor || null,
        basePrice: parseFloat(data.basePrice ?? precioMensual ?? 0),
        description: data.description || descripcion,
        durationMonths: data.durationMonths || 12,
        features: data.features || {},
        firstYearDiscount: data.firstYearDiscount
          ? parseFloat(data.firstYearDiscount)
          : 0,
        hasFreeTrial: data.hasFreeTrial ?? false,
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
        isPioneer: data.isPioneer ?? false,
        isVisible: data.isVisible ?? true,
        maxActiveOffers: data.maxActiveOffers ?? null,
        maxFeaturedOffers: data.maxFeaturedOffers ?? 0,
        maxStorage: data.maxStorage ?? null,
        maxTeamMembers: data.maxTeamMembers ?? 1,
        name: data.name || nombre || slug,
        nameEn: data.nameEn || data.name || nombre || slug,
        nameEs: data.nameEs || data.name || nombre || slug,
        priority: data.priority ?? nextPriority,
        trialDurationDays: data.trialDurationDays ?? null,
        funcionalidades: data.funcionalidades || null,
      }
    });

    return NextResponse.json(nuevoPlan, { status: 201 });

  } catch (error) {
    console.error('Error al crear plan:', error);
    return NextResponse.json(
      { error: 'Error al crear pla' },
      { status: 500 }
    );
  }
}