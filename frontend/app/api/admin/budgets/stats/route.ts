import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/budgets/stats
 * Estadísticas de presupuestos
 */
export async function GET(request: NextRequest) {
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

    const [
      total,
      draft,
      sent,
      approved,
      rejected,
      invoiced,
      expired,
      totalAmount,
      approvedAmount,
      thisMonthCount,
      thisMonthAmount,
    ] = await Promise.all([
      prismaClient.budget.count(),
      prismaClient.budget.count({ where: { status: 'DRAFT' } }),
      prismaClient.budget.count({ where: { status: 'SENT' } }),
      prismaClient.budget.count({ where: { status: 'APPROVED' } }),
      prismaClient.budget.count({ where: { status: 'REJECTED' } }),
      prismaClient.budget.count({ where: { status: 'INVOICED' } }),
      prismaClient.budget.count({ where: { status: 'EXPIRED' } }),
      prismaClient.budget.aggregate({
        _sum: { total: true },
      }),
      prismaClient.budget.aggregate({
        where: { status: { in: ['APPROVED', 'INVOICED'] } },
        _sum: { total: true },
      }),
      // Estadísticas del mes actual
      prismaClient.budget.count({
        where: {
          issueDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prismaClient.budget.aggregate({
        where: {
          issueDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { total: true },
      }),
    ]);

    // Calcular tasas de conversión
    const conversionRate = total > 0 ? ((approved + invoiced) / total * 100) : 0;
    const rejectionRate = total > 0 ? (rejected / total * 100) : 0;

    // Presupuestos próximos a expirar (en 7 días)
    const expiringCount = await prismaClient.budget.count({
      where: {
        status: { in: ['SENT', 'APPROVED'] },
        validUntil: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        total,
        byStatus: {
          draft,
          sent,
          approved,
          rejected,
          invoiced,
          expired,
        },
        amounts: {
          total: totalAmount._sum.total || 0,
          approved: approvedAmount._sum.total || 0,
        },
        thisMonth: {
          count: thisMonthCount,
          amount: thisMonthAmount._sum.total || 0,
        },
        rates: {
          conversion: Math.round(conversionRate * 100) / 100,
          rejection: Math.round(rejectionRate * 100) / 100,
        },
        alerts: {
          expiring: expiringCount,
        },
      },
    });

  } catch (error) {
    console.error('❌ Error fetching budget stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}