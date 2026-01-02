// lib/gestio-empreses/actions/company-profile-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { calculateProfileCompleteness, getMissingRequiredFields } from '../company-profile-utils'
import { getCRMUserIds, createNotification } from '@/lib/notifications/notification-actions'

// Re-exportar tipus per mantenir compatibilitat
export type { CompanyProfileData, UpdateCompanyProfileInput } from '../company-profile-types'
import type { CompanyProfileData, UpdateCompanyProfileInput } from '../company-profile-types'

// ============================================
// HELPERS
// ============================================

async function getSessionWithRole() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { authorized: false, error: 'No autenticat' }
  }

  const user = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true }
  })

  if (!user) {
    return { authorized: false, error: 'Usuari no trobat' }
  }

  const role = user.role
  const isGestor = role.includes('GESTOR') || role.includes('CRM') || ['ADMIN', 'ADMIN_GESTIO', 'SUPER_ADMIN'].includes(role)

  return {
    authorized: isGestor,
    userId: user.id,
    userName: user.name,
    role,
    error: isGestor ? undefined : 'No tens permisos'
  }
}

// ============================================
// ACCIONS
// ============================================

/**
 * Obtenir dades del perfil d'una empresa per editar
 */
export async function getCompanyProfile(companyId: string): Promise<{
  success: boolean
  data?: CompanyProfileData
  error?: string
}> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  try {
    const company = await prismaClient.company.findUnique({
      where: { id: companyId },
      include: {
        currentPlan: {
          select: { id: true, nombre: true, nombreCorto: true }
        },
        accountManager: {
          select: { id: true, name: true }
        }
      }
    })

    if (!company) {
      return { success: false, error: 'Empresa no trobada' }
    }

    // Verificar que el gestor té accés a aquesta empresa
    const role = session.role!
    if (role.includes('GESTOR') && company.accountManagerId !== session.userId) {
      return { success: false, error: 'No tens accés a aquesta empresa' }
    }

    const data: CompanyProfileData = {
      id: company.id,
      name: company.name,
      cif: company.cif,
      email: company.email,
      phone: company.phone,
      website: company.website,
      sector: company.sector,
      description: company.description,
      employeeCount: company.employeeCount,
      foundingYear: company.foundingYear,
      address: company.address,
      status: company.status,
      stage: company.stage,
      currentPlanId: company.currentPlanId,
      currentPlan: company.currentPlan ? {
        id: company.currentPlan.id,
        name: company.currentPlan.nombre,
        nombreCorto: company.currentPlan.nombreCorto
      } : null,
      slogan: company.slogan,
      logo: company.logo,
      coverImage: company.coverImage,
      adminContactPerson: company.adminContactPerson,
      adminPhone: company.adminPhone,
      adminEmail: company.adminEmail,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      contactPerson: company.contactPerson,
      whatsappNumber: company.whatsappNumber,
      workingHours: company.workingHours,
      size: company.size,
      services: company.services || [],
      specializations: company.specializations || [],
      collaborationType: company.collaborationType,
      averageBudget: company.averageBudget,
      gallery: company.gallery || [],
      brandColors: company.brandColors as any,
      socialMedia: company.socialMedia as any,
      certifications: company.certifications as any,
      profileCompleteness: company.profileCompleteness,
      profileCompletedAt: company.profileCompletedAt,
      accountManagerId: company.accountManagerId,
      accountManager: company.accountManager,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error obtenint perfil empresa:', error)
    return { success: false, error: 'Error obtenint dades' }
  }
}

/**
 * Actualitzar perfil empresa
 */
