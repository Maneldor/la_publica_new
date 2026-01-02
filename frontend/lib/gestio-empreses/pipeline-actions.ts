// lib/gestio-empreses/pipeline-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { PIPELINE_STAGES, PipelineStage } from './pipeline-utils'
import { PIPELINE_PHASES, PhaseId } from './pipeline-utils-phases'
import { notifyLeadToVerify, getCRMUserIds } from '@/lib/notifications/notification-actions'
import { canTransition, getTransitionErrorMessage, LeadStage } from './lead-permissions'
import { GESTOR_ROLES, CRM_ROLES, ADMIN_ROLES, GESTOR_STAGES } from './pipeline-config'

interface PipelineLead {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
  score: number | null
  createdAt: Date
  updatedAt: Date
  assignedTo: {
    id: string
    name: string | null
  } | null
}

interface PipelineData {
  stages: {
    id: string
    label: string
    color: string
    leads: PipelineLead[]
    totalValue: number
    count: number
  }[]
  totals: {
    leads: number
    value: number
  }
}

// Verificar accés
async function verifyAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }
  const userRole = (session.user as any).role || 'USER'
  const userType = (session.user as any).userType || 'USER'
  const isSupervisor = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'ACCOUNT_MANAGER'].includes(userType)
  return { user: session.user, isSupervisor, userRole }
}

// Obtenir dades del pipeline
export async function getPipelineData(): Promise<PipelineData> {
  const { user, isSupervisor } = await verifyAccess()

  const whereClause = isSupervisor ? {} : { assignedToId: user.id }

  // Obtenir tots els leads
  const leads = await prismaClient.companyLead.findMany({
    where: whereClause,
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
      status: true,
      priority: true,
      estimatedRevenue: true,
      score: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { priority: 'asc' },
      { updatedAt: 'desc' },
    ],
  })

  // Agrupar per estat
  const stages = PIPELINE_STAGES.map(stage => {
    const stageLeads = leads.filter(l => l.status === stage.id)
    const totalValue = stageLeads.reduce((sum, l) => {
      const revenue = Number(l.estimatedRevenue) || 0
      return sum + revenue
    }, 0)

    return {
      ...stage,
      leads: stageLeads,
      totalValue,
      count: stageLeads.length,
    }
  })

  const totals = {
    leads: leads.length,
    value: leads.reduce((sum, l) => {
      const revenue = Number(l.estimatedRevenue) || 0
      return sum + revenue
    }, 0),
  }

  return { stages, totals }
}

// Moure lead a un nou estat
export async function moveLeadToStage(
  leadId: string,
  newStatus: PipelineStage
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, isSupervisor, userRole } = await verifyAccess()

    // Verificar que el lead existeix i l'usuari té accés
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
    })

    if (!lead) {
      return { success: false, error: 'Lead no trobat' }
    }

    if (!isSupervisor && lead.assignedToId !== user.id) {
      return { success: false, error: 'No tens permís per modificar aquest lead' }
    }

    // Verificar permisos de transició utilitzant el sistema de permisos
    const currentStage = lead.stage as LeadStage || lead.status as LeadStage
    const targetStage = newStatus as LeadStage

    // Els administradors poden saltar-se les verificacions de permisos
    if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)) {
      if (!canTransition(userRole, currentStage, targetStage)) {
        const errorMessage = getTransitionErrorMessage(userRole, currentStage, targetStage)
        return { success: false, error: errorMessage }
      }
    }

    // Actualitzar lead
    const updatedLead = await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        stage: newStatus,  // Sincronitzar stage amb status
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        }
      }
    })

    // Crear activitat
    await prismaClient.leadActivity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        description: `Estat canviat de ${lead.status} a ${newStatus}`,
        userId: user.id,
      },
    })

    // Enviar notificación al CRM cuando un gestor envía un lead para revisar
    if (newStatus === 'PENDING_CRM') {
      try {
        const crmUserIds = await getCRMUserIds()
        const gestorName = updatedLead.assignedTo?.name || user.name || 'Gestor'

        await notifyLeadToVerify(
          crmUserIds,
          leadId,
          updatedLead.companyName,
          gestorName
        )
        console.log('🔔 Notificació enviada al CRM per verificar lead:', leadId)
      } catch (error) {
        console.error('Error enviando notificación al CRM:', error)
        // No falla la operación principal si hay error en notificaciones
      }
    }

    revalidatePath('/gestio/pipeline')
    revalidatePath('/gestio/leads')
    revalidatePath(`/gestio/leads/${leadId}`)

    return { success: true }

  } catch (error) {
    console.error('Error moving lead:', error)
    return { success: false, error: 'Error movent el lead' }
  }
}

