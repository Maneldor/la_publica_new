import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/announcements/[id]/contact
 * Contactar al vendedor de un anuncio
 * - Crea o recupera una conversación existente
 * - Envía el mensaje inicial
 * - Notifica al vendedor
 * - Incrementa el contador de contactos del anuncio
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { message } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      )
    }

    // Obtener usuario actual
    const currentUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, name: true, nick: true, firstName: true, lastName: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Buscar el anuncio por ID o slug
    const anuncio = await prismaClient.anuncio.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ],
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nick: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    if (!anuncio) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      )
    }

    // No permitir contactarse a uno mismo
    if (anuncio.authorId === currentUser.id) {
      return NextResponse.json(
        { error: 'No puedes contactar tu propio anuncio' },
        { status: 400 }
      )
    }

    // Buscar si ya existe una conversación entre estos usuarios para este anuncio
    const existingConversation = await prismaClient.conversation.findFirst({
      where: {
        anuncioId: anuncio.id,
        AND: [
          {
            ConversationParticipants: {
              some: { B: currentUser.id }
            }
          },
          {
            ConversationParticipants: {
              some: { B: anuncio.authorId }
            }
          }
        ]
      },
      include: {
        ConversationParticipants: true
      }
    })

    let conversationId: string

    if (existingConversation && existingConversation.ConversationParticipants.length === 2) {
      // Usar conversación existente
      conversationId = existingConversation.id
    } else {
      // Crear nueva conversación
      const newConversation = await prismaClient.conversation.create({
        data: {
          title: `Re: ${anuncio.title}`,
          anuncioId: anuncio.id,
          ConversationParticipants: {
            create: [
              { B: currentUser.id },
              { B: anuncio.authorId }
            ]
          }
        }
      })
      conversationId = newConversation.id

      // Incrementar contador de contactos solo en primera vez
      await prismaClient.anuncio.update({
        where: { id: anuncio.id },
        data: { contactsCount: { increment: 1 } }
      })
    }

    // Crear el mensaje
    await prismaClient.message.create({
      data: {
        content: message.trim(),
        conversationId,
        senderId: currentUser.id,
      }
    })

    // Actualizar timestamp de la conversación
    await prismaClient.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    // Crear notificación para el vendedor
    const senderName = currentUser.firstName && currentUser.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser.name || currentUser.nick || 'Un usuario'

    const messagePreview = message.length > 50
      ? message.substring(0, 50) + '...'
      : message

    await prismaClient.notification.create({
      data: {
        userId: anuncio.authorId,
        type: 'NEW_MESSAGE',
        title: `Interés en tu anuncio: ${anuncio.title}`,
        message: `${senderName} te ha contactado: "${messagePreview}"`,
        actionUrl: `/dashboard/missatges?conversation=${conversationId}`,
        isRead: false,
        metadata: {
          senderId: currentUser.id,
          senderName,
          anuncioId: anuncio.id,
          anuncioTitle: anuncio.title,
          conversationId
        }
      }
    })

    console.log(`📧 Contacto enviado para anuncio "${anuncio.title}" por ${senderName}`)

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        isNewConversation: !existingConversation
      },
      message: 'Mensaje enviado correctamente'
    })

  } catch (error) {
    console.error('Error al contactar vendedor:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
