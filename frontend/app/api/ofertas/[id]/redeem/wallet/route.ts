import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const redeemWalletSchema = z.object({
  userAgent: z.string().optional(),
  referrer: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // 2. Validar ID
    if (!params.id || params.id.length < 10) {
      return NextResponse.json(
        { success: false, error: 'ID invàlid' },
        { status: 400 }
      );
    }

    // 3. Obtener y validar body
    const body = await request.json();
    const validated = redeemWalletSchema.parse(body);

    // 4. Buscar oferta
    const offer = await prismaClient.offer.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Oferta no trobada' },
        { status: 404 }
      );
    }

    // 5. Validar tipo de redención
    if (offer.redemptionType !== 'VIP_ACCOUNT') {
      return NextResponse.json(
        {
          success: false,
          error: 'Aquesta oferta no és de tipus monedero digital',
          actualType: offer.redemptionType
        },
        { status: 400 }
      );
    }

    // 6. Validar descuento configurado
    if (!offer.discount || offer.discount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Aquesta oferta no té descuento configurat per al monedero' },
        { status: 400 }
      );
    }

    // 7. Verificar estado oferta
    if (offer.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Oferta no disponible' },
        { status: 400 }
      );
    }

    // 8. Verificar expiración
    if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Oferta caducada' },
        { status: 400 }
      );
    }

    // 9. Verificar redención duplicada (una vez por oferta por usuario)
    const existingTransaction = await prismaClient.walletTransaction.findFirst({
      where: {
        userId: session.user.id,
        metadata: {
          path: ['offerId'],
          equals: offer.id
        }
      }
    });

    if (existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ja has utilitzat aquesta oferta en el teu monedero',
          transactionId: existingTransaction.id
        },
        { status: 409 }
      );
    }

    // 10. Operación atómica: Crear/Actualizar wallet + Transacción + Eventos
    const result = await prismaClient.$transaction(async (prisma) => {
      // Obtener o crear UserWallet
      let userWallet = await prisma.userWallet.findUnique({
        where: { userId: session.user.id }
      });

      if (!userWallet) {
        userWallet = await prisma.userWallet.create({
          data: {
            userId: session.user.id,
            balance: new Decimal(0),
            totalEarned: new Decimal(0),
            totalSpent: new Decimal(0)
          }
        });
      }

      // Calcular nuevo balance
      const creditAmount = new Decimal(offer.discount);
      const newBalance = userWallet.balance.add(creditAmount);
      const newTotalEarned = userWallet.totalEarned.add(creditAmount);

      // Actualizar wallet
      const updatedWallet = await prisma.userWallet.update({
        where: { userId: session.user.id },
        data: {
          balance: newBalance,
          totalEarned: newTotalEarned,
          lastTransactionAt: new Date()
        }
      });

      // Crear transacción
      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: 'CREDIT',
          amount: creditAmount,
          balance: newBalance,
          description: `Redempció oferta: ${offer.title}`,
          metadata: {
            offerId: offer.id,
            companyId: offer.companyId,
            companyName: offer.company.name,
            offerTitle: offer.title,
            userAgent: validated.userAgent || request.headers.get('user-agent'),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            referrer: validated.referrer,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Crear evento de tracking
      await prisma.offerEvent.create({
        data: {
          offerId: offer.id,
          userId: session.user.id,
          companyId: offer.companyId,
          eventType: 'WALLET_REDEEM',
          userAgent: validated.userAgent || request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          referrer: validated.referrer,
          metadata: {
            transactionId: transaction.id,
            creditAmount: creditAmount.toString(),
            newBalance: newBalance.toString(),
            timestamp: new Date().toISOString()
          }
        }
      });

      // Incrementar contador de redenciones
      await prisma.offer.update({
        where: { id: offer.id },
        data: {
          redemptions: { increment: 1 }
        }
      });

      return { updatedWallet, transaction };
    });

    // 11. Notificar empresa (opcional, asíncrono)
    await prismaClient.notification.create({
      data: {
        userId: offer.companyId,
        type: 'SYSTEM_NOTIFICATION',
        title: 'Oferta utilitzada en monedero',
        message: `Un usuari ha afegit ${offer.discount}€ al seu monedero utilitzant la teva oferta "${offer.title}"`,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          offerId: offer.id,
          userId: session.user.id,
          transactionId: result.transaction.id,
          amount: offer.discount,
          timestamp: new Date().toISOString()
        })
      }
    }).catch(err => console.error('Error creant notificació:', err));

    // 12. Notificar usuario
    await prismaClient.notification.create({
      data: {
        userId: session.user.id,
        type: 'WALLET_CREDIT',
        title: 'Monedero actualitzat',
        message: `S'han afegit ${offer.discount}€ al teu monedero. Nou saldo: ${result.updatedWallet.balance}€`,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          offerId: offer.id,
          transactionId: result.transaction.id,
          amount: offer.discount,
          newBalance: result.updatedWallet.balance.toString(),
          companyName: offer.company.name
        })
      }
    }).catch(err => console.error('Error creant notificació usuari:', err));

    // 13. Response exitosa
    return NextResponse.json({
      success: true,
      data: {
        transaction: {
          id: result.transaction.id,
          amount: result.transaction.amount.toString(),
          type: result.transaction.type,
          description: result.transaction.description,
          createdAt: result.transaction.createdAt.toISOString()
        },
        wallet: {
          balance: result.updatedWallet.balance.toString(),
          totalEarned: result.updatedWallet.totalEarned.toString(),
          lastTransactionAt: result.updatedWallet.lastTransactionAt?.toISOString()
        },
        offer: {
          title: offer.title,
          companyName: offer.company.name,
          discount: offer.discount
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dades invàlides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error en redeem wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// Bloquear otros métodos
export async function GET() {
  return NextResponse.json(
    { error: 'Mètode no permès' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Mètode no permès' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Mètode no permès' },
    { status: 405 }
  );
}