// lib/gestio-empreses/conversion-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getGestioSession } from './auth-helpers'

/**
 * Verificar si un lead es pot convertir
 */
export async function canConvertLead(leadId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const lead = await prismaClient.companyLead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      status: true,
      companyName: true,
      cif: true,
      email: true,
    },
  })

  if (!lead) {
    return { canConvert: false, reason: 'Lead no trobat' }
  }

  // Només es poden convertir leads guanyats
  if (lead.status !== 'WON') {
    return {
      canConvert: false,
      reason: `El lead ha d'estar guanyat. Estat actual: ${lead.status}`
    }
  }

  // Verificar si ja existeix empresa amb aquest CIF
  if (lead.cif) {
    const existingCompany = await prismaClient.company.findFirst({
      where: { cif: lead.cif },
    })
    if (existingCompany) {
      return {
        canConvert: false,
        reason: `Ja existeix una empresa amb CIF ${lead.cif}`
      }
    }
  }

  // Verificar si el lead ja ha estat convertit
  const existingCompany = await prismaClient.company.findFirst({
    where: { originalLeadId: leadId },
  })
  if (existingCompany) {
    return {
      canConvert: false,
      reason: 'Aquest lead ja ha estat convertit a empresa'
    }
  }

  return { canConvert: true, lead }
}

/**
 * Obtenir dades del lead per pre-omplir el formulari de conversió
 */
export async function getLeadForConversion(leadId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const lead = await prismaClient.companyLead.findUnique({
    where: { id: leadId },
    include: {
      contacts: true,
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return lead
}

/**
 * Convertir lead a empresa
 */
export async function convertLeadToCompany(
  leadId: string,
  conversionData: {
    planTier: string
    notes?: string
    assignToGestorId?: string
  }
) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Verificar permisos - Solo CRM, ADMIN pueden convertir
  if (!['all', 'team'].includes(session.dataAccess)) {
    throw new Error('No tienes permisos para convertir leads')
  }

  // Obtenir lead complet
  const lead = await prismaClient.companyLead.findUnique({
    where: { id: leadId },
    include: {
      contacts: true,
      assignedTo: true,
    },
  })

  if (!lead) {
    throw new Error('Lead no trobat')
  }

  if (lead.status !== 'WON') {
    throw new Error('Només es poden convertir leads guanyats')
  }

  try {
    // Crear empresa
    const company = await prismaClient.company.create({
      data: {
        name: lead.companyName,
        cif: lead.cif,
        sector: lead.sector,
        website: lead.website,
        phone: lead.phone,
        address: lead.address,
        city: lead.city,
        postalCode: lead.postalCode,
        province: lead.province,
        employees: lead.employees,
        description: lead.notes,
        status: 'PENDING', // Pendent d'aprovació per Admin
        isActive: false,
        // Assignar gestor
        accountManagerId: conversionData.assignToGestorId || lead.assignedToId,
        // Pla proposat (guardarem com a metadata fins que tinguem camp de pla)
        // Relació amb el lead original
        originalLeadId: lead.id,
      },
    })

    // Crear usuari empresa si tenim contacte principal
    const primaryContact = lead.contacts.find((c) => c.isPrimary) || lead.contacts[0]

    if (primaryContact?.email) {
      // Verificar si ja existeix usuari amb aquest email
      const existingUser = await prismaClient.user.findUnique({
        where: { email: primaryContact.email },
      })

      if (!existingUser) {
        await prismaClient.user.create({
          data: {
            email: primaryContact.email,
            name: primaryContact.firstName + ' ' + (primaryContact.lastName || ''),
            phone: primaryContact.phone,
            userType: 'EMPLOYEE',
            memberCompanyId: company.id,
            isActive: false, // S'activarà quan Admin aprovi
          },
        })
      }
    }

    // Actualitzar lead com a convertit
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        convertedAt: new Date(),
        convertedCompanyId: company.id,
        updatedAt: new Date(),
      },
    })

    // Crear activitat al lead
    await prismaClient.leadActivity.create({
      data: {
        leadId: leadId,
        userId: session.userId,
        type: 'CONVERSION',
        description: `Lead convertit a empresa: ${company.name}`,
        metadata: {
          companyId: company.id,
          planTier: conversionData.planTier,
          notes: conversionData.notes,
        },
      },
    })

    revalidatePath('/gestio/leads')
    revalidatePath('/gestio/empreses')

    return company
  } catch (error) {
    console.error('Error convertint lead:', error)
    throw new Error('Error al convertir el lead')
  }
}

/**
 * Obtenir plans disponibles per conversió
 */
export async function getAvailablePlans() {
  // Com no tenim taula de plans, retornem plans estàtics
  const plans = [
    {
      id: 'pioneres',
      name: 'Pioneres',
      tier: 'PIONERES',
      price: 25,
      features: ['Funcions bàsiques', 'Suport email'],
    },
    {
      id: 'estandard',
      name: 'Estàndard',
      tier: 'ESTANDARD',
      price: 50,
      features: ['Funcions avançades', 'Suport prioritari'],
    },
    {
      id: 'estrategic',
      name: 'Estratègic',
      tier: 'ESTRATEGIC',
      price: 100,
      features: ['Totes les funcions', 'Suport dedicat'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tier: 'ENTERPRISE',
      price: 200,
      features: ['Personalització', 'Account Manager'],
    },
  ]

  return plans
}