// app/api/gestio/pipeline-comercial/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Stages per leads
const LEAD_STAGES = ['NOU', 'ASSIGNAT', 'TREBALLANT', 'PER_VERIFICAR', 'VERIFICAT', 'PRE_CONTRACTE', 'CONTRACTAT'] as const
type LeadStage = typeof LEAD_STAGES[number]

// Stages per empreses
const EMPRESA_STAGES = ['CREADA', 'ASSIGNADA', 'ONBOARDING', 'ACTIVA'] as const
type EmpresaStage = typeof EMPRESA_STAGES[number]

interface LeadItem {
  id: string
  companyName: string
  contactName: string | null
  email: string | null
  phone: string | null
  stage: LeadStage
  status: string
  priority: string
  estimatedValue: number
  score: number | null
  createdAt: string
  assignedTo: { id: string; name: string } | null
}

interface EmpresaItem {
  id: string
  name: string
  email: string
  phone: string | null
  stage: EmpresaStage
  status: string
  sector: string | null
  createdAt: string
  accountManager: { id: string; name: string } | null
  fromLeadId: string | null
}

interface PipelineStats {
  total: number
  pendents: number
  enProces: number
  completats: number
}

interface UserPipelineData {
  user: {
    id: string
    name: string
    email: string
    role: string
    image?: string
  }
  leads: {
    byStage: Record<LeadStage, LeadItem[]>
    stats: PipelineStats
  }
  empreses: {
    byStage: Record<EmpresaStage, EmpresaItem[]>
    stats: PipelineStats & { actives: number }
  }
}

// Roles que poden veure equips
const TEAM_VIEWER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT']

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role as string

    // Obtenir dades de l'usuari actual amb subordinats
    const currentUser = await prismaClient.user.findUnique({
      where: { id: userId },
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

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Obtenir el meu pipeline
    const myPipeline = await getUserPipelineData(userId, {
      id: userId,
      name: currentUser.name || 'Sense nom',
      email: currentUser.email,
      role: currentUser.role,
      image: currentUser.image || undefined
    }, userRole)

    // Obtenir pipelines de l'equip si el rol ho permet
    let teamPipelines: UserPipelineData[] = []

    if (TEAM_VIEWER_ROLES.includes(userRole)) {
      // Per SUPER_ADMIN i ADMIN, obtenir tots els subordinats recursivament
      if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
        const allSubordinates = await getAllSubordinatesRecursive(userId)
        teamPipelines = await Promise.all(
          allSubordinates.map(sub => getUserPipelineData(sub.id, sub, sub.role))
        )
      } else {
        // Per altres rols, nomes subordinats directes
        teamPipelines = await Promise.all(
          currentUser.subordinates.map(sub => getUserPipelineData(sub.id, {
            id: sub.id,
            name: sub.name || 'Sense nom',
            email: sub.email,
            role: sub.role,
            image: sub.image || undefined
          }, sub.role))
        )
      }
    }

    return NextResponse.json({
      myPipeline,
      teamPipelines
    })

  } catch (error) {
    console.error('Error carregant pipeline comercial:', error)
    return NextResponse.json(
      { error: 'Error carregant dades del pipeline' },
      { status: 500 }
    )
  }
}

