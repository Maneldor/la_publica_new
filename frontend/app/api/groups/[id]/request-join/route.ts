import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { userHasProfessionalGroup } from '@/lib/group-visibility'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/groups/[id]/request-join
 * Crear sol·licitud per unir-se a un grup
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const userId = session.user.id
  const { id: groupId } = await params

  try {
    // Obtenir el grup
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

    // Verificar que el grup accepta sol·licituds
    if (group.type !== 'PRIVATE' && group.type !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Aquest grup no accepta sol·licituds. Pots unir-te directament.' },
        { status: 400 }
      )
    }

    // Verificar si ja és membre
    const existingMembership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Ja ets membre d\'aquest grup' },
        { status: 400 }
      )
    }

    // Per grups PROFESSIONAL, verificar que no en tingui un altre
    if (group.type === 'PROFESSIONAL') {
      const hasProfessional = await userHasProfessionalGroup(userId)
      if (hasProfessional) {
        return NextResponse.json(
          { error: 'Ja pertanys a un grup professional. Només pots pertànyer a un.' },
          { status: 400 }
        )
      }
    }

    // Verificar si ja té una sol·licitud
    const existingRequest = await prismaClient.groupJoinRequest.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    })

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Ja tens una sol·licitud pendent per aquest grup' },
          { status: 400 }
        )
      }
      if (existingRequest.status === 'REJECTED') {
        return NextResponse.json(
          { error: 'La teva sol·licitud anterior va ser rebutjada. Contacta amb un administrador.' },
          { status: 400 }
        )
      }
    }

    // Obtenir missatge opcional
    const body = await request.json().catch(() => ({}))
    const message = body.message?.trim() || null

    // Crear sol·licitud
    const joinRequest = await prismaClient.groupJoinRequest.create({
      data: {
        groupId,
        userId,
        message,
        status: 'PENDING',
      },
      include: {
        user: {
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

    // Notificar als admins del grup (o admins del sistema si no n'hi ha)
    const groupAdmins = await prismaClient.groupMember.findMany({
      where: {
        groupId,
        role: { in: ['ADMIN', 'MODERATOR'] }
      },
      select: { userId: true }
    })

    if (groupAdmins.length > 0) {
      // Notificar als admins del grup
      await prismaClient.notification.createMany({
        data: groupAdmins.map(admin => ({
          userId: admin.userId,
          senderId: userId,
          type: 'GROUP_JOIN_REQUEST',
          title: 'Nova sol·licitud per unir-se',
          message: `${session.user.name || 'Un usuari'} vol unir-se al grup "${group.name}"`,
          actionUrl: `/dashboard/grups/${group.slug}/gestio/solicituds`,
          metadata: {
            groupId,
            groupName: group.name,
            requestId: joinRequest.id,
          }
        }))
      })
    } else {
      // El grup no té admin - notificar als admins del sistema
      const systemAdmins = await prismaClient.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
          isActive: true,
        },
        select: { id: true }
      })

      if (systemAdmins.length > 0) {
        await prismaClient.notification.createMany({
          data: systemAdmins.map(admin => ({
            userId: admin.id,
            senderId: userId,
            type: 'GROUP_JOIN_REQUEST',
            title: 'Sol·licitud de grup sense admin',
            message: `${session.user.name || 'Un usuari'} vol unir-se al grup "${group.name}" (sense administrador)`,
            actionUrl: '/admin/grups/solicituds',
            metadata: {
              groupId,
              groupName: group.name,
              requestId: joinRequest.id,
              noGroupAdmin: true,
            }
          }))
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sol·licitud enviada correctament',
      request: {
        id: joinRequest.id,
        status: joinRequest.status,
        createdAt: joinRequest.createdAt,
      },
    })

  } catch (error) {
    console.error('Error creating join request:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * GET /api/groups/[id]/request-join
 * Obtenir estat de la sol·licitud de l'usuari actual
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params

  try {
    const joinRequest = await prismaClient.groupJoinRequest.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        }
      },
      select: {
        id: true,
        status: true,
        message: true,
        createdAt: true,
        reviewedAt: true,
        reviewNote: true,
      }
    })

    return NextResponse.json({ request: joinRequest })

  } catch (error) {
    console.error('Error fetching join request:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/groups/[id]/request-join
 * Cancel·lar sol·licitud
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params

  try {
    const joinRequest = await prismaClient.groupJoinRequest.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        }
      }
    })

    if (!joinRequest) {
      return NextResponse.json({ error: 'Sol·licitud no trobada' }, { status: 404 })
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Només es poden cancel·lar sol·licituds pendents' },
        { status: 400 }
      )
    }

    await prismaClient.groupJoinRequest.update({
      where: { id: joinRequest.id },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ success: true, message: 'Sol·licitud cancel·lada' })

  } catch (error) {
    console.error('Error cancelling join request:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
