// lib/gestio-empreses/unified-pipeline-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Tipos
export interface PipelineColumn {
  id: string
  label: string
  stages: string[]
  type: 'lead' | 'empresa'
  filter?: Record<string, any>
  color?: string
}

export interface PipelineItem {
  id: string
  type: 'lead' | 'empresa'
  name: string
  contactName?: string
  email?: string
  phone?: string
  stage: string
  status: string
  priority?: string
  estimatedValue?: number
  sector?: string
  createdAt: string
  updatedAt: string
  assignedTo?: { id: string; name: string } | null
  daysInStage: number
}

export interface PipelineData {
  columns: PipelineColumn[]
  items: Record<string, PipelineItem[]>
  stats: {
    total: number
    byColumn: Record<string, number>
  }
}

export interface UserPipelineData {
  user: {
    id: string
    name: string
    email: string
    role: string
    image?: string
  }
  pipeline: PipelineData
}

export interface UnifiedPipelineData {
  myPipeline: UserPipelineData
  teamPipelines: UserPipelineData[]
}

// Configuración de columnas por rol
function getColumnsForRole(role: string): PipelineColumn[] {
  // ADMIN_GESTIO, ADMIN, SUPER_ADMIN
  if (['ADMIN_GESTIO', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return [
      {
        id: 'pre_contractes',
        label: 'Pre-contractes rebuts',
        stages: ['PRE_CONTRACTE'],
        type: 'lead',
        color: 'purple'
      },
      {
        id: 'en_revisio',
        label: 'En revisió',
        stages: ['EN_REVISIO'],
        type: 'lead',
        color: 'blue'
      },
      {
        id: 'empresa_creada',
        label: 'Empresa creada',
        stages: ['CONTRACTAT'],
        type: 'lead',
        color: 'green'
      },
    ]
  }

  // CRM_COMERCIAL, CRM_CONTINGUT
  if (role.includes('CRM')) {
    return [
      {
        id: 'per_assignar',
        label: 'Per assignar',
        stages: ['NOU'],
        type: 'lead',
        filter: { assignedToId: null },
        color: 'slate'
      },
      {
        id: 'per_verificar',
        label: 'Per verificar',
        stages: ['PER_VERIFICAR'],
        type: 'lead',
        color: 'amber'
      },
      {
        id: 'verificats',
        label: 'Verificats',
        stages: ['VERIFICAT'],
        type: 'lead',
        color: 'green'
      },
      {
        id: 'pre_contractats',
        label: 'Pre-contractats',
        stages: ['PRE_CONTRACTE'],
        type: 'lead',
        color: 'purple'
      },
      {
        id: 'empreses_assignar',
        label: 'Empreses per assignar',
        stages: ['CREADA'],
        type: 'empresa',
        filter: { accountManagerId: null },
        color: 'blue'
      },
    ]
  }

  // GESTOR_ESTANDARD, GESTOR_ESTRATEGIC, GESTOR_ENTERPRISE
  return [
    {
      id: 'leads_nous',
      label: 'Leads nous',
      stages: ['ASSIGNAT'],
      type: 'lead',
      color: 'blue'
    },
    {
      id: 'treballant',
      label: 'Treballant',
      stages: ['TREBALLANT'],
      type: 'lead',
      color: 'cyan'
    },
    {
      id: 'per_verificar',
      label: 'Per verificar',
      stages: ['PER_VERIFICAR'],
      type: 'lead',
      color: 'amber'
    },
    {
      id: 'empreses_onboarding',
      label: 'Empreses onboarding',
      stages: ['ONBOARDING'],
      type: 'empresa',
      color: 'purple'
    },
    {
      id: 'empreses_actives',
      label: 'Empreses actives',
      stages: ['ACTIVA'],
      type: 'empresa',
      color: 'green'
    },
  ]
}

// Obtener items para una columna específica
async function getItemsForColumn(
  userId: string,
  role: string,
  column: PipelineColumn
): Promise<PipelineItem[]> {
  const now = new Date()
  const items: PipelineItem[] = []

  if (column.type === 'lead') {
    // Construir filtro base
    const where: any = {
      stage: { in: column.stages }
    }

    // Aplicar filtros adicionales de la columna
    if (column.filter) {
      Object.assign(where, column.filter)
    }

    // Para gestores, solo sus leads asignados
    if (role.includes('GESTOR')) {
      where.assignedToId = userId
    }

    const leads = await prismaClient.companyLead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } }
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: 50
    })

    for (const lead of leads) {
      const daysInStage = Math.floor(
        (now.getTime() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      )

      items.push({
        id: lead.id,
        type: 'lead',
        name: lead.companyName,
        contactName: lead.contactName || undefined,
        email: lead.email || undefined,
        phone: lead.phone || undefined,
        stage: lead.stage || 'NOU',
        status: lead.status,
        priority: lead.priority,
        estimatedValue: Number(lead.estimatedValue || lead.estimatedRevenue) || 0,
        sector: lead.sector || undefined,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        assignedTo: lead.assignedTo ? {
          id: lead.assignedTo.id,
          name: lead.assignedTo.name || 'Sense nom'
        } : null,
        daysInStage
      })
    }
  } else {
    // Empresas
    const where: any = {
      stage: { in: column.stages }
    }

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
        accountManager: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    })

    for (const empresa of empresas) {
      const daysInStage = Math.floor(
        (now.getTime() - new Date(empresa.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      )

      items.push({
        id: empresa.id,
        type: 'empresa',
        name: empresa.name,
        email: empresa.email || undefined,
        phone: empresa.phone || undefined,
        stage: empresa.stage || 'CREADA',
        status: empresa.status,
        sector: empresa.sector || undefined,
        createdAt: empresa.createdAt.toISOString(),
        updatedAt: empresa.updatedAt.toISOString(),
        assignedTo: empresa.accountManager ? {
          id: empresa.accountManager.id,
          name: empresa.accountManager.name || 'Sense nom'
        } : null,
        daysInStage
      })
    }
  }

  return items
}

