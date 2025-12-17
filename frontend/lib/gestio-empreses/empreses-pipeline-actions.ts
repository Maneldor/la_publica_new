// lib/gestio-empreses/empreses-pipeline-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Tipos
export interface EmpresesPipelineColumn {
  id: string
  label: string
  stages: string[]
  filter?: Record<string, any>
  color?: string
}

export interface EmpresesPipelineItem {
  id: string
  name: string
  email?: string
  phone?: string
  cif?: string
  stage: string
  status: string
  sector?: string
  planType?: string
  createdAt: string
  updatedAt: string
  assignedAt?: string
  accountManager?: { id: string; name: string } | null
  daysInStage: number
  fromLeadId?: string
}

export interface EmpresesPipelineData {
  columns: EmpresesPipelineColumn[]
  items: Record<string, EmpresesPipelineItem[]>
  stats: {
    total: number
    byColumn: Record<string, number>
  }
}

export interface UserEmpresesPipelineData {
  user: {
    id: string
    name: string
    email: string
    role: string
    image?: string
  }
  pipeline: EmpresesPipelineData
}

export interface UnifiedEmpresesPipelineData {
  myPipeline: UserEmpresesPipelineData
  teamPipelines: UserEmpresesPipelineData[]
  availableGestors: { id: string; name: string; role: string }[]
}

