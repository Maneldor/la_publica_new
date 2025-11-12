import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/extras/[id]
 * Obtiene un extra específico con información de uso
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const extra = await prismaClient.extra.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            budgetItems: true,
            invoiceItems: true,
          },
        },
      },
    });

    if (!extra) {
      return NextResponse.json(
        { error: 'Extra no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      extra,
    });

  } catch (error) {
    console.error('❌ Error fetching extra:', error);
    return NextResponse.json(
      { error: 'Error al obtener extra' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/extras/[id]
 * Actualiza un extra existente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verificar que el extra exists
    const existingExtra = await prismaClient.extra.findUnique({
      where: { id: params.id },
    });

    if (!existingExtra) {
      return NextResponse.json(
        { error: 'Extra no encontrado' },
        { status: 404 }
      );
    }

    // Validar precio si se proporciona
    if (body.basePrice !== undefined) {
      const price = parseFloat(body.basePrice);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'El precio debe ser un número positivo' },
          { status: 400 }
        );
      }
      body.basePrice = price;
    }

    // Construir datos de actualización
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    if (body.priceType !== undefined) updateData.priceType = body.priceType;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.requiresApproval !== undefined) updateData.requiresApproval = body.requiresApproval;
    if (body.icon !== undefined) updateData.icon = body.icon?.trim() || null;
    if (body.image !== undefined) updateData.image = body.image?.trim() || null;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.order !== undefined) updateData.order = body.order;

    // Actualizar
    const extra = await prismaClient.extra.update({
      where: { id: params.id },
      data: updateData,
    });

    console.log('✅ Extra actualizado:', extra.name);

    return NextResponse.json({
      success: true,
      extra,
      message: 'Extra actualizado correctamente'
    });

  } catch (error) {
    console.error('❌ Error updating extra:', error);
    return NextResponse.json(
      { error: 'Error al actualizar extra' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/extras/[id]
 * Elimina o desactiva un extra
 * Si está en uso (presupuestos/facturas), solo lo desactiva
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Verificar si existe y obtener info de uso
    const extra = await prismaClient.extra.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            budgetItems: true,
            invoiceItems: true,
          },
        },
      },
    });

    if (!extra) {
      return NextResponse.json(
        { error: 'Extra no encontrado' },
        { status: 404 }
      );
    }

    const isInUse = extra._count.budgetItems > 0 || extra._count.invoiceItems > 0;

    if (isInUse) {
      // Desactivar en lugar de eliminar
      const updated = await prismaClient.extra.update({
        where: { id: params.id },
        data: { active: false },
      });

      console.log('⚠️ Extra desactivado (en uso):', updated.name);

      return NextResponse.json({
        success: true,
        deactivated: true,
        message: `Extra desactivado. Está en uso en ${extra._count.budgetItems} presupuestos y ${extra._count.invoiceItems} facturas.`,
        extra: updated,
      });
    }

    // Eliminar si no está en uso
    await prismaClient.extra.delete({
      where: { id: params.id },
    });

    console.log('✅ Extra eliminado:', extra.name);

    return NextResponse.json({
      success: true,
      deleted: true,
      message: 'Extra eliminado correctamente',
    });

  } catch (error) {
    console.error('❌ Error deleting extra:', error);
    return NextResponse.json(
      { error: 'Error al eliminar extra' },
      { status: 500 }
    );
  }
}