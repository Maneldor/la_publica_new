'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  notifyLeadToVerify,
  notifyLeadVerifiedForAdmin,
  getCRMUserIds,
  getAdminUserIds
} from '@/lib/notifications/notification-actions'
import { STAGE_ORDER, isValidStage } from './lead-stage-utils'

interface AdvanceStageResult {
  success: boolean
  newStatus?: string
  error?: string
}

/**
 * Avançar un lead a la següent fase
 */
export async function advanceLeadStage(
  leadId: string,
  newStatus: string,
  userId: string
): Promise<AdvanceStageResult> {
  try {
    console.log('⏩ Avançant lead:', leadId, 'a:', newStatus)

    // Obtenir lead actual
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        companyName: true,
        status: true,
        assignedToId: true
      }
    })

    if (!lead) {
      return { success: false, error: 'Lead no trobat' }
    }

    const previousStatus = lead.status

    // Validar que el nou status és vàlid
    if (!isValidStage(newStatus)) {
      return { success: false, error: 'Estat no vàlid' }
    }

    // Actualitzar lead
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: newStatus as any,
        stage: newStatus,  // Sincronitzar amb status per filtres d'admin
        updatedAt: new Date()
      }
    })

    // Obtenir info de l'usuari que fa l'acció
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true }
    })

    // ========== NOTIFICACIONS SEGONS LA TRANSICIÓ ==========

    // Si passa a PENDING_CRM → Notificar CRM
    if (newStatus === 'PENDING_CRM' && previousStatus !== 'PENDING_CRM') {
      console.log('🔔 Notificant CRM: Lead pendent de verificació')
      const crmUserIds = await getCRMUserIds()

      if (crmUserIds.length > 0) {
        await notifyLeadToVerify(
          crmUserIds,
          leadId,
          lead.companyName,
          user?.name || 'Un gestor'
        )
        console.log('✅ Notificacions enviades a', crmUserIds.length, 'usuaris CRM')
      }
    }

    // Si passa a PENDING_ADMIN → Notificar Admins
    if (newStatus === 'PENDING_ADMIN' && previousStatus !== 'PENDING_ADMIN') {
      console.log('🔔 Notificant Admins: Lead verificat')
      const adminUserIds = await getAdminUserIds()

      if (adminUserIds.length > 0) {
        await notifyLeadVerifiedForAdmin(
          adminUserIds,
          leadId,
          lead.companyName,
          user?.name || 'CRM'
        )
        console.log('✅ Notificacions enviades a', adminUserIds.length, 'admins')
      }
    }

    // ========== FI NOTIFICACIONS ==========

    // Revalidar paths
    revalidatePath('/gestio/leads')
    revalidatePath('/gestio/pipeline')
    revalidatePath('/gestio/crm/verificacio')

    console.log('✅ Lead avançat correctament')
    return { success: true, newStatus }
  } catch (error) {
    console.error('❌ Error avançant lead:', error)
    return { success: false, error: 'Error avançant el lead' }
  }
}

/**
 * Canviar lead a un estat específic (no necessàriament el següent)
 */
export async function changeLeadStatus(
  leadId: string,
  newStatus: string,
  userId: string
): Promise<AdvanceStageResult> {
  // Usa la mateixa lògica que advanceLeadStage
  return advanceLeadStage(leadId, newStatus, userId)
}


/**
 * Marcar lead com a guanyat
 */
export async function markLeadAsWon(
  leadId: string,
  userId: string
): Promise<AdvanceStageResult> {
  return advanceLeadStage(leadId, 'WON', userId)
}

/**
 * Marcar lead com a perdut
 */
export async function markLeadAsLost(
  leadId: string,
  userId: string,
  reason?: string
): Promise<AdvanceStageResult> {
  try {
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: 'LOST',
        stage: 'LOST',  // Sincronitzar amb status
        notes: reason ? `Motiu de pèrdua: ${reason}` : undefined,
        updatedAt: new Date()
      }
    })

    revalidatePath('/gestio/leads')
    revalidatePath('/gestio/pipeline')

    return { success: true, newStatus: 'LOST' }
  } catch (error) {
    console.error('Error marcant lead com a perdut:', error)
    return { success: false, error: 'Error actualitzant el lead' }
  }
}