// PATCH - Actualitzar stage d'un lead o empresa
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, newStage, assignedToId } = body

    if (!type || !id || !newStage) {
      return NextResponse.json({ error: 'Falten parametres' }, { status: 400 })
    }

    const userId = session.user.id
    const now = new Date()

    if (type === 'lead') {
      // Actualitzar lead
      const updateData: any = { stage: newStage, updatedAt: now }

      // Afegir camps segons l'stage
      if (newStage === 'ASSIGNAT' && assignedToId) {
        updateData.assignedToId = assignedToId
        updateData.assignedAt = now
      } else if (newStage === 'PER_VERIFICAR') {
        // No cal res especial
      } else if (newStage === 'VERIFICAT') {
        updateData.verifiedById = userId
        updateData.verifiedAt = now
      } else if (newStage === 'PRE_CONTRACTE') {
        updateData.preContractAt = now
      } else if (newStage === 'CONTRACTAT') {
        updateData.contractedAt = now
        updateData.status = 'WON'
      }

      const updatedLead = await prismaClient.companyLead.update({
        where: { id },
        data: updateData
      })

      // Si es CONTRACTAT, crear empresa
      if (newStage === 'CONTRACTAT') {
        const lead = await prismaClient.companyLead.findUnique({ where: { id } })
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

          // Actualitzar lead amb la referencia a l'empresa
          await prismaClient.companyLead.update({
            where: { id },
            data: {
              convertedToCompanyId: newCompany.id,
              convertedAt: now
            }
          })
        }
      }

      // TODO: Enviar notificacio
      await sendStageChangeNotification('lead', id, newStage, userId)

      return NextResponse.json({ success: true, data: updatedLead })

    } else if (type === 'empresa') {
      // Actualitzar empresa
      const updateData: any = { stage: newStage, updatedAt: now }

      if (newStage === 'ASSIGNADA' && assignedToId) {
        updateData.accountManagerId = assignedToId
        updateData.assignedAt = now
      } else if (newStage === 'ACTIVA') {
        updateData.onboardingCompletedAt = now
        updateData.status = 'APPROVED'
        updateData.isActive = true
      }

      const updatedCompany = await prismaClient.company.update({
        where: { id },
        data: updateData
      })

      // TODO: Enviar notificacio
      await sendStageChangeNotification('empresa', id, newStage, userId)

      return NextResponse.json({ success: true, data: updatedCompany })
    }

    return NextResponse.json({ error: 'Tipus no valid' }, { status: 400 })

  } catch (error) {
    console.error('Error actualitzant stage:', error)
    return NextResponse.json(
      { error: 'Error actualitzant stage' },
      { status: 500 }
    )
  }
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

  async function collectSubordinates(id: string) {
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
        await collectSubordinates(sub.id)
      }
    }
  }

  await collectSubordinates(userId)
  return result
}

