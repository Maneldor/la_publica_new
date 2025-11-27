import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';
import { NotificationType, Prisma } from '@prisma/client';

// Schema de validación para query parameters
const walletQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 20), // Max 100 transacciones
  type: z.enum(['CREDIT', 'DEBIT', 'REFUND']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeStats: z.string().optional().transform(val => val === 'true')
}).refine(data => {
  return data.page > 0;
}, {
  message: 'Page ha de ser major que 0'
}).refine(data => {
  return data.limit > 0 && data.limit <= 100;
}, {
  message: 'Limit ha de estar entre 1 i 100'
});

export async function GET(req: NextRequest) {
  try {
    // 1. SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de acceso sin autenticación a wallet');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // 2. Parsear y validar query parameters
    const url = new URL(req.url);
    const queryParams = {
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      type: url.searchParams.get('type'),
      dateFrom: url.searchParams.get('dateFrom'),
      dateTo: url.searchParams.get('dateTo'),
      includeStats: url.searchParams.get('includeStats')
    };

    const validation = walletQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paràmetres de consulta invàlids',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { page, limit, type, dateFrom, dateTo, includeStats } = validation.data;

    // 3. Obtener o crear wallet del usuario
    let userWallet = await prismaClient.userWallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!userWallet) {
      userWallet = await prismaClient.userWallet.create({
        data: {
          userId: session.user.id
        }
      });
    }

    // 4. Construir filtros para transacciones
    const transactionFilters: Prisma.WalletTransactionWhereInput = {
      walletId: userWallet.id
    };

    if (type) {
      transactionFilters.type = type;
    }

    if (dateFrom || dateTo) {
      transactionFilters.createdAt = {};
      if (dateFrom) {
        transactionFilters.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        transactionFilters.createdAt.lte = new Date(dateTo);
      }
    }

    // 5. Obtener transacciones paginadas
    const offset = (page - 1) * limit;

    const [transactions, totalTransactions] = await Promise.all([
      prismaClient.walletTransaction.findMany({
        where: transactionFilters,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          createdAt: true,
          metadata: true
        }
      }),
      prismaClient.walletTransaction.count({
        where: transactionFilters
      })
    ]);

    // 6. Estadísticas adicionales (opcional)
    let additionalStats = {};
    if (includeStats) {
      const [creditSum, debitSum, lastMonthTransactions, thisWeekTransactions] = await Promise.all([
        // Total de créditos
        prismaClient.walletTransaction.aggregate({
          where: { walletId: userWallet.id, type: 'CREDIT' },
          _sum: { amount: true }
        }),
        // Total de débitos
        prismaClient.walletTransaction.aggregate({
          where: { walletId: userWallet.id, type: 'DEBIT' },
          _sum: { amount: true }
        }),
        // Transacciones último mes
        prismaClient.walletTransaction.count({
          where: {
            walletId: userWallet.id,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),
        // Transacciones esta semana
        prismaClient.walletTransaction.count({
          where: {
            walletId: userWallet.id,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      const creditTotal = creditSum._sum?.amount ? Number(creditSum._sum.amount) : 0;
      const debitTotal = debitSum._sum?.amount ? Number(debitSum._sum.amount) : 0;

      additionalStats = {
        totalCredits: creditSum._sum?.amount?.toString() || '0',
        totalDebits: debitSum._sum?.amount?.toString() || '0',
        lastMonthTransactions,
        thisWeekTransactions,
        averageTransactionAmount: totalTransactions > 0
          ? ((creditTotal + debitTotal) / totalTransactions).toFixed(2)
          : '0'
      };
    }

    // 7. Formatear transacciones para respuesta
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      metadata: transaction.metadata || {}
    }));

    // 8. Calcular información de paginación
    const totalPages = Math.ceil(totalTransactions / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 9. Crear audit log
    await prismaClient.notification.create({
      data: {
        type: NotificationType.SYSTEM,
        title: 'USER_ACCESS: Consulta wallet',
        message: `Usuario consultó su monedero digital - ${totalTransactions} transacciones`,
        priority: 'LOW',
        userId: session.user.id,
        isRead: true,
        metadata: JSON.stringify({
          action: 'VIEW_WALLET',
          filters: { type, dateFrom, dateTo },
          pagination: { page, limit },
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }
    }).catch(err => console.error('Error creando audit log:', err));

    console.log(`[USER_WALLET] Usuario ${session.user.id} consultó wallet - Balance: ${userWallet.balance}€`);

    // 10. Response exitosa
    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          balance: userWallet.balance.toString(),
          currency: userWallet.currency,
          createdAt: userWallet.createdAt.toISOString(),
          updatedAt: userWallet.updatedAt.toISOString()
        },
        transactions: formattedTransactions,
        pagination: {
          page,
          limit,
          total: totalTransactions,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          type: type || null,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null
        },
        ...(includeStats && { stats: additionalStats })
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paràmetres invàlids',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('[ERROR] Error obteniendo wallet usuario:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error intern del servidor. Intenta-ho més tard.'
      },
      { status: 500 }
    );
  }
}

// SEGURIDAD: Bloquear otros métodos HTTP
export async function POST() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}