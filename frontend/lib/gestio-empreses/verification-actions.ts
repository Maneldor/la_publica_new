// lib/gestio-empreses/verification-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  notifyLeadVerifiedForAdmin,
  getAdminUserIds,
  notifyCompanyPublishedToGestor,
  notifyCompanyPublishedToAdmins,
  notifyCompanyOwnerPublished
} from '@/lib/notifications/notification-actions'
import { emailService } from '@/lib/email'
import { EmailTemplate } from '@prisma/client'

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
      stage: 'PENDING_ADMIN',
      updatedAt: new Date(),
    },
  })

  // Crear activitat
  // Verificar que l'usuari existeix
  const userExists = userId ? await prismaClient.user.findUnique({
    where: { id: userId },
    select: { id: true }
  }) : null

  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'WON',
      description: notes ? `Aprovat pel CRM: ${notes}` : 'Aprovat pel CRM',
      userId: userExists ? userId : null,
    },
  })

  // Obtenir qui ha verificat
  const verifier = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { name: true }
  })

  // Obtenir tots els usuaris Admin per notificar
  const adminUserIds = await getAdminUserIds()

  // Disparar notificacions als Admins
  if (adminUserIds.length > 0) {
    await notifyLeadVerifiedForAdmin(
      adminUserIds,
      leadId,
      lead.companyName,
      verifier?.name || 'CRM'
    )
    console.log('🔔 Notificacions enviades a', adminUserIds.length, 'admins per lead verificat:', leadId)
  }

  revalidatePath('/gestio/crm/verificacio')
  revalidatePath('/admin/empreses-pendents')

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
  // Verificar que l'usuari existeix
  const userExists = userId ? await prismaClient.user.findUnique({
    where: { id: userId },
    select: { id: true }
  }) : null

  await prismaClient.leadActivity.create({
    data: {
      leadId,
      type: 'LOST',
      description: `Rebutjat pel CRM: ${reason}`,
      userId: userExists ? userId : null,
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
      stage: 'PENDING_ADMIN',
      updatedAt: new Date(),
    },
  })

  // Crear activitats
  // Verificar que l'usuari existeix abans de crear les activitats
  const userExists = userId ? await prismaClient.user.findUnique({
    where: { id: userId },
    select: { id: true }
  }) : null

  await prismaClient.leadActivity.createMany({
    data: leadIds.map((leadId) => ({
      leadId,
      type: 'WON',
      description: notes ? `Aprovat en bloc: ${notes}` : 'Aprovat en bloc pel CRM',
      userId: userExists ? userId : null,
    })),
  })

  // Obtenir noms dels leads per enviar notificacions
  const approvedLeads = await prismaClient.companyLead.findMany({
    where: { id: { in: leadIds } },
    select: { id: true, companyName: true }
  })

  // Obtenir qui ha verificat
  const verifier = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { name: true }
  })

  // Obtenir tots els usuaris Admin per notificar
  const adminUserIds = await getAdminUserIds()

  // Enviar notificació per cada lead aprovat
  if (adminUserIds.length > 0) {
    for (const lead of approvedLeads) {
      await notifyLeadVerifiedForAdmin(
        adminUserIds,
        lead.id,
        lead.companyName,
        verifier?.name || 'CRM'
      )
    }
    console.log('🔔 Notificacions enviades a', adminUserIds.length, 'admins per', approvedLeads.length, 'leads verificats')
  }

  revalidatePath('/gestio/crm/verificacio')
  revalidatePath('/admin/empreses-pendents')
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
  // Verificar que l'usuari existeix abans de crear les activitats
  const userExists = userId ? await prismaClient.user.findUnique({
    where: { id: userId },
    select: { id: true }
  }) : null

  await prismaClient.leadActivity.createMany({
    data: leadIds.map((leadId) => ({
      leadId,
      type: 'LOST',
      description: `Rebutjat en bloc: ${reason}`,
      userId: userExists ? userId : null,
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
        priority: leadData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
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
    // Verificar que l'usuari existeix
    const userExists = userId ? await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true }
    }) : null

    await prismaClient.leadActivity.createMany({
      data: [
        {
          leadId: lead.id,
          type: 'CREATED',
          description: 'Lead creat al sistema',
          userId: userExists ? userId : null,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'STATUS_CHANGE',
          description: 'Estat canviat a Contactat',
          userId: userExists ? userId : null,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'NOTE',
          description: 'Trucada inicial realitzada. Client interessat.',
          userId: userExists ? userId : null,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          leadId: lead.id,
          type: 'STATUS_CHANGE',
          description: 'Enviat a verificació CRM',
          userId: userExists ? userId : null,
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

// ============================================
// FUNCIONS PER VERIFICACIÓ D'EMPRESES GESTIONADES
// ============================================

/**
 * Obtenir empreses pendents de verificació CRM (enviades per gestors)
 */
export async function getPendingVerificationCompanies() {
  const companies = await prismaClient.company.findMany({
    where: { stage: 'PENDENT_CRM' },
    include: {
      accountManager: {
        select: { id: true, name: true, email: true },
      },
      currentPlan: {
        select: { id: true, nombre: true, nombreCorto: true }
      }
    },
    orderBy: [
      { profileCompletedAt: 'asc' },
    ],
  })

  return companies.map((company) => ({
    ...company,
    waitingHours: company.profileCompletedAt
      ? Math.round((new Date().getTime() - new Date(company.profileCompletedAt).getTime()) / (1000 * 60 * 60))
      : 0,
  }))
}

/**
 * Obtenir estadístiques d'empreses pendents
 */
export async function getCompanyVerificationStats() {
  const [pending, publishedToday, publishedWeek] = await Promise.all([
    prismaClient.company.count({
      where: { stage: 'PENDENT_CRM' },
    }),
    prismaClient.company.count({
      where: {
        stage: 'ACTIVA',
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prismaClient.company.count({
      where: {
        stage: 'ACTIVA',
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  return {
    pending,
    publishedToday,
    publishedWeek,
  }
}

/**
 * Aprovar i publicar una empresa
 */
export async function approveAndPublishCompany(
  companyId: string,
  _userId?: string, // Deprecated: s'obté de la sessió
  notes?: string
) {
  // Obtenir sessió actual
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('No autenticat')
  }
  const userId = session.user.id

  // Obtenir informació de l'empresa abans d'actualitzar
  const companyBefore = await prismaClient.company.findUnique({
    where: { id: companyId },
    include: {
      currentPlan: {
        select: { nombre: true, nombreCorto: true }
      },
      accountManager: {
        select: { id: true, name: true }
      }
    }
  })

  if (!companyBefore) {
    throw new Error('Empresa no trobada')
  }

  // Actualitzar empresa a PUBLICADA
  const company = await prismaClient.company.update({
    where: { id: companyId },
    data: {
      stage: 'ACTIVA',
      status: 'PUBLISHED',
      approvedAt: new Date(),
      approvedById: userId,
      updatedAt: new Date(),
    },
  })

  // Obtenir informació del verificador
  const verifier = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { name: true }
  })
  const verifierName = verifier?.name || 'CRM'

  // ============================================
  // NOTIFICACIONS
  // ============================================

  // 1. Notificar al gestor que l'empresa ha estat publicada
  if (company.accountManagerId) {
    await notifyCompanyPublishedToGestor(
      company.accountManagerId,
      companyId,
      company.name,
      verifierName
    )
    console.log('🔔 Notificació enviada al gestor:', company.accountManagerId)
  }

  // 2. Notificar als admins
  const adminUserIds = await getAdminUserIds()
  if (adminUserIds.length > 0) {
    // Excloure el verificador de les notificacions si és admin
    const adminsToNotify = adminUserIds.filter(id => id !== userId)
    if (adminsToNotify.length > 0) {
      await notifyCompanyPublishedToAdmins(
        adminsToNotify,
        companyId,
        company.name,
        verifierName
      )
      console.log('🔔 Notificacions enviades a', adminsToNotify.length, 'admins')
    }
  }

  // 3. Notificar al representant de l'empresa (si té usuari associat)
  const companyUser = await prismaClient.user.findFirst({
    where: {
      companyId: companyId,
      role: { in: ['COMPANY_ADMIN', 'COMPANY_STAFF'] }
    },
    select: { id: true, email: true, name: true }
  })

  if (companyUser) {
    await notifyCompanyOwnerPublished(
      companyUser.id,
      companyId,
      company.name
    )
    console.log('🔔 Notificació enviada al representant de l\'empresa:', companyUser.id)
  }

  // ============================================
  // EMAIL DE FELICITACIÓ
  // ============================================

  // Enviar email de publicació a l'empresa
  const companyEmail = company.contactEmail || company.email
  if (companyEmail) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      await emailService.sendEmail({
        to: companyEmail,
        subject: `🎉 Felicitats! ${company.name} ja està publicada a La Pública`,
        template: EmailTemplate.COMPANY_PUBLISHED,
        templateProps: {
          companyName: company.name,
          contactName: company.contactPerson || company.adminContactPerson || 'Usuari',
          planName: companyBefore.currentPlan?.nombreCorto || companyBefore.currentPlan?.nombre || 'Estàndard',
          profileUrl: `${baseUrl}/dashboard/empreses/${companyId}`,
          dashboardUrl: `${baseUrl}/empresa/dashboard`
        },
        userId: companyUser?.id
      })
      console.log('📧 Email de publicació enviat a:', companyEmail)
    } catch (emailError) {
      console.error('❌ Error enviant email de publicació:', emailError)
      // No bloquegem el flux si l'email falla
    }
  }

  // Revalidar paths
  revalidatePath('/gestio/crm/verificacio')
  revalidatePath('/gestio/empreses')
  revalidatePath('/gestio/empreses/pipeline')
  revalidatePath(`/gestio/empreses/${companyId}`)
  revalidatePath('/dashboard/empreses')

  return company
}

/**
 * Rebutjar empresa i retornar al gestor
 */
export async function rejectCompanyVerification(
  companyId: string,
  userId: string,
  reason: string
) {
  const company = await prismaClient.company.update({
    where: { id: companyId },
    data: {
      stage: 'ONBOARDING',
      profileCompletedAt: null,
      updatedAt: new Date(),
    },
  })

  // Notificar al gestor que l'empresa ha estat retornada
  if (company.accountManagerId) {
    const verifier = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })

    await prismaClient.notification.create({
      data: {
        userId: company.accountManagerId,
        type: 'COMPANY_REJECTED',
        title: 'Empresa retornada per revisió',
        message: `L'empresa "${company.name}" requereix modificacions: ${reason}`,
        actionUrl: `/gestio/empreses/${companyId}`,
        companyId,
        metadata: {
          companyId,
          companyName: company.name,
          reason,
          rejectedBy: verifier?.name || 'CRM'
        }
      }
    })
  }

  revalidatePath('/gestio/crm/verificacio')
  revalidatePath('/gestio/empreses')
  revalidatePath('/gestio/empreses/pipeline')
  revalidatePath(`/gestio/empreses/${companyId}`)

  return company
}
