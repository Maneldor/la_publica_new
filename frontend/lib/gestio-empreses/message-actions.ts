// lib/gestio-empreses/message-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Types per al sistema avançat
export interface Recipient {
  id: string
  name: string
  email: string
  type: 'admin' | 'manager' | 'lead' | 'company'
  avatar?: string
  position?: string
  companyName?: string
}

export interface MessageTemplate {
  id: string
  name: string
  category: string
  subject: string
  content: string
  variables: string[]
}

// Función para obtener plantillas predefinidas
function getTemplatesData(): MessageTemplate[] {
  return [
    // Seguiment de Leads
    {
      id: 'welcome-lead',
      name: 'Benvinguda Lead',
      category: 'Seguiment',
      subject: 'Benvingut/da a {{companyName}}',
      content: 'Hola {{firstName}},\n\nGràcies pel vostre interès en els nostres serveis. Estem emocionats de començar aquesta col·laboració.\n\nEns posarem en contacte aviat per programar una primera reunió.\n\nCordials salutacions,\n{{senderName}}',
      variables: ['firstName', 'companyName', 'senderName']
    },
    {
      id: 'follow-up-lead',
      name: 'Seguiment Lead',
      category: 'Seguiment',
      subject: 'Seguiment de la nostra conversa',
      content: 'Hola {{firstName}},\n\nEsperem que estiguis bé. Volem fer un seguiment de la conversa que vam tenir sobre {{topic}}.\n\n¿Tens algun dubte o necessites més informació?\n\nQuedo a la teva disposició.\n\nSalutacions,\n{{senderName}}',
      variables: ['firstName', 'topic', 'senderName']
    },
    {
      id: 'proposal-lead',
      name: 'Enviament Proposta',
      category: 'Seguiment',
      subject: 'Proposta per a {{companyName}}',
      content: 'Hola {{firstName}},\n\nAdjuntem la proposta personalitzada per als vostres requeriments.\n\nLa proposta inclou:\n- {{service1}}\n- {{service2}}\n- {{service3}}\n\n¿Podem programar una reunió per revisar-la junts?\n\nGràcies,\n{{senderName}}',
      variables: ['firstName', 'companyName', 'service1', 'service2', 'service3', 'senderName']
    },
    // Comunicació Empreses
    {
      id: 'project-update',
      name: 'Actualització Projecte',
      category: 'Projectes',
      subject: 'Actualització del projecte {{projectName}}',
      content: 'Hola {{firstName}},\n\nVolem informar-vos sobre l\'estat actual del projecte {{projectName}}:\n\n✅ Completat: {{completedTasks}}\n🔄 En procés: {{inProgressTasks}}\n📅 Pròxims passos: {{nextSteps}}\n\nSi teniu preguntes, no dubteu en contactar-nos.\n\nSalutacions,\n{{senderName}}',
      variables: ['firstName', 'projectName', 'completedTasks', 'inProgressTasks', 'nextSteps', 'senderName']
    },
    {
      id: 'meeting-request',
      name: 'Sol·licitud Reunió',
      category: 'Reunions',
      subject: 'Reunió per {{purpose}}',
      content: 'Hola {{firstName}},\n\nEns agradaria programar una reunió per tractar {{purpose}}.\n\nProposem les següents dates:\n- {{option1}}\n- {{option2}}\n- {{option3}}\n\nLa durada estimada és de {{duration}}.\n\nConfirma\'ns quina opció t\'és més convenient.\n\nGràcies,\n{{senderName}}',
      variables: ['firstName', 'purpose', 'option1', 'option2', 'option3', 'duration', 'senderName']
    },
    {
      id: 'invoice-notification',
      name: 'Notificació Facturació',
      category: 'Facturació',
      subject: 'Nova factura disponible - {{invoiceNumber}}',
      content: 'Hola {{firstName}},\n\nTeniu una nova factura disponible:\n\nNúmero: {{invoiceNumber}}\nImport: {{amount}}€\nVenciment: {{dueDate}}\n\nPodeu consultar-la al vostre portal de client o sol·licitar una còpia.\n\nGràcies per la vostra confiança.\n\nSalutacions,\n{{senderName}}',
      variables: ['firstName', 'invoiceNumber', 'amount', 'dueDate', 'senderName']
    },
    // Comunicació Interna
    {
      id: 'team-update',
      name: 'Actualització Equip',
      category: 'Intern',
      subject: 'Actualització setmanal de l\'equip',
      content: 'Hola equip,\n\nActualització d\'aquesta setmana:\n\n🎯 Objectius assolits:\n{{achievements}}\n\n📊 Mètriques clau:\n{{metrics}}\n\n🚀 Pròximes prioritats:\n{{priorities}}\n\nGràcies per la vostra dedicació!\n\n{{senderName}}',
      variables: ['achievements', 'metrics', 'priorities', 'senderName']
    },
    {
      id: 'task-assignment',
      name: 'Assignació Tasca',
      category: 'Intern',
      subject: 'Nova tasca assignada: {{taskTitle}}',
      content: 'Hola {{firstName}},\n\nT\'hem assignat una nova tasca:\n\nTítol: {{taskTitle}}\nDescripció: {{taskDescription}}\nPrioritat: {{priority}}\nVenciment: {{dueDate}}\n\nPots consultar tots els detalls al sistema de gestió.\n\nGràcies,\n{{senderName}}',
      variables: ['firstName', 'taskTitle', 'taskDescription', 'priority', 'dueDate', 'senderName']
    }
  ]
}

