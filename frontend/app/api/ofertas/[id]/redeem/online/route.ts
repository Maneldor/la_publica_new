import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';
import { EventType, NotificationType } from '@prisma/client';

const redeemOnlineSchema = z.object({
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
    const validated = redeemOnlineSchema.parse(body);

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
    if (offer.redemptionType !== 'ONLINE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Aquesta oferta no és de tipus online',
          actualType: offer.redemptionType
        },
        { status: 400 }
      );
    }

    // 6. Validar URL externa
    if (!offer.externalUrl) {
      return NextResponse.json(
        { success: false, error: 'URL externa no configurada per aquesta oferta' },
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

    // 9. Crear evento de tracking
    await prismaClient.offerEvent.create({
      data: {
        offerId: offer.id,
        userId: session.user.id,
        companyId: offer.companyId,
        eventType: EventType.EXTERNAL_CLICK,
        userAgent: validated.userAgent || request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        referrer: validated.referrer
      }
    });

    // 10. Incrementar contador de clicks
    await prismaClient.offer.update({
      where: { id: offer.id },
      data: {
        clicks: { increment: 1 }
      }
    });

    // 11. Construir URL con tracking
    const trackingUrl = new URL(offer.externalUrl);
    trackingUrl.searchParams.append('ref', 'lapublica');
    trackingUrl.searchParams.append('offer_id', offer.id);
    trackingUrl.searchParams.append('user_id', session.user.id);

    // Token único para tracking (opcional)
    const trackingToken = Buffer.from(
      `${session.user.id}-${offer.id}-${Date.now()}`
    ).toString('base64url');
    trackingUrl.searchParams.append('token', trackingToken);

    // 12. Notificar empresa (opcional, asíncrono)
    await prismaClient.notification.create({
      data: {
        userId: offer.companyId,
        type: NotificationType.SYSTEM,
        title: 'Click en oferta online',
        message: `Un usuari ha fet click a la teva oferta "${offer.title}"`,
        priority: 'LOW',
        metadata: JSON.stringify({
          offerId: offer.id,
          userId: session.user.id,
          timestamp: new Date().toISOString()
        })
      }
    }).catch(err => console.error('Error creant notificació:', err));

    // 13. Response exitosa
    return NextResponse.json({
      success: true,
      data: {
        redirectUrl: trackingUrl.toString(),
        offerTitle: offer.title,
        companyName: offer.company.name,
        expiresAt: offer.expiresAt
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

    console.error('Error en redeem online:', error);
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