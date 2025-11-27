import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCache, setCache } from '@/lib/cache/redis';
import memoryCache from '@/lib/cache/memory';

const CACHE_TTL = 30; // 30 segundos

/**
 * GET /api/admin/dashboard - Métricas globales del sistema en tiempo real
 * Optimizado con caché y consultas combinadas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    // Verificar rol admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accés denegat' },
        { status: 403 }
      );
    }

    // Verificar caché (Redis primero, luego memoria)
    const cacheKey = 'admin-dashboard-metrics';
    
    // Intentar Redis primero
    let cached = await getCache(cacheKey);
    
    // Si no hay Redis, usar caché en memoria
    if (!cached) {
      cached = memoryCache.get(cacheKey);
    }
    
    if (cached) {
      console.log('📊 [Admin Dashboard] Serving from cache');
      return NextResponse.json({
        ...cached,
        cached: true
      });
    }

    console.log('📊 [Admin Dashboard] Loading real-time metrics');
    const startTime = Date.now();

    // Calcular fechas una sola vez
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Queries paralelas protegidas con try-catch
    // OPTIMIZACIÓN: Mover consulta adicional al Promise.all
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      usersByRole,
      usersSevenDaysAgo,
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      approvedCompanies,
      totalOffers,
      publishedOffers,
      pendingOffers,
      draftOffers,
      totalCoupons,
      activeCoupons,
      usedCoupons,
      totalRedemptions,
      eventsLast7Days,
      viewsLast7Days,
      totalNotifications,
      unreadNotifications,
      totalInvoices,
      paidInvoices
    ] = await Promise.all([
      // Usuarios (protegidos)
      prismaClient.user.count().catch(() => 0),
      prismaClient.user.count({ where: { isActive: true } }).catch(() => 0),
      prismaClient.user.count({
        where: {
          createdAt: {
            gte: todayStart
          }
        }
      }).catch(() => 0),
      prismaClient.user.groupBy({
        by: ['role'],
        _count: true
      }).catch(() => []),
      // Mover consulta de crecimiento aquí para evitar latencia adicional
      prismaClient.user.count({
        where: { createdAt: { lt: sevenDaysAgo } }
      }).catch(() => 0),

      // Empresas (protegidas)
      prismaClient.company.count().catch(() => 0),
      prismaClient.company.count({ where: { isActive: true } }).catch(() => 0),
      prismaClient.company.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prismaClient.company.count({ where: { status: 'PUBLISHED' } }).catch(() => 0), // APPROVED no existe, usar PUBLISHED

      // Ofertas (protegidas)
      prismaClient.offer.count().catch(() => 0),
      prismaClient.offer.count({ where: { status: 'PUBLISHED' } }).catch(() => 0),
      prismaClient.offer.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prismaClient.offer.count({ where: { status: 'DRAFT' } }).catch(() => 0),

      // Cupones (protegidos)
      prismaClient.coupon.count().catch(() => 0),
      prismaClient.coupon.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      prismaClient.coupon.count({ where: { status: 'USED' } }).catch(() => 0),
      prismaClient.redemption.count().catch(() => 0),

      // Eventos últimos 7 días (protegidos) - usar fecha calculada
      prismaClient.offerEvent.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }).catch(() => 0),
      prismaClient.offerEvent.count({
        where: {
          eventType: 'VIEW',
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }).catch(() => 0),

      // Notificaciones (protegidas)
      prismaClient.notification.count().catch(() => 0),
      prismaClient.notification.count({ where: { isRead: false } }).catch(() => 0),

      // Facturación (protegida)
      prismaClient.invoice.count().catch(() => 0),
      prismaClient.invoice.count({ where: { status: 'PAID' } }).catch(() => 0)
    ]);

    // Calcular métricas derivadas
    const conversionRate = totalCoupons > 0
      ? Math.round((usedCoupons / totalCoupons) * 100)
      : 0;

    const companyApprovalRate = totalCompanies > 0
      ? Math.round((approvedCompanies / totalCompanies) * 100)
      : 0;

    const offerPublishRate = totalOffers > 0
      ? Math.round((publishedOffers / totalOffers) * 100)
      : 0;

    // Formatear datos por rol
    const roleStats: Record<string, number> = {};
    usersByRole.forEach(item => {
      roleStats[item.role] = item._count;
    });

    // Calcular crecimiento (ya obtenido en Promise.all)
    const userGrowth = totalUsers - usersSevenDaysAgo;
    const userGrowthPercent = usersSevenDaysAgo > 0
      ? Math.round((userGrowth / usersSevenDaysAgo) * 100)
      : 0;

    const duration = Date.now() - startTime;
    console.log(`✅ [Admin Dashboard] Metrics loaded in ${duration}ms`);

    const responseData = {
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          byRole: roleStats,
          growth: userGrowth,
          growthPercent: userGrowthPercent
        },
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          pending: pendingCompanies,
          approved: approvedCompanies,
          approvalRate: companyApprovalRate
        },
        offers: {
          total: totalOffers,
          published: publishedOffers,
          pending: pendingOffers,
          draft: draftOffers,
          publishRate: offerPublishRate
        },
        coupons: {
          total: totalCoupons,
          active: activeCoupons,
          used: usedCoupons,
          redeemed: totalRedemptions,
          conversionRate
        },
        activity: {
          eventsLast7Days,
          viewsLast7Days,
          avgViewsPerDay: Math.round(viewsLast7Days / 7)
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications
        },
        invoices: {
          total: totalInvoices,
          paid: paidInvoices
        }
      },
      timestamp: new Date().toISOString(),
      queryTime: `${duration}ms`,
      cached: false
    };

    // Guardar en caché (Redis primero, luego memoria como fallback)
    const saved = await setCache(cacheKey, responseData, { ttl: CACHE_TTL });
    
    if (!saved) {
      // Fallback a memoria si Redis no está disponible
      memoryCache.set(cacheKey, responseData, CACHE_TTL * 1000);
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ [Admin Dashboard] Error loading metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al carregar mètriques',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}