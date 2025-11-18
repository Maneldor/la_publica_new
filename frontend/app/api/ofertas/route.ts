import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/ofertas - Lista pública de ofertas
 *
 * Query params:
 * - search: string (buscar en título/descripción)
 * - categoryId: string (filtrar por categoría)
 * - sort: 'recent' | 'discount' | 'expiring' | 'popular' | 'featured'
 * - featured: 'true' | 'false' (solo destacadas)
 * - remote: 'true' | 'false' (solo remotas)
 * - minPrice: number
 * - maxPrice: number
 * - location: string (ciudad/provincia)
 * - page: number (default: 1)
 * - limit: number (default: 12, max: 50)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de filtrado
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';
    const featured = searchParams.get('featured');
    const remote = searchParams.get('remote');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));

    console.log('📊 [API /ofertas] Request params:', {
      categoryId,
      search,
      sort,
      featured,
      remote,
      minPrice,
      maxPrice,
      location,
      page,
      limit
    });

    // Construir filtros WHERE
    const where: any = {
      status: 'PUBLISHED',
      // Solo ofertas no caducadas o sin fecha de caducidad
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    };

    // Filtro por categoría
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Búsqueda por texto
    if (search && search.trim()) {
      where.AND = [
        {
          OR: [
            { title: { contains: search.trim(), mode: 'insensitive' } },
            { description: { contains: search.trim(), mode: 'insensitive' } },
            { shortDescription: { contains: search.trim(), mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Filtro destacadas
    if (featured === 'true') {
      where.featured = true;
    }

    // Filtro remoto
    if (remote === 'true') {
      where.remote = true;
    } else if (remote === 'false') {
      where.remote = false;
    }

    // Filtro por precio
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Filtro por ubicación
    if (location && location.trim()) {
      where.location = {
        contains: location.trim(),
        mode: 'insensitive'
      };
    }

    // Determinar ordenación
    let orderBy: any = { createdAt: 'desc' };

    switch (sort) {
      case 'discount':
        // Mayor descuento primero (calculado: originalPrice - price)
        orderBy = [
          { originalPrice: 'desc' },
          { price: 'asc' }
        ];
        break;

      case 'expiring':
        // Las que caducan antes
        orderBy = { expiresAt: 'asc' };
        break;

      case 'popular':
        // Más vistas
        orderBy = { views: 'desc' };
        break;

      case 'featured':
        // Destacadas primero, luego por fecha
        orderBy = [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ];
        break;

      case 'recent':
      default:
        orderBy = { publishedAt: 'desc' };
    }

    // Paginación
    const skip = (page - 1) * limit;

    console.log('🔍 [API /ofertas] Query:', { where, orderBy, skip, limit });

    // Consulta a BD (paralela para optimizar)
    const [offers, total, categories] = await Promise.all([
      prismaClient.offer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true,
              currentPlan: {
                select: {
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              coupons: true,
              redemptions: true,
              favorites: true
            }
          }
        }
      }),
      prismaClient.offer.count({ where }),
      prismaClient.offerCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })
    ]);

    console.log(`✅ [API /ofertas] Found ${offers.length} offers of ${total} total`);

    // Obtener favoritos del usuario si está autenticado
    const session = await getServerSession(authOptions);
    let favoriteIds: string[] = [];

    if (session?.user?.id) {
      const favorites = await prismaClient.userFavorite.findMany({
        where: { userId: session.user.id },
        select: { offerId: true }
      });
      favoriteIds = favorites.map(f => f.offerId);
      console.log(`👤 [API /ofertas] User ${session.user.email} has ${favoriteIds.length} favorites`);
    }

    // Formatear ofertas para respuesta
    const formattedOffers = offers.map(offer => {
      const originalPrice = Number(offer.originalPrice) || 0;
      const price = Number(offer.price) || 0;
      const discountPercentage = originalPrice > 0 && price < originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

      return {
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
        category: offer.category,
        company: {
          id: offer.company.id,
          name: offer.company.name,
          logo: offer.company.logo,
          description: offer.company.description,
          plan: offer.company.currentPlan?.name || 'ESTÀNDARD',
          verified: true, // TODO: Implementar verificación real
          rating: 4.5, // TODO: Implementar ratings reales
          reviews: 0 // TODO: Implementar reviews reales
        },
        location: offer.location,
        remote: offer.remote,
        featured: offer.featured,
        expiresAt: offer.expiresAt,
        views: offer.views,
        isFavorite: favoriteIds.includes(offer.id),
        stats: {
          couponsGenerated: offer._count.coupons,
          couponsUsed: offer._count.redemptions,
          saves: offer._count.favorites,
          conversionRate: offer._count.coupons > 0
            ? Math.round((offer._count.redemptions / offer._count.coupons) * 100)
            : 0
        },
        createdAt: offer.createdAt,
        publishedAt: offer.publishedAt,
        updatedAt: offer.updatedAt
      };
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ [API /ofertas] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      offers: formattedOffers,
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      },
      meta: {
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    console.error('❌ [API /ofertas] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al carregar les ofertes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}