/**
 * Obtenir leads agrupats per fase
 */
export async function getLeadsByPhase(userId?: string) {
  const { user, isSupervisor } = await verifyAccess()

  const where = isSupervisor ? {} : { assignedToId: userId || user.id }

  const leads = await prismaClient.companyLead.findMany({
    where,
    select: {
      id: true,
      companyName: true,
      contactName: true,
      status: true,
      priority: true,
      estimatedRevenue: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: {
        select: { id: true, name: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Agrupar per fase i estat
  const phaseData: Record<PhaseId, {
    leads: Record<string, typeof leads>,
    totalLeads: number,
    totalValue: number,
  }> = {
    1: { leads: {}, totalLeads: 0, totalValue: 0 },
    2: { leads: {}, totalLeads: 0, totalValue: 0 },
    3: { leads: {}, totalLeads: 0, totalValue: 0 },
  }

  // Inicialitzar arrays per cada estat
  Object.entries(PIPELINE_PHASES).forEach(([phaseId, phase]) => {
    phase.statuses.forEach((status) => {
      phaseData[Number(phaseId) as PhaseId].leads[status] = []
    })
  })

  // Classificar leads
  leads.forEach((lead) => {
    for (const [phaseId, phase] of Object.entries(PIPELINE_PHASES)) {
      if (phase.statuses.includes(lead.status as any)) {
        const pid = Number(phaseId) as PhaseId
        phaseData[pid].leads[lead.status].push(lead)
        phaseData[pid].totalLeads++
        phaseData[pid].totalValue += Number(lead.estimatedRevenue) || 0
        break
      }
    }
  })

  return phaseData
}

/**
 * Obtenir estadístiques globals del pipeline
 */
export async function getPipelineStats() {
  const leads = await prismaClient.companyLead.findMany({
    select: {
      status: true,
      estimatedRevenue: true,
    },
  })

  const totalLeads = leads.length
  let totalValue = 0
  let wonValue = 0
  let wonCount = 0

  leads.forEach((lead) => {
    totalValue += Number(lead.estimatedRevenue) || 0
    if (lead.status === 'WON') {
      wonValue += Number(lead.estimatedRevenue) || 0
      wonCount++
    }
  })

  const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0

  return {
    totalLeads,
    totalValue,
    wonValue,
    wonCount,
    conversionRate,
  }
}

/**
 * Moure lead a un nou estat
 */
export async function moveLeadToStatus(
  leadId: string,
  newStatus: string,
  userId: string
): Promise<{ success: boolean; lead?: any; error?: string }> {
  try {
    const { user, userRole } = await verifyAccess()

    // Obtenir dades del lead actual
    const currentLead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      select: { stage: true, status: true, assignedToId: true }
    })

    if (!currentLead) {
      return { success: false, error: 'Lead no trobat' }
    }

    // Verificar permisos de transició
    const currentStage = currentLead.stage as LeadStage || currentLead.status as LeadStage
    const targetStage = newStatus as LeadStage

    // Els administradors poden saltar-se les verificacions de permisos
    if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)) {
      if (!canTransition(userRole, currentStage, targetStage)) {
        const errorMessage = getTransitionErrorMessage(userRole, currentStage, targetStage)
        return { success: false, error: errorMessage }
      }
    }

    const lead = await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        stage: newStatus,  // Sincronitzar stage amb status
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        }
      }
    })

    // Crear activitat
    await prismaClient.leadActivity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        description: `Estat canviat a ${newStatus}`,
        userId: user.id,
      },
    })

    // Enviar notificación al CRM cuando un gestor envía un lead para revisar
    if (newStatus === 'PENDING_CRM') {
      try {
        const crmUserIds = await getCRMUserIds()
        const gestorName = lead.assignedTo?.name || user.name || 'Gestor'

        await notifyLeadToVerify(
          crmUserIds,
          leadId,
          lead.companyName,
          gestorName
        )
        console.log('🔔 Notificació enviada al CRM per verificar lead:', leadId)
      } catch (error) {
        console.error('Error enviando notificación al CRM:', error)
        // No falla la operación principal si hay error en notificaciones
      }
    }

    revalidatePath('/gestio/pipeline')

    return { success: true, lead }
  } catch (error) {
    console.error('Error moving lead to status:', error)
    return { success: false, error: 'Error actualitzant l\'estat del lead' }
  }
}

