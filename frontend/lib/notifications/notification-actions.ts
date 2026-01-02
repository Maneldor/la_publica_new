'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Tipus de notificacions del flux de leads i connexions
export type NotificationType =
  // Leads
  | 'LEAD_ASSIGNED'           // Lead assignat a Gestor
  | 'LEAD_TO_VERIFY'          // Gestor envia lead a verificar
  | 'LEAD_VERIFIED'           // CRM ha verificat el lead
  | 'LEAD_TO_ADMIN'           // Lead enviat a Admin per contractar
  | 'LEAD_CONVERTED'          // Lead convertit en empresa
  | 'LEAD_INACTIVE_REMINDER'  // Recordatori lead inactiu (7 dies)
  | 'LEAD_EXPIRING'           // Lead a punt d'expirar (30 dies)
  | 'COMPANY_REGISTERED'      // Admin ha registrat l'empresa
  | 'COMPANY_ASSIGNED'        // CRM ha assignat empresa a Gestor
  | 'COMPANY_PROFILE_COMPLETED' // Empresa ha completat el perfil
  | 'COMPANY_PUBLISHED'       // Empresa publicada (visible al directori)
  // Connexions entre usuaris
  | 'CONNECTION_REQUEST'      // Sol·licitud de connexió rebuda
  | 'CONNECTION_ACCEPTED'     // Sol·licitud acceptada
  | 'CONNECTION_REJECTED'     // Sol·licitud rebutjada
  | 'CONNECTION_EXPIRED'      // Sol·licitud expirada
  // Missatgeria
  | 'NEW_MESSAGE'             // Nou missatge
  | 'TASK_ASSIGNED'           // Nova tasca assignada
  | 'GENERAL'                 // Notificació general

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
  leadId?: string
  companyId?: string
}

// Mapear els nostres tipus a els tipus del enum de Prisma
function mapNotificationTypeToPrisma(type: NotificationType): string {
  const typeMap: Record<NotificationType, string> = {
    'LEAD_ASSIGNED': 'COMPANY_ASSIGNED',
    'LEAD_TO_VERIFY': 'COMPANY_PENDING',
    'LEAD_VERIFIED': 'COMPANY_APPROVED',
    'LEAD_TO_ADMIN': 'COMPANY_PENDING',
    'LEAD_CONVERTED': 'COMPANY_COMPLETED',
    'LEAD_INACTIVE_REMINDER': 'GENERAL',
    'LEAD_EXPIRING': 'GENERAL',
    'COMPANY_REGISTERED': 'COMPANY_APPROVED',
    'COMPANY_ASSIGNED': 'COMPANY_ASSIGNED',
    'COMPANY_PROFILE_COMPLETED': 'COMPANY_COMPLETED',
    'COMPANY_PUBLISHED': 'COMPANY_PUBLISHED',
    // Connexions
    'CONNECTION_REQUEST': 'CONNECTION_REQUEST',
    'CONNECTION_ACCEPTED': 'CONNECTION_ACCEPTED',
    'CONNECTION_REJECTED': 'CONNECTION_REJECTED',
    'CONNECTION_EXPIRED': 'CONNECTION_EXPIRED',
    // Missatgeria
    'NEW_MESSAGE': 'NEW_MESSAGE',
    'TASK_ASSIGNED': 'GENERAL',
    'GENERAL': 'GENERAL'
  }

  return typeMap[type] || 'GENERAL'
}

/**
 * Crear una nova notificació
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    console.log('🔔 Creant notificació:', params.type, 'per usuari:', params.userId)

    const notification = await prismaClient.notification.create({
      data: {
        userId: params.userId,
        type: mapNotificationTypeToPrisma(params.type),
        title: params.title,
        message: params.message,
        actionUrl: params.link || null,
        metadata: params.metadata || null,
        leadId: params.leadId || null,
        companyId: params.companyId || null,
      }
    })

    console.log('✅ Notificació creada:', notification.id)
    return { success: true, notification }
  } catch (error) {
    console.error('❌ Error creant notificació:', error)
    return { success: false, error: 'Error creant notificació' }
  }
}

/**
 * Obtenir notificacions d'un usuari
 */
export async function getUserNotifications(userId: string, limit: number = 20) {
  try {
    const notifications = await prismaClient.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return { success: true, notifications }
  } catch (error) {
    console.error('Error obtenint notificacions:', error)
    return { success: false, notifications: [] }
  }
}

