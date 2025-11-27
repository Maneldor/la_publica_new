import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Buscar usuario y empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: true
      }
    });

    if (!user?.ownedCompany) {
      return NextResponse.json({ error: 'Usuario sin empresa' }, { status: 403 });
    }

    const companyId = user.ownedCompany.id;

    // 3. Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // 4. Construir filtros
    const where: any = {
      companyId: companyId
    };

    if (status && ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    // 5. Obtener facturas con paginación
    const [invoices, totalCount] = await Promise.all([
      prismaClient.invoice.findMany({
        where,
        include: {
          subscription: {
            include: {
              plan: {
                select: {
                  planType: true,
                  precioMensual: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              paymentDate: true,
              externalId: true
            }
          },
          items: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prismaClient.invoice.count({ where })
    ]);

    // 6. Calcular estadísticas
    const stats = await prismaClient.invoice.groupBy({
      by: ['status'],
      where: { companyId },
      _sum: {
        totalAmount: true
      },
      _count: {
        _all: true
      }
    });

    const statisticsMap = stats.reduce((acc: any, stat: any) => {
      acc[stat.status] = {
        count: (stat._count as any)?._all || 0,
        total: (stat._sum as any)?.totalAmount || 0
      };
      return acc;
    }, {} as any);

    const statistics = {
      total: {
        count: stats.reduce((sum: number, s: any) => sum + ((s._count as any)?._all || 0), 0),
        amount: stats.reduce((sum: number, s: any) => sum + ((s._sum as any)?.totalAmount || 0), 0)
      },
      paid: statisticsMap.PAID || { count: 0, total: 0 },
      pending: statisticsMap.PENDING || { count: 0, total: 0 },
      overdue: statisticsMap.OVERDUE || { count: 0, total: 0 },
      cancelled: statisticsMap.CANCELLED || { count: 0, total: 0 }
    };

    // 7. Respuesta
    return NextResponse.json({
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        amount: invoice.totalAmount,
        currency: 'EUR',
        description: invoice.concept,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidDate,
        details: invoice.items,
        plan: invoice.subscription ? {
          tier: invoice.subscription.plan?.planType,
          monthlyPrice: invoice.subscription.plan?.precioMensual
        } : null,
        payments: invoice.payments || []
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      statistics
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}