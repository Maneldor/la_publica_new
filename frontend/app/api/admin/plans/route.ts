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
    const nuevoPlan = await prisma.planConfig.create({
      data: {
        planType: data.planType || `CUSTOM_${Date.now()}`,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        tier: data.tier || 'CUSTOM',
        name: data.name,
        nameEs: data.nameEs || data.name,
        nameEn: data.nameEn || data.name,
        description: data.description || 'Sin descripción',
        basePrice: parseFloat(data.basePrice),
        firstYearDiscount: data.firstYearDiscount ? parseFloat(data.firstYearDiscount) : 0,
        maxActiveOffers: data.maxActiveOffers || null,
        maxTeamMembers: data.maxTeamMembers || 1,
        maxFeaturedOffers: data.maxFeaturedOffers || 0,
        maxStorage: data.maxStorage || null,
        features: data.features || {},
        badge: data.badge || null,
        badgeColor: data.badgeColor || null,
        isPioneer: data.isPioneer || false,
        color: data.color || '#3B82F6',
        icono: data.icono || '📦',
        destacado: data.destacado || false,
        priority: data.priority || nextPriority,
        hasFreeTrial: data.hasFreeTrial || false,
        trialDurationDays: data.trialDurationDays || null,
        isActive: data.isActive !== false, // Por defecto true
        isVisible: data.isVisible !== false, // Por defecto true
        displayNote: data.displayNote || 'IVA incluido',
        funcionalidades: data.funcionalidades || null,
        priceIncludesVAT: data.priceIncludesVAT !== false,
        durationMonths: data.durationMonths || 12,
        isDefault: data.isDefault || false,
        esSistema: false // Los nuevos planes nunca son del sistema
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