/**
 * Obtenir comptador de notificacions no llegides
 */
export async function getUnreadCount(userId: string) {
  try {
    const count = await prismaClient.notification.count({
      where: {
        userId,
        isRead: false
      }
    })

    return { success: true, count }
  } catch (error) {
    console.error('Error comptant notificacions:', error)
    return { success: false, count: 0 }
  }
}

/**
 * Marcar notificació com a llegida
 */
export async function markAsRead(notificationId: string) {
  try {
    await prismaClient.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error marcant notificació:', error)
    return { success: false }
  }
}

/**
 * Marcar totes les notificacions com a llegides
 */
export async function markAllAsRead(userId: string) {
  try {
    await prismaClient.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    revalidatePath('/gestio')
    return { success: true }
  } catch (error) {
    console.error('Error marcant notificacions:', error)
    return { success: false }
  }
}

/**
 * Eliminar notificacions antigues (més de 30 dies)
 */
export async function cleanOldNotifications() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await prismaClient.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        isRead: true
      }
    })

    console.log(`🧹 Eliminades ${result.count} notificacions antigues`)
    return { success: true, deleted: result.count }
  } catch (error) {
    console.error('Error eliminant notificacions:', error)
    return { success: false }
  }
}

// ============================================
// FUNCIONS ESPECÍFIQUES DEL FLUX DE LEADS
// ============================================

/**
 * Notificar Gestor: Lead assignat
 */
export async function notifyLeadAssigned(
  gestorId: string,
  leadId: string,
  leadName: string,
  assignedBy: string
) {
  return createNotification({
    userId: gestorId,
    type: 'LEAD_ASSIGNED',
    title: 'Nou lead assignat',
    message: `T'han assignat el lead "${leadName}" per gestionar.`,
    link: `/gestio/pipeline?highlight=${leadId}`,
    leadId,
    metadata: { leadId, leadName, assignedBy }
  })
}

/**
 * Notificar CRM: Lead enviat a verificar
 */
export async function notifyLeadToVerify(
  crmUserIds: string[],
  leadId: string,
  leadName: string,
  gestorName: string
) {
  const results = []

  for (const crmId of crmUserIds) {
    const result = await createNotification({
      userId: crmId,
      type: 'LEAD_TO_VERIFY',
      title: 'Lead pendent de verificació',
      message: `El gestor ${gestorName} ha enviat el lead "${leadName}" per verificar.`,
      link: `/gestio/pipeline?highlight=${leadId}&status=PENDING_CRM`,
      leadId,
      metadata: { leadId, leadName, gestorName }
    })
    results.push(result)
  }

  return results
}

/**
 * Notificar Admin: Lead verificat, pendent de contractar
 */
export async function notifyLeadVerifiedForAdmin(
  adminUserIds: string[],
  leadId: string,
  leadName: string,
  verifiedBy: string
) {
  const results = []

  for (const adminId of adminUserIds) {
    const result = await createNotification({
      userId: adminId,
      type: 'LEAD_TO_ADMIN',
      title: 'Lead verificat - Pendent de contractar',
      message: `El lead "${leadName}" ha estat verificat i està pendent de contractació.`,
      link: `/gestio/pipeline?highlight=${leadId}&status=PENDING_ADMIN`,
      leadId,
      metadata: { leadId, leadName, verifiedBy }
    })
    results.push(result)
  }

  return results
}

/**
 * Notificar CRM: Empresa registrada per Admin
 */
export async function notifyCompanyRegistered(
  crmUserIds: string[],
  companyId: string,
  companyName: string,
  registeredBy: string
) {
  const results = []

  for (const crmId of crmUserIds) {
    const result = await createNotification({
      userId: crmId,
      type: 'COMPANY_REGISTERED',
      title: 'Nova empresa registrada',
      message: `L'empresa "${companyName}" ha estat registrada i està pendent d'assignació.`,
      link: `/gestio/empreses?highlight=${companyId}`,
      companyId,
      metadata: { companyId, companyName, registeredBy }
    })
    results.push(result)
  }

  return results
}

/**
 * Notificar Gestor: Empresa assignada
 */
