import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/announcements/my
 * Obtiene los anuncios del usuario actual con filtros por estado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('📋 [API /my] Session:', JSON.stringify(session?.user, null, 2))

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      )
    }

    // Obtener usuario actual
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    })

    console.log('👤 [API /my] User found:', user?.id, 'for email:', session.user.email)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // all, published, pending, rejected, sold
    const search = searchParams.get('search')

    // Construir filtros
    const where: any = {
      authorId: user.id,
      deletedAt: null,
    }

    // Filtro por estado
    if (status && status !== 'all') {
      switch (status) {
        case 'published':
          where.status = 'PUBLISHED'
          break
        case 'pending':
          where.status = 'PENDING'
          break
        case 'rejected':
          where.status = 'REJECTED'
          break
        case 'sold':
          where.status = 'SOLD'
          break
        case 'draft':
          where.status = 'DRAFT'
          break
        case 'expired':
          where.status = 'EXPIRED'
          break
      }
    }

    // Filtro por búsqueda
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Obtener anuncios con paginación
    const [anuncios, total] = await Promise.all([
      prismaClient.anuncio.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          type: true,
          priority: true,
          status: true,
          audience: true,
          publishAt: true,
          expiresAt: true,
          imageUrl: true,
          attachmentUrl: true,
          externalUrl: true,
          tags: true,
          isSticky: true,
          allowComments: true,
          slug: true,
          views: true,
          reactions: true,
          commentsCount: true,
          sharesCount: true,
          contactsCount: true,
          contactPhone: true,
          contactEmail: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
          community: {
            select: {
              id: true,
              nombre: true,
            }
          },
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.anuncio.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    console.log('📊 [API /my] Found', total, 'anuncios for user', user.id)
    console.log('📊 [API /my] Anuncios:', anuncios.map(a => ({ id: a.id, title: a.title, status: a.status })))

    // Calcular estadísticas
    const stats = await prismaClient.anuncio.groupBy({
      by: ['status'],
      where: {
        authorId: user.id,
        deletedAt: null,
      },
      _count: {
        status: true
      }
    })

    const statsMap: Record<string, number> = {}
    stats.forEach(s => {
      statsMap[s.status] = s._count.status
    })

    // Totales agregados
    const aggregates = await prismaClient.anuncio.aggregate({
      where: {
        authorId: user.id,
        deletedAt: null,
      },
      _sum: {
        views: true,
        reactions: true,
        contactsCount: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: anuncios,
      pagination: {
        total,
        page,
        limit,
        totalPages
      },
      stats: {
        total,
        published: statsMap['PUBLISHED'] || 0,
        pending: statsMap['PENDING'] || 0,
        rejected: statsMap['REJECTED'] || 0,
        sold: statsMap['SOLD'] || 0,
        draft: statsMap['DRAFT'] || 0,
        expired: statsMap['EXPIRED'] || 0,
        totalViews: aggregates._sum.views || 0,
        totalReactions: aggregates._sum.reactions || 0,
        totalContacts: aggregates._sum.contactsCount || 0,
      }
    })

  } catch (error) {
    console.error('Error al obtener mis anuncios:', error)
    return NextResponse.json(
      { error: 'Error al obtener anuncios', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
