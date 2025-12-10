'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { notifyCompanyAssigned } from '@/lib/notifications/actions'

// ============================================
// TIPUS
// ============================================

export interface Message {
  id: string
  content: string
  conversationId: string
  senderId: string
  senderName: string | null
  senderRole: string
  isRead: boolean
  createdAt: Date
}

export interface Conversation {
  id: string
  title: string
  otherParticipantId: string
  otherParticipantName: string | null
  lastMessage: string | null
  lastMessageAt: Date | null
  unreadCount: number
  companyId?: string
  companyName?: string
}

// ============================================
// OBTENIR CONVERSES
// ============================================

export async function getConversations(): Promise<{
  success: boolean
  data?: Conversation[]
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  const userId = session.user.id
  const role = session.user.role as string

  try {
    // Obtenir converses on l'usuari participa
    const conversations = await prismaClient.conversation.findMany({
      where: {
        ConversationParticipants: {
          some: {
            B: userId
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
                email: true,
                role: true,
                ownedCompany: {
                  select: { id: true, name: true }
                },
                memberCompany: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
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
    })

    const formattedConversations: Conversation[] = conversations.map(conv => {
      // Trobar l'altre participant (que no sigui l'usuari actual)
      const otherParticipant = conv.ConversationParticipants
        .find(p => p.User.id !== userId)?.User

      if (!otherParticipant) {
        return null
      }

      // Determinar nom i empresa
      let displayName = otherParticipant.name || otherParticipant.email
      let companyInfo = null

      // Si l'altre participant és d'una empresa, mostrar empresa
      if (otherParticipant.ownedCompany) {
        companyInfo = otherParticipant.ownedCompany
        displayName = `${displayName} (${companyInfo.name})`
      } else if (otherParticipant.memberCompany) {
        companyInfo = otherParticipant.memberCompany
        displayName = `${displayName} (${companyInfo.name})`
      }

      return {
        id: conv.id,
        title: conv.title,
        otherParticipantId: otherParticipant.id,
        otherParticipantName: displayName,
        lastMessage: conv.messages[0]?.content || null,
        lastMessageAt: conv.messages[0]?.createdAt || conv.updatedAt,
        unreadCount: conv._count.messages,
        companyId: companyInfo?.id,
        companyName: companyInfo?.name
      }
    }).filter(Boolean) as Conversation[]

    return {
      success: true,
      data: formattedConversations
    }
  } catch (error) {
    console.error('Error obtenint converses:', error)
    return { success: false, error: 'Error obtenint converses' }
  }
}

// ============================================
// OBTENIR MISSATGES D'UNA CONVERSA
// ============================================

export async function getMessages(conversationId: string): Promise<{
  success: boolean
  data?: Message[]
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    // Verificar que l'usuari participa en aquesta conversa
    const participation = await prismaClient.conversationParticipants.findFirst({
      where: {
        A: conversationId,
        B: session.user.id
      }
    })

    if (!participation) {
      return { success: false, error: 'No tens accés a aquesta conversa' }
    }

    // Obtenir missatges
    const messages = await prismaClient.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Marcar com llegits els missatges dels altres
    await prismaClient.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false
      },
      data: { isRead: true }
    })

    return {
      success: true,
      data: messages.map(m => ({
        id: m.id,
        content: m.content,
        conversationId: m.conversationId,
        senderId: m.sender.id,
        senderName: m.sender.name,
        senderRole: m.sender.role,
        isRead: m.isRead,
        createdAt: m.createdAt
      }))
    }
  } catch (error) {
    console.error('Error obtenint missatges:', error)
    return { success: false, error: 'Error obtenint missatges' }
  }
}

// ============================================
// ENVIAR MISSATGE
// ============================================

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ success: boolean; message?: Message; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  if (!content.trim()) {
    return { success: false, error: 'El missatge no pot estar buit' }
  }

  try {
    // Verificar que l'usuari participa en aquesta conversa
    const participation = await prismaClient.conversationParticipants.findFirst({
      where: {
        A: conversationId,
        B: session.user.id
      }
    })

    if (!participation) {
      return { success: false, error: 'No tens accés a aquesta conversa' }
    }

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
            role: true
          }
        }
      }
    })

    // Actualitzar timestamp de la conversa
    await prismaClient.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    // TODO: Enviar notificació al destinatari
    // await notifyNewMessage(conversationId, session.user.id)

    revalidatePath('/gestio/missatgeria')
    revalidatePath('/empresa/missatgeria')

    return {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        conversationId: message.conversationId,
        senderId: message.sender.id,
        senderName: message.sender.name,
        senderRole: message.sender.role,
        isRead: message.isRead,
        createdAt: message.createdAt
      }
    }
  } catch (error) {
    console.error('Error enviant missatge:', error)
    return { success: false, error: 'Error enviant missatge' }
  }
}

// ============================================
// CREAR O OBTENIR CONVERSA
// ============================================