export async function notifyCompanyAssigned(
  gestorId: string,
  companyId: string,
  companyName: string,
  assignedBy: string
) {
  return createNotification({
    userId: gestorId,
    type: 'COMPANY_ASSIGNED',
    title: 'Nova empresa assignada',
    message: `T'han assignat l'empresa "${companyName}" per gestionar el seu perfil.`,
    link: `/gestio/empreses/${companyId}`,
    companyId,
    metadata: { companyId, companyName, assignedBy }
  })
}

// ============================================
// HELPERS PER OBTENIR USUARIS PER ROL
// ============================================

/**
 * Obtenir IDs d'usuaris amb rol CRM
 */
export async function getCRMUserIds(): Promise<string[]> {
  try {
    const users = await prismaClient.user.findMany({
      where: {
        role: { in: ['CRM_COMERCIAL', 'CRM_CONTINGUT'] },
        isActive: true
      },
      select: { id: true }
    })
    return users.map(u => u.id)
  } catch (error) {
    console.error('Error obtenint usuaris CRM:', error)
    return []
  }
}

/**
 * Obtenir IDs d'usuaris Admin
 */
export async function getAdminUserIds(): Promise<string[]> {
  try {
    const users = await prismaClient.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO'] },
        isActive: true
      },
      select: { id: true }
    })
    return users.map(u => u.id)
  } catch (error) {
    console.error('Error obtenint usuaris Admin:', error)
    return []
  }
}

/**
 * Obtenir informació d'un usuari per ID
 */
export async function getUserById(userId: string) {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return user
  } catch (error) {
    console.error('Error obtenint usuari:', error)
    return null
  }
}

// ============================================
// FUNCIONS ESPECÍFIQUES DE CONNEXIONS
// ============================================

/**
 * Notificar usuari: Sol·licitud de connexió rebuda
 */
export async function notifyConnectionRequest(
  receiverId: string,
  senderId: string,
  senderName: string,
  connectionId: string,
  message?: string
) {
  return createNotification({
    userId: receiverId,
    type: 'CONNECTION_REQUEST',
    title: 'Nova sol·licitud de connexió',
    message: message
      ? `${senderName} vol connectar amb tu: "${message}"`
      : `${senderName} vol connectar amb tu.`,
    link: `/dashboard/missatges?tab=sol·licituds`,
    metadata: { senderId, senderName, connectionId }
  })
}

/**
 * Notificar usuari: Sol·licitud acceptada
 */
export async function notifyConnectionAccepted(
  senderId: string,
  receiverId: string,
  receiverName: string,
  connectionId: string
) {
  return createNotification({
    userId: senderId,
    type: 'CONNECTION_ACCEPTED',
    title: 'Sol·licitud acceptada!',
    message: `${receiverName} ha acceptat la teva sol·licitud de connexió.`,
    link: `/dashboard/missatges`,
    metadata: { receiverId, receiverName, connectionId }
  })
}

/**
 * Notificar usuari: Sol·licitud rebutjada
 */
export async function notifyConnectionRejected(
  senderId: string,
  receiverId: string,
  receiverName: string,
  connectionId: string
) {
  return createNotification({
    userId: senderId,
    type: 'CONNECTION_REJECTED',
    title: 'Sol·licitud no acceptada',
    message: `${receiverName} no ha acceptat la teva sol·licitud de connexió.`,
    link: `/dashboard/comunitat`,
    metadata: { receiverId, receiverName, connectionId }
  })
}

// ============================================
// FUNCIONS ESPECÍFIQUES DE MISSATGERIA
// ============================================

/**
 * Notificar usuari: Nou missatge rebut
 */
export async function notifyNewMessage(
  receiverId: string,
  senderId: string,
  senderName: string,
  conversationId: string,
  messagePreview: string
) {
  // Truncar missatge si és massa llarg
  const preview = messagePreview.length > 50
    ? messagePreview.substring(0, 50) + '...'
    : messagePreview

  return createNotification({
    userId: receiverId,
    type: 'NEW_MESSAGE',
    title: `Nou missatge de ${senderName}`,
    message: preview,
    link: `/dashboard/missatges?conversation=${conversationId}`,
    metadata: { senderId, senderName, conversationId, messagePreview: preview }
  })
}

// ============================================
// FUNCIONS ADDICIONALS DEL FLUX LEAD → EMPRESA
// ============================================

/**
 * Notificar Gestor: El seu lead s'ha convertit en empresa
 */
