import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { EventType, NotificationType } from '@prisma/client';

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

    const discountAmount = Number((offer as unknown as { discount?: number }).discount ?? 0);

    // 6. Validar descuento configurado
    if (!discountAmount || discountAmount <= 0) {
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
    const userWallet = await prismaClient.userWallet.findUnique({
      where: { userId: session.user.id }
    });

    const existingTransaction = userWallet
      ? await prismaClient.walletTransaction.findFirst({
          where: {
            walletId: userWallet.id,
            metadata: {
              path: ['offerId'],
              equals: offer.id
            }
          }
        })
      : null;

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
      let wallet = userWallet;
      if (!wallet) {
        wallet = await prisma.userWallet.create({
          data: { userId: session.user.id }
        });
      }

      const creditAmount = new Decimal(discountAmount);

      // Actualizar wallet
      const updatedWallet = await prisma.userWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: creditAmount }
        }
      });

      // Crear transacción
      const transaction = await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: creditAmount,
          description: `Redempció oferta: ${offer.title}`,
          offerId: offer.id,
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
          eventType: EventType.CLICK,
          userAgent: validated.userAgent || request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          referrer: validated.referrer
        }
      });

      // Incrementar contador de interacciones
      await prisma.offer.update({
        where: { id: offer.id },
        data: {
          applications: { increment: 1 }
        }
      });

      return { updatedWallet, transaction };
    });

    // 11. Notificar empresa (opcional, asíncrono)
    await prismaClient.notification.create({
      data: {
        userId: offer.companyId,
        type: NotificationType.SYSTEM,
        title: 'Oferta utilitzada en monedero',
        message: `Un usuari ha afegit ${discountAmount}€ al seu monedero utilitzant la teva oferta "${offer.title}"`,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          offerId: offer.id,
          userId: session.user.id,
          transactionId: result.transaction.id,
          amount: discountAmount,
          timestamp: new Date().toISOString()
        })
      }
    }).catch(err => console.error('Error creant notificació:', err));

    // 12. Notificar usuario
    await prismaClient.notification.create({
      data: {
        userId: session.user.id,
        type: NotificationType.SYSTEM,
        title: 'Monedero actualitzat',
        message: `S'han afegit ${discountAmount}€ al teu monedero. Nou saldo: ${result.updatedWallet.balance}€`,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          offerId: offer.id,
          transactionId: result.transaction.id,
          amount: discountAmount,
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
          currency: result.updatedWallet.currency
        },
        offer: {
          title: offer.title,
          companyName: offer.company.name,
          discount: discountAmount
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dades invàlides',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
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