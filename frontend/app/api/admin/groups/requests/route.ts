import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/admin/groups/requests
 * Llistar sol·licituds pendents de grups sense admin
 * Només accessible per ADMIN i SUPER_ADMIN
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const groupId = searchParams.get('groupId') // Filtre opcional per grup
    const statsOnly = searchParams.get('stats') === 'true'

    // Si només volem stats
    if (statsOnly) {
      const pending = await prismaClient.groupJoinRequest.count({
        where: {
          status: 'PENDING',
          group: {
            members: {
              none: { role: 'ADMIN' }
            }
          }
        }
      })

      // Comptar per grup
      const groupsWithPendingRequests = await prismaClient.group.findMany({
        where: {
          members: {
            none: { role: 'ADMIN' }
          },
          joinRequests: {
            some: { status: 'PENDING' }
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          _count: {
            select: {
              joinRequests: {
                where: { status: 'PENDING' }
              }
            }
          }
        }
      })

      return NextResponse.json({
        stats: {
          totalPending: pending,
          groupsWithPending: groupsWithPendingRequests.length
        },
        groups: groupsWithPendingRequests.map(g => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          type: g.type,
          pendingCount: g._count.joinRequests
        }))
      })
    }

    // Condicions base: sol·licituds pendents de grups sense admin
    const where: Record<string, unknown> = {
      status: 'PENDING',
      group: {
        members: {
          none: { role: 'ADMIN' }
        }
      }
    }

    // Filtre per grup específic
    if (groupId) {
      where.groupId = groupId
    }

    const [requests, total] = await Promise.all([
      prismaClient.groupJoinRequest.findMany({
        where,
        orderBy: { createdAt: 'asc' }, // Les més antigues primer
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              nick: true,
              email: true,
              image: true,
            }
          },
          group: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              description: true,
              image: true,
              sensitiveJobCategory: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        }
      }),
      prismaClient.groupJoinRequest.count({ where })
    ])

    // Formatejar resposta
    const formattedRequests = requests.map(req => ({
      id: req.id,
      message: req.message,
      createdAt: req.createdAt,
      user: {
        id: req.user.id,
        name: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.name || req.user.nick,
        nick: req.user.nick,
        email: req.user.email,
        image: req.user.image,
      },
      group: req.group
    }))

    return NextResponse.json({
      requests: formattedRequests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error fetching admin requests:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