export async function notifyLeadConvertedToGestor(
  gestorId: string,
  leadName: string,
  companyId: string,
  companyName: string
) {
  return createNotification({
    userId: gestorId,
    type: 'LEAD_CONVERTED',
    title: 'Lead convertit en empresa! 🎉',
    message: `El teu lead "${leadName}" s'ha convertit en l'empresa col·laboradora "${companyName}".`,
    link: `/gestio/empreses/${companyId}`,
    companyId,
    metadata: { leadName, companyId, companyName }
  })
}

/**
 * Notificar Gestor: Lead sense activitat (recordatori 7 dies)
 */
export async function notifyLeadInactiveReminder(
  gestorId: string,
  leadId: string,
  leadName: string,
  daysInactive: number
) {
  return createNotification({
    userId: gestorId,
    type: 'LEAD_INACTIVE_REMINDER',
    title: 'Lead sense activitat',
    message: `El lead "${leadName}" porta ${daysInactive} dies sense activitat. Recorda fer seguiment!`,
    link: `/gestio/pipeline?highlight=${leadId}`,
    leadId,
    metadata: { leadId, leadName, daysInactive }
  })
}

/**
 * Notificar Gestor + CRM: Lead a punt d'expirar (30 dies)
 */
export async function notifyLeadExpiring(
  userId: string,
  leadId: string,
  leadName: string,
  isGestor: boolean = true
) {
  return createNotification({
    userId,
    type: 'LEAD_EXPIRING',
    title: '⚠️ Lead a punt d\'expirar',
    message: isGestor
      ? `El lead "${leadName}" porta 30 dies sense activitat i pot ser reassignat.`
      : `El lead "${leadName}" porta 30 dies sense activitat. Considera reassignar-lo.`,
    link: `/gestio/pipeline?highlight=${leadId}`,
    leadId,
    metadata: { leadId, leadName, isGestor }
  })
}

/**
 * Notificar CRM: Perfil d'empresa completat, pendent de revisió
 */
export async function notifyCompanyProfileCompleted(
  crmUserIds: string[],
  companyId: string,
  companyName: string
) {
  const results = []

  for (const crmId of crmUserIds) {
    const result = await createNotification({
      userId: crmId,
      type: 'COMPANY_PROFILE_COMPLETED',
      title: 'Perfil empresa completat',
      message: `L'empresa "${companyName}" ha completat el seu perfil. Pendent de revisió.`,
      link: `/gestio/empreses/${companyId}`,
      companyId,
      metadata: { companyId, companyName }
    })
    results.push(result)
  }

  return results
}

// ============================================
// FUNCIONS DE PUBLICACIÓ D'EMPRESES
// ============================================

/**
 * Notificar Gestor: L'empresa ha estat publicada
 */
export async function notifyCompanyPublishedToGestor(
  gestorId: string,
  companyId: string,
  companyName: string,
  publishedBy: string
) {
  return createNotification({
    userId: gestorId,
    type: 'COMPANY_PUBLISHED',
    title: 'Empresa publicada! 🎉',
    message: `L'empresa "${companyName}" que gestiones ha estat verificada i publicada al directori.`,
    link: `/gestio/empreses/${companyId}`,
    companyId,
    metadata: { companyId, companyName, publishedBy }
  })
}

/**
 * Notificar Admins: Una empresa ha estat publicada
 */
export async function notifyCompanyPublishedToAdmins(
  adminUserIds: string[],
  companyId: string,
  companyName: string,
  publishedBy: string
) {
  const results = []

  for (const adminId of adminUserIds) {
    const result = await createNotification({
      userId: adminId,
      type: 'COMPANY_PUBLISHED',
      title: 'Nova empresa publicada',
      message: `L'empresa "${companyName}" ha estat publicada per ${publishedBy}.`,
      link: `/gestio/empreses/${companyId}`,
      companyId,
      metadata: { companyId, companyName, publishedBy }
    })
    results.push(result)
  }

  return results
}

/**
 * Notificar al representant de l'empresa: Empresa publicada
 */
export async function notifyCompanyOwnerPublished(
  companyUserId: string,
  companyId: string,
  companyName: string
) {
  return createNotification({
    userId: companyUserId,
    type: 'COMPANY_PUBLISHED',
    title: 'La vostra empresa ja està publicada! 🎉',
    message: `Felicitats! "${companyName}" ja és visible al directori d'empreses col·laboradores.`,
    link: `/empresa/dashboard`,
    companyId,
    metadata: { companyId, companyName }
  })
}