'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { notifyCompanyRegistered, getCRMUserIds, getUserById } from '@/lib/notifications/notification-actions'

// ============================================
// TIPUS
// ============================================

export interface LeadPendentRegistre {
  id: string
  companyName: string
  cif: string | null
  sector: string | null
  contactName: string | null
  contactRole: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  estimatedValue: number | null
  priority: string
  stage: string | null
  notes: string | null
  internalNotes: string | null
  createdAt: Date
  updatedAt: Date
  assignedTo: {
    id: string
    name: string | null
    email: string
  } | null
  // Camps afegits per al workflow
  paymentStatus?: 'PENDING' | 'CONTACTED' | 'PAYMENT_SENT' | 'PAYMENT_CONFIRMED'
  paymentConfirmedAt?: Date | null
  adminNotes?: string | null
}

export interface LeadsPendentsStats {
  total: number
  perContactar: number
  contactats: number
  pagamentPendent: number
}

// ============================================
// VERIFICACIÓ ACCÉS
// ============================================

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: 'No autenticat', authorized: false }
  }

  const role = session.user.role as string
  if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
    return { error: 'No tens permisos d\'administrador', authorized: false }
  }

  return { authorized: true, userId: session.user.id, role }
}

// ============================================
// OBTENIR LEADS PENDENTS
// ============================================

export async function getLeadById(leadId: string): Promise<{
  success: boolean
  data?: LeadPendentRegistre
  error?: string
}> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!lead) {
      return { success: false, error: 'Lead no trobat' }
    }

    return {
      success: true,
      data: {
        ...lead,
        estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
        assignedTo: lead.assignedTo
      } as LeadPendentRegistre
    }
  } catch (error) {
    console.error('Error obtenint lead:', error)
    return { success: false, error: 'Error obtenint lead' }
  }
}

export async function getLeadsPendentsRegistre(): Promise<{
  success: boolean
  data?: LeadPendentRegistre[]
  error?: string
}> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    const leads = await prismaClient.companyLead.findMany({
      where: {
        stage: 'PENDING_ADMIN',
        convertedToCompanyId: null  // Encara no convertit a empresa
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return {
      success: true,
      data: leads.map(lead => ({
        ...lead,
        estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
        assignedTo: lead.assignedTo
      })) as LeadPendentRegistre[]
    }
  } catch (error) {
    console.error('Error obtenint leads pendents:', error)
    return { success: false, error: 'Error obtenint leads pendents' }
  }
}

// ============================================
// ESTADÍSTIQUES
// ============================================

export async function getLeadsPendentsStats(): Promise<{
  success: boolean
  data?: LeadsPendentsStats
  error?: string
}> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    // Comptar leads pendents d'admin (no convertits encara)
    const [total, ambNotes, senseNotes] = await Promise.all([
      // Total de leads pendents
      prismaClient.companyLead.count({
        where: {
          stage: 'PENDING_ADMIN',
          convertedToCompanyId: null
        }
      }),
      // Leads amb notes (considerats contactats)
      prismaClient.companyLead.count({
        where: {
          stage: 'PENDING_ADMIN',
          convertedToCompanyId: null,
          internalNotes: {
            not: null
          }
        }
      }),
      // Leads sense notes (per contactar)
      prismaClient.companyLead.count({
        where: {
          stage: 'PENDING_ADMIN',
          convertedToCompanyId: null,
          OR: [
            { internalNotes: null },
            { internalNotes: '' }
          ]
        }
      })
    ])

    return {
      success: true,
      data: {
        total,
        perContactar: senseNotes,
        contactats: ambNotes,
        pagamentPendent: 0  // Per implementar en el futur amb tracking de pagaments
      }
    }
  } catch (error) {
    console.error('Error obtenint estadístiques:', error)
    return { success: false, error: 'Error obtenint estadístiques' }
  }
}

// ============================================
// ACTUALITZAR NOTES ADMIN
// ============================================

export async function updateLeadAdminNotes(
  leadId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        internalNotes: notes,
        updatedAt: new Date()
      }
    })

    revalidatePath('/admin/empreses-pendents')
    return { success: true }
  } catch (error) {
    console.error('Error actualitzant notes:', error)
    return { success: false, error: 'Error actualitzant notes' }
  }
}

// ============================================
// MARCAR COM GUANYAT (quan es crea l'empresa)
// ============================================

export async function marcarLeadGuanyat(
  leadId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    // Obtenir dades del lead abans d'actualitzar
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      select: { companyName: true }
    })

    if (!lead) {
      return { success: false, error: 'Lead no trobat' }
    }

    // Actualitzar el lead com a convertit
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        stage: 'WON',
        status: 'WON',  // Sincronitzar status amb stage
        convertedToCompanyId: companyId,
        convertedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Enviar notificació al CRM que s'ha registrat una empresa
    try {
      const crmUserIds = await getCRMUserIds()
      const adminUser = await getUserById(access.userId!)
      const adminName = adminUser?.name || 'Admin'

      if (crmUserIds.length > 0) {
        await notifyCompanyRegistered(
          crmUserIds,
          companyId,
          lead.companyName,
          adminName
        )
        console.log('🔔 Notificacions enviades a', crmUserIds.length, 'usuaris CRM per empresa registrada:', lead.companyName)
      }
    } catch (notificationError) {
      console.error('Error enviant notificació de empresa registrada:', notificationError)
      // No falla la operació principal si hi ha error en notificacions
    }

    revalidatePath('/admin/empreses-pendents')
    revalidatePath('/gestio/admin/empreses-pendents')  // Nova ruta de gestió
    revalidatePath('/gestio/leads')
    revalidatePath('/gestio/pipeline')
    return { success: true }
  } catch (error) {
    console.error('Error marcant lead com guanyat:', error)
    return { success: false, error: 'Error marcant lead com guanyat' }
  }
}