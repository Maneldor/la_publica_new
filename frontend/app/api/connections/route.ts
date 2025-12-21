import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { notifyConnectionRequest } from '@/lib/notifications/notification-actions'

/**
 * POST /api/connections
 * Enviar sol·licitud de connexió
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, message } = body

    if (!receiverId) {
      return NextResponse.json({ error: 'Cal especificar el destinatari' }, { status: 400 })
    }

    // No es pot connectar amb un mateix
    if (receiverId === session.user.id) {
      return NextResponse.json({ error: 'No pots connectar amb tu mateix' }, { status: 400 })
    }

    // Verificar que l'usuari existeix
    const receiver = await prismaClient.user.findUnique({
      where: { id: receiverId },
      select: {
        id: true,
        nick: true,
        firstName: true,
        lastName: true,
        name: true
      }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Verificar si ja existeix una connexió (en qualsevol direcció)
    const existingConnection = await prismaClient.userConnection.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id }
        ]
      }
    })

    if (existingConnection) {
      if (existingConnection.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Ja esteu connectats' }, { status: 400 })
      }
      if (existingConnection.status === 'PENDING') {
        // Si la sol·licitud és cap a mi, suggerir acceptar
        if (existingConnection.receiverId === session.user.id) {
          return NextResponse.json({
            error: 'Aquest usuari ja t\'ha enviat una sol·licitud. Accepta-la!',
            existingConnectionId: existingConnection.id,
            isIncoming: true
          }, { status: 400 })
        }
        return NextResponse.json({ error: 'Ja hi ha una sol·licitud pendent' }, { status: 400 })
      }
      // Si està rebutjada o cancel·lada, permetre nova sol·licitud eliminant l'antiga
      if (existingConnection.status === 'REJECTED' || existingConnection.status === 'CANCELLED' || existingConnection.status === 'EXPIRED') {
        await prismaClient.userConnection.delete({
          where: { id: existingConnection.id }
        })
      }
    }

    // Calcular data d'expiració (15 dies)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 15)

    // Crear connexió
    const connection = await prismaClient.userConnection.create({
      data: {
        senderId: session.user.id,
        receiverId,
        message: message || null,
        expiresAt,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true
          }
        }
      }
    })

    const receiverName = receiver.firstName || receiver.name || receiver.nick || 'l\'usuari'

    // Obtenir nom de l'usuari actual per la notificació
    const currentUser = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, name: true, nick: true }
    })
    const senderName = currentUser?.firstName || currentUser?.name || currentUser?.nick || 'Un usuari'

    // Enviar notificació al receptor
    try {
      await notifyConnectionRequest(
        receiverId,
        session.user.id,
        senderName,
        connection.id,
        message
      )
      console.log(`🔔 Notificació enviada a ${receiverName}`)
    } catch (notifyError) {
      console.error('Error enviant notificació:', notifyError)
      // No fallam la petició si falla la notificació
    }

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
        expiresAt: connection.expiresAt,
        receiver: connection.receiver
      },
      message: `Sol·licitud enviada a ${receiverName}. Expira en 15 dies.`
    })
  } catch (error) {
    console.error('Error enviant sol·licitud:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * GET /api/connections
 * Obtenir les meves connexions/sol·licituds
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, pending, sent, accepted

    let where: any = {}

    switch (type) {
      case 'pending':
        // Sol·licituds pendents rebudes (per acceptar/rebutjar)
        where = {
          receiverId: session.user.id,
          status: 'PENDING'
        }
        break
      case 'sent':
        // Sol·licituds enviades pendents
        where = {
          senderId: session.user.id,
          status: 'PENDING'
        }
        break
      case 'accepted':
        // Connexions acceptades
        where = {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ],
          status: 'ACCEPTED'
        }
        break
      default:
        // Totes les connexions
        where = {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
        }
    }

    const connections = await prismaClient.userConnection.findMany({
      where,
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
              select: { position: true, department: true, city: true }
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
              select: { position: true, department: true, city: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Formatejar per facilitar l'ús al frontend
    const formattedConnections = connections.map(conn => {
      const isOutgoing = conn.senderId === session.user.id
      const otherUser = isOutgoing ? conn.receiver : conn.sender
      const fullName = [otherUser.firstName, otherUser.lastName].filter(Boolean).join(' ') || otherUser.name || otherUser.nick

      return {
        id: conn.id,
        status: conn.status.toLowerCase(),
        isOutgoing,
        message: conn.message,
        expiresAt: conn.expiresAt,
        createdAt: conn.createdAt,
        acceptedAt: conn.acceptedAt,
        otherUser: {
          id: otherUser.id,
          username: otherUser.nick,
          name: fullName,
          avatar: otherUser.image,
          isOnline: otherUser.isOnline,
          position: otherUser.profile?.position,
          department: otherUser.profile?.department,
          location: otherUser.profile?.city
        }
      }
    })

    return NextResponse.json({
      connections: formattedConnections,
      counts: {
        total: connections.length,
        pending: connections.filter(c => c.status === 'PENDING' && c.receiverId === session.user.id).length,
        sent: connections.filter(c => c.status === 'PENDING' && c.senderId === session.user.id).length,
        accepted: connections.filter(c => c.status === 'ACCEPTED').length
      }
    })
  } catch (error) {
    console.error('Error obtenint connexions:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
