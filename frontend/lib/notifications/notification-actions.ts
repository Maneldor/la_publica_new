'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Tipus de notificacions del flux de leads
export type NotificationType =
  | 'LEAD_ASSIGNED'           // Lead assignat a Gestor (usar COMPANY_ASSIGNED del enum)
  | 'LEAD_TO_VERIFY'          // Gestor envia lead a verificar (usar COMPANY_PENDING)
  | 'LEAD_VERIFIED'           // CRM ha verificat el lead (usar LEAD_VERIFIED del enum)
  | 'LEAD_TO_ADMIN'           // Lead enviat a Admin per contractar (usar COMPANY_PENDING)
  | 'COMPANY_REGISTERED'      // Admin ha registrat l'empresa (usar COMPANY_APPROVED)
  | 'COMPANY_ASSIGNED'        // CRM ha assignat empresa a Gestor (usar COMPANY_ASSIGNED del enum)
  | 'NEW_MESSAGE'             // Nou missatge (usar GENERAL)
  | 'TASK_ASSIGNED'           // Nova tasca assignada (usar GENERAL)
  | 'GENERAL'                 // Notificació general (usar GENERAL del enum)

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
    'LEAD_VERIFIED': 'LEAD_VERIFIED',
    'LEAD_TO_ADMIN': 'COMPANY_PENDING',
    'COMPANY_REGISTERED': 'COMPANY_APPROVED',
    'COMPANY_ASSIGNED': 'COMPANY_ASSIGNED',
    'NEW_MESSAGE': 'GENERAL',
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