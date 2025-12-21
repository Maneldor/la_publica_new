import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/user/invitations
 * Llistar invitacions rebudes per l'usuari actual
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const now = new Date()

    const invitations = await prismaClient.groupInvitation.findMany({
      where: {
        userId,
        ...(status !== 'ALL' && { status: status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            type: true,
            membersCount: true,
          }
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            nick: true,
            image: true,
          }
        }
      }
    })

    // Formatejar i marcar expirades
    const formattedInvitations = invitations.map(inv => ({
      id: inv.id,
      status: inv.status,
      message: inv.message,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      respondedAt: inv.respondedAt,
      isExpired: inv.status === 'PENDING' && inv.expiresAt && new Date(inv.expiresAt) < now,
      group: inv.group,
      invitedBy: inv.invitedBy,
    }))

    // Comptar pendents vàlides (no expirades)
    const pendingCount = await prismaClient.groupInvitation.count({
      where: {
        userId,
        status: 'PENDING',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    })

    return NextResponse.json({
      invitations: formattedInvitations,
      pendingCount,
    })

  } catch (error) {
    console.error('Error fetching user invitations:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
