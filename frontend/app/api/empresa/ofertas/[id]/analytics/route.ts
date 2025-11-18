import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/empresa/ofertas/[id]/analytics
 *
 * Retorna analytics completos de una oferta:
 * - Métricas generales (vistas, cupones, conversión)
 * - Timeline de eventos
 * - Datos para gráficos
 * - Lista detallada de cupones
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('❌ [Analytics] Unauthorized - no session');
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    const { id: offerId } = params;

    console.log(`📊 [Analytics] Loading analytics for offer ${offerId}`);

    // Verificar que la oferta existe
    const offer = await prismaClient.offer.findUnique({
      where: { id: offerId },
      include: {
        company: true,
        category: true
      }
    });

    if (!offer) {
      console.log(`❌ [Analytics] Offer not found: ${offerId}`);
      return NextResponse.json(
        { success: false, error: 'Oferta no trobada' },
        { status: 404 }
      );
    }

    // Para este demo, permitimos ver analytics de cualquier oferta
    // En producción aquí verificarías que pertenece a la empresa del usuario

    // Obtener rango de fechas (últimos 30 días por defecto)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log(`📅 [Analytics] Loading data from ${startDate.toISOString()} to now`);

    // Consultas paralelas para optimizar
    const [
      // Métricas generales
      totalCoupons,
      totalRedemptions,
      totalEvents,
      totalFavorites,

      // Cupones detallados
      coupons,

      // Eventos timeline
      events,

      // Datos para gráfico temporal
      dailyStatsResult
    ] = await Promise.all([
      // Total cupones generados
      prismaClient.coupon.count({
        where: { offerId }
      }),

      // Total cupones usados
      prismaClient.redemption.count({
        where: { offerId }
      }),

      // Total eventos
      prismaClient.offerEvent.count({
        where: { offerId }
      }),

      // Total favoritos
      prismaClient.userFavorite.count({
        where: { offerId }
      }),

      // Lista de cupones con detalles
      prismaClient.coupon.findMany({
        where: { offerId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          redemption: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { generatedAt: 'desc' }
      }),

      // Eventos recientes para timeline
      prismaClient.offerEvent.findMany({
        where: {
          offerId,
          createdAt: { gte: startDate }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),

      // Estadísticas diarias para gráfico - usando agregación manual
      prismaClient.coupon.findMany({
        where: {
          offerId,
          generatedAt: { gte: startDate }
        },
        select: {
          generatedAt: true,
          status: true,
          usedAt: true
        }
      })
    ]);

    // Procesar estadísticas diarias manualmente
    const dailyStats: Array<{
      date: string;
      coupons_generated: number;
      coupons_used: number;
    }> = [];

    // Crear mapa de fechas
    const statsMap = new Map<string, { generated: number; used: number }>();

    dailyStatsResult.forEach(coupon => {
      const dateKey = coupon.generatedAt.toISOString().split('T')[0];
      const existing = statsMap.get(dateKey) || { generated: 0, used: 0 };
      existing.generated += 1;
      if (coupon.status === 'USED' && coupon.usedAt) {
        existing.used += 1;
      }
      statsMap.set(dateKey, existing);
    });

    // Convertir a array para el gráfico
    for (const [date, stats] of statsMap.entries()) {
      dailyStats.push({
        date,
        coupons_generated: stats.generated,
        coupons_used: stats.used
      });
    }

    dailyStats.sort((a, b) => a.date.localeCompare(b.date));

    // Calcular métricas
    const conversionRate = totalCoupons > 0
      ? Math.round((totalRedemptions / totalCoupons) * 100)
      : 0;

    const activeCoupons = coupons.filter(c => c.status === 'ACTIVE').length;
    const expiredCoupons = coupons.filter(c => c.status === 'EXPIRED').length;
    const cancelledCoupons = coupons.filter(c => c.status === 'CANCELLED').length;

    // Calcular ingresos (si hay redemptions con precio)
    const totalRevenue = await prismaClient.redemption.aggregate({
      where: { offerId },
      _sum: { finalPrice: true }
    });

    const avgTicket = totalRedemptions > 0 && totalRevenue._sum.finalPrice
      ? Number(totalRevenue._sum.finalPrice) / totalRedemptions
      : 0;

    // Formatear cupones para respuesta
    const formattedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      status: coupon.status,
      generatedAt: coupon.generatedAt,
      expiresAt: coupon.expiresAt,
      usedAt: coupon.usedAt,
      user: {
        name: coupon.user.name,
        email: coupon.user.email
      },
      redemption: coupon.redemption ? {
        redeemedAt: coupon.redemption.redeemedAt,
        finalPrice: Number(coupon.redemption.finalPrice),
        location: coupon.redemption.location,
        receiptNumber: coupon.redemption.receiptNumber
      } : null
    }));

    // Agrupar eventos por tipo
    const eventsByType = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Formatear timeline
    const timeline = events.slice(0, 20).map(event => ({
      id: event.id,
      type: event.eventType,
      timestamp: event.createdAt,
      user: event.user ? {
        name: event.user.name,
        email: event.user.email
      } : null,
      metadata: {
        deviceType: event.deviceType,
        browser: event.browser,
        city: event.city
      }
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Analytics] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        title: offer.title,
        status: offer.status,
        category: offer.category.name,
        publishedAt: offer.publishedAt
      },
      metrics: {
        // Engagement
        views: offer.views,
        favorites: totalFavorites,

        // Cupones
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        cancelledCoupons,

        // Conversión
        totalRedemptions,
        conversionRate,

        // Económico
        totalRevenue: Number(totalRevenue._sum.finalPrice || 0),
        avgTicket: Math.round(avgTicket * 100) / 100,

        // Actividad
        totalEvents,
        eventsByType
      },
      charts: {
        daily: dailyStats,
        conversionFunnel: [
          { stage: 'Vistes', value: offer.views },
          { stage: 'Cupons Generats', value: totalCoupons },
          { stage: 'Cupons Usats', value: totalRedemptions }
        ]
      },
      coupons: formattedCoupons,
      timeline,
      meta: {
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString(),
          days
        },
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    console.error('❌ [Analytics] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al carregar analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}