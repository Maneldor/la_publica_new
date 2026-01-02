// lib/gestio-empreses/actions/empreses-llista-actions.ts
'use server'

import { prismaClient as prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { notifyCompanyAssigned, getUserById } from '@/lib/notifications/notification-actions'

// ============================================
// TIPUS
// ============================================

export interface EmpresaLlista {
  id: string
  name: string
  cif: string
  email: string
  status: string
  isActive: boolean
  isVerified: boolean
  sector: string | null
  description: string | null
  logo: string | null
  currentPlanId: string | null
  currentPlan: {
    id: string
    tier: string
    nombreCorto: string | null
  } | null
  accountManagerId: string | null
  accountManager: {
    id: string
    name: string | null
    email: string
  } | null
  completionPercentage: number
  createdAt: Date
  updatedAt: Date
}

export interface EmpresaStats {
  total: number
  verificades: number
  actives: number
  pendents: number
  pendentsCompletar: number
}

export interface EmpresaFilters {
  search?: string
  status?: string[]
  planTier?: string[]
  sector?: string[]
  accountManagerId?: string
}

// ============================================
// HELPERS
// ============================================

function calculateCompletionPercentage(empresa: any): number {
  const requiredFields = [
    'name', 'cif', 'email', 'description', 'logo', 'phone', 'address', 'website', 'sector'
  ]

  let completed = 0
  requiredFields.forEach(field => {
    if (empresa[field]) completed++
  })

  return Math.round((completed / requiredFields.length) * 100)
}

async function getSessionWithRole() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: 'No autenticat', authorized: false }
  }

  const role = session.user.role as string
  const userId = session.user.id

  // Determinar nivell d'accés
  const hasFullAccess = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'].includes(role)

  return {
    authorized: true,
    userId,
    role,
    hasFullAccess
  }
}

// ============================================
// OBTENIR EMPRESES
// ============================================

// ============================================
// OBTENIR EMPRESES
// ============================================

export async function getEmpresesLlista(
  filters: EmpresaFilters = {},
  page: number = 1,
  limit: number = 50
): Promise<{
  success: boolean;
  data?: EmpresaLlista[];
  metadata?: { total: number; page: number; limit: number; totalPages: number };
  error?: string
}> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  try {
    // Construir where clause
    const where: any = {}

    // FILTRE AUTOMÀTIC SEGONS ROL
    if (!session.hasFullAccess) {
      // Gestors només veuen les seves empreses assignades
      where.accountManagerId = session.userId
    }

    // Filtres opcionals
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { cif: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { sector: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status }
    }

    if (filters.sector && filters.sector.length > 0) {
      where.sector = { in: filters.sector }
    }

    if (filters.planTier && filters.planTier.length > 0) {
      where.currentPlan = {
        tier: { in: filters.planTier }
      }
    }

    // Si admin/CRM vol filtrar per gestor específic
    if (filters.accountManagerId && session.hasFullAccess) {
      if (filters.accountManagerId === 'NULL') {
        where.accountManagerId = null
      } else {
        where.accountManagerId = filters.accountManagerId
      }
    }

    // Calcular total per paginació
    const total = await prisma.company.count({ where })

    // Calcular paginació
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    const empreses = await prisma.company.findMany({
      where,
      include: {
        currentPlan: {
          select: {
            id: true,
            tier: true,
            nombreCorto: true
          }
        },
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    })

    // Calcular percentatge de completitud per cada empresa
    const empresesAmbCompletitud = empreses.map(empresa => ({
      ...empresa,
      completionPercentage: calculateCompletionPercentage(empresa)
    }))

    return {
      success: true,
      data: empresesAmbCompletitud as EmpresaLlista[],
      metadata: {
        total,
        page,
        limit,
        totalPages
      }
    }
  } catch (error) {
    console.error('Error obtenint empreses:', error)
    return { success: false, error: 'Error obtenint empreses' }
  }
}

// ============================================
// ESTADÍSTIQUES
// ============================================

export async function getEmpresesStats(): Promise<{ success: boolean; data?: EmpresaStats; error?: string }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  try {
    const where: any = {}

    // Gestors només veuen stats de les seves empreses
    if (!session.hasFullAccess) {
      where.accountManagerId = session.userId
    }

    // Optimization: Run counts in parallel using DB aggregation where possible
    // For 'pendentsCompletar' (incomplete profile), checking all fields in DB query is complex but faster than fetching all data.
    // We check for null/empty on key fields.
    const incompleteWhere = {
      ...where,
      OR: [
        { name: null }, { name: '' },
        { cif: null }, { cif: '' },
        { email: null }, { email: '' },
        // { description: null }, // Description is text, might be heavy to check empty string? nullable is fine.
        { phone: null }, { phone: '' },
        { address: null }, { address: '' },
        { sector: null }, { sector: '' }
      ]
    }

    const [total, verificades, actives, pendents, pendentsCompletar] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.count({ where: { ...where, isVerified: true } }),
      prisma.company.count({ where: { ...where, isActive: true } }),
      prisma.company.count({ where: { ...where, status: 'PENDING' } }),
      prisma.company.count({ where: incompleteWhere })
    ])

    return {
      success: true,
      data: {
        total,
        verificades,
        actives,
        pendents,
        pendentsCompletar
      }
    }
  } catch (error) {
    console.error('Error obtenint estadístiques:', error)
    return { success: false, error: 'Error obtenint estadístiques' }
  }
}

// ============================================
// ACCIONS SOBRE EMPRESES
// ============================================

