import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { notifyNewMessage } from '@/lib/notifications/notification-actions'

/**
 * GET /api/conversations/[id]/messages
 * Obtenir missatges d'una conversa amb paginació
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

    const { id: conversationId } = await params
    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verificar que l'usuari és participant
    const isParticipant = await prismaClient.conversationParticipants.findFirst({
      where: {
        A: conversationId,
        B: userId
      }
    })

    if (!isParticipant) {
      return NextResponse.json({ error: 'No tens accés a aquesta conversa' }, { status: 403 })
    }

    // Obtenir missatges amb paginació
    const messages = await prismaClient.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            nick: true,
            image: true,
            firstName: true,
            lastName: true,
          }
        },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1
      })
    })

    const hasMore = messages.length > limit
    const data = hasMore ? messages.slice(0, -1) : messages

    // Formatejar missatges per al frontend
    const formattedMessages = data.reverse().map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      sender: msg.sender,
      content: msg.content,
      type: msg.attachments.length > 0 ? detectMessageType(msg.attachments[0]) : 'text',
      timestamp: msg.createdAt,
      status: msg.isRead ? 'read' : 'delivered',
      isRead: msg.isRead,
      attachments: msg.attachments.map(att => ({
        id: att.id,
        type: detectAttachmentType(att.mimeType),
        url: att.url,
        name: att.filename,
        size: att.size,
      })),
    }))

    return NextResponse.json({
      messages: formattedMessages,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1]?.id : null
    })
  } catch (error) {
    console.error('Error obtenint missatges:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Enviar nou missatge
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const userId = session.user.id

    // Verificar que l'usuari és participant
    const isParticipant = await prismaClient.conversationParticipants.findFirst({
      where: {
        A: conversationId,
        B: userId
      }
    })

    if (!isParticipant) {
      return NextResponse.json({ error: 'No tens accés a aquesta conversa' }, { status: 403 })
    }

    const body = await request.json()
    const { content, attachments } = body

    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'El missatge no pot estar buit' }, { status: 400 })
    }

    // Crear missatge
    const message = await prismaClient.message.create({
      data: {
        content: content?.trim() || '',
        conversationId,
        senderId: userId,
        ...(attachments && attachments.length > 0 && {
          attachments: {
            create: attachments.map((att: { filename: string; url: string; mimeType: string; size?: number }) => ({
              filename: att.filename,
              url: att.url,
              mimeType: att.mimeType,
              size: att.size || null,
            }))
          }
        })
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            nick: true,
            image: true,
            firstName: true,
            lastName: true,
          }
        },
        attachments: true,
      }
    })

    // Actualitzar updatedAt de la conversa
    await prismaClient.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    // Obtenir els altres participants per notificar-los
    try {
      const otherParticipants = await prismaClient.conversationParticipants.findMany({
        where: {
          A: conversationId,
          NOT: { B: userId }
        }
      })

      const senderName = message.sender.firstName || message.sender.name || message.sender.nick || 'Un usuari'
      const messagePreview = content?.trim() || 'Ha enviat un arxiu'

      // Notificar a cada participant (excepte l'emissor)
      for (const participant of otherParticipants) {
        await notifyNewMessage(
          participant.B,
          userId,
          senderName,
          conversationId,
          messagePreview
        )
      }

      if (otherParticipants.length > 0) {
        console.log(`🔔 Notificació de missatge enviada a ${otherParticipants.length} participant(s)`)
      }
    } catch (notifyError) {
      console.error('Error enviant notificacions de missatge:', notifyError)
      // No fallam la petició si falla la notificació
    }

    // Formatejar resposta
    const formattedMessage = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: message.sender,
      content: message.content,
      type: message.attachments.length > 0 ? detectMessageType(message.attachments[0]) : 'text',
      timestamp: message.createdAt,
      status: 'sent',
      isRead: false,
      attachments: message.attachments.map(att => ({
        id: att.id,
        type: detectAttachmentType(att.mimeType),
        url: att.url,
        name: att.filename,
        size: att.size,
      })),
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error('Error enviant missatge:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// Helper per detectar tipus de missatge segons attachment
function detectMessageType(attachment: { mimeType: string }): string {
  const mime = attachment.mimeType.toLowerCase()
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'document'
}

// Helper per detectar tipus d'attachment
function detectAttachmentType(mimeType: string): 'image' | 'document' | 'audio' | 'video' {
  const mime = mimeType.toLowerCase()
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'document'
}
