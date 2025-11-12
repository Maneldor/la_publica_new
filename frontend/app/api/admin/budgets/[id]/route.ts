import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/budgets/[id]
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

    const budget = await prismaClient.budget.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        items: {
          include: {
            plan: true,
            extra: true,
          },
          orderBy: { order: 'asc' },
        },
        invoice: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      budget,
    });

  } catch (error) {
    console.error('❌ Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Error al obtener presupuesto' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/budgets/[id]
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

    const budget = await prismaClient.budget.findUnique({
      where: { id: params.id },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    // No permitir editar si está facturado
    if (budget.status === 'INVOICED') {
      return NextResponse.json(
        { error: 'No se puede editar un presupuesto ya facturado' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.clientName !== undefined) updateData.clientName = body.clientName;
    if (body.clientEmail !== undefined) updateData.clientEmail = body.clientEmail;
    if (body.clientPhone !== undefined) updateData.clientPhone = body.clientPhone;
    if (body.clientNIF !== undefined) updateData.clientNIF = body.clientNIF;
    if (body.validUntil !== undefined) updateData.validUntil = new Date(body.validUntil);
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes;
    if (body.terms !== undefined) updateData.terms = body.terms;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await prismaClient.budget.update({
      where: { id: params.id },
      data: updateData,
      include: {
        company: true,
        items: {
          include: {
            plan: true,
            extra: true,
          },
        },
      },
    });

    console.log('✅ Presupuesto actualizado:', budget.budgetNumber);

    return NextResponse.json({
      success: true,
      budget: updated,
      message: 'Presupuesto actualizado correctamente',
    });

  } catch (error) {
    console.error('❌ Error updating budget:', error);
    return NextResponse.json(
      { error: 'Error al actualizar presupuesto' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/budgets/[id]
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

    const budget = await prismaClient.budget.findUnique({
      where: { id: params.id },
      include: { invoice: true },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar si ya está facturado
    if (budget.invoice) {
      return NextResponse.json(
        { error: 'No se puede eliminar un presupuesto ya facturado' },
        { status: 400 }
      );
    }

    // Eliminar presupuesto (cascade eliminará items)
    await prismaClient.budget.delete({
      where: { id: params.id },
    });

    console.log('🗑️ Presupuesto eliminado:', budget.budgetNumber);

    return NextResponse.json({
      success: true,
      message: 'Presupuesto eliminado correctamente',
    });

  } catch (error) {
    console.error('❌ Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Error al eliminar presupuesto' },
      { status: 500 }
    );
  }
}