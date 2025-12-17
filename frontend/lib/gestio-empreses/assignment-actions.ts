// lib/gestio-empreses/assignment-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { notifyLeadAssigned } from '@/lib/notifications/notification-actions'

const MAX_LEADS_PER_GESTOR = 10 // Màxim leads per gestor (configurable)

/**
 * Obtenir gestors comercials amb les seves càrregues
 */
export async function getGestorsWithWorkload() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const gestors = await prismaClient.user.findMany({
    where: {
      role: {
        in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL'],
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userType: true,
      role: true,
      _count: {
        select: {
          assignedLeads: {
            where: {
              status: {
                notIn: ['WON', 'LOST'],
              },
            },
          },
          managedCompanies: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Filtrar para mostrar solo un usuario por rol (el primero)
  const seenRoles = new Set<string>()
  const uniqueGestors = gestors.filter(g => {
    if (seenRoles.has(g.role)) {
      return false
    }
    seenRoles.add(g.role)
    return true
  })

  return uniqueGestors.map((g) => ({
    id: g.id,
    name: formatGestorName(g.role, g.name, g.email),
    email: g.email,
    image: g.image,
    role: g.role,
    activeLeads: g._count.assignedLeads,
    activeCompanies: g._count.managedCompanies,
  }))
}

/**
 * Obtenir leads sense assignar o reassignables
 */
export async function getUnassignedLeads() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  return prismaClient.companyLead.findMany({
    where: {
      assignedToId: null,
      status: {
        notIn: ['WON', 'LOST'],
      },
    },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      status: true,
      priority: true,
      estimatedRevenue: true,
      companySize: true,
      sector: true,
      createdAt: true,
      assignedTo: {
        select: { id: true, name: true },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
  })
}

/**
 * Obtenir leads d'un gestor específic
 */
export async function getLeadsByGestor(gestorId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  return prismaClient.companyLead.findMany({
    where: {
      assignedToId: gestorId,
      status: {
        notIn: ['WON', 'LOST'],
      },
    },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      status: true,
      priority: true,
      estimatedRevenue: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Assignar lead a un gestor
 */
export async function assignLeadToGestor(
  leadId: string,
  gestorId: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Verificar permisos - solo admin, admin_gestio, CRM_COMERCIAL y roles superiores pueden asignar
  if (!['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN', 'CRM_COMERCIAL'].includes(session.user.role)) {
    throw new Error('No tens permisos per assignar leads')
  }

  const assignedById = session.user.id

  // Obtenir el rol del gestor per determinar el nou stage
  const gestor = await prismaClient.user.findUnique({
    where: { id: gestorId },
    select: { role: true }
  })

  // Determinar el nou stage segons el rol del gestor
  let newStage = 'ASSIGNAT' // Per defecte per GESTOR_*
  if (gestor?.role) {
    if (gestor.role.includes('CRM')) {
      newStage = 'PER_VERIFICAR'
    } else if (['ADMIN_GESTIO', 'ADMIN', 'SUPER_ADMIN'].includes(gestor.role)) {
      newStage = 'PRE_CONTRACTE'
    }
  }

  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      assignedToId: gestorId,
      assignedAt: new Date(),
      stage: newStage,
      updatedAt: new Date(),
    },
    include: {
      assignedTo: {
        select: { name: true, email: true }
      }
    }
  })

  // Crear activitat d'assignació
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'ASSIGNMENT',
      description: 'Lead assignat a nou gestor',
      userId: assignedById,
    },
  })

  // Enviar notificació al gestor assignat
  if (lead.assignedTo) {
    await notifyLeadAssigned(
      gestorId,
      leadId,
      lead.companyName,
      assignedById
    )
  }

  revalidatePath('/gestio/crm/assignacions')
  revalidatePath('/gestio/leads')
  revalidatePath('/gestio/pipeline')

  return lead
}

/**
 * Reassignar múltiples leads
 */
export async function bulkReassignLeads(
  leadIds: string[],
  newGestorId: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const results = await Promise.all(
    leadIds.map((leadId) => assignLeadToGestor(leadId, newGestorId))
  )

  return results
}

/**
 * Autoassignar leads segons criteris
 */
export async function autoAssignLeads() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Verificar permisos - solo admin, admin_gestio y roles superiores pueden auto-asignar
  if (!['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('No tens permisos per auto-assignar leads')
  }

  const assignedById = session.user.id

  // Obtenir leads sense assignar
  const unassignedLeads = await prismaClient.companyLead.findMany({
    where: {
      assignedToId: null,
      status: 'NEW',
    },
    select: {
      id: true,
      companySize: true,
      estimatedRevenue: true,
    },
  })

  // Obtenir gestors amb capacitat
  const gestors = await getGestorsWithWorkload()

  const assignments: { leadId: string; gestorId: string }[] = []

  for (const lead of unassignedLeads) {
    // Determinar segment segons empleats i valor
    let targetRole = 'EMPLOYEE'
    const revenue = lead.estimatedRevenue ? Number(lead.estimatedRevenue) : 0

    if (lead.companySize === '200+' || revenue > 100000) {
      targetRole = 'ADMIN'
    } else if (lead.companySize === '50-200' || revenue > 50000) {
      targetRole = 'ACCOUNT_MANAGER'
    }

    // Trobar gestor amb menys càrrega del segment
    const eligibleGestors = gestors
      .filter((g) => g.role === targetRole || g.role === 'ADMIN')
      .sort((a, b) => a.activeLeads - b.activeLeads)

    if (eligibleGestors.length > 0) {
      assignments.push({
        leadId: lead.id,
        gestorId: eligibleGestors[0].id,
      })
      // Incrementar comptador local
      eligibleGestors[0].activeLeads++
    }
  }

  // Executar assignacions
  for (const { leadId, gestorId } of assignments) {
    await assignLeadToGestor(leadId, gestorId)
  }

  return {
    assigned: assignments.length,
    total: unassignedLeads.length,
  }
}

/**
 * Redistribuir leads d'un gestor inactiu
 */
export async function redistributeFromGestor(fromGestorId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const leads = await prismaClient.companyLead.findMany({
    where: {
      assignedToId: fromGestorId,
      status: {
        notIn: ['WON', 'LOST'],
      },
    },
    select: { id: true },
  })

  // Desassignar tots
  await prismaClient.companyLead.updateMany({
    where: {
      id: { in: leads.map((l) => l.id) },
    },
    data: {
      assignedToId: null,
    },
  })

  // Reassignar automàticament
  const result = await autoAssignLeads()

  revalidatePath('/gestio/crm/assignacions')

  return {
    redistributed: leads.length,
    ...result,
  }
}

/**
 * Obtenir estadístiques d'assignació
 */
export async function getAssignmentStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const [
    totalLeads,
    unassignedLeads,
    gestorsWithLeads,
    reassignedToday,
  ] = await Promise.all([
    // Total leads actius
    prismaClient.companyLead.count({
      where: { status: { notIn: ['WON', 'LOST'] } },
    }),
    // Leads sense assignar
    prismaClient.companyLead.count({
      where: {
        assignedToId: null,
        status: { notIn: ['WON', 'LOST'] },
      },
    }),
    // Gestors amb leads
    prismaClient.user.findMany({
      where: {
        role: { in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'] },
        isActive: true,
      },
      select: {
        id: true,
        _count: { select: { assignedLeads: true } },
      },
    }),
    // Reassignats avui
    prismaClient.leadActivity.count({
      where: {
        type: 'ASSIGNMENT',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ])

  const activeGestors = gestorsWithLeads.length
  const totalAssigned = gestorsWithLeads.reduce((sum, g) => sum + g._count.assignedLeads, 0)
  const avgPerGestor = activeGestors > 0 ? Math.round((totalAssigned / activeGestors) * 10) / 10 : 0
  const teamLoad = activeGestors > 0
    ? Math.round((totalAssigned / (activeGestors * MAX_LEADS_PER_GESTOR)) * 100)
    : 0

  return {
    totalLeads,
    unassignedLeads,
    teamLoad: Math.min(teamLoad, 100),
    avgPerGestor,
    reassignedToday,
    maxPerGestor: MAX_LEADS_PER_GESTOR,
  }
}

/**
 * Formatear nombre de gestor según rol
 */
function formatGestorName(role: string, name: string | null, email: string): string {
  const roleLabels: Record<string, string> = {
    'GESTOR_ESTANDARD': 'Gestor Estàndard',
    'GESTOR_ESTRATEGIC': 'Gestor Estratègic',
    'GESTOR_ENTERPRISE': 'Gestor Enterprise',
    'CRM_COMERCIAL': 'CRM Comercial'
  }

  return roleLabels[role] || email
}

/**
 * Obtenir gestors amb estadístiques detallades
 */
export async function getGestorsWithStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const gestors = await prismaClient.user.findMany({
    where: {
      role: { in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL'] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userType: true,
      role: true,
      assignedLeads: {
        where: { status: { notIn: ['LOST'] } },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          estimatedRevenue: true,
          priority: true,
          status: true,
          createdAt: true,
        },
        orderBy: [
          { priority: 'desc' },
          { updatedAt: 'desc' },
        ],
      },
      _count: {
        select: {
          assignedLeads: {
            where: { status: 'WON' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Filtrar para mostrar solo un usuario por rol (el primero)
  const seenRoles = new Set<string>()
  const uniqueGestors = gestors.filter(gestor => {
    if (seenRoles.has(gestor.role)) {
      return false
    }
    seenRoles.add(gestor.role)
    return true
  })

  return uniqueGestors.map((gestor) => {
    const activeLeads = gestor.assignedLeads.filter((l) => l.status !== 'WON')
    const pipeline = activeLeads.reduce((sum, l) => sum + (l.estimatedRevenue || 0), 0)
    const load = Math.round((activeLeads.length / MAX_LEADS_PER_GESTOR) * 100)

    return {
      id: gestor.id,
      name: formatGestorName(gestor.role, gestor.name, gestor.email),
      email: gestor.email,
      image: gestor.image,
      role: gestor.role,
      leads: gestor.assignedLeads,
      activeLeadsCount: activeLeads.length,
      wonCount: gestor._count.assignedLeads,
      pipeline,
      load: Math.min(load, 100),
      maxLeads: MAX_LEADS_PER_GESTOR,
    }
  })
}

/**
 * Assignar múltiples leads a un gestor
 */
export async function assignLeadsToGestor(
  leadIds: string[],
  gestorId: string,
  assignedById: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Verificar permisos - solo admin, admin_gestio, CRM_COMERCIAL y roles superiores pueden asignar
  if (!['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN', 'CRM_COMERCIAL'].includes(session.user.role)) {
    throw new Error('No tens permisos per assignar leads')
  }

  // Obtener información de los leads antes de la asignación
  const leadsToAssign = await prismaClient.companyLead.findMany({
    where: { id: { in: leadIds } },
    select: { id: true, companyName: true }
  })

  // Obtenir el rol del gestor per determinar el nou stage
  const gestor = await prismaClient.user.findUnique({
    where: { id: gestorId },
    select: { role: true }
  })

  // Determinar el nou stage segons el rol del gestor
  let newStage = 'ASSIGNAT' // Per defecte per GESTOR_*
  if (gestor?.role) {
    if (gestor.role.includes('CRM')) {
      newStage = 'PER_VERIFICAR'
    } else if (['ADMIN_GESTIO', 'ADMIN', 'SUPER_ADMIN'].includes(gestor.role)) {
      newStage = 'PRE_CONTRACTE'
    }
  }

  await prismaClient.companyLead.updateMany({
    where: { id: { in: leadIds } },
    data: {
      assignedToId: gestorId,
      assignedAt: new Date(),
      stage: newStage,
    },
  })

  // Crear activitats
  await prismaClient.leadActivity.createMany({
    data: leadIds.map((leadId) => ({
      leadId,
      type: 'ASSIGNMENT',
      description: 'Lead assignat a gestor',
      userId: assignedById,
    })),
  })

  // Enviar notificaciones por cada lead asignado
  for (const lead of leadsToAssign) {
    await notifyLeadAssigned(
      gestorId,
      lead.id,
      lead.companyName,
      assignedById
    )
  }

  revalidatePath('/gestio/crm/assignacions')
  revalidatePath('/gestio/leads')
}

/**
 * Reassignar lead a un altre gestor
 */
export async function reassignLead(
  leadId: string,
  newGestorId: string,
  reassignedById: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Verificar permisos - solo admin, admin_gestio y roles superiores pueden reassignar
  if (!['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('No tens permisos per reassignar leads')
  }

  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: { assignedToId: newGestorId },
  })

  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'ASSIGNMENT',
      description: 'Lead reassignat a un altre gestor',
      userId: reassignedById,
    },
  })

  revalidatePath('/gestio/crm/assignacions')

  return lead
}

/**
 * Desassignar lead
 */
export async function unassignLead(leadId: string, unassignedById: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  await prismaClient.companyLead.update({
    where: { id: leadId },
    data: { assignedToId: null },
  })

  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'ASSIGNMENT',
      description: 'Lead desassignat',
      userId: unassignedById,
    },
  })

  revalidatePath('/gestio/crm/assignacions')
}