/**
 * Obtenir converses de l'usuari autenticat
 */
export async function getUserConversations() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const conversations = await prismaClient.conversation.findMany({
    where: {
      participants: {
        some: {
          id: session.user.id,
        },
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              senderId: { not: session.user.id },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    participants: conversation.participants.filter(p => p.id !== session.user.id),
    lastMessage: conversation.messages[0] || null,
    unreadCount: conversation._count.messages,
    updatedAt: conversation.updatedAt,
  }))
}

/**
 * Obtenir missatges d'una conversa específica
 */
export async function getConversationMessages(conversationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Verificar que l'usuari és participant de la conversa
  const conversation = await prismaClient.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          id: session.user.id,
        },
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!conversation) {
    throw new Error('Conversa no trobada o accés denegat')
  }

  const messages = await prismaClient.message.findMany({
    where: {
      conversationId: conversationId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attachments: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return {
    conversation,
    messages,
  }
}

/**
 * Crear nova conversa
 */
export async function createConversation(
  title: string,
  participantIds: string[],
  initialMessage?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Afegir l'usuari actual als participants si no hi és
  const allParticipantIds = participantIds.includes(session.user.id)
    ? participantIds
    : [...participantIds, session.user.id]

  const conversation = await prismaClient.conversation.create({
    data: {
      title,
      participants: {
        connect: allParticipantIds.map(id => ({ id })),
      },
      messages: initialMessage
        ? {
            create: {
              content: initialMessage,
              senderId: session.user.id,
              isRead: false,
            },
          }
        : undefined,
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  revalidatePath('/gestio/missatges')
  return conversation
}

/**
 * Enviar missatge a una conversa
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  attachmentIds?: string[]
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Verificar que l'usuari és participant de la conversa
  const conversation = await prismaClient.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          id: session.user.id,
        },
      },
    },
  })

  if (!conversation) {
    throw new Error('Conversa no trobada o accés denegat')
  }

  const message = await prismaClient.message.create({
    data: {
      content,
      conversationId,
      senderId: session.user.id,
      isRead: false,
      attachments: attachmentIds
        ? {
            connect: attachmentIds.map(id => ({ id })),
          }
        : undefined,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attachments: true,
    },
  })

  // Actualitzar timestamp de la conversa
  await prismaClient.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  revalidatePath(`/gestio/missatges/${conversationId}`)
  revalidatePath('/gestio/missatges')

  return message
}

/**
 * Marcar missatges com a llegits
 */
export async function markMessagesAsRead(conversationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  await prismaClient.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  })

  revalidatePath(`/gestio/missatges/${conversationId}`)
  revalidatePath('/gestio/missatges')
}

/**
 * Obtenir usuaris disponibles per crear converses
 */
export async function getAvailableUsers() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const users = await prismaClient.user.findMany({
    where: {
      id: { not: session.user.id },
      isActive: true,
      role: {
        in: [
          // Admins
          'ADMIN',
          'SUPER_ADMIN',
          // Gestors
          'EMPLOYEE',
          'ACCOUNT_MANAGER',
          // Empreses
          'COMPANY',
          'COMPANY_MANAGER',
        ]
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
    orderBy: [
      { role: 'asc' },
      { name: 'asc' },
    ],
  })

  return users
}

/**
 * Buscar converses per títol o participants
 */
export async function searchConversations(query: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const conversations = await prismaClient.conversation.findMany({
    where: {
      participants: {
        some: {
          id: session.user.id,
        },
      },
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          participants: {
            some: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return conversations
}

/**
 * Obtenir estadístiques de missatges per l'usuari
 */
export async function getMessageStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const [totalConversations, unreadMessages, sentMessages] = await Promise.all([
    // Total converses de l'usuari
    prismaClient.conversation.count({
      where: {
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
    }),
    // Missatges per llegir
    prismaClient.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              id: session.user.id,
            },
          },
        },
        senderId: { not: session.user.id },
        isRead: false,
      },
    }),
    // Missatges enviats aquest mes
    prismaClient.message.count({
      where: {
        senderId: session.user.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ])

  return {
    totalConversations,
    unreadMessages,
    sentMessages,
  }
}

/**
 * Obtener destinatarios según tipo (Admin, Gestores, Leads, Empresas)
 */
export async function getRecipientsByType(
  type: 'all' | 'admin' | 'manager' | 'lead' | 'company',
  userId: string
): Promise<Recipient[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autorizado')
  }

  try {
    const recipients: Recipient[] = []

    // TEMPORAL: Añadir usuarios ficticios hasta resolver problemas con base de datos
    if (type === 'admin' || type === 'all') {
      recipients.push(
        {
          id: 'admin-1',
          name: 'Admin Principal',
          email: 'admin@lapublica.cat',
          type: 'admin',
          avatar: undefined
        },
        {
          id: 'admin-2',
          name: 'Super Administrador',
          email: 'superadmin@lapublica.cat',
          type: 'admin',
          avatar: undefined
        }
      )
    }

    if (type === 'manager' || type === 'all') {
      recipients.push(
        {
          id: 'manager-1',
          name: 'Gestor Comercial',
          email: 'comercial@lapublica.cat',
          type: 'manager',
          avatar: undefined
        },
        {
          id: 'manager-2',
          name: 'Gestor CRM',
          email: 'crm@lapublica.cat',
          type: 'manager',
          avatar: undefined
        }
      )
    }

    // CÓDIGO ORIGINAL PARA BASE DE DATOS (comentado temporalmente)
    /*
    // Administradores y gestores
    if (type === 'all' || type === 'admin' || type === 'manager') {
      const users = await prismaClient.user.findMany({
        where: {
          id: { not: session.user.id },
          isActive: true,
          role: type === 'admin'
            ? { in: ['ADMIN', 'SUPER_ADMIN'] }
            : type === 'manager'
            ? { in: ['MODERATOR', 'COMMUNITY_MANAGER'] }
            : { in: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'COMMUNITY_MANAGER'] }
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true
        }
      })

      recipients.push(...users.map(user => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        type: ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? 'admin' as const : 'manager' as const,
        avatar: user.image || undefined
      })))
    }

    // Leads
    if (type === 'all' || type === 'lead') {
      const leads = await prismaClient.lead.findMany({
        where: { userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          company: true
        }
      })

      recipients.push(...leads.map(lead => ({
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`.trim(),
        email: lead.email,
        type: 'lead' as const,
        position: lead.position || undefined,
        companyName: lead.company || undefined
      })))
    }

    // Empresas
    if (type === 'all' || type === 'company') {
      const companies = await prismaClient.company.findMany({
        where: { userId },
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1
          }
        }
      })

      recipients.push(...companies.map(company => ({
        id: company.id,
        name: company.name,
        email: company.contacts[0]?.email || company.email || '',
        type: 'company' as const,
        companyName: company.name
      })))
    }
    */

    return recipients.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error obteniendo destinatarios:', error)
    return []
  }
}

/**
 * Buscar destinatarios por nombre/email
 */
export async function searchRecipients(
  query: string,
  type: 'all' | 'admin' | 'manager' | 'lead' | 'company',
  userId: string
): Promise<Recipient[]> {
  if (!query.trim()) {
    return getRecipientsByType(type, userId)
  }

  const recipients = await getRecipientsByType(type, userId)

  return recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(query.toLowerCase()) ||
    recipient.email.toLowerCase().includes(query.toLowerCase()) ||
    (recipient.companyName && recipient.companyName.toLowerCase().includes(query.toLowerCase()))
  )
}

/**
 * Obtener plantillas de mensajes
 */
export async function getMessageTemplates(category?: string): Promise<MessageTemplate[]> {
  const templates = getTemplatesData()
  if (category) {
    return templates.filter(template => template.category === category)
  }
  return templates
}

/**
 * Aplicar plantilla con variables
 */
export async function applyTemplate(
  template: MessageTemplate,
  variables: Record<string, string>
): Promise<{ subject: string; content: string }> {
  let subject = template.subject
  let content = template.content

  // Reemplazar variables en subject y content
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    subject = subject.replace(new RegExp(placeholder, 'g'), value)
    content = content.replace(new RegExp(placeholder, 'g'), value)
  })

  return { subject, content }
}

/**
 * Crear conversación con destinatario específico
 */
export async function createConversationWithRecipient(
  recipientId: string,
  recipientType: 'admin' | 'manager' | 'lead' | 'company',
  initialMessage: string,
  template?: string
): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autorizado')
  }

  try {
    // Determinar título de la conversación según el tipo de destinatario
    let conversationTitle = 'Conversación'

    if (recipientType === 'lead') {
      const lead = await prismaClient.lead.findUnique({
        where: { id: recipientId },
        select: { firstName: true, lastName: true }
      })
      if (lead) {
        conversationTitle = `Conversación con ${lead.firstName} ${lead.lastName}`
      }
    } else if (recipientType === 'company') {
      const company = await prismaClient.company.findUnique({
        where: { id: recipientId },
        select: { name: true }
      })
      if (company) {
        conversationTitle = `Conversación con ${company.name}`
      }
    } else {
      const user = await prismaClient.user.findUnique({
        where: { id: recipientId },
        select: { name: true, email: true }
      })
      if (user) {
        conversationTitle = `Conversación con ${user.name || user.email}`
      }
    }

    // Crear la conversación
    const conversation = await prismaClient.conversation.create({
      data: {
        title: conversationTitle,
        participants: {
          connect: [
            { id: session.user.id },
            { id: recipientId }
          ]
        },
        messages: {
          create: {
            content: initialMessage,
            senderId: session.user.id,
            isRead: false,
            template
          }
        }
      }
    })

    revalidatePath('/gestio/missatgeria')
    return conversation.id
  } catch (error) {
    console.error('Error creando conversación:', error)
    throw new Error('Error creando la conversación')
  }
}