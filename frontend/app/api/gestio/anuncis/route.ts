import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Rols permesos per moderar anuncis (ADMIN_GESTIO i CRM_CONTINGUT, més superiors)
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT']

/**
 * GET /api/gestio/anuncis
 * Llistar anuncis per moderació amb filtres i estadístiques
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar rol
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat. Només CRM Contingut pot moderar anuncis.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const statsOnly = searchParams.get('stats') === 'true'

    // Si només volem stats
    if (statsOnly) {
      const stats = await prismaClient.anuncio.groupBy({
        by: ['status'],
        _count: true,
        where: { deletedAt: null }
      })

      const statsMap = {
        pending: 0,
        published: 0,
        rejected: 0,
        draft: 0,
        total: 0,
      }

      stats.forEach(s => {
        statsMap.total += s._count
        const key = s.status.toLowerCase() as keyof typeof statsMap
        if (key in statsMap) {
          statsMap[key] = s._count
        }
      })

      // El "rejected" es pot simular amb ARCHIVED que vingui d'un rebuig
      // O podem usar el camp rejectionReason per identificar-los
      const rejectedCount = await prismaClient.anuncio.count({
        where: {
          deletedAt: null,
          status: 'ARCHIVED',
          // Si tenim un camp per motiu de rebuig
        }
      })

      return NextResponse.json({ stats: statsMap })
    }

    const skip = (page - 1) * limit

    // Construir filtres
    const where: any = {
      deletedAt: null,
    }

    // Filtrar per status
    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Filtrar per cerca
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
        { author: { nick: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Filtrar per categoria (guardada a tags o metadata)
    if (category) {
      where.tags = { has: category }
    }

    const [anuncis, total, statsRaw] = await Promise.all([
      prismaClient.anuncio.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nick: true,
              email: true,
              image: true,
            }
          },
        }
      }),
      prismaClient.anuncio.count({ where }),
      // Estadístiques globals
      prismaClient.anuncio.groupBy({
        by: ['status'],
        _count: true,
        where: { deletedAt: null }
      })
    ])

    // Processar stats
    const stats = {
      pending: 0,
      published: 0,
      archived: 0,
      draft: 0,
      total: 0,
    }

    statsRaw.forEach(s => {
      stats.total += s._count
      const key = s.status.toLowerCase() as keyof typeof stats
      if (key in stats) {
        stats[key] = s._count
      }
    })

    return NextResponse.json({
      anuncis,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    })

  } catch (error) {
    console.error('Error fetching anuncis for moderation:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
