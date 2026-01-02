/**
 * Funcions de cron per recordatoris de leads
 *
 * Aquestes funcions s'executen periòdicament per:
 * - Notificar gestors de leads inactius (7 dies)
 * - Notificar gestors i CRM de leads a punt d'expirar (30 dies)
 */

import { prismaClient } from '@/lib/prisma'
import {
  notifyLeadInactiveReminder,
  notifyLeadExpiring,
  getCRMUserIds
} from '@/lib/notifications/notification-actions'

/**
 * Comprovar leads sense activitat (7 dies)
 * Envia recordatori al gestor assignat
 */
export async function checkInactiveLeads(): Promise<{
  checked: number
  notified: number
  errors: number
}> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const results = {
    checked: 0,
    notified: 0,
    errors: 0
  }

  try {
    // Buscar leads actius sense activitat en 7 dies
    const inactiveLeads = await prismaClient.companyLead.findMany({
      where: {
        status: { in: ['ACTIVE', 'CONTACTED', 'QUALIFIED', 'PROSPECTING'] },
        assignedToId: { not: null },
        updatedAt: { lt: sevenDaysAgo }
      },
      select: {
        id: true,
        companyName: true,
        assignedToId: true,
        updatedAt: true
      }
    })

    results.checked = inactiveLeads.length
    console.log(`📊 [Cron] Trobats ${inactiveLeads.length} leads inactius (7 dies)`)

    for (const lead of inactiveLeads) {
      if (!lead.assignedToId) continue

      // Calcular dies d'inactivitat
      const daysInactive = Math.floor(
        (Date.now() - lead.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Comprovar si ja s'ha enviat notificació recentment (últimes 24h)
      const recentNotification = await prismaClient.notification.findFirst({
        where: {
          userId: lead.assignedToId,
          leadId: lead.id,
          type: 'GENERAL', // mapeja a LEAD_INACTIVE_REMINDER
          createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })

      if (recentNotification) {
        console.log(`⏭️ [Cron] Saltant lead ${lead.companyName} - notificació recent`)
        continue
      }

      try {
        await notifyLeadInactiveReminder(
          lead.assignedToId,
          lead.id,
          lead.companyName,
          daysInactive
        )
        results.notified++
        console.log(`✅ [Cron] Notificat gestor per lead: ${lead.companyName}`)
      } catch (error) {
        results.errors++
        console.error(`❌ [Cron] Error notificant lead ${lead.id}:`, error)
      }
    }

    return results
  } catch (error) {
    console.error('❌ [Cron] Error en checkInactiveLeads:', error)
    throw error
  }
}

/**
 * Comprovar leads a punt d'expirar (30 dies sense activitat)
 * Envia notificació al gestor i a CRM
 */
export async function checkExpiringLeads(): Promise<{
  checked: number
  gestorsNotified: number
  crmNotified: number
  errors: number
}> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const results = {
    checked: 0,
    gestorsNotified: 0,
    crmNotified: 0,
    errors: 0
  }

  try {
    // Buscar leads que porten 30 dies sense activitat
    const expiringLeads = await prismaClient.companyLead.findMany({
      where: {
        status: { notIn: ['WON', 'LOST'] },
        assignedToId: { not: null },
        updatedAt: { lt: thirtyDaysAgo }
      },
      select: {
        id: true,
        companyName: true,
        assignedToId: true,
        updatedAt: true
      }
    })

    results.checked = expiringLeads.length
    console.log(`📊 [Cron] Trobats ${expiringLeads.length} leads a punt d'expirar (30 dies)`)

    // Obtenir IDs de CRM una sola vegada
    const crmIds = await getCRMUserIds()

    for (const lead of expiringLeads) {
      // Comprovar si ja s'ha enviat notificació d'expiració (últimes 7 dies)
      const recentExpNotification = await prismaClient.notification.findFirst({
        where: {
          leadId: lead.id,
          title: { contains: 'expirar' },
          createdAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })

      if (recentExpNotification) {
        console.log(`⏭️ [Cron] Saltant lead ${lead.companyName} - notificació expiració recent`)
        continue
      }

      try {
        // Notificar Gestor
        if (lead.assignedToId) {
          await notifyLeadExpiring(lead.assignedToId, lead.id, lead.companyName, true)
          results.gestorsNotified++
        }

        // Notificar CRM
        for (const crmId of crmIds) {
          await notifyLeadExpiring(crmId, lead.id, lead.companyName, false)
        }
        results.crmNotified += crmIds.length

        console.log(`✅ [Cron] Notificats per lead expirant: ${lead.companyName}`)
      } catch (error) {
        results.errors++
        console.error(`❌ [Cron] Error notificant lead expirant ${lead.id}:`, error)
      }
    }

    return results
  } catch (error) {
    console.error('❌ [Cron] Error en checkExpiringLeads:', error)
    throw error
  }
}

/**
 * Executar totes les comprovacions de leads
 */
export async function runAllLeadReminders() {
  console.log('🚀 [Cron] Iniciant comprovacions de leads...')
  const startTime = Date.now()

  const inactiveResults = await checkInactiveLeads()
  const expiringResults = await checkExpiringLeads()

  const duration = Date.now() - startTime
  console.log(`✅ [Cron] Comprovacions completades en ${duration}ms`)

  return {
    inactive: inactiveResults,
    expiring: expiringResults,
    duration
  }
}