// Configuración de columnas por rol
function getEmpresesColumnsForRoleInternal(role: string): EmpresesPipelineColumn[] {
  // ADMIN_GESTIO, ADMIN, SUPER_ADMIN
  if (['ADMIN_GESTIO', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return [
      {
        id: 'creades',
        label: 'Creades',
        stages: ['CREADA'],
        color: 'slate'
      },
      {
        id: 'assignades',
        label: 'Assignades',
        stages: ['ASSIGNADA', 'ONBOARDING'],
        color: 'blue'
      },
      {
        id: 'actives',
        label: 'Actives',
        stages: ['ACTIVA'],
        color: 'green'
      },
      {
        id: 'inactives',
        label: 'Inactives',
        stages: ['INACTIVA', 'SUSPESA'],
        color: 'red'
      },
    ]
  }

  // CRM_COMERCIAL, CRM_CONTINGUT
  if (role.includes('CRM')) {
    return [
      {
        id: 'per_assignar',
        label: 'Per assignar',
        stages: ['CREADA'],
        filter: { accountManagerId: null },
        color: 'slate'
      },
      {
        id: 'assignades',
        label: 'Assignades',
        stages: ['ASSIGNADA', 'ONBOARDING'],
        color: 'blue'
      },
      {
        id: 'actives',
        label: 'Actives',
        stages: ['ACTIVA'],
        color: 'green'
      },
    ]
  }

  // GESTOR_ESTANDARD, GESTOR_ESTRATEGIC, GESTOR_ENTERPRISE
  return [
    {
      id: 'onboarding',
      label: 'En onboarding',
      stages: ['ASSIGNADA', 'ONBOARDING'],
      color: 'purple'
    },
    {
      id: 'actives',
      label: 'Les meves empreses',
      stages: ['ACTIVA'],
      color: 'green'
    },
  ]
}

// Obtener items para una columna específica
async function getItemsForColumn(
  userId: string,
  role: string,
  column: EmpresesPipelineColumn
): Promise<EmpresesPipelineItem[]> {
  const now = new Date()
  const items: EmpresesPipelineItem[] = []

  // Construir filtro base
  const where: any = {
    stage: { in: column.stages }
  }

  // Aplicar filtros adicionales de la columna
  if (column.filter) {
    Object.assign(where, column.filter)
  }

  // Para gestores, solo sus empresas asignadas
  if (role.includes('GESTOR')) {
    where.accountManagerId = userId
  }

  const empresas = await prismaClient.company.findMany({
    where,
    include: {
      accountManager: { select: { id: true, name: true } },
      currentPlan: { select: { name: true } }
    },
    orderBy: [
      { updatedAt: 'desc' }
    ],
    take: 100
  })

  for (const empresa of empresas) {
    const referenceDate = empresa.assignedAt || empresa.updatedAt
    const daysInStage = Math.floor(
      (now.getTime() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    items.push({
      id: empresa.id,
      name: empresa.name,
      email: empresa.email || undefined,
      phone: empresa.phone || undefined,
      cif: empresa.cif || undefined,
      stage: empresa.stage || 'CREADA',
      status: empresa.status,
      sector: empresa.sector || undefined,
      planType: empresa.currentPlan?.name || undefined,
      createdAt: empresa.createdAt.toISOString(),
      updatedAt: empresa.updatedAt.toISOString(),
      assignedAt: empresa.assignedAt?.toISOString() || undefined,
      accountManager: empresa.accountManager ? {
        id: empresa.accountManager.id,
        name: empresa.accountManager.name || 'Sense nom'
      } : null,
      daysInStage,
      fromLeadId: empresa.fromLeadId || undefined
    })
  }

  return items
}

// Obtener pipeline de un usuario
async function getUserPipeline(
  userId: string,
  userInfo: { id: string; name: string; email: string; role: string; image?: string }
): Promise<UserEmpresesPipelineData> {
  const columns = getEmpresesColumnsForRoleInternal(userInfo.role)
  const items: Record<string, EmpresesPipelineItem[]> = {}
  const byColumn: Record<string, number> = {}
  let total = 0

  for (const column of columns) {
    const columnItems = await getItemsForColumn(userId, userInfo.role, column)
    items[column.id] = columnItems
    byColumn[column.id] = columnItems.length
    total += columnItems.length
  }

  return {
    user: userInfo,
    pipeline: {
      columns,
      items,
      stats: { total, byColumn }
    }
  }
}

// Obtener subordinados
async function getSubordinates(userId: string, role: string): Promise<{
  id: string
  name: string
  email: string
  role: string
  image?: string
}[]> {
  const result: { id: string; name: string; email: string; role: string; image?: string }[] = []

  // SUPER_ADMIN y ADMIN ven toda la jerarquía
  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    const allSubordinates = await getAllSubordinatesRecursive(userId)
    return allSubordinates
  }

  // ADMIN_GESTIO ve CRMs y Gestores
  if (role === 'ADMIN_GESTIO') {
    const subordinates = await prismaClient.user.findMany({
      where: {
        supervisorId: userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      }
    })

    for (const sub of subordinates) {
      result.push({
        id: sub.id,
        name: sub.name || 'Sense nom',
        email: sub.email,
        role: sub.role,
        image: sub.image || undefined
      })

      // También obtener subordinados de CRMs
      if (sub.role.includes('CRM')) {
        const crmSubs = await prismaClient.user.findMany({
          where: {
            supervisorId: sub.id,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        })

        for (const crmSub of crmSubs) {
          result.push({
            id: crmSub.id,
            name: crmSub.name || 'Sense nom',
            email: crmSub.email,
            role: crmSub.role,
            image: crmSub.image || undefined
          })
        }
      }
    }

    return result
  }

  // CRM ve solo sus gestores
  if (role.includes('CRM')) {
    const subordinates = await prismaClient.user.findMany({
      where: {
        supervisorId: userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      }
    })

    return subordinates.map(sub => ({
      id: sub.id,
      name: sub.name || 'Sense nom',
      email: sub.email,
      role: sub.role,
      image: sub.image || undefined
    }))
  }

  // Gestores no ven subordinados
  return []
}

async function getAllSubordinatesRecursive(userId: string): Promise<{
  id: string
  name: string
  email: string
  role: string
  image?: string
}[]> {
  const result: { id: string; name: string; email: string; role: string; image?: string }[] = []
  const visited = new Set<string>()

  async function collect(id: string) {
    if (visited.has(id)) return
    visited.add(id)

    const user = await prismaClient.user.findUnique({
      where: { id },
      include: {
        subordinates: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    })

    if (user) {
      for (const sub of user.subordinates) {
        result.push({
          id: sub.id,
          name: sub.name || 'Sense nom',
          email: sub.email,
          role: sub.role,
          image: sub.image || undefined
        })
        await collect(sub.id)
      }
    }
  }

  await collect(userId)
  return result
}

// Obtener gestores disponibles para asignar
async function getAvailableGestors(): Promise<{ id: string; name: string; role: string }[]> {
  const gestors = await prismaClient.user.findMany({
    where: {
      role: {
        in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE']
      },
      isActive: true
    },
    select: {
      id: true,
      name: true,
      role: true
    },
    orderBy: { name: 'asc' }
  })

  return gestors.map(g => ({
    id: g.id,
    name: g.name || 'Sense nom',
    role: g.role
  }))
}

// Función principal exportada
export async function getEmpresesPipelineData(
  userId: string,
  role: string
): Promise<UnifiedEmpresesPipelineData> {
  // Obtener info del usuario
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true
    }
  })

  if (!user) {
    throw new Error('Usuari no trobat')
  }

  const userInfo = {
    id: user.id,
    name: user.name || 'Sense nom',
    email: user.email,
    role: user.role,
    image: user.image || undefined
  }

  // Obtener mi pipeline
  const myPipeline = await getUserPipeline(userId, userInfo)

  // Obtener pipelines del equipo
  const subordinates = await getSubordinates(userId, role)
  const teamPipelines: UserEmpresesPipelineData[] = []

  for (const sub of subordinates) {
    const subPipeline = await getUserPipeline(sub.id, sub)
    teamPipelines.push(subPipeline)
  }

  // Obtener gestores disponibles (solo para CRM y Admin)
  let availableGestors: { id: string; name: string; role: string }[] = []
  if (['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role) || role.includes('CRM')) {
    availableGestors = await getAvailableGestors()
  }

  return {
    myPipeline,
    teamPipelines,
    availableGestors
  }
}

// Asignar empresa a gestor
export async function assignEmpresaToGestor(
  empresaId: string,
  gestorId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  const userRole = (session.user as any).role
  const canAssign = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)

  if (!canAssign) {
    return { success: false, error: 'No tens permisos per assignar empreses' }
  }

  try {
    // Verificar que el gestor existe y es válido
    const gestor = await prismaClient.user.findUnique({
      where: { id: gestorId },
      select: { id: true, name: true, role: true, isActive: true }
    })

    if (!gestor || !gestor.isActive) {
      return { success: false, error: 'Gestor no trobat o inactiu' }
    }

    if (!gestor.role.includes('GESTOR')) {
      return { success: false, error: 'L\'usuari seleccionat no és un gestor' }
    }

    // Actualizar empresa
    await prismaClient.company.update({
      where: { id: empresaId },
      data: {
        accountManagerId: gestorId,
        assignedAt: new Date(),
        stage: 'ASSIGNADA',
        updatedAt: new Date()
      }
    })

    // Crear notificación para el gestor
    await prismaClient.notification.create({
      data: {
        userId: gestorId,
        type: 'COMPANY_ASSIGNED',
        title: 'Nova empresa assignada',
        message: `S'ha assignat una nova empresa al teu compte.`,
        companyId: empresaId,
        isRead: false
      }
    })

    revalidatePath('/gestio/empreses/pipeline')
    revalidatePath('/gestio/empreses')

    return { success: true }
  } catch (error) {
    console.error('Error assignant empresa:', error)
    return { success: false, error: 'Error al assignar l\'empresa' }
  }
}

// Actualizar stage de empresa
export async function updateEmpresaStage(
  empresaId: string,
  newStage: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  const now = new Date()

  try {
    const updateData: any = {
      stage: newStage,
      updatedAt: now
    }

    // Campos adicionales según stage
    if (newStage === 'ACTIVA') {
      updateData.onboardingCompletedAt = now
      updateData.status = 'APPROVED'
      updateData.isActive = true
    } else if (newStage === 'INACTIVA' || newStage === 'SUSPESA') {
      updateData.isActive = false
    }

    await prismaClient.company.update({
      where: { id: empresaId },
      data: updateData
    })

    revalidatePath('/gestio/empreses/pipeline')
    revalidatePath('/gestio/empreses')

    return { success: true }
  } catch (error) {
    console.error('Error actualitzant stage:', error)
    return { success: false, error: 'Error al actualitzar l\'stage' }
  }
}

// Mover empresa entre columnas (drag & drop)
export async function moveEmpresaToColumn(
  empresaId: string,
  targetColumnId: string,
  gestorId?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { success: false, error: 'No autenticat' }
  }

  const userRole = (session.user as any).role
  const columns = getEmpresesColumnsForRoleInternal(userRole)
  const targetColumn = columns.find(c => c.id === targetColumnId)

  if (!targetColumn) {
    return { success: false, error: 'Columna de destí no trobada' }
  }

  const newStage = targetColumn.stages[0]

  // Si la columna requiere asignación y no hay gestor
  if (targetColumnId === 'assignades' && gestorId) {
    return assignEmpresaToGestor(empresaId, gestorId)
  }

  return updateEmpresaStage(empresaId, newStage)
}
