'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ============================================
// TIPUS
// ============================================

export type NotificationType =
  | 'LEAD_VERIFIED'           // CRM verifica lead → Admin
  | 'COMPANY_ASSIGNED'        // CRM assigna empresa → Gestor
  | 'COMPANY_COMPLETED'       // Gestor completa empresa → CRM
  | 'COMPANY_PUBLISHED'       // CRM publica empresa → Empresa + Gestor
  | 'NEW_MESSAGE'             // Nou missatge → Destinatari
  | 'TASK_ASSIGNED'           // Nova tasca assignada
  | 'PAYMENT_RECEIVED'        // Pagament rebut → Admin
  | 'PLAN_EXPIRING'           // Pla a punt d'expirar → Empresa + Gestor
  | 'INFO'                    // Informació general
  | 'WARNING'                 // Avís
  | 'SUCCESS'                 // Èxit

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  actionUrl: string | null
  isRead: boolean
  createdAt: Date
  readAt: Date | null
  metadata?: any
}

export interface NotificationStats {
  total: number
  unread: number
}

// ============================================
// OBTENIR NOTIFICACIONS
// ============================================

export async function getNotifications(limit: number = 10): Promise<{
  success: boolean
  data?: Notification[]
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    const notifications = await prismaClient.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        actionUrl: true,
        isRead: true,
        createdAt: true,
        readAt: true,
        metadata: true
      }
    })

    return {
      success: true,
      data: notifications.map(n => ({
        ...n,
        type: n.type as string,
        metadata: n.metadata as any
      }))
    }
  } catch (error) {
    console.error('Error obtenint notificacions:', error)
    return { success: false, error: 'Error obtenint notificacions' }
  }
}

// ============================================
// COMPTAR NO LLEGIDES
// ============================================

export async function getUnreadCount(): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    const count = await prismaClient.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    })

    return { success: true, count }
  } catch (error) {
    console.error('Error comptant notificacions:', error)
    return { success: false, error: 'Error comptant notificacions' }
  }
}

// ============================================
// MARCAR COM LLEGIDA
// ============================================

export async function markAsRead(notificationId: string): Promise<{
  success: boolean
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    await prismaClient.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id  // Seguretat: només les pròpies
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error marcant com llegida:', error)
    return { success: false, error: 'Error marcant com llegida' }
  }
}

// ============================================
// MARCAR TOTES COM LLEGIDES
// ============================================

export async function markAllAsRead(): Promise<{
  success: boolean
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticat' }
  }

  try {
    await prismaClient.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error marcant totes com llegides:', error)
    return { success: false, error: 'Error marcant totes com llegides' }
  }
}

// ============================================
// CREAR NOTIFICACIÓ (ús intern)
// ============================================

export async function createNotification({
  userId,
  type,
  title,
  message,
  actionUrl,
  metadata,
  priority = 'NORMAL'
}: {
  userId: string
  type: string
  title: string
  message: string
  actionUrl?: string
  metadata?: any
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}): Promise<{ success: boolean; error?: string }> {
  try {
    await prismaClient.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        actionUrl: actionUrl || null,
        priority: priority as any,
        metadata: metadata || null,
        isRead: false
      }
    })

    // Revalidar les pàgines que mostren notificacions
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    console.error('Error creant notificació:', error)
    return { success: false, error: 'Error creant notificació' }
  }
}

// ============================================
// NOTIFICACIONS ESPECÍFIQUES
// ============================================

// Quan CRM verifica un lead → Notificar a tots els admins
export async function notifyLeadVerified(leadName: string, leadId: string): Promise<void> {
  try {
    // Obtenir tots els admins
    const admins = await prismaClient.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN'] },
        isActive: true
      },
      select: { id: true }
    })

    // Crear notificació per cada admin
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'LEAD_VERIFIED',
        title: 'Nova empresa verificada per registrar',
        message: `L'empresa "${leadName}" ha estat aprovada pel CRM i està llesta per ser contractada. Clica per veure els detalls.`,
        actionUrl: `/admin/empreses-pendents`,
        priority: 'HIGH',
        metadata: { leadId, leadName }
      })
    }
  } catch (error) {
    console.error('Error notificant lead verificat:', error)
  }
}

// Quan s'assigna una empresa a un gestor
export async function notifyCompanyAssigned(
  gestorId: string,
  companyName: string,
  companyId: string
): Promise<void> {
  await createNotification({
    userId: gestorId,
    type: 'COMPANY_ASSIGNED',
    title: 'Nova empresa assignada',
    message: `Se t'ha assignat l'empresa "${companyName}". Revisa el perfil i contacta amb l'empresa.`,
    actionUrl: `/gestio/empreses/${companyId}/completar`,
    priority: 'HIGH'
  })
}

// Quan es publica una empresa
export async function notifyCompanyPublished(
  companyUserId: string,
  gestorId: string | null,
  companyName: string,
  companyId: string
): Promise<void> {
  // Notificar a l'empresa
  await createNotification({
    userId: companyUserId,
    type: 'COMPANY_PUBLISHED',
    title: 'Perfil publicat!',
    message: `El perfil de "${companyName}" ja és visible al directori. Ara pots crear ofertes!`,
    actionUrl: `/empresa/perfil`,
    priority: 'HIGH'
  })

  // Notificar al gestor si existeix
  if (gestorId) {
    await createNotification({
      userId: gestorId,
      type: 'COMPANY_PUBLISHED',
      title: 'Empresa publicada',
      message: `L'empresa "${companyName}" ha estat publicada al directori.`,
      actionUrl: `/gestio/empreses/${companyId}`,
      priority: 'NORMAL'
    })
  }
}

// Quan es completa el perfil d'una empresa
export async function notifyCompanyCompleted(
  crmUserId: string,
  companyName: string,
  companyId: string
): Promise<void> {
  await createNotification({
    userId: crmUserId,
    type: 'COMPANY_COMPLETED',
    title: 'Perfil completat',
    message: `L'empresa "${companyName}" ha completat el seu perfil i està pendent de revisió.`,
    actionUrl: `/gestio/empreses/${companyId}`,
    priority: 'NORMAL'
  })
}

// Quan un pla està a punt d'expirar
export async function notifyPlanExpiring(
  userId: string,
  companyName: string,
  daysLeft: number
): Promise<void> {
  await createNotification({
    userId,
    type: 'PLAN_EXPIRING',
    title: 'Pla a punt d\'expirar',
    message: `El pla de "${companyName}" expira en ${daysLeft} dies. Contacta amb l'empresa per renovar.`,
    actionUrl: `/empresa/facturacio`,
    priority: daysLeft < 7 ? 'URGENT' : 'HIGH'
  })
}