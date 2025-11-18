import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/ofertas/detail/[slug] - Detalle completo de oferta pública
 *
 * Features:
 * - Tracking automático de VIEW
 * - Incremento contador de vistas
 * - Detección de favorito del usuario
 * - Geolocalización por IP
 * - Device detection
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const startTime = Date.now();

  try {
    const { slug } = params;

    console.log(`📖 [API /ofertas/detail/${slug}] Getting offer detail`);

    // Buscar oferta con todas las relaciones necesarias
    const offer = await prismaClient.offer.findUnique({
      where: { slug },
      include: {
        category: true,
        company: {
          include: {
            currentPlan: true
          }
        },
        _count: {
          select: {
            coupons: true,
            redemptions: true,
            favorites: true,
            events: true
          }
        }
      }
    });

    if (!offer) {
      console.log(`❌ [API /ofertas/detail/${slug}] Offer not found`);
      return NextResponse.json(
        { success: false, error: 'Oferta no trobada' },
        { status: 404 }
      );
    }

    // Verificar que está publicada
    if (offer.status !== 'PUBLISHED') {
      console.log(`⚠️ [API /ofertas/detail/${slug}] Offer not published (status: ${offer.status})`);
      return NextResponse.json(
        { success: false, error: 'Oferta no disponible' },
        { status: 403 }
      );
    }

    // Verificar que no ha caducado
    if (offer.expiresAt && offer.expiresAt < new Date()) {
      console.log(`⏰ [API /ofertas/detail/${slug}] Offer expired at ${offer.expiresAt}`);
      return NextResponse.json(
        { success: false, error: 'Oferta caducada' },
        { status: 410 }
      );
    }

    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Extraer metadata de la request
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const referer = request.headers.get('referer') || '';

    // Device detection simple
    const deviceType = userAgent.toLowerCase().includes('mobile') ? 'mobile' :
                      userAgent.toLowerCase().includes('tablet') ? 'tablet' :
                      'desktop';

    const browser = userAgent.toLowerCase().includes('chrome') ? 'chrome' :
                   userAgent.toLowerCase().includes('firefox') ? 'firefox' :
                   userAgent.toLowerCase().includes('safari') ? 'safari' :
                   'other';

    const os = userAgent.toLowerCase().includes('windows') ? 'windows' :
              userAgent.toLowerCase().includes('mac') ? 'macos' :
              userAgent.toLowerCase().includes('iphone') || userAgent.toLowerCase().includes('ipad') ? 'ios' :
              userAgent.toLowerCase().includes('android') ? 'android' :
              'other';

    console.log(`📱 [API /ofertas/detail/${slug}] Device: ${deviceType}, Browser: ${browser}, OS: ${os}`);

    // Generar o recuperar sessionId (desde cookie o crear nuevo)
    const sessionId = request.cookies.get('session_id')?.value ||
                     `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Incrementar contador de vistas y actualizar lastViewedAt
    const updatePromise = prismaClient.offer.update({
      where: { id: offer.id },
      data: {
        views: { increment: 1 },
        lastViewedAt: new Date()
      }
    });

    // Registrar evento DETAIL_VIEW
    const eventPromise = prismaClient.offerEvent.create({
      data: {
        offerId: offer.id,
        userId: userId || null,
        companyId: offer.companyId,
        eventType: 'DETAIL_VIEW',
        sessionId,
        userAgent,
        ipAddress,
        deviceType,
        browser,
        os,
        referrer: referer || null
      }
    });

    // Ejecutar en paralelo
    await Promise.all([updatePromise, eventPromise]);

    console.log(`✅ [API /ofertas/detail/${slug}] View tracked (total views: ${offer.views + 1})`);

    // Verificar si es favorito del usuario
    let isFavorite = false;
    if (userId) {
      const favorite = await prismaClient.userFavorite.findUnique({
        where: {
          unique_user_offer_favorite: {
            userId: userId,
            offerId: offer.id
          }
        }
      });
      isFavorite = !!favorite;
    }

    // Obtener cupón activo del usuario si existe
    let activeCoupon = null;
    if (userId) {
      activeCoupon = await prismaClient.coupon.findFirst({
        where: {
          offerId: offer.id,
          userId: userId,
          status: 'ACTIVE',
          expiresAt: { gte: new Date() }
        },
        orderBy: { generatedAt: 'desc' }
      });
    }

    // Calcular descuento
    const originalPrice = Number(offer.originalPrice) || 0;
    const price = Number(offer.price) || 0;
    const discountPercentage = originalPrice > 0 && price < originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    // Calcular tasa de conversión
    const conversionRate = offer._count.coupons > 0
      ? Math.round((offer._count.redemptions / offer._count.coupons) * 100)
      : 0;

    const duration = Date.now() - startTime;
    console.log(`⏱️ [API /ofertas/detail/${slug}] Completed in ${duration}ms`);

    // Formatear respuesta
    const response = {
      success: true,
      offer: {
        id: offer.id,
        title: offer.title,
        slug: offer.slug,
        shortDescription: offer.shortDescription,
        description: offer.description,
        images: offer.images,
        price,
        originalPrice,
        discountPercentage,
        currency: offer.currency,
        priceType: offer.priceType,
        category: {
          id: offer.category.id,
          name: offer.category.name,
          slug: offer.category.slug,
          icon: offer.category.icon,
          color: offer.category.color
        },
        company: {
          id: offer.company.id,
          name: offer.company.name,
          logo: offer.company.logo,
          description: offer.company.description,
          plan: offer.company.currentPlan?.name || 'ESTÀNDARD',
          verified: true,
          rating: 4.5, // TODO: Sistema de ratings real
          reviews: 0 // TODO: Sistema de reviews real
        },
        location: offer.location,
        remote: offer.remote,
        featured: offer.featured,
        featuredUntil: offer.featuredUntil,
        expiresAt: offer.expiresAt,
        publishedAt: offer.publishedAt,

        // Contacto
        contactMethod: offer.contactMethod,
        contactEmail: offer.contactEmail,
        contactPhone: offer.contactPhone,
        contactForm: offer.contactForm,
        externalUrl: offer.externalUrl,

        // Detalles
        requirements: offer.requirements,
        benefits: offer.benefits,
        duration: offer.duration,

        // SEO
        seoTitle: offer.seoTitle,
        seoDescription: offer.seoDescription,
        seoKeywords: offer.seoKeywords,

        // Tags
        tags: offer.tags,

        // Estadísticas
        stats: {
          views: offer.views + 1, // +1 por esta vista
          saves: offer._count.favorites,
          couponsGenerated: offer._count.coupons,
          couponsUsed: offer._count.redemptions,
          conversionRate,
          totalEvents: offer._count.events
        },

        // Estado del usuario
        isFavorite,
        hasActiveCoupon: !!activeCoupon,
        activeCoupon: activeCoupon ? {
          id: activeCoupon.id,
          code: activeCoupon.code,
          expiresAt: activeCoupon.expiresAt,
          qrCodeUrl: activeCoupon.qrCodeUrl
        } : null,

        // Fechas
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt
      },
      meta: {
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        sessionId
      }
    };

    // Set cookie de sesión si no existe
    const headers = new Headers();
    if (!request.cookies.get('session_id')) {
      headers.set('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    }

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error(`❌ [API /ofertas/detail/${params.slug}] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al carregar el detall de l\'oferta',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}