export async function updateCompanyProfile(
  companyId: string,
  input: UpdateCompanyProfileInput
): Promise<{ success: boolean; error?: string; completeness?: number }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  try {
    // Verificar que l'empresa existeix
    const company = await prismaClient.company.findUnique({
      where: { id: companyId },
      select: { id: true, accountManagerId: true, stage: true }
    })

    if (!company) {
      return { success: false, error: 'Empresa no trobada' }
    }

    // Verificar accés
    const role = session.role!
    if (role.includes('GESTOR') && company.accountManagerId !== session.userId) {
      return { success: false, error: 'No tens accés a aquesta empresa' }
    }

    // Preparar dades per actualitzar
    const updateData: any = {
      updatedAt: new Date()
    }

    // Afegir només els camps que venen a l'input
    if (input.slogan !== undefined) updateData.slogan = input.slogan
    if (input.logo !== undefined) updateData.logo = input.logo
    if (input.coverImage !== undefined) updateData.coverImage = input.coverImage
    if (input.adminContactPerson !== undefined) updateData.adminContactPerson = input.adminContactPerson
    if (input.adminPhone !== undefined) updateData.adminPhone = input.adminPhone
    if (input.adminEmail !== undefined) updateData.adminEmail = input.adminEmail
    if (input.description !== undefined) updateData.description = input.description
    if (input.contactEmail !== undefined) updateData.contactEmail = input.contactEmail
    if (input.contactPhone !== undefined) updateData.contactPhone = input.contactPhone
    if (input.contactPerson !== undefined) updateData.contactPerson = input.contactPerson
    if (input.whatsappNumber !== undefined) updateData.whatsappNumber = input.whatsappNumber
    if (input.workingHours !== undefined) updateData.workingHours = input.workingHours
    if (input.size !== undefined) updateData.size = input.size
    if (input.foundingYear !== undefined) updateData.foundingYear = input.foundingYear
    if (input.services !== undefined) updateData.services = input.services
    if (input.specializations !== undefined) updateData.specializations = input.specializations
    if (input.collaborationType !== undefined) updateData.collaborationType = input.collaborationType
    if (input.averageBudget !== undefined) updateData.averageBudget = input.averageBudget
    if (input.gallery !== undefined) updateData.gallery = input.gallery
    if (input.brandColors !== undefined) updateData.brandColors = input.brandColors
    if (input.socialMedia !== undefined) updateData.socialMedia = input.socialMedia
    if (input.certifications !== undefined) updateData.certifications = input.certifications

    // Actualitzar empresa
    const updated = await prismaClient.company.update({
      where: { id: companyId },
      data: updateData
    })

    // Calcular completitud
    const completeness = calculateProfileCompleteness(updated as any)
    await prismaClient.company.update({
      where: { id: companyId },
      data: { profileCompleteness: completeness }
    })

    // Si l'empresa està en ASSIGNADA i es comença a treballar, passar a ONBOARDING
    if (company.stage === 'ASSIGNADA') {
      await prismaClient.company.update({
        where: { id: companyId },
        data: { stage: 'ONBOARDING' }
      })
    }

    revalidatePath('/gestio/empreses')
    revalidatePath('/gestio/empreses/pipeline')
    revalidatePath(`/gestio/empreses/${companyId}`)

    return { success: true, completeness }
  } catch (error) {
    console.error('Error actualitzant perfil empresa:', error)
    return { success: false, error: 'Error actualitzant dades' }
  }
}

/**
 * Enviar empresa a CRM per verificació i publicació
 */
export async function sendToCrmVerification(companyId: string): Promise<{
  success: boolean
  error?: string
}> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  try {
    // Obtenir empresa
    const company = await prismaClient.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return { success: false, error: 'Empresa no trobada' }
    }

    // Verificar accés
    const role = session.role!
    if (role.includes('GESTOR') && company.accountManagerId !== session.userId) {
      return { success: false, error: 'No tens accés a aquesta empresa' }
    }

    // Verificar camps obligatoris
    const missingFields = getMissingRequiredFields(company as any)
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Falten camps obligatoris: ${missingFields.join(', ')}`
      }
    }

    // Actualitzar empresa - passar a PENDENT_CRM per a verificació
    await prismaClient.company.update({
      where: { id: companyId },
      data: {
        stage: 'PENDENT_CRM',
        profileCompletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Crear notificació per a tots els usuaris CRM
    const crmUserIds = await getCRMUserIds()
    const gestorName = session.userName || 'Un gestor'

    for (const crmUserId of crmUserIds) {
      await createNotification({
        userId: crmUserId,
        type: 'COMPANY_PROFILE_COMPLETED',
        title: 'Empresa pendent de verificació',
        message: `${gestorName} ha enviat l'empresa "${company.name}" per a verificació i publicació.`,
        link: `/gestio/crm/verificacio?highlight=${companyId}`,
        companyId,
        metadata: {
          companyId,
          companyName: company.name,
          gestorName,
          gestorId: session.userId
        }
      })
    }

    console.log(`✅ Notificacions enviades a ${crmUserIds.length} usuaris CRM per empresa ${company.name}`)

    revalidatePath('/gestio/empreses')
    revalidatePath('/gestio/empreses/pipeline')
    revalidatePath('/gestio/crm/verificacio')
    revalidatePath(`/gestio/empreses/${companyId}`)

    return { success: true }
  } catch (error) {
    console.error('Error enviant a CRM:', error)
    return { success: false, error: 'Error enviant a CRM per verificació' }
  }
}

/**
 * Obtenir llista de gestors disponibles per assignar
 */
export async function getAvailableGestors(): Promise<{
  success: boolean
  data?: { id: string; name: string; role: string; empresesAssignades: number }[]
  error?: string
}> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  try {
    const gestors = await prismaClient.user.findMany({
      where: {
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        role: true,
        _count: {
          select: { managedCompanies: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return {
      success: true,
      data: gestors.map(g => ({
        id: g.id,
        name: g.name || 'Sense nom',
        role: g.role,
        empresesAssignades: g._count.managedCompanies
      }))
    }
  } catch (error) {
    console.error('Error obtenint gestors:', error)
    return { success: false, error: 'Error obtenint gestors' }
  }
}
