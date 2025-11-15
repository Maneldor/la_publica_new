// app/api/admin/plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * PUT /api/admin/plans/[id]
 * Actualizar plan completo (solo admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que es admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Se requiere rol de administrador' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = params;

    // Campos permitidos para actualizar
    const {
      basePrice,
      precioMensual,
      precioAnual,
      firstYearDiscount,
      maxActiveOffers,
      maxTeamMembers,
      maxFeaturedOffers,
      maxStorage,
      isActive,
      isVisible,
      destacado,
      displayNote,
      funcionalidades  // AÑADIR AQUÍ
    } = body;

    // Actualizar plan
    const updatedPlan = await prismaClient.planConfig.update({
      where: { id },
      data: {
        ...(basePrice !== undefined && { basePrice }),
        ...(precioMensual !== undefined && { precioMensual }),
        ...(precioAnual !== undefined && { precioAnual }),
        ...(firstYearDiscount !== undefined && { firstYearDiscount }),
        ...(maxActiveOffers !== undefined && { maxActiveOffers }),
        ...(maxTeamMembers !== undefined && { maxTeamMembers }),
        ...(maxFeaturedOffers !== undefined && { maxFeaturedOffers }),
        ...(maxStorage !== undefined && { maxStorage }),
        ...(isActive !== undefined && { isActive }),
        ...(isVisible !== undefined && { isVisible }),
        ...(destacado !== undefined && { destacado }),
        ...(displayNote !== undefined && { displayNote }),
        ...(funcionalidades !== undefined && { funcionalidades })  // AÑADIR AQUÍ
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: 'Plan actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando plan:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar plan',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/plans/[id]
 * Actualizar campo específico del plan (ej: toggle isActive)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que es admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    console.log('🔍 PATCH /api/admin/plans/[id] - Debug auth:');
    console.log('- Email:', session.user.email);
    console.log('- User found:', !!user);
    console.log('- User role:', user?.role);
    console.log('- Expected role: ADMIN');

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: `Se requiere rol de administrador. Tu rol actual: ${user?.role}` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = params;

    // Actualizar solo los campos enviados
    const updatedPlan = await prismaClient.planConfig.update({
      where: { id },
      data: body
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: 'Plan actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando plan:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar plan',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/plans/[id]
 * Obtener detalle de un plan específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    const plan = await prismaClient.planConfig.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            companies: true,
            subscriptions: true
          }
        }
      }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('Error obteniendo plan:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener plan',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}