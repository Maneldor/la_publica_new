// lib/gestio-empreses/notification-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type NotificationType =
  | 'LEAD_ASSIGNED'
  | 'LEAD_STATUS_CHANGE'
  | 'COMPANY_APPROVED'
  | 'COMPANY_PENDING'
  | 'TASK_DUE'
  | 'TASK_ASSIGNED'
  | 'MESSAGE_RECEIVED'
  | 'EVENT_REMINDER'
  | 'CRM_APPROVAL_NEEDED'
  | 'SYSTEM'

/**
 * Obtenir notificacions de l'usuari
 */
export async function getUserNotifications(userId: string, limit = 20) {
  const notifications = await prismaClient.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return notifications
}

/**
 * Obtenir notificacions no llegides
 */
export async function getUnreadNotifications(userId: string) {
  const notifications = await prismaClient.notification.findMany({
    where: {
      userId,
      isRead: false,
    },
    orderBy: { createdAt: 'desc' },
  })

  return notifications
}

/**
 * Comptar notificacions no llegides
 */
export async function getUnreadCount(userId: string) {
  const count = await prismaClient.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  return count
}

/**
 * Marcar notificació com llegida
 */
export async function markAsRead(notificationId: string) {
  await prismaClient.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  })

  revalidatePath('/gestio')
}

/**
 * Marcar totes com llegides
 */
export async function markAllAsRead(userId: string) {
  await prismaClient.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  revalidatePath('/gestio')
}

/**
 * Crear notificació
 */
export async function createNotification(
  userId: string,
  data: {
    type: NotificationType
    title: string
    message: string
    link?: string
    metadata?: any
  }
) {
  const notification = await prismaClient.notification.create({
    data: {
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata,
      isRead: false,
    },
  })

  return notification
}

/**
 * Crear notificacions massives (per a múltiples usuaris)
 */
export async function createBulkNotifications(
  userIds: string[],
  data: {
    type: NotificationType
    title: string
    message: string
    link?: string
    metadata?: any
  }
) {
  await prismaClient.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata,
      isRead: false,
    })),
  })
}

/**
 * Eliminar notificació
 */
export async function deleteNotification(notificationId: string) {
  await prismaClient.notification.delete({
    where: { id: notificationId },
  })

  revalidatePath('/gestio')
}

/**
 * Eliminar notificacions antigues (més de 30 dies)
 */
export async function cleanOldNotifications(userId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  await prismaClient.notification.deleteMany({
    where: {
      userId,
      createdAt: { lt: thirtyDaysAgo },
      isRead: true,
    },
  })
}

// Helper functions per crear notificacions específiques

export async function notifyLeadAssigned(
  gestorId: string,
  leadId: string,
  leadName: string,
  assignedBy: string
) {
  return createNotification(gestorId, {
    type: 'COMPANY_ASSIGNED',
    title: 'Nou lead assignat',
    message: `T'han assignat el lead "${leadName}"`,
    link: `/gestio/leads/${leadId}`,
    metadata: { leadId, assignedBy },
  })
}

export async function notifyLeadStatusChange(
  gestorId: string,
  leadId: string,
  leadName: string,
  newStatus: string
) {
  return createNotification(gestorId, {
    type: 'LEAD_STATUS_CHANGE',
    title: 'Canvi d\'estat del lead',
    message: `El lead "${leadName}" ha canviat a ${newStatus}`,
    link: `/gestio/leads/${leadId}`,
    metadata: { leadId, newStatus },
  })
}

export async function notifyCRMApprovalNeeded(crmUserIds: string[], leadId: string, leadName: string, sentByGestorName: string) {
  return createBulkNotifications(crmUserIds, {
    type: 'GENERAL',
    title: 'Lead pendent de verificació',
    message: `${sentByGestorName} ha enviat el lead "${leadName}" per verificació CRM`,
    link: `/gestio/crm/verificacio`,
    metadata: { leadId, sentByGestorName },
  })
}

/**
 * Obtener usuarios CRM para notificaciones
 */
export async function getCRMUsers() {
  const crmUsers = await prismaClient.user.findMany({
    where: {
      role: {
        in: ['CRM_COMERCIAL', 'ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN']
      },
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  })

  return crmUsers
}

export async function notifyTaskDue(
  userId: string,
  taskId: string,
  taskTitle: string,
  dueDate: Date
) {
  return createNotification(userId, {
    type: 'TASK_DUE',
    title: 'Tasca propera',
    message: `La tasca "${taskTitle}" venç aviat`,
    link: `/gestio/tasques`,
    metadata: { taskId, dueDate },
  })
}

export async function notifyEventReminder(
  userId: string,
  eventId: string,
  eventTitle: string,
  eventDate: Date
) {
  return createNotification(userId, {
    type: 'EVENT_REMINDER',
    title: 'Recordatori d\'esdeveniment',
    message: `L'esdeveniment "${eventTitle}" és aviat`,
    link: `/gestio/agenda`,
    metadata: { eventId, eventDate },
  })
}