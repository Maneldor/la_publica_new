import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/groups/[id]/invitations
 * Enviar invitació a un usuari (admin/moderador de grup)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params
  const invitedById = session.user.id

  try {
    // Verificar que el grup existeix
    const group = await prismaClient.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        isActive: true,
      }
    })

    if (!group || !group.isActive) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    // Verificar permisos (admin/mod del grup o admin del sistema)
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: invitedById }
      }
    })

    const isSystemAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')

    if (!membership?.role || (!['ADMIN', 'MODERATOR'].includes(membership.role) && !isSystemAdmin)) {
      return NextResponse.json({ error: 'No tens permisos per convidar' }, { status: 403 })
    }

    // Obtenir dades de la invitació
    const body = await request.json()
    const { userId, message } = body

    if (!userId) {
      return NextResponse.json({ error: 'ID d\'usuari requerit' }, { status: 400 })
    }

    // Verificar que l'usuari existeix
    const targetUser = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, nick: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Verificar que no és ja membre
    const existingMembership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Aquest usuari ja és membre del grup' },
        { status: 400 }
      )
    }

    // Verificar que no té invitació pendent
    const existingInvitation = await prismaClient.groupInvitation.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    })

    if (existingInvitation) {
      if (existingInvitation.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Ja hi ha una invitació pendent per aquest usuari' },
          { status: 400 }
        )
      }
      // Si va ser rebutjada o cancel·lada, permetre reenviar
      await prismaClient.groupInvitation.delete({
        where: { id: existingInvitation.id }
      })
    }

    // Crear invitació amb expiració de 30 dies
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const invitation = await prismaClient.groupInvitation.create({
      data: {
        groupId,
        userId,
        invitedById,
        message: message?.trim() || null,
        status: 'PENDING',
        expiresAt,
      },
      include: {
        user: {
          select: { id: true, name: true, nick: true, image: true }
        },
        invitedBy: {
          select: { id: true, name: true, nick: true }
        }
      }
    })

    // Notificar l'usuari convidat
    await prismaClient.notification.create({
      data: {
        userId,
        senderId: invitedById,
        type: 'GROUP_INVITATION',
        title: 'Invitació a un grup',
        content: `${session.user.name || session.user.nick} t'ha convidat a unir-te al grup "${group.name}"`,
        link: '/dashboard/invitacions',
        metadata: {
          groupId,
          groupName: group.name,
          groupSlug: group.slug,
          invitationId: invitation.id,
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Invitació enviada a ${targetUser.name || targetUser.nick}`,
      invitation: {
        id: invitation.id,
        status: invitation.status,
        user: invitation.user,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      },
    })

  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * GET /api/groups/[id]/invitations
 * Llistar invitacions del grup (admin/moderador)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params

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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const invitations = await prismaClient.groupInvitation.findMany({
      where: {
        groupId,
        ...(status !== 'ALL' && { status: status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' }),
      },
      orderBy: { createdAt: 'desc' },
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
        }
      }
    })

    // Comptar per estat
    const counts = await prismaClient.groupInvitation.groupBy({
      by: ['status'],
      where: { groupId },
      _count: true
    })

    const statusCounts = {
      PENDING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      EXPIRED: 0,
      CANCELLED: 0,
    }

    counts.forEach(c => {
      statusCounts[c.status as keyof typeof statusCounts] = c._count
    })

    // Marcar expirades com a tal
    const now = new Date()
    const formattedInvitations = invitations.map(inv => ({
      ...inv,
      isExpired: inv.status === 'PENDING' && inv.expiresAt && new Date(inv.expiresAt) < now,
    }))

    return NextResponse.json({
      invitations: formattedInvitations,
      counts: statusCounts,
    })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
