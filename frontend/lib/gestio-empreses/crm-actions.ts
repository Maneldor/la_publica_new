// lib/gestio-empreses/crm-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * Obtenir leads pendents de verificació CRM
 */
export async function getPendingVerificationLeads() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const leads = await prismaClient.companyLead.findMany({
    where: {
      status: 'DOCUMENTATION',
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
  })

  return leads
}

/**
 * Obtenir detall complet d'un lead per verificació
 */
export async function getLeadForVerification(leadId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const lead = await prismaClient.companyLead.findUnique({
    where: { id: leadId },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  })

  return lead
}

/**
 * Aprovar lead - passa a PENDING_ADMIN
 */
export async function approveLead(
  leadId: string,
  notes?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const approverId = session.user.id

  // Marcar com aprovat i passar directament a WON (contractat)
  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      status: 'WON',
      updatedAt: new Date(),
    },
  })

  // Crear activitat d'aprovació
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'STATUS_CHANGE',
      description: `Lead aprovat pel CRM i contractat${notes ? `: ${notes}` : ''}`,
      userId: approverId,
    },
  })

  revalidatePath('/gestio/crm/verificacio')
  revalidatePath('/gestio/pipeline')

  return lead
}

/**
 * Rebutjar lead - torna al gestor comercial
 */
export async function rejectLead(
  leadId: string,
  reason: string,
  returnToStatus: 'NEGOTIATION' | 'CONTACTED' = 'NEGOTIATION'
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const rejectorId = session.user.id

  // Retornar al estat seleccionat directament
  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      status: returnToStatus,
      updatedAt: new Date(),
    },
  })

  // Crear activitat de rebuig i retorn
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'STATUS_CHANGE',
      description: `Lead rebutjat pel CRM: ${reason}. Retornat a ${returnToStatus}`,
      userId: rejectorId,
    },
  })

  revalidatePath('/gestio/crm/verificacio')
  revalidatePath('/gestio/pipeline')

  return lead
}

/**
 * Estadístiques de verificació
 */
export async function getVerificationStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [pending, approvedToday, rejectedToday, approvedThisWeek] = await Promise.all([
    prismaClient.companyLead.count({
      where: { status: 'DOCUMENTATION' },
    }),
    prismaClient.leadActivity.count({
      where: {
        type: 'STATUS_CHANGE',
        description: { contains: 'aprovat pel CRM' },
        createdAt: { gte: today },
      },
    }),
    prismaClient.leadActivity.count({
      where: {
        type: 'STATUS_CHANGE',
        description: { contains: 'rebutjat pel CRM' },
        createdAt: { gte: today },
      },
    }),
    prismaClient.leadActivity.count({
      where: {
        type: 'STATUS_CHANGE',
        description: { contains: 'aprovat pel CRM' },
        createdAt: { gte: weekAgo },
      },
    }),
  ])

  return {
    pending,
    approvedToday,
    rejectedToday,
    approvedThisWeek,
  }
}