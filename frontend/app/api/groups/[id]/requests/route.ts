import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/groups/[id]/requests
 * Obtenir sol·licituds d'un grup (només admins/moderadors)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PENDING'

  try {
    // Verificar que l'usuari és admin o moderador del grup
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    })

    if (!membership || !['ADMIN', 'MODERATOR'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'No tens permisos per gestionar sol·licituds' },
        { status: 403 }
      )
    }

    // Obtenir sol·licituds filtrades per status
    const requests = await prismaClient.groupJoinRequest.findMany({
      where: {
        groupId,
        ...(status !== 'ALL' ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            nick: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            cargo: true,
            createdAt: true,
            profile: {
              select: {
                position: true,
                department: true,
                bio: true,
              }
            }
          }
        },
        reviewedBy: {
          select: {
            id: true,
            nick: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Comptar per status
    const counts = await prismaClient.groupJoinRequest.groupBy({
      by: ['status'],
      where: { groupId },
      _count: true
    })

    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    }

    counts.forEach(c => {
      statusCounts[c.status as keyof typeof statusCounts] = c._count
    })

    // Formatejar resposta
    const formattedRequests = requests.map(req => ({
      id: req.id,
      status: req.status,
      message: req.message,
      createdAt: req.createdAt,
      reviewedAt: req.reviewedAt,
      reviewNote: req.reviewNote,
      user: {
        id: req.user.id,
        nick: req.user.nick,
        name: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || req.user.name || req.user.nick,
        email: req.user.email,
        image: req.user.image,
        position: req.user.profile?.position || req.user.cargo,
        department: req.user.profile?.department,
        bio: req.user.profile?.bio,
        memberSince: req.user.createdAt,
      },
      reviewedBy: req.reviewedBy ? {
        id: req.reviewedBy.id,
        nick: req.reviewedBy.nick,
        name: req.reviewedBy.name,
        image: req.reviewedBy.image,
      } : null
    }))

    return NextResponse.json({
      requests: formattedRequests,
      counts: statusCounts,
      total: formattedRequests.length,
    })

  } catch (error) {
    console.error('Error fetching join requests:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
