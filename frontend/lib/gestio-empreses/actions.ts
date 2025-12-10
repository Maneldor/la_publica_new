// lib/gestio-empreses/actions.ts
// FITXER NOU - Server actions per Gestió d'Empreses

'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { LeadFilters } from '@/types/gestio-empreses'
import { getDashboardStats, getLeads, getRecentLeads, getPendingTasks, getPipelineStats, getManagedCompanies } from './data'

/**
 * Verifica que l'usuari té accés al dashboard de gestió
 */
async function verifyAccess() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('No autenticat')
  }

  // Comprovar el tipus d'usuari (userType en lloc de role)
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNT_MANAGER']
  if (!session.user.userType || !allowedRoles.includes(session.user.userType)) {
    throw new Error('Accés denegat')
  }

  const isSupervisor = ['SUPER_ADMIN', 'ADMIN'].includes(session.user.userType)

  return { session, isSupervisor }
}

/**
 * Action per obtenir estadístiques del dashboard
 */
export async function fetchDashboardStats() {
  const { session, isSupervisor } = await verifyAccess()
  return getDashboardStats(session.user.id, isSupervisor)
}

/**
 * Action per obtenir leads paginats
 */
export async function fetchLeads(filters: LeadFilters = {}, page: number = 1, pageSize: number = 10) {
  const { session, isSupervisor } = await verifyAccess()
  return getLeads(session.user.id, isSupervisor, filters, page, pageSize)
}

/**
 * Action per obtenir leads recents
 */
export async function fetchRecentLeads(limit: number = 5) {
  const { session, isSupervisor } = await verifyAccess()
  return getRecentLeads(session.user.id, isSupervisor, limit)
}

/**
 * Action per obtenir tasques pendents
 */
export async function fetchPendingTasks(limit: number = 10) {
  const { session } = await verifyAccess()
  return getPendingTasks(session.user.id, limit)
}

/**
 * Action per obtenir stats del pipeline
 */
export async function fetchPipelineStats() {
  const { session, isSupervisor } = await verifyAccess()
  return getPipelineStats(session.user.id, isSupervisor)
}

/**
 * Action per obtenir empreses gestionades
 */
export async function fetchManagedCompanies(limit?: number) {
  const { session, isSupervisor } = await verifyAccess()
  return getManagedCompanies(session.user.id, isSupervisor, limit)
}

/**
 * Action per crear un nou lead
 */
export async function createLead(data: {
  companyName: string
  contactName: string
  email: string
  phone?: string
  sector?: string
  source: string
  priority?: string
  notes?: string
  estimatedRevenue?: number
  employeeCount?: string
}) {
  const { session } = await verifyAccess()

  const lead = await prismaClient.companyLead.create({
    data: {
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      sector: data.sector,
      source: data.source as any,
      priority: (data.priority || 'MEDIUM') as any,
      status: 'NEW',
      notes: data.notes,
      estimatedRevenue: data.estimatedRevenue,
      employeeCount: data.employeeCount,
      assignedToId: session.user.id,
    }
  })

  // Crear activitat
  await prismaClient.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: session.user.id,
      type: 'CREATED',
      description: `Lead creat per ${session.user.name || session.user.email}`
    }
  })

  revalidatePath('/gestor-empreses/leads')
  revalidatePath('/gestor-empreses')

  return lead
}

/**
 * Action per actualitzar l'estat d'un lead
 */
export async function updateLeadStatus(leadId: string, newStatus: string) {
  const { session } = await verifyAccess()

  // Verificar que el lead existeix i que l'usuari hi té accés
  const existingLead = await prismaClient.companyLead.findFirst({
    where: {
      id: leadId,
      // Si no és supervisor, només pot editar els seus
      ...(session.user.userType !== 'SUPER_ADMIN' && session.user.userType !== 'ADMIN'
        ? { assignedToId: session.user.id }
        : {})
    }
  })

  if (!existingLead) {
    throw new Error('Lead no trobat o sense permisos')
  }

  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      status: newStatus as any,
      stage: newStatus,  // Sincronitzar stage amb status
      lastContactDate: new Date()
    }
  })

  // Crear activitat
  await prismaClient.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: session.user.id,
      type: 'STATUS_CHANGE',
      description: `Estat canviat a ${newStatus}`
    }
  })

  revalidatePath('/gestor-empreses/leads')
  revalidatePath('/gestor-empreses/pipeline')
  revalidatePath(`/gestor-empreses/leads/${leadId}`)

  return lead
}

/**
 * Action per afegir una interacció a un lead
 */
