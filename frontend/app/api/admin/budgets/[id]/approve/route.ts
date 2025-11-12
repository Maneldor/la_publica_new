import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * POST /api/admin/budgets/[id]/approve
 * Aprueba un presupuesto
 */
export async function POST(
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
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    if (budget.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'El presupuesto ya está aprobado' },
        { status: 400 }
      );
    }

    if (budget.status === 'INVOICED') {
      return NextResponse.json(
        { error: 'El presupuesto ya ha sido facturado' },
        { status: 400 }
      );
    }

    // Aprobar
    const updated = await prismaClient.budget.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
      include: {
        company: true,
        items: true,
      },
    });

    console.log('✅ Presupuesto aprobado:', budget.budgetNumber);

    return NextResponse.json({
      success: true,
      budget: updated,
      message: 'Presupuesto aprobado correctamente',
    });

  } catch (error) {
    console.error('❌ Error approving budget:', error);
    return NextResponse.json(
      { error: 'Error al aprobar presupuesto' },
      { status: 500 }
    );
  }
}