// ============================================
// OBTENIR GESTORS AMB ELS SEUS LEADS
// ============================================

export async function getGestorsWithLeads(): Promise<{
  success: boolean
  data?: Array<{
    gestor: {
      id: string
      name: string
      email: string
      role: string
    }
    leadCount: number
    leadsByStage: Record<string, number>
  }>
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  const userRole = session.user.role as string

  // Només CRM i Admin poden veure això
  if (!CRM_ROLES.includes(userRole) && !ADMIN_ROLES.includes(userRole)) {
    return { success: false, error: 'No tens permisos' }
  }

  try {
    // Obtenir tots els gestors
    const gestors = await prismaClient.user.findMany({
      where: {
        role: { in: GESTOR_ROLES },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    // Per cada gestor, obtenir el recompte de leads per fase
    const gestorsWithLeads = await Promise.all(
      gestors.map(async (gestor) => {
        const leads = await prismaClient.companyLead.groupBy({
          by: ['stage'],
          where: {
            assignedToId: gestor.id,
            stage: { in: [...GESTOR_STAGES] }
          },
          _count: true
        })

        const leadsByStage: Record<string, number> = {}
        let totalLeads = 0

        leads.forEach(item => {
          if (item.stage) {
            leadsByStage[item.stage] = item._count
            totalLeads += item._count
          }
        })

        return {
          gestor,
          leadCount: totalLeads,
          leadsByStage
        }
      })
    )

    // Filtrar gestors sense leads si es vol
    const gestorsWithAtLeastOneLead = gestorsWithLeads.filter(g => g.leadCount > 0)

    return { success: true, data: gestorsWithAtLeastOneLead }
  } catch (error) {
    console.error('Error obtenint gestors amb leads:', error)
    return { success: false, error: 'Error obtenint dades' }
  }
}

// ============================================
// OBTENIR LEADS D'UN GESTOR ESPECÍFIC
// ============================================

export async function getLeadsByGestor(
  gestorId: string
): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  const userRole = session.user.role as string

  // Només CRM i Admin poden veure leads d'altres gestors
  if (!CRM_ROLES.includes(userRole) && !ADMIN_ROLES.includes(userRole)) {
    return { success: false, error: 'No tens permisos' }
  }

  try {
    const leads = await prismaClient.companyLead.findMany({
      where: {
        assignedToId: gestorId,
        stage: { in: [...GESTOR_STAGES] }
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return { success: true, data: leads }
  } catch (error) {
    console.error('Error obtenint leads del gestor:', error)
    return { success: false, error: 'Error obtenint leads' }
  }
}

// ============================================
// OBTENIR LEADS PER WORKSPACE
// ============================================

export async function getPipelineLeads({
  stages,
  userId
}: {
  stages: string[]
  userId?: string
}): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { success: false, error: 'No autenticat' }
    }

    const whereClause: any = {
      stage: { in: stages }
    }

    // Si s'especifica userId, filtrar per assignat
    if (userId) {
      whereClause.assignedToId = userId
    }

    const leads = await prismaClient.companyLead.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { updatedAt: 'desc' }
      ]
    })

    return { success: true, data: leads }
  } catch (error) {
    console.error('Error obtenint leads del pipeline:', error)
    return { success: false, error: 'Error obtenint leads' }
  }
}

