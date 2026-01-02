import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

// GET /api/empresa/messages - Obtenir converses i resum
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    // Si es demana una conversa específica, retornar missatges
    if (conversationId) {
      // Verificar que l'usuari participa en la conversa
      const participation = await prismaClient.conversationParticipants.findFirst({
        where: {
          A: conversationId,
          B: userId
        }
      });

      if (!participation) {
        return NextResponse.json({ error: 'No tens accés a aquesta conversa' }, { status: 403 });
      }

      const messages = await prismaClient.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 100
      });

      // Marcar com a llegits
      await prismaClient.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false
        },
        data: { isRead: true }
      });

      return NextResponse.json({
        success: true,
        messages: messages.map(m => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          senderName: m.sender.name,
          senderImage: m.sender.image,
          createdAt: m.createdAt,
          isOwn: m.senderId === userId
        }))
      });
    }

    // Obtenir totes les converses
    const conversations = await prismaClient.conversation.findMany({
      where: {
        ConversationParticipants: {
          some: { B: userId }
        }
      },
      include: {
        ConversationParticipants: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
                role: true,
                ownedCompany: { select: { id: true, name: true } },
                memberCompany: { select: { id: true, name: true } }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.ConversationParticipants
        .find(p => p.User.id !== userId)?.User;

      if (!otherParticipant) return null;

      const companyName = otherParticipant.ownedCompany?.name ||
                         otherParticipant.memberCompany?.name || null;

      return {
        id: conv.id,
        title: conv.title,
        participant: {
          id: otherParticipant.id,
          name: otherParticipant.name || otherParticipant.email || 'Usuari',
          image: otherParticipant.image,
          role: otherParticipant.role,
          companyName
        },
        lastMessage: conv.messages[0]?.content || null,
        lastMessageAt: conv.messages[0]?.createdAt || conv.updatedAt,
        unreadCount: conv._count.messages
      };
    }).filter(Boolean);

    const totalUnread = formattedConversations.reduce(
      (sum, c) => sum + (c?.unreadCount || 0), 0
    );

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
      totalUnread
    });

  } catch (error) {
    console.error('Error obtenint missatges:', error);
    return NextResponse.json({ error: 'Error al obtenir missatges' }, { status: 500 });
  }
}

// POST /api/empresa/messages - Enviar missatge
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: 'Falten dades' }, { status: 400 });
    }

    // Verificar participació
    const participation = await prismaClient.conversationParticipants.findFirst({
      where: {
        A: conversationId,
        B: session.user.id
      }
    });

    if (!participation) {
      return NextResponse.json({ error: 'No tens accés a aquesta conversa' }, { status: 403 });
    }

    // Crear missatge
    const message = await prismaClient.message.create({
      data: {
        content: content.trim(),
        conversationId,
        senderId: session.user.id,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Actualitzar conversa
    await prismaClient.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderImage: message.sender.image,
        createdAt: message.createdAt,
        isOwn: true
      }
    });

  } catch (error) {
    console.error('Error enviant missatge:', error);
    return NextResponse.json({ error: 'Error al enviar missatge' }, { status: 500 });
  }
}

// PATCH /api/empresa/messages - Marcar com a llegits
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'ID de conversa requerit' }, { status: 400 });
    }

    await prismaClient.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marcant missatges:', error);
    return NextResponse.json({ error: 'Error al marcar missatges' }, { status: 500 });
  }
}