export async function getOrCreateConversation(
  otherUserId: string,
  companyId?: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  const currentUserId = session.user.id

  try {
    // Buscar conversa existent entre aquests dos usuaris
    const existingConversation = await prismaClient.conversation.findFirst({
      where: {
        ConversationParticipants: {
          every: {
            OR: [
              { B: currentUserId },
              { B: otherUserId }
            ]
          }
        }
      },
      include: {
        ConversationParticipants: {
          select: { B: true }
        }
      }
    })

    // Verificar que existeix una conversa amb exactament aquests dos usuaris
    let conversation = existingConversation
    if (existingConversation) {
      const participantIds = existingConversation.ConversationParticipants.map(p => p.B)
      if (participantIds.length === 2 &&
          participantIds.includes(currentUserId) &&
          participantIds.includes(otherUserId)) {
        conversation = existingConversation
      } else {
        conversation = null
      }
    }

    // Si no existeix, crear-la
    if (!conversation) {
      // Obtenir info dels usuaris per generar títol
      const users = await prismaClient.user.findMany({
        where: {
          id: { in: [currentUserId, otherUserId] }
        },
        select: {
          id: true,
          name: true,
          email: true,
          ownedCompany: { select: { name: true } },
          memberCompany: { select: { name: true } }
        }
      })

      const currentUser = users.find(u => u.id === currentUserId)
      const otherUser = users.find(u => u.id === otherUserId)

      // Generar títol descriptiu
      const currentUserName = currentUser?.name || currentUser?.email || 'Usuari'
      const otherUserName = otherUser?.name || otherUser?.email || 'Usuari'
      const title = `${currentUserName} ↔ ${otherUserName}`

      conversation = await prismaClient.conversation.create({
        data: {
          title,
          ConversationParticipants: {
            createMany: {
              data: [
                { B: currentUserId },
                { B: otherUserId }
              ]
            }
          }
        }
      })
    }

    return { success: true, conversationId: conversation.id }
  } catch (error) {
    console.error('Error creant conversa:', error)
    return { success: false, error: 'Error creant conversa' }
  }
}

// ============================================
// ENVIAR MISSATGE DE BENVINGUDA (GESTOR)
// ============================================

export async function enviarMissatgeBenvinguda(
  companyId: string,
  gestorName: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    // Obtenir l'usuari propietari de l'empresa
    const company = await prismaClient.company.findUnique({
      where: { id: companyId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!company) {
      return { success: false, error: 'Empresa no trobada' }
    }

    if (!company.owner) {
      return { success: false, error: 'L\'empresa no té propietari assignat' }
    }

    // Crear o obtenir conversa amb el propietari de l'empresa
    const convResult = await getOrCreateConversation(company.owner.id, companyId)
    if (!convResult.success || !convResult.conversationId) {
      return { success: false, error: convResult.error }
    }

    const contactName = company.owner.name || company.owner.email || 'equip'

    // Missatge de benvinguda personalitzat
    const welcomeMessage = `Hola ${contactName}!

Sóc ${gestorName}, el teu gestor comercial a La Pública.

T'escric per donar-te la benvinguda i oferir-te el meu suport per completar el perfil de ${company.name}.

Els passos per publicar el teu perfil són:
1. Afegir logo i imatge de portada
2. Escriure descripció i eslògan
3. Afegir dades de contacte públiques
4. Indicar serveis i sector
5. Afegir xarxes socials

Si necessites ajuda amb qualsevol pas o tens dubtes, escriu-me aquí i et respondré el més aviat possible.

Salutacions,
${gestorName}
Gestor Comercial - La Pública`

    // Enviar missatge
    const messageResult = await sendMessage(convResult.conversationId, welcomeMessage)
    if (!messageResult.success) {
      return { success: false, error: messageResult.error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error enviant missatge benvinguda:', error)
    return { success: false, error: 'Error enviant missatge de benvinguda' }
  }
}

// ============================================
// OBTENIR CONVERSA AMB USUARI ESPECÍFIC
// ============================================

export async function getConversationWith(otherUserId: string): Promise<{
  success: boolean
  conversationId?: string
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    // Buscar conversa existent
    const conversation = await prismaClient.conversation.findFirst({
      where: {
        ConversationParticipants: {
          every: {
            OR: [
              { B: session.user.id },
              { B: otherUserId }
            ]
          }
        }
      },
      include: {
        ConversationParticipants: {
          select: { B: true }
        }
      }
    })

    if (conversation) {
      const participantIds = conversation.ConversationParticipants.map(p => p.B)
      if (participantIds.length === 2 &&
          participantIds.includes(session.user.id) &&
          participantIds.includes(otherUserId)) {
        return { success: true, conversationId: conversation.id }
      }
    }

    return { success: true, conversationId: undefined }
  } catch (error) {
    console.error('Error buscant conversa:', error)
    return { success: false, error: 'Error buscant conversa' }
  }
}