// Obtener pipeline de un usuario
async function getUserPipeline(
  userId: string,
  userInfo: { id: string; name: string; email: string; role: string; image?: string }
): Promise<UserPipelineData> {
  const columns = getColumnsForRole(userInfo.role)
  const items: Record<string, PipelineItem[]> = {}
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

// Obtener subordinados recursivamente
async function getSubordinates(userId: string, role: string): Promise<{
  id: string
  name: string
  email: string
  role: string
  image?: string
}[]> {
  const result: { id: string; name: string; email: string; role: string; image?: string }[] = []

  // SUPER_ADMIN, ADMIN i ADMIN_GESTIO veuen tota la jerarquia
  if (['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(role)) {
    const allSubordinates = await getAllSubordinatesRecursive(userId)
    return allSubordinates
  }

  // CRM veu els seus gestors subordinats
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

// Función principal exportada
export async function getUnifiedPipelineData(
  userId: string,
  role: string
): Promise<UnifiedPipelineData> {
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
    throw new Error('Usuario no encontrado')
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
  const teamPipelines: UserPipelineData[] = []

  for (const sub of subordinates) {
    const subPipeline = await getUserPipeline(sub.id, sub)
    teamPipelines.push(subPipeline)
  }

  return {
    myPipeline,
    teamPipelines
  }
}

// Actualizar stage de un item
export async function updateItemStage(
  itemId: string,
  itemType: 'lead' | 'empresa',
  newStage: string,
  assignedToId?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autenticat')
  }

  const now = new Date()

  if (itemType === 'lead') {
    const updateData: any = {
      stage: newStage,
      updatedAt: now
    }

    // Campos adicionales según stage
    if (newStage === 'ASSIGNAT' && assignedToId) {
      updateData.assignedToId = assignedToId
      updateData.assignedAt = now
    } else if (newStage === 'VERIFICAT') {
      updateData.verifiedById = session.user.id
      updateData.verifiedAt = now
    } else if (newStage === 'PRE_CONTRACTE') {
      updateData.preContractAt = now
    } else if (newStage === 'CONTRACTAT') {
      updateData.contractedAt = now
      updateData.status = 'WON'
    }

    await prismaClient.companyLead.update({
      where: { id: itemId },
      data: updateData
    })

    // Si es CONTRACTAT, crear empresa
    if (newStage === 'CONTRACTAT') {
      const lead = await prismaClient.companyLead.findUnique({ where: { id: itemId } })
      if (lead && !lead.convertedToCompanyId) {
        const newCompany = await prismaClient.company.create({
          data: {
            name: lead.companyName,
            email: lead.email || '',
            phone: lead.phone,
            cif: lead.cif,
            sector: lead.sector,
            stage: 'CREADA',
            fromLeadId: lead.id,
            status: 'PENDING'
          }
        })

        await prismaClient.companyLead.update({
          where: { id: itemId },
          data: {
            convertedToCompanyId: newCompany.id,
            convertedAt: now
          }
        })
      }
    }
  } else {
    const updateData: any = {
      stage: newStage,
      updatedAt: now
    }

    if (newStage === 'ASSIGNADA' && assignedToId) {
      updateData.accountManagerId = assignedToId
      updateData.assignedAt = now
    } else if (newStage === 'ACTIVA') {
      updateData.onboardingCompletedAt = now
      updateData.status = 'APPROVED'
      updateData.isActive = true
    }

    await prismaClient.company.update({
      where: { id: itemId },
      data: updateData
    })
  }

  return { success: true }
}
