// lib/gestio-empreses/pipeline-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { PIPELINE_STAGES, PipelineStage } from './pipeline-utils'
import { PIPELINE_PHASES, PhaseId } from './pipeline-utils-phases'

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
  const userType = (session.user as any).userType || 'USER'
  const isSupervisor = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNT_MANAGER'].includes(userType)
  return { user: session.user, isSupervisor }
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
    const { user, isSupervisor } = await verifyAccess()

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

    // Validar transicions permeses
    const allowedTransitions: Record<string, string[]> = {
      'NEW': ['CONTACTED', 'LOST'],
      'CONTACTED': ['NEW', 'NEGOTIATION', 'LOST'],
      'NEGOTIATION': ['CONTACTED', 'QUALIFIED', 'LOST'],
      'QUALIFIED': ['NEGOTIATION', 'PENDING_CRM', 'LOST'],
      'PENDING_CRM': ['QUALIFIED', 'CRM_APPROVED', 'CRM_REJECTED'],
      'CRM_APPROVED': ['PENDING_CRM', 'PENDING_ADMIN'],
      'CRM_REJECTED': ['PENDING_CRM', 'QUALIFIED', 'LOST'],
      'PENDING_ADMIN': ['CRM_APPROVED', 'WON', 'LOST'],
      'WON': ['PENDING_ADMIN'],
      'LOST': ['NEW', 'CONTACTED', 'NEGOTIATION'],
    }

    // Supervisors poden fer qualsevol transició
    if (!isSupervisor) {
      const allowed = allowedTransitions[lead.status] || []
      if (!allowed.includes(newStatus)) {
        return { success: false, error: `No es pot moure de ${lead.status} a ${newStatus}` }
      }
    }

    // Actualitzar lead
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
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

  let totalLeads = leads.length
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
) {
  const { user } = await verifyAccess()

  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
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

  revalidatePath('/gestio/pipeline')

  return lead
}