export async function toggleEmpresaVerificacio(
  empresaId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  // Només Admin i CRM poden verificar
  if (!session.hasFullAccess) {
    return { success: false, error: 'No tens permisos per verificar empreses' }
  }

  try {
    const empresa = await prisma.company.findUnique({
      where: { id: empresaId },
      select: { isVerified: true }
    })

    if (!empresa) {
      return { success: false, error: 'Empresa no trobada' }
    }

    await prisma.company.update({
      where: { id: empresaId },
      data: {
        isVerified: !empresa.isVerified,
        status: !empresa.isVerified ? 'APPROVED' : 'PENDING'
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error canviant verificació:', error)
    return { success: false, error: 'Error canviant verificació' }
  }
}

export async function toggleEmpresaActiva(
  empresaId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  // Només Admin i CRM poden activar/desactivar
  if (!session.hasFullAccess) {
    return { success: false, error: 'No tens permisos per canviar l\'estat' }
  }

  try {
    const empresa = await prisma.company.findUnique({
      where: { id: empresaId },
      select: { isActive: true }
    })

    if (!empresa) {
      return { success: false, error: 'Empresa no trobada' }
    }

    await prisma.company.update({
      where: { id: empresaId },
      data: { isActive: !empresa.isActive }
    })

    return { success: true }
  } catch (error) {
    console.error('Error canviant estat actiu:', error)
    return { success: false, error: 'Error canviant estat' }
  }
}

export async function deleteEmpresa(
  empresaId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  // Només Admin i Admin Gestió pot eliminar
  if (!['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(session.role!)) {
    return { success: false, error: 'No tens permisos per eliminar empreses' }
  }

  try {
    await prisma.company.delete({
      where: { id: empresaId }
    })

    return { success: true }
  } catch (error) {
    console.error('Error eliminant empresa:', error)
    return { success: false, error: 'Error eliminant empresa' }
  }
}

// ============================================
// OBTENIR GESTORS (per filtre)
// ============================================

export async function getGestorsPerFiltre(): Promise<{ success: boolean; data?: { id: string; name: string; email: string }[]; error?: string }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: 'No autenticat' }
  }

  if (!session.hasFullAccess) {
    // Si no tiene acceso completo, devolver lista vacía en lugar de error
    return { success: true, data: [] }
  }

  try {
    const gestors = await prisma.user.findMany({
      where: {
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: gestors }
  } catch (error) {
    console.error('Error obtenint gestors:', error)
    return { success: false, error: 'Error obtenint gestors: ' + (error as Error).message }
  }
}

// ============================================
// ASSIGNAR GESTOR
// ============================================

export async function assignarGestor(
  empresaId: string,
  gestorId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  // Només Admin i CRM poden assignar
  if (!session.hasFullAccess) {
    return { success: false, error: 'No tens permisos per assignar gestors' }
  }

  try {
    // Verificar que el gestor existeix i té rol correcte
    const gestor = await prisma.user.findUnique({
      where: { id: gestorId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!gestor) {
      return { success: false, error: 'Gestor no trobat' }
    }

    if (!gestor.role.startsWith('GESTOR_') && gestor.role !== 'CRM_COMERCIAL') {
      return { success: false, error: 'L\'usuari seleccionat no és un gestor' }
    }

    // Obtenir dades de l'empresa per la notificació
    const empresa = await prisma.company.findUnique({
      where: { id: empresaId },
      select: { id: true, name: true, accountManagerId: true, status: true }
    })

    if (!empresa) {
      return { success: false, error: 'Empresa no trobada' }
    }

    // Actualitzar l'empresa: assignar gestor i canviar stage a ASSIGNADA
    await prisma.company.update({
      where: { id: empresaId },
      data: {
        accountManagerId: gestorId,
        stage: 'ASSIGNADA',
        assignedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Obtenir qui fa l'assignació (CRM)
    const assigner = await getUserById(session.userId!)
    const assignerName = assigner?.name || 'CRM'

    // Notificar al gestor que se li ha assignat l'empresa
    try {
      await notifyCompanyAssigned(
        gestorId,
        empresaId,
        empresa.name,
        assignerName
      )
      console.log('🔔 Notificació enviada al gestor:', gestor.name, 'per empresa assignada:', empresa.name)
    } catch (notificationError) {
      console.error('Error enviant notificació d\'empresa assignada:', notificationError)
      // No falla la operació principal si hi ha error en notificacions
    }

    // Revalidar pàgines
    revalidatePath('/gestio/empreses')
    revalidatePath('/gestio/empreses/pipeline')
    revalidatePath(`/gestio/empreses/${empresaId}`)

    return { success: true }
  } catch (error) {
    console.error('Error assignant gestor:', error)
    return { success: false, error: 'Error assignant gestor' }
  }
}

// ============================================
// DESASSIGNAR GESTOR
// ============================================

export async function desassignarGestor(
  empresaId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  if (!session.hasFullAccess) {
    return { success: false, error: 'No tens permisos' }
  }

  try {
    await prisma.company.update({
      where: { id: empresaId },
      data: {
        accountManagerId: null,
        updatedAt: new Date()
      }
    })

    revalidatePath('/gestio/empreses')
    return { success: true }
  } catch (error) {
    console.error('Error desassignant gestor:', error)
    return { success: false, error: 'Error desassignant gestor' }
  }
}

// ============================================
// OBTENIR GESTORS DISPONIBLES (per assignació)
// ============================================

export async function getGestorsDisponibles(): Promise<{
  success: boolean
  data?: Array<{ id: string; name: string | null; email: string; empresesAssignades: number }>
  error?: string
}> {
  const session = await getSessionWithRole()
  if (!session.authorized) {
    return { success: false, error: session.error }
  }

  try {
    const gestors = await prisma.user.findMany({
      where: {
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
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
        name: g.name,
        email: g.email,
        empresesAssignades: g._count.managedCompanies
      }))
    }
  } catch (error) {
    console.error('Error obtenint gestors:', error)
    return { success: false, error: 'Error obtenint gestors' }
  }
}