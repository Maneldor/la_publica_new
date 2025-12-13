// lib/gestio-empreses/actions/empresa-completar-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ============================================
// TIPUS
// ============================================

export interface EmpresaCompletarData {
  // Dades bàsiques (ja existents, editables)
  id: string
  name: string
  cif: string
  email: string
  currentPlanId: string | null
  currentPlan: {
    id: string
    tier: string
    nombreCorto: string | null
  } | null
  status: string

  // Dades obligatòries
  slogan: string | null
  description: string | null
  logo: string | null
  coverImage: string | null

  // Contacte administratiu
  adminContactPerson: string | null
  adminPhone: string | null
  adminEmail: string | null
  companyPhone: string | null
  companyEmail: string | null

  // Contacte públic
  publicPhone: string | null
  publicEmail: string | null
  contactPerson: string | null
  whatsappNumber: string | null
  website: string | null
  address: string | null
  workingHours: string | null

  // Informació ampliada
  sector: string | null
  size: string | null
  yearEstablished: number | null
  employeeCount: string | null
  location: string | null
  services: string[]
  specializations: string[]
  collaborationType: string | null
  averageBudget: string | null

  // Branding i xarxes
  gallery: string[]
  brandColors: any | null
  socialMediaLinkedIn: string | null
  socialMediaFacebook: string | null
  socialMediaInstagram: string | null
  socialMediaTwitter: string | null
  certifications: string[]

  // Configuració
  isActive: boolean

  // Metadata
  assignedToId: string | null
  assignedTo: { id: string; name: string | null; email: string } | null
  completionPercentage: number
  createdAt: Date
  updatedAt: Date

  // Camps de formulari (no persistits o persistits parcialment)
  acceptsTerms?: boolean
  acceptsDataProcessing?: boolean
  isPubliclyVisible?: boolean
  allowDirectContact?: boolean
}

// ============================================
// HELPERS
// ============================================

async function checkAccess(empresaId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: 'No autenticat', authorized: false }
  }

  const role = session.user.role as string
  const userId = session.user.id

  // Admin i CRM_COMERCIAL poden accedir a tot
  if (['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'].includes(role)) {
    return { authorized: true, userId, role }
  }

  // Gestors només poden accedir a empreses assignades
  if (role.startsWith('GESTOR_')) {
    const empresa = await prismaClient.company.findUnique({
      where: { id: empresaId },
      select: { assignedToId: true }
    })

    if (empresa?.assignedToId !== userId) {
      return { error: 'No tens accés a aquesta empresa', authorized: false }
    }

    return { authorized: true, userId, role }
  }

  return { error: 'No tens permisos', authorized: false }
}

function calculateCompletionPercentage(empresa: any): number {
  const requiredFields = [
    'name', 'cif', 'email', 'slogan', 'description',
    'logo', 'coverImage', 'adminContactPerson', 'adminPhone', 'adminEmail'
  ]

  const optionalFields = [
    'publicPhone', 'publicEmail', 'contactPerson', 'website', 'address',
    'sector', 'yearEstablished', 'employeeCount', 'location',
    'socialMediaLinkedIn', 'socialMediaFacebook'
  ]

  let completed = 0
  let total = requiredFields.length + optionalFields.length

  requiredFields.forEach(field => {
    if (empresa[field]) completed++
  })

  optionalFields.forEach(field => {
    if (empresa[field]) completed++
  })

  // Arrays
  if (empresa.services?.length > 0) completed++
  if (empresa.gallery?.length > 0) completed++
  total += 2

  return Math.round((completed / total) * 100)
}

// ============================================
// OBTENIR EMPRESA
// ============================================

export async function getEmpresaPerCompletar(
  empresaId: string
): Promise<{ success: boolean; data?: EmpresaCompletarData; error?: string }> {
  const access = await checkAccess(empresaId)
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    const empresa = await prismaClient.company.findUnique({
      where: { id: empresaId },
      include: {
        accountManager: {
          select: { id: true, name: true, email: true }
        },
        currentPlan: {
          select: {
            id: true,
            tier: true,
            nombreCorto: true
          }
        }
      }
    })

    if (!empresa) {
      return { success: false, error: 'Empresa no trobada' }
    }

    const completionPercentage = calculateCompletionPercentage(empresa)

    return {
      success: true,
      data: {
        ...empresa,
        services: empresa.services || [],
        specializations: empresa.specializations || [],
        gallery: empresa.gallery || [],
        certifications: empresa.certifications || [],
        completionPercentage
      } as EmpresaCompletarData
    }
  } catch (error) {
    console.error('Error obtenint empresa:', error)
    return { success: false, error: 'Error obtenint empresa' }
  }
}

// ============================================
// ACTUALITZAR EMPRESA (PER STEP)
// ============================================

export async function updateEmpresaStep(
  empresaId: string,
  step: number,
  data: Partial<EmpresaCompletarData>
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAccess(empresaId)
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    // Filtrar només els camps permesos per cada step
    let updateData: any = {}

    switch (step) {
      case 1: // Dades bàsiques
        updateData = {
          name: data.name,
          cif: data.cif,
          email: data.email,
          currentPlanId: data.currentPlanId || null // Convertir string buida a null
        }
        break

      case 2: // Dades obligatòries
        updateData = {
          slogan: data.slogan,
          description: data.description,
          logo: data.logo,
          coverImage: data.coverImage
        }
        break

      case 3: // Contacte administratiu
        updateData = {
          adminContactPerson: data.adminContactPerson,
          adminPhone: data.adminPhone,
          adminEmail: data.adminEmail,
          companyPhone: data.companyPhone,
          companyEmail: data.companyEmail
        }
        break

      case 4: // Contacte públic
        updateData = {
          publicPhone: data.publicPhone,
          publicEmail: data.publicEmail,
          contactPerson: data.contactPerson,
          whatsappNumber: data.whatsappNumber,
          website: data.website,
          address: data.address,
          workingHours: data.workingHours
        }
        break

      case 5: // Informació ampliada
        updateData = {
          sector: data.sector,
          size: data.size,
          yearEstablished: data.yearEstablished,
          employeeCount: data.employeeCount,
          location: data.location,
          services: data.services,
          specializations: data.specializations,
          collaborationType: data.collaborationType,
          averageBudget: data.averageBudget
        }
        break

      case 6: // Branding i xarxes
        updateData = {
          gallery: data.gallery,
          brandColors: data.brandColors,
          socialMediaLinkedIn: data.socialMediaLinkedIn,
          socialMediaFacebook: data.socialMediaFacebook,
          socialMediaInstagram: data.socialMediaInstagram,
          socialMediaTwitter: data.socialMediaTwitter,
          certifications: data.certifications
        }
        break

      case 7: // Configuració (només admin/CRM)
        if (['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'].includes(access.role!)) {
          updateData = {
            status: data.status,
            isActive: data.isActive
          }
        }
        break
    }

    // Eliminar camps undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key]
    })

    await prismaClient.company.update({
      where: { id: empresaId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    revalidatePath(`/gestio/empreses/${empresaId}/completar`)
    revalidatePath('/gestio/empreses')

    return { success: true }
  } catch (error) {
    console.error('Error actualitzant empresa:', error)
    console.error('Step:', step)
    console.error('Data enviada:', JSON.stringify(data, null, 2))

    const errorMessage = error instanceof Error ? error.message : 'Error desconegut'
    return { success: false, error: `Error actualitzant empresa: ${errorMessage}` }
  }
}

// ============================================
// FINALITZAR I ENVIAR A VERIFICACIÓ
// ============================================

export async function enviarAVerificacio(
  empresaId: string
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAccess(empresaId)
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    const empresa = await prismaClient.company.findUnique({
      where: { id: empresaId }
    })

    if (!empresa) {
      return { success: false, error: 'Empresa no trobada' }
    }

    // Verificar camps obligatoris
    const requiredFields = ['name', 'cif', 'email', 'slogan', 'description', 'logo', 'coverImage']
    const missingFields = requiredFields.filter(field => !(empresa as any)[field])

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Falten camps obligatoris: ${missingFields.join(', ')}`
      }
    }

    await prismaClient.company.update({
      where: { id: empresaId },
      data: {
        status: 'PENDING_VERIFICATION',
        updatedAt: new Date()
      }
    })

    revalidatePath(`/gestio/empreses/${empresaId}`)
    revalidatePath('/gestio/empreses')

    return { success: true }
  } catch (error) {
    console.error('Error enviant a verificació:', error)
    return { success: false, error: 'Error enviant a verificació' }
  }
}

// ============================================
// UPLOAD IMATGES (placeholder - implementar amb el teu sistema)
// ============================================

export async function uploadEmpresaImage(
  empresaId: string,
  file: FormData,
  type: 'logo' | 'cover' | 'gallery'
): Promise<{ success: boolean; url?: string; error?: string }> {
  const access = await checkAccess(empresaId)
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    // TODO: Implementar upload real amb el teu sistema (S3, Cloudinary, etc.)
    // Per ara retornem un placeholder
    const url = `/uploads/empreses/${empresaId}/${type}-${Date.now()}.jpg`

    return { success: true, url }
  } catch (error) {
    console.error('Error pujant imatge:', error)
    return { success: false, error: 'Error pujant imatge' }
  }
}