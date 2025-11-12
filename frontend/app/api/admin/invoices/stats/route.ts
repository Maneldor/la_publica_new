import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/invoices/stats
 * Estadísticas de facturas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      total,
      draft,
      sent,
      pending,
      paid,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount,
      thisMonthAmount,
      thisYearAmount,
      overdueInvoices,
      recentPayments,
    ] = await Promise.all([
      // Contadores por estado
      prismaClient.invoice.count(),
      prismaClient.invoice.count({ where: { status: 'DRAFT' } }),
      prismaClient.invoice.count({ where: { status: 'SENT' } }),
      prismaClient.invoice.count({ where: { status: 'SENT' } }),
      prismaClient.invoice.count({ where: { status: 'PAID' } }),
      prismaClient.invoice.count({
        where: {
          status: 'SENT',
          dueDate: { lt: now },
        },
      }),

      // Importes totales
      prismaClient.invoice.aggregate({
        _sum: { totalAmount: true },
      }),
      prismaClient.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prismaClient.invoice.aggregate({
        where: { status: 'SENT' },
        _sum: { totalAmount: true },
      }),

      // Facturación del mes
      prismaClient.invoice.aggregate({
        where: {
          issueDate: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),

      // Facturación del año
      prismaClient.invoice.aggregate({
        where: {
          issueDate: { gte: startOfYear },
        },
        _sum: { totalAmount: true },
      }),

      // Facturas vencidas con detalles
      prismaClient.invoice.findMany({
        where: {
          status: 'SENT',
          dueDate: { lt: now },
        },
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          dueDate: true,
          company: {
            select: { name: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),

      // Pagos recientes
      prismaClient.payment.findMany({
        take: 10,
        orderBy: { paymentDate: 'desc' },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              company: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ]);

    // Calcular tasas
    const collectionRate = total > 0 ? (paid / total * 100) : 0;
    const overdueRate = total > 0 ? (overdue / total * 100) : 0;

    // Calcular promedio días hasta pago
    const paidInvoicesWithPayments = await prismaClient.invoice.findMany({
      where: { status: 'PAID' },
      include: {
        payments: {
          orderBy: { paymentDate: 'asc' },
          take: 1,
        },
      },
    });

    let totalDaysToPayment = 0;
    let paidInvoicesCount = 0;

    for (const invoice of paidInvoicesWithPayments) {
      if (invoice.payments.length > 0) {
        const daysDiff = Math.floor(
          (invoice.payments[0].paymentDate.getTime() - invoice.issueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDaysToPayment += daysDiff;
        paidInvoicesCount++;
      }
    }

    const avgDaysToPayment = paidInvoicesCount > 0 ? Math.round(totalDaysToPayment / paidInvoicesCount) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        byStatus: {
          draft,
          sent,
          pending,
          paid,
          overdue,
        },
        amounts: {
          total: (totalAmount._sum.totalAmount || 0) / 100,
          paid: (paidAmount._sum.totalAmount || 0) / 100,
          pending: (pendingAmount._sum.totalAmount || 0) / 100,
          thisMonth: (thisMonthAmount._sum.totalAmount || 0) / 100,
          thisYear: (thisYearAmount._sum.totalAmount || 0) / 100,
        },
        rates: {
          collection: Math.round(collectionRate * 100) / 100,
          overdue: Math.round(overdueRate * 100) / 100,
        },
        metrics: {
          avgDaysToPayment,
          totalPayments: recentPayments.length,
        },
        alerts: {
          overdueCount: overdue,
          overdueAmount: overdueInvoices.reduce(
            (sum, inv) => sum + Number(inv.totalAmount),
            0
          ) / 100,
        },
        overdueInvoices: overdueInvoices.map(inv => ({
          ...inv,
          totalAmount: Number(inv.totalAmount) / 100,
        })),
        recentPayments: recentPayments.map(payment => ({
          ...payment,
          amount: Number(payment.amount) / 100,
        })),
      },
    });

  } catch (error) {
    console.error('❌ Error fetching invoice stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}