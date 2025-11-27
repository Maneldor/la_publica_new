import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateCouponCode, generateQRCode, calculateCouponExpiration } from '@/lib/coupon-utils';
import { sendEmail, canSendEmail, createNotification } from '@/lib/email';
import { render } from '@react-email/render';

/**
 * POST /api/ofertas/[id]/coupon - Generar cupón para oferta
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('❌ [API /ofertas/coupon] Unauthorized - no session');
      return NextResponse.json(
        { success: false, error: 'No autoritzat. Cal iniciar sessió.' },
        { status: 401 }
      );
    }

    const { id: offerId } = params;
    const userId = session.user.id;

    console.log(`🎫 [API /ofertas/coupon] User ${session.user.email} generating coupon for offer ${offerId}`);

    // Verificar que la oferta existe y está publicada
    const offer = await prismaClient.offer.findUnique({
      where: { id: offerId },
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
      console.log(`❌ [API /ofertas/coupon] Offer ${offerId} not found`);
      return NextResponse.json(
        { success: false, error: 'Oferta no trobada' },
        { status: 404 }
      );
    }

    if (offer.status !== 'PUBLISHED') {
      console.log(`⚠️ [API /ofertas/coupon] Offer ${offerId} not published (status: ${offer.status})`);
      return NextResponse.json(
        { success: false, error: 'Oferta no disponible per generar cupons' },
        { status: 403 }
      );
    }

    // Verificar que no ha caducado
    if (offer.expiresAt && offer.expiresAt < new Date()) {
      console.log(`⏰ [API /ofertas/coupon] Offer expired at ${offer.expiresAt}`);
      return NextResponse.json(
        { success: false, error: 'Oferta caducada' },
        { status: 410 }
      );
    }

    // Verificar si ya tiene un cupón activo
    const existingActiveCoupon = await prismaClient.coupon.findFirst({
      where: {
        offerId,
        userId,
        status: 'ACTIVE',
        expiresAt: { gte: new Date() }
      },
      orderBy: { generatedAt: 'desc' }
    });

    if (existingActiveCoupon) {
      console.log(`ℹ️ [API /ofertas/coupon] User already has active coupon: ${existingActiveCoupon.code}`);
      return NextResponse.json({
        success: true,
        message: 'Ja tens un cupó actiu per aquesta oferta',
        coupon: {
          id: existingActiveCoupon.id,
          code: existingActiveCoupon.code,
          qrCodeUrl: existingActiveCoupon.qrCodeUrl,
          qrCodeData: existingActiveCoupon.qrCodeData,
          expiresAt: existingActiveCoupon.expiresAt,
          generatedAt: existingActiveCoupon.generatedAt
        }
      });
    }

    // Generar código único
    const couponCode = generateCouponCode(offer.company.name, offerId);

    // Verificar que el código no existe (muy improbable pero por seguridad)
    const existingCode = await prismaClient.coupon.findUnique({
      where: { code: couponCode }
    });

    if (existingCode) {
      // Re-intentar con timestamp diferente
      const fallbackCode = generateCouponCode(offer.company.name, offerId);
      console.log(`⚠️ [API /ofertas/coupon] Code collision, using fallback: ${fallbackCode}`);
    }

    // Calcular fecha de expiración
    const expiresAt = calculateCouponExpiration(offer.expiresAt);

    // Generar QR code
    console.log(`🔄 [API /ofertas/coupon] Generating QR code for: ${couponCode}`);
    const qrCodeData = await generateQRCode(couponCode, {
      width: 300,
      margin: 2
    });

    // Extraer metadata de la request
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const deviceType = userAgent.toLowerCase().includes('mobile') ? 'mobile' :
                      userAgent.toLowerCase().includes('tablet') ? 'tablet' :
                      'desktop';

    // Crear cupón en la base de datos
    const coupon = await prismaClient.coupon.create({
      data: {
        code: couponCode,
        offerId,
        userId,
        companyId: offer.companyId,
        expiresAt,
        qrCodeData,
        userAgent,
        ipAddress,
        deviceType,
        generatedFrom: 'web'
      }
    });

    // Registrar evento COUPON_GENERATED
    await prismaClient.offerEvent.create({
      data: {
        offerId,
        userId,
        companyId: offer.companyId,
        eventType: 'COUPON_GENERATED',
        userAgent,
        ipAddress,
        deviceType
      }
    });

    console.log(`✅ [API /ofertas/coupon] Coupon generated: ${coupon.code} (expires: ${expiresAt})`);

    // ============= ENVIAR EMAIL Y NOTIFICACIÓN =============
    try {
      // Verificar preferencias del usuario
      const canSend = await canSendEmail(session.user.id, 'coupon_generated');

      if (canSend) {
        const CouponGeneratedEmail = (await import('@/emails/coupon_generated')).default;

        const emailHtml = await render(
          CouponGeneratedEmail({
            user: {
              name: session.user.name || 'Usuari'
            },
            coupon: {
              code: coupon.code,
              qrCodeUrl: coupon.qrCodeData || undefined, // Base64 data URL
              expiresAt: coupon.expiresAt,
              offerTitle: offer.title,
              offerDescription: offer.shortDescription || offer.description,
              companyName: offer.company.name,
              originalPrice: offer.originalPrice ? Number(offer.originalPrice) : undefined,
              discountedPrice: offer.price ? Number(offer.price) : undefined,
              discount: offer.originalPrice && offer.price
                ? `${Math.round((1 - Number(offer.price) / Number(offer.originalPrice)) * 100)}%`
                : undefined
            }
          })
        );

        await sendEmail({
          to: session.user.email!,
          userId: session.user.id,
          subject: `🎉 El teu cupó per a "${offer.title}" està llest!`,
          template: 'COUPON_GENERATED',
          templateProps: {
            user: { name: session.user.name },
            coupon: {
              code: coupon.code,
              offerTitle: offer.title,
              companyName: offer.company.name
            }
          }
        });

        console.log(`📧 [Coupon] Email sent to ${session.user.email}`);
      } else {
        console.log(`🔕 [Coupon] User ${session.user.id} has disabled coupon emails`);
      }

      // Crear notificación in-app
      await createNotification(
        session.user.id,
        'COUPON_GENERATED',
        'Cupó generat amb èxit',
        `Has generat un cupó per a "${offer.title}". Mostra'l a l'empresa per gaudir del descompte.`,
        `/dashboard/ofertes/${offer.slug || offer.id}`,
        session.user.id
      );

      console.log(`🔔 [Coupon] Notification created for user ${session.user.id}`);

    } catch (notificationError) {
      console.error('❌ [Coupon] Error sending notifications:', notificationError);
      // No fallar la request si las notificaciones fallan
    }
    // ============= FIN EMAIL Y NOTIFICACIÓN =============

    return NextResponse.json({
      success: true,
      message: 'Cupó generat correctament',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        qrCodeUrl: coupon.qrCodeUrl,
        qrCodeData: coupon.qrCodeData,
        expiresAt: coupon.expiresAt,
        generatedAt: coupon.generatedAt,
        offer: {
          id: offer.id,
          title: offer.title,
          company: offer.company.name
        }
      }
    });

  } catch (error) {
    console.error('❌ [API /ofertas/coupon] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar el cupó',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ofertas/[id]/coupon - Obtener cupón activo del usuario
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    const { id: offerId } = params;
    const userId = session.user.id;

    console.log(`🔍 [API /ofertas/coupon GET] Getting active coupon for user ${session.user.email} and offer ${offerId}`);

    // Buscar cupón activo
    const activeCoupon = await prismaClient.coupon.findFirst({
      where: {
        offerId,
        userId,
        status: 'ACTIVE',
        expiresAt: { gte: new Date() }
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    if (!activeCoupon) {
      return NextResponse.json({
        success: true,
        coupon: null,
        message: 'No tens cap cupó actiu per aquesta oferta'
      });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: activeCoupon.id,
        code: activeCoupon.code,
        qrCodeUrl: activeCoupon.qrCodeUrl,
        qrCodeData: activeCoupon.qrCodeData,
        expiresAt: activeCoupon.expiresAt,
        generatedAt: activeCoupon.generatedAt,
        offer: {
          id: activeCoupon.offer.id,
          title: activeCoupon.offer.title,
          company: activeCoupon.offer.company.name
        }
      }
    });

  } catch (error) {
    console.error('❌ [API /ofertas/coupon GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtenir cupó',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}