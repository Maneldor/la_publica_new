import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { notifyConnectionAccepted, notifyConnectionRejected } from '@/lib/notifications/notification-actions'

/**
 * PATCH /api/connections/[id]
 * Acceptar o rebutjar sol·licitud de connexió
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id: connectionId } = await params

    const body = await request.json()
    const { action } = body // 'accept' o 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acció invàlida. Usa "accept" o "reject"' }, { status: 400 })
    }

    // Obtenir la connexió
    const connection = await prismaClient.userConnection.findUnique({
      where: { id: connectionId },
      include: {
        sender: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            name: true
          }
        },
        receiver: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            name: true
          }
        }
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connexió no trobada' }, { status: 404 })
    }

    // Només el receptor pot acceptar/rebutjar
    if (connection.receiverId !== session.user.id) {
      return NextResponse.json({
        error: 'No tens permís per fer aquesta acció. Només el receptor pot acceptar o rebutjar.'
      }, { status: 403 })
    }

    // Només es poden processar sol·licituds pendents
    if (connection.status !== 'PENDING') {
      const statusMessages: Record<string, string> = {
        'ACCEPTED': 'Aquesta sol·licitud ja ha estat acceptada',
        'REJECTED': 'Aquesta sol·licitud ja ha estat rebutjada',
        'CANCELLED': 'Aquesta sol·licitud ha estat cancel·lada',
        'EXPIRED': 'Aquesta sol·licitud ha expirat'
      }
      return NextResponse.json({
        error: statusMessages[connection.status] || 'Aquesta sol·licitud ja ha estat processada'
      }, { status: 400 })
    }

    // Verificar si ha expirat
    if (connection.expiresAt && new Date() > connection.expiresAt) {
      await prismaClient.userConnection.update({
        where: { id: connectionId },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json({ error: 'Aquesta sol·licitud ha expirat' }, { status: 400 })
    }

    // Actualitzar estat
    const updatedConnection = await prismaClient.userConnection.update({
      where: { id: connectionId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
        ...(action === 'accept' && { acceptedAt: new Date() }),
        ...(action === 'reject' && { rejectedAt: new Date() }),
        expiresAt: null // Ja no expira un cop processada
      }
    })

    const senderName = connection.sender.firstName || connection.sender.name || connection.sender.nick

    // Obtenir nom del receptor (usuari actual) per la notificació
    const currentUser = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, name: true, nick: true }
    })
    const receiverName = currentUser?.firstName || currentUser?.name || currentUser?.nick || 'Un usuari'

    // Enviar notificació al sender
    try {
      if (action === 'accept') {
        await notifyConnectionAccepted(
          connection.senderId,
          session.user.id,
          receiverName,
          connectionId
        )
        console.log(`🔔 Notificació d'acceptació enviada a ${senderName}`)
      } else {
        await notifyConnectionRejected(
          connection.senderId,
          session.user.id,
          receiverName,
          connectionId
        )
        console.log(`🔔 Notificació de rebuig enviada a ${senderName}`)
      }
    } catch (notifyError) {
      console.error('Error enviant notificació:', notifyError)
      // No fallam la petició si falla la notificació
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: updatedConnection.id,
        status: updatedConnection.status.toLowerCase(),
        acceptedAt: updatedConnection.acceptedAt,
        rejectedAt: updatedConnection.rejectedAt
      },
      message: action === 'accept'
        ? `T'has connectat amb ${senderName}!`
        : `Sol·licitud de ${senderName} rebutjada`
    })
  } catch (error) {
    console.error('Error processant sol·licitud:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/connections/[id]
 * Cancel·lar sol·licitud pendent o desconnectar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id: connectionId } = await params

    // Obtenir la connexió
    const connection = await prismaClient.userConnection.findUnique({
      where: { id: connectionId },
      include: {
        sender: {
          select: { firstName: true, name: true, nick: true }
        },
        receiver: {
          select: { firstName: true, name: true, nick: true }
        }
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connexió no trobada' }, { status: 404 })
    }

    // Verificar que l'usuari és part de la connexió
    if (connection.senderId !== session.user.id && connection.receiverId !== session.user.id) {
      return NextResponse.json({
        error: 'No tens permís per fer aquesta acció'
      }, { status: 403 })
    }

    // Determinar l'altre usuari
    const otherUser = connection.senderId === session.user.id
      ? connection.receiver
      : connection.sender
    const otherUserName = otherUser.firstName || otherUser.name || otherUser.nick

    // Determinar el tipus d'acció
    const wasPending = connection.status === 'PENDING'
    const wasSentByMe = connection.senderId === session.user.id

    // Eliminar la connexió
    await prismaClient.userConnection.delete({
      where: { id: connectionId }
    })

    let message: string
    if (wasPending && wasSentByMe) {
      message = `Sol·licitud a ${otherUserName} cancel·lada`
    } else if (wasPending && !wasSentByMe) {
      message = `Sol·licitud de ${otherUserName} eliminada`
    } else {
      message = `T'has desconnectat de ${otherUserName}`
    }

    // TODO: Enviar notificació si era connexió acceptada

    return NextResponse.json({
      success: true,
      message,
      wasConnected: connection.status === 'ACCEPTED'
    })
  } catch (error) {
    console.error('Error eliminant connexió:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * GET /api/connections/[id]
 * Obtenir detall d'una connexió específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id: connectionId } = await params

    const connection = await prismaClient.userConnection.findUnique({
      where: { id: connectionId },
      include: {
        sender: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            isOnline: true,
            profile: {
              select: { position: true, department: true, city: true, bio: true }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            isOnline: true,
            profile: {
              select: { position: true, department: true, city: true, bio: true }
            }
          }
        }
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connexió no trobada' }, { status: 404 })
    }

    // Verificar que l'usuari és part de la connexió
    if (connection.senderId !== session.user.id && connection.receiverId !== session.user.id) {
      return NextResponse.json({
        error: 'No tens accés a aquesta connexió'
      }, { status: 403 })
    }

    const isOutgoing = connection.senderId === session.user.id
    const otherUser = isOutgoing ? connection.receiver : connection.sender

    return NextResponse.json({
      id: connection.id,
      status: connection.status.toLowerCase(),
      isOutgoing,
      message: connection.message,
      expiresAt: connection.expiresAt,
      createdAt: connection.createdAt,
      acceptedAt: connection.acceptedAt,
      rejectedAt: connection.rejectedAt,
      otherUser: {
        id: otherUser.id,
        username: otherUser.nick,
        name: [otherUser.firstName, otherUser.lastName].filter(Boolean).join(' ') || otherUser.name,
        avatar: otherUser.image,
        isOnline: otherUser.isOnline,
        position: otherUser.profile?.position,
        department: otherUser.profile?.department,
        location: otherUser.profile?.city,
        bio: otherUser.profile?.bio
      }
    })
  } catch (error) {
    console.error('Error obtenint connexió:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