export async function addLeadInteraction(leadId: string, data: {
  type: string
  title?: string
  description: string
  outcome?: string
  duration?: number
}) {
  const { session } = await verifyAccess()

  // Verificar accés al lead
  const existingLead = await prismaClient.companyLead.findFirst({
    where: {
      id: leadId,
      ...(session.user.userType !== 'SUPER_ADMIN' && session.user.userType !== 'ADMIN'
        ? { assignedToId: session.user.id }
        : {})
    }
  })

  if (!existingLead) {
    throw new Error('Lead no trobat o sense permisos')
  }

  const interaction = await prismaClient.leadInteraction.create({
    data: {
      leadId,
      userId: session.user.id,
      type: data.type as any,
      title: data.title,
      description: data.description,
      outcome: data.outcome,
      duration: data.duration,
    }
  })

  // Actualitzar lastContactDate del lead
  await prismaClient.companyLead.update({
    where: { id: leadId },
    data: { lastContactDate: new Date() }
  })

  // Crear activitat
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      userId: session.user.id,
      type: 'INTERACTION',
      description: `${data.type}: ${data.title || data.description.substring(0, 50)}`
    }
  })

  revalidatePath(`/gestor-empreses/leads/${leadId}`)

  return interaction
}

/**
 * Action per crear una tasca per a un lead
 */
export async function createLeadTask(leadId: string, data: {
  title: string
  description?: string
  type: string
  priority?: string
  dueDate?: Date
}) {
  const { session } = await verifyAccess()

  // Verificar accés al lead
  const existingLead = await prismaClient.companyLead.findFirst({
    where: {
      id: leadId,
      ...(session.user.userType !== 'SUPER_ADMIN' && session.user.userType !== 'ADMIN'
        ? { assignedToId: session.user.id }
        : {})
    }
  })

  if (!existingLead) {
    throw new Error('Lead no trobat o sense permisos')
  }

  const task = await prismaClient.leadTask.create({
    data: {
      leadId,
      userId: session.user.id,
      title: data.title,
      description: data.description,
      type: data.type as any,
      priority: (data.priority || 'MEDIUM') as any,
      status: 'PENDING',
      dueDate: data.dueDate,
    }
  })

  // Crear activitat
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      userId: session.user.id,
      type: 'TASK_CREATED',
      description: `Tasca creada: ${data.title}`
    }
  })

  revalidatePath(`/gestor-empreses/leads/${leadId}`)
  revalidatePath('/gestor-empreses/tasques')

  return task
}

/**
 * Action per actualitzar una tasca
 */
export async function updateTask(taskId: string, data: {
  status?: string
  title?: string
  description?: string
  dueDate?: Date
}) {
  const { session } = await verifyAccess()

  // Verificar que la tasca existeix i que l'usuari hi té accés
  const existingTask = await prismaClient.leadTask.findFirst({
    where: {
      id: taskId,
      userId: session.user.id
    }
  })

  if (!existingTask) {
    throw new Error('Tasca no trobada o sense permisos')
  }

  const task = await prismaClient.leadTask.update({
    where: { id: taskId },
    data: {
      ...(data.status && { status: data.status as any }),
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dueDate && { dueDate: data.dueDate }),
    }
  })

  // Si s'ha actualitzat l'estat, crear activitat
  if (data.status && existingTask.leadId) {
    await prismaClient.leadActivity.create({
      data: {
        leadId: existingTask.leadId,
        userId: session.user.id,
        type: 'TASK_UPDATED',
        description: `Tasca actualitzada: ${task.title} - ${data.status}`
      }
    })
  }

  revalidatePath('/gestor-empreses/tasques')
  if (existingTask.leadId) {
    revalidatePath(`/gestor-empreses/leads/${existingTask.leadId}`)
  }

  return task
}

/**
 * Action per convertir un lead en empresa
 */
export async function convertLeadToCompany(leadId: string, companyData: {
  name: string
  email: string
  cif?: string
  phone?: string
  address?: string
  website?: string
  sector?: string
  planId?: string
}) {
  const { session, isSupervisor } = await verifyAccess()

  // Només supervisors poden convertir leads
  if (!isSupervisor) {
    throw new Error('Només els supervisors poden convertir leads en empreses')
  }

  // Verificar que el lead existeix
  const lead = await prismaClient.companyLead.findUnique({
    where: { id: leadId }
  })

  if (!lead) {
    throw new Error('Lead no trobat')
  }

  // Crear l'empresa
  const company = await prismaClient.company.create({
    data: {
      name: companyData.name,
      email: companyData.email,
      cif: companyData.cif,
      phone: companyData.phone,
      address: companyData.address,
      website: companyData.website,
      sector: companyData.sector,
      currentPlanId: companyData.planId,
      status: 'PENDING',
      isActive: true,
    }
  })

  // Actualitzar el lead
  await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      status: 'WON',
      convertedToCompanyId: company.id,
      convertedAt: new Date(),
    }
  })

  // Crear activitat
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      userId: session.user.id,
      type: 'CONVERTED',
      description: `Lead convertit en empresa: ${company.name}`
    }
  })

  revalidatePath('/gestor-empreses/leads')
  revalidatePath('/gestor-empreses/empreses')
  revalidatePath(`/gestor-empreses/leads/${leadId}`)

  return company
}