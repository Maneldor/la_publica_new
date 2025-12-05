// lib/gestio-empreses/verification-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Obtenir estadístiques de verificació
 */
export async function getVerificationStats() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const slaHours = 24 // SLA de 24 hores

  const [
    pending,
    approvedToday,
    rejectedToday,
    approvedWeek,
    allPending,
  ] = await Promise.all([
    // Pendents
    prismaClient.companyLead.count({
      where: { status: 'DOCUMENTATION' },
    }),
    // Aprovats avui
    prismaClient.companyLead.count({
      where: {
        status: 'WON',
        updatedAt: { gte: todayStart },
      },
    }),
    // Rebutjats avui
    prismaClient.companyLead.count({
      where: {
        status: 'LOST',
        updatedAt: { gte: todayStart },
      },
    }),
    // Aprovats setmana
    prismaClient.companyLead.count({
      where: {
        status: 'WON',
        updatedAt: { gte: weekStart },
      },
    }),
    // Tots els pendents per calcular temps mitjà i SLA
    prismaClient.companyLead.findMany({
      where: { status: 'DOCUMENTATION' },
      select: { createdAt: true, updatedAt: true },
    }),
  ])

  // Calcular temps mitjà d'espera (en hores)
  let avgWaitTime = 0
  let slaCompliance = 100
  let outsideSLA = 0

  if (allPending.length > 0) {
    const totalHours = allPending.reduce((sum, lead) => {
      const hours = (now.getTime() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60)
      if (hours > slaHours) outsideSLA++
      return sum + hours
    }, 0)
    avgWaitTime = Math.round(totalHours / allPending.length * 10) / 10
    slaCompliance = Math.round(((allPending.length - outsideSLA) / allPending.length) * 100)
  }

  return {
    pending,
    approvedToday,
    rejectedToday,
    approvedWeek,
    avgWaitTime,
    slaCompliance,
    outsideSLA,
  }
}

/**
 * Obtenir leads pendents de verificació
 */
export async function getPendingVerificationLeads() {
  const leads = await prismaClient.companyLead.findMany({
    where: { status: 'DOCUMENTATION' },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { activities: true },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { updatedAt: 'asc' },
    ],
  })

  return leads.map((lead) => ({
    ...lead,
    waitingHours: Math.round(
      (new Date().getTime() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60)
    ),
    contacts: [{ name: lead.contactName, position: null }].filter(c => c.name),
  }))
}

/**
 * Obtenir detall complet d'un lead per preview
 */
export async function getLeadPreview(leadId: string) {
  const lead = await prismaClient.companyLead.findUnique({
    where: { id: leadId },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  })

  if (!lead) return null

  return {
    ...lead,
    contacts: [{
      id: '1',
      name: lead.contactName || 'Sense contacte',
      email: lead.email,
      phone: lead.phone,
      position: null,
      isPrimary: true
    }].filter(c => c.name !== 'Sense contacte'),
  }
}

/**
 * Aprovar un lead
 */
export async function approveLead(
  leadId: string,
  userId: string,
  notes?: string
) {
  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      status: 'WON',
      updatedAt: new Date(),
    },
  })

  // Crear activitat
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'WON',
      description: notes ? `Aprovat pel CRM: ${notes}` : 'Aprovat pel CRM',
      userId: userId,
    },
  })

  revalidatePath('/gestio/crm/verificacio')

  return lead
}

/**
 * Rebutjar un lead
 */
export async function rejectLead(
  leadId: string,
  userId: string,
  reason: string
) {
  const lead = await prismaClient.companyLead.update({
    where: { id: leadId },
    data: {
      status: 'LOST',
      updatedAt: new Date(),
    },
  })

  // Crear activitat
  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'LOST',
      description: `Rebutjat pel CRM: ${reason}`,
      userId: userId,
    },
  })

  revalidatePath('/gestio/crm/verificacio')

  return lead
}

/**
 * Aprovar múltiples leads
 */
export async function bulkApproveLeads(
  leadIds: string[],
  userId: string,
  notes?: string
) {
  await prismaClient.companyLead.updateMany({
    where: { id: { in: leadIds } },
    data: {
      status: 'WON',
      updatedAt: new Date(),
    },
  })

  // Crear activitats
  await prismaClient.leadActivity.createMany({
    data: leadIds.map((leadId) => ({
      leadId,
      type: 'WON',
      description: notes ? `Aprovat en bloc: ${notes}` : 'Aprovat en bloc pel CRM',
      userId: userId,
    })),
  })

  revalidatePath('/gestio/crm/verificacio')
}

/**
 * Rebutjar múltiples leads
 */
export async function bulkRejectLeads(
  leadIds: string[],
  userId: string,
  reason: string
) {
  await prismaClient.companyLead.updateMany({
    where: { id: { in: leadIds } },
    data: {
      status: 'LOST',
      updatedAt: new Date(),
    },
  })

  // Crear activitats
  await prismaClient.leadActivity.createMany({
    data: leadIds.map((leadId) => ({
      leadId,
      type: 'LOST',
      description: `Rebutjat en bloc: ${reason}`,
      userId: userId,
    })),
  })

  revalidatePath('/gestio/crm/verificacio')
}
/**
 * Crear leads de prova per verificació
 * NOMÉS PER DESENVOLUPAMENT
 */
export async function seedVerificationLeads(userId: string) {
  const testLeads = [
    {
      companyName: 'Tech Innovators BCN',
      sector: 'TECHNOLOGY',
      contactName: 'Maria Garcia',
      contactEmail: 'maria@techinnovators.com',
      contactPhone: '+34 612 345 678',
      estimatedRevenue: 75000,
      priority: 'HIGH',
      city: 'Barcelona',
      website: 'https://techinnovators.com',
      notes: 'Empresa interessada en el pla Enterprise. Han sol·licitat demo.',
    },
    {
      companyName: 'Marketing Solutions SL',
      sector: 'MARKETING',
      contactName: 'Joan Pérez',
      contactEmail: 'joan@marketingsolutions.es',
      contactPhone: '+34 623 456 789',
      estimatedRevenue: 35000,
      priority: 'MEDIUM',
      city: 'Madrid',
      website: 'https://marketingsolutions.es',
      notes: 'Referit per client existent. Interessats en pla Estàndard.',
    },
    {
      companyName: 'Consultoria Financera Global',
      sector: 'FINANCE',
      contactName: 'Laura Sánchez',
      contactEmail: 'laura@cfglobal.com',
      contactPhone: '+34 634 567 890',
      estimatedRevenue: 120000,
      priority: 'HIGH',
      city: 'Barcelona',
      website: 'https://cfglobal.com',
      notes: 'Gran empresa amb 200+ empleats. Molt potencial.',
    },
    {
      companyName: 'Retail Express Catalunya',
      sector: 'RETAIL',
      contactName: 'Pere Fernández',
      contactEmail: 'pere@retailexpress.cat',
      contactPhone: '+34 645 678 901',
      estimatedRevenue: 25000,
      priority: 'LOW',
      city: 'Girona',
      notes: 'Petita empresa local. Interessats en pla bàsic.',
    },
    {
      companyName: 'Logística Mediterrània',
      sector: 'LOGISTICS',
      contactName: 'Anna Martínez',
      contactEmail: 'anna@logmed.es',
      contactPhone: '+34 656 789 012',
      estimatedRevenue: 55000,
      priority: 'MEDIUM',
      city: 'Tarragona',
      website: 'https://logmed.es',
      notes: 'Empresa en expansió. Necessiten gestió de flota.',
    },
  ]

  const createdLeads = []

  for (const leadData of testLeads) {
    // Crear el lead amb estat PENDING_CRM
    const lead = await prismaClient.companyLead.create({
      data: {
        companyName: leadData.companyName,
        sector: leadData.sector,
        contactName: leadData.contactName,
        email: leadData.contactEmail,
        phone: leadData.contactPhone,
        estimatedRevenue: leadData.estimatedRevenue,
        priority: leadData.priority,
        city: leadData.city,
        website: leadData.website,
        notes: leadData.notes,
        status: 'DOCUMENTATION',
        source: 'MANUAL',
        assignedToId: userId,
        userId:userId,
        // Dates variades per simular temps d'espera diferents
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // 0-5 dies enrere
      },
    })

    // Crear algunes activitats de prova
    await prismaClient.leadActivity.createMany({
      data: [
        {
          leadId: lead.id,
          type: 'CREATED',
          description: 'Lead creat al sistema',
          userId:userId,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'STATUS_CHANGE',
          description: 'Estat canviat a Contactat',
          userId:userId,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'NOTE',
          description: 'Trucada inicial realitzada. Client interessat.',
          userId:userId,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'STATUS_CHANGE',
          description: 'Enviat a verificació CRM',
          userId:userId,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    })

    createdLeads.push(lead)
  }

  revalidatePath('/gestio/crm/verificacio')

  return createdLeads
}

/**
 * Eliminar leads de prova
 * NOMÉS PER DESENVOLUPAMENT
 */
export async function clearTestLeads() {
  // Eliminar leads creats com a prova (els que tenen PENDING_CRM i source MANUAL)
  const leadsToDelete = await prismaClient.companyLead.findMany({
    where: {
      status: 'DOCUMENTATION',
      source: 'MANUAL',
    },
    select: { id: true },
  })

  for (const lead of leadsToDelete) {
    // Eliminar activitats
    await prismaClient.leadActivity.deleteMany({
      where: { leadId: lead.id },
    })
  }

  // Eliminar leads
  await prismaClient.companyLead.deleteMany({
    where: {
      status: 'DOCUMENTATION',
      source: 'MANUAL',
    },
  })

  revalidatePath('/gestio/crm/verificacio')
}
