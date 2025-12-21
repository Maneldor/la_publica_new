import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string; invitationId: string }>
}

/**
 * GET /api/groups/[id]/invitations/[invitationId]
 * Obtenir detalls d'una invitació
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId, invitationId } = await params

  try {
    // Verificar permisos
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    })

    const isSystemAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')

    if (!membership?.role || (!['ADMIN', 'MODERATOR'].includes(membership.role) && !isSystemAdmin)) {
      return NextResponse.json({ error: 'No tens permisos' }, { status: 403 })
    }

    const invitation = await prismaClient.groupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nick: true,
            email: true,
            image: true,
          }
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            nick: true,
            image: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    if (!invitation || invitation.groupId !== groupId) {
      return NextResponse.json({ error: 'Invitació no trobada' }, { status: 404 })
    }

    return NextResponse.json({ invitation })

  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/groups/[id]/invitations/[invitationId]
 * Cancel·lar invitació (admin/moderador)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId, invitationId } = await params

  try {
    // Verificar permisos
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    })

    const isSystemAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')

    if (!membership?.role || (!['ADMIN', 'MODERATOR'].includes(membership.role) && !isSystemAdmin)) {
      return NextResponse.json({ error: 'No tens permisos' }, { status: 403 })
    }

    const invitation = await prismaClient.groupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        user: {
          select: { id: true, name: true, nick: true }
        },
        group: {
          select: { name: true }
        }
      }
    })

    if (!invitation || invitation.groupId !== groupId) {
      return NextResponse.json({ error: 'Invitació no trobada' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Només es poden cancel·lar invitacions pendents' },
        { status: 400 }
      )
    }

    await prismaClient.groupInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' }
    })

    // Notificar l'usuari que la invitació ha estat cancel·lada
    await prismaClient.notification.create({
      data: {
        userId: invitation.userId,
        senderId: session.user.id,
        type: 'GROUP_INVITATION_CANCELLED',
        title: 'Invitació cancel·lada',
        content: `La invitació al grup "${invitation.group.name}" ha estat cancel·lada`,
        link: '/dashboard/invitacions',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitació cancel·lada',
    })

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/groups/[id]/invitations/[invitationId]
 * Reenviar invitació (reiniciar expiració)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId, invitationId } = await params

  try {
    // Verificar permisos
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    })

    const isSystemAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')

    if (!membership?.role || (!['ADMIN', 'MODERATOR'].includes(membership.role) && !isSystemAdmin)) {
      return NextResponse.json({ error: 'No tens permisos' }, { status: 403 })
    }

    const invitation = await prismaClient.groupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        user: {
          select: { id: true, name: true, nick: true }
        },
        group: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!invitation || invitation.groupId !== groupId) {
      return NextResponse.json({ error: 'Invitació no trobada' }, { status: 404 })
    }

    // Només es poden reenviar invitacions pendents o expirades
    if (!['PENDING', 'EXPIRED'].includes(invitation.status)) {
      return NextResponse.json(
        { error: 'Només es poden reenviar invitacions pendents o expirades' },
        { status: 400 }
      )
    }

    // Nova expiració de 30 dies
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prismaClient.groupInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'PENDING',
        expiresAt,
        invitedById: session.user.id,
      }
    })

    // Notificar l'usuari
    await prismaClient.notification.create({
      data: {
        userId: invitation.userId,
        senderId: session.user.id,
        type: 'GROUP_INVITATION',
        title: 'Invitació reenviada',
        content: `${session.user.name || session.user.nick} t'ha reenviat la invitació al grup "${invitation.group.name}"`,
        link: '/dashboard/invitacions',
        metadata: {
          groupId: invitation.group.id,
          groupName: invitation.group.name,
          groupSlug: invitation.group.slug,
          invitationId: invitation.id,
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitació reenviada',
    })

  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
