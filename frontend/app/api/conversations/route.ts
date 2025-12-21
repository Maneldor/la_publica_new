import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/conversations
 * Llistar converses de l'usuari actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const userId = session.user.id

    // Obtenir converses on l'usuari és participant
    const conversations = await prismaClient.conversation.findMany({
      where: {
        ConversationParticipants: {
          some: {
            B: userId // B = userId en el model ConversationParticipants
          }
        }
      },
      include: {
        ConversationParticipants: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                nick: true,
                image: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                nick: true,
              }
            }
          }
        },
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Comptar missatges no llegits per cada conversa
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prismaClient.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false
          }
        })

        // Obtenir participants (excloent l'usuari actual per a xats individuals)
        const participants = conv.ConversationParticipants
          .map(p => p.User)
          .filter(u => u.id !== userId)

        // Determinar el nom de la conversa
        let conversationName = conv.title
        let conversationAvatar = null
        const isGroup = conv.ConversationParticipants.length > 2

        if (!conversationName && !isGroup && participants.length === 1) {
          // Xat individual: usar nom de l'altre participant
          const otherUser = participants[0]
          conversationName = otherUser.firstName && otherUser.lastName
            ? `${otherUser.firstName} ${otherUser.lastName}`
            : otherUser.name || otherUser.nick || 'Usuari'
          conversationAvatar = otherUser.image
        } else if (!conversationName && isGroup) {
          // Grup sense nom: llistar participants
          conversationName = participants
            .slice(0, 3)
            .map(p => p.firstName || p.name || p.nick)
            .join(', ')
          if (participants.length > 3) {
            conversationName += ` +${participants.length - 3}`
          }
        }

        return {
          id: conv.id,
          title: conversationName || 'Conversa',
          avatar: conversationAvatar,
          type: isGroup ? 'group' : 'individual',
          participants: participants,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt,
          isPinned: false, // TODO: afegir camp a la BD
          isMuted: false,  // TODO: afegir camp a la BD
          isArchived: false, // TODO: afegir camp a la BD
        }
      })
    )

    return NextResponse.json(conversationsWithUnread)
  } catch (error) {
    console.error('Error obtenint converses:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/conversations
 * Crear nova conversa
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { participantIds, title, initialMessage } = body

    // Verificar que hi ha participants
    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json({ error: 'Cal seleccionar participants' }, { status: 400 })
    }

    // Afegir l'usuari actual als participants
    const allParticipantIds: string[] = [...new Set([userId, ...participantIds])]

    // Per a xats 1:1, verificar si ja existeix una conversa
    if (allParticipantIds.length === 2) {
      const existingConversations = await prismaClient.conversation.findMany({
        where: {
          AND: [
            {
              ConversationParticipants: {
                some: { B: allParticipantIds[0] }
              }
            },
            {
              ConversationParticipants: {
                some: { B: allParticipantIds[1] }
              }
            }
          ]
        },
        include: {
          ConversationParticipants: true,
        }
      })

      // Trobar conversa amb exactament 2 participants
      const existingConversation = existingConversations.find(
        conv => conv.ConversationParticipants.length === 2
      )

      if (existingConversation) {
        return NextResponse.json({
          conversation: { id: existingConversation.id },
          existing: true
        })
      }
    }

    // Crear nova conversa
    const conversation = await prismaClient.conversation.create({
      data: {
        title: title || '',
        ConversationParticipants: {
          create: allParticipantIds.map(participantId => ({
            B: participantId
          }))
        },
      },
      include: {
        ConversationParticipants: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                nick: true,
                image: true,
              }
            }
          }
        }
      }
    })

    // Crear missatge inicial si s'ha proporcionat
    if (initialMessage?.trim()) {
      await prismaClient.message.create({
        data: {
          content: initialMessage.trim(),
          conversationId: conversation.id,
          senderId: userId,
        }
      })
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        participants: conversation.ConversationParticipants.map(p => p.User),
      },
      existing: false
    })
  } catch (error) {
    console.error('Error creant conversa:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