async function getUserPipelineData(
  userId: string,
  userInfo: { id: string; name: string; email: string; role: string; image?: string },
  userRole: string
): Promise<UserPipelineData> {
  // Construir filtre segons rol
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)
  const isCRM = ['CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)

  // Leads: Admins i CRM veuen tot, gestors nomes els seus
  const leadsWhere = isAdmin || isCRM
    ? {} // Veuen tots
    : { assignedToId: userId } // Nomes els assignats

  // Empreses: Admins i CRM veuen tot, gestors nomes les seves
  const empresesWhere = isAdmin || isCRM
    ? {}
    : { accountManagerId: userId }

  // Obtenir leads
  const leads = await prismaClient.companyLead.findMany({
    where: leadsWhere,
    include: {
      assignedTo: {
        select: { id: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Obtenir empreses
  const empreses = await prismaClient.company.findMany({
    where: empresesWhere,
    include: {
      accountManager: {
        select: { id: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Agrupar leads per stage
  const leadsByStage: Record<LeadStage, LeadItem[]> = {
    NOU: [],
    ASSIGNAT: [],
    TREBALLANT: [],
    PER_VERIFICAR: [],
    VERIFICAT: [],
    PRE_CONTRACTE: [],
    CONTRACTAT: []
  }

  for (const lead of leads) {
    const stage = (lead.stage as LeadStage) || 'NOU'
    if (LEAD_STAGES.includes(stage)) {
      leadsByStage[stage].push({
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        stage,
        status: lead.status,
        priority: lead.priority,
        estimatedValue: Number(lead.estimatedValue || lead.estimatedRevenue) || 0,
        score: lead.score,
        createdAt: lead.createdAt.toISOString(),
        assignedTo: lead.assignedTo ? {
          id: lead.assignedTo.id,
          name: lead.assignedTo.name || 'Sense nom'
        } : null
      })
    }
  }

  // Agrupar empreses per stage
  const empresesByStage: Record<EmpresaStage, EmpresaItem[]> = {
    CREADA: [],
    ASSIGNADA: [],
    ONBOARDING: [],
    ACTIVA: []
  }

  for (const empresa of empreses) {
    const stage = (empresa.stage as EmpresaStage) || 'CREADA'
    if (EMPRESA_STAGES.includes(stage)) {
      empresesByStage[stage].push({
        id: empresa.id,
        name: empresa.name,
        email: empresa.email,
        phone: empresa.phone,
        stage,
        status: empresa.status,
        sector: empresa.sector,
        createdAt: empresa.createdAt.toISOString(),
        accountManager: empresa.accountManager ? {
          id: empresa.accountManager.id,
          name: empresa.accountManager.name || 'Sense nom'
        } : null,
        fromLeadId: empresa.fromLeadId
      })
    }
  }

  // Calcular stats de leads
  const leadsStats: PipelineStats = {
    total: leads.length,
    pendents: leadsByStage.NOU.length,
    enProces: leadsByStage.ASSIGNAT.length + leadsByStage.TREBALLANT.length + leadsByStage.PER_VERIFICAR.length + leadsByStage.VERIFICAT.length + leadsByStage.PRE_CONTRACTE.length,
    completats: leadsByStage.CONTRACTAT.length
  }

  // Calcular stats d'empreses
  const empresesStats = {
    total: empreses.length,
    pendents: empresesByStage.CREADA.length,
    enProces: empresesByStage.ASSIGNADA.length + empresesByStage.ONBOARDING.length,
    completats: empresesByStage.ACTIVA.length,
    actives: empresesByStage.ACTIVA.length
  }

  return {
    user: userInfo,
    leads: {
      byStage: leadsByStage,
      stats: leadsStats
    },
    empreses: {
      byStage: empresesByStage,
      stats: empresesStats
    }
  }
}

async function sendStageChangeNotification(
  type: 'lead' | 'empresa',
  itemId: string,
  newStage: string,
  triggeredByUserId: string
) {
  try {
    const notificationConfigs: Record<string, { toRole?: string; toField?: string; message: string }> = {
      // Leads
      'lead_ASSIGNAT': { toField: 'assignedTo', message: 'Tens un nou lead assignat' },
      'lead_PER_VERIFICAR': { toRole: 'CRM_COMERCIAL', message: 'Lead pendent de verificar' },
      'lead_PRE_CONTRACTE': { toRole: 'ADMIN_GESTIO', message: 'Pre-contracte pendent d\'aprovacio' },
      'lead_CONTRACTAT': { toRole: 'CRM_COMERCIAL', message: 'Nou lead convertit a empresa' },
      // Empreses
      'empresa_ASSIGNADA': { toField: 'accountManager', message: 'Nova empresa assignada' },
      'empresa_ACTIVA': { toRole: 'ADMIN_GESTIO', message: 'Empresa activa correctament' },
    }

    const configKey = `${type}_${newStage}`
    const config = notificationConfigs[configKey]

    if (!config) return

    let targetUserIds: string[] = []

    if (config.toField) {
      // Obtenir usuari del camp
      if (type === 'lead') {
        const lead = await prismaClient.companyLead.findUnique({
          where: { id: itemId },
          select: { assignedToId: true }
        })
        if (lead?.assignedToId) targetUserIds.push(lead.assignedToId)
      } else {
        const empresa = await prismaClient.company.findUnique({
          where: { id: itemId },
          select: { accountManagerId: true }
        })
        if (empresa?.accountManagerId) targetUserIds.push(empresa.accountManagerId)
      }
    } else if (config.toRole) {
      // Obtenir tots els usuaris amb el rol
      const users = await prismaClient.user.findMany({
        where: { role: config.toRole as any, isActive: true },
        select: { id: true }
      })
      targetUserIds = users.map(u => u.id)
    }

    // Crear notificacions
    for (const targetUserId of targetUserIds) {
      if (targetUserId !== triggeredByUserId) {
        await prismaClient.notification.create({
          data: {
            title: type === 'lead' ? 'Actualitzacio de Lead' : 'Actualitzacio d\'Empresa',
            message: config.message,
            type: 'SYSTEM',
            priority: 'NORMAL',
            userId: targetUserId,
            senderId: triggeredByUserId,
            metadata: {
              type,
              itemId,
              newStage
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('Error enviant notificacio:', error)
    // No fallar si la notificacio falla
  }
}
