// app/api/gestio/supervision-pipeline/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Tipus de rol
type UserRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'ADMIN_GESTIO' | 'CRM_COMERCIAL' | 'CRM_CONTINGUT' | 'GESTOR_ESTANDARD' | 'GESTOR_ESTRATEGIC' | 'GESTOR_ENTERPRISE'

interface MyWorkStats {
  leadsAssigned: number
  leadsInProgress: number
  leadsCompleted: number
  empresesAssigned: number
  empresesInProgress: number
  empresesActive: number
  pendingVerification: number
  pendingPreContract: number
  thisMonth: {
    leadsCompleted: number
    empresesActivated: number
    conversionRate: number
  }
}

interface PendingItem {
  id: string
  type: 'lead' | 'empresa'
  name: string
  stage: string
  priority?: string
  estimatedValue?: number
  daysInStage: number
  assignedTo?: { id: string; name: string }
  createdAt: string
}

interface TeamMemberStats {
  id: string
  name: string
  email: string
  role: string
  image?: string
  stats: {
    leadsTotal: number
    leadsInProgress: number
    leadsCompleted: number
    empresesTotal: number
    empresesActive: number
    conversionRate: number
    avgDaysToConvert: number
  }
  recentActivity: {
    lastLeadUpdate?: string
    lastEmpresaUpdate?: string
  }
}

interface SupervisionData {
  myWork: MyWorkStats
  pendingItems: PendingItem[]
  teamMembers: TeamMemberStats[]
  roleSpecific: {
    // Admin Gestio
    preContractsReceived?: number
    pendingFormalization?: number
    // CRM
    leadsToAssign?: number
    pendingVerificationTotal?: number
    // Totals generals
    totalLeads?: number
    totalEmpreses?: number
    totalActive?: number
  }
}

// Rols que tenen subordinats
const SUPERVISOR_ROLES: UserRoleType[] = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT']

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role as UserRoleType

    // Obtenir usuari amb subordinats
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

    // Obtenir les meves estadistiques de treball
    const myWork = await getMyWorkStats(userId, userRole)

    // Obtenir items pendents segons rol
    const pendingItems = await getPendingItems(userId, userRole)

    // Obtenir estadistiques de l'equip
    let teamMembers: TeamMemberStats[] = []
    if (SUPERVISOR_ROLES.includes(userRole)) {
      const subordinateIds = await getSubordinateIds(userId, userRole)
      teamMembers = await getTeamMembersStats(subordinateIds)
    }

    // Obtenir dades especifiques del rol
    const roleSpecific = await getRoleSpecificData(userRole)

    const data: SupervisionData = {
      myWork,
      pendingItems,
      teamMembers,
      roleSpecific
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error carregant supervision pipeline:', error)
    return NextResponse.json(
      { error: 'Error carregant dades' },
      { status: 500 }
    )
  }
}

async function getMyWorkStats(userId: string, userRole: UserRoleType): Promise<MyWorkStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)
  const isCRM = ['CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)

  // Query base per leads
  const leadsWhereBase = isAdmin || isCRM ? {} : { assignedToId: userId }

  // Leads assignats
  const leadsAssigned = await prismaClient.companyLead.count({
    where: { ...leadsWhereBase, assignedToId: { not: null } }
  })

  // Leads en progres
  const leadsInProgress = await prismaClient.companyLead.count({
    where: {
      ...leadsWhereBase,
      stage: { in: ['ASSIGNAT', 'TREBALLANT', 'PER_VERIFICAR', 'VERIFICAT', 'PRE_CONTRACTE'] }
    }
  })

  // Leads completats
  const leadsCompleted = await prismaClient.companyLead.count({
    where: {
      ...leadsWhereBase,
      stage: 'CONTRACTAT'
    }
  })

  // Query base per empreses
  const empresesWhereBase = isAdmin || isCRM ? {} : { accountManagerId: userId }

  // Empreses assignades
  const empresesAssigned = await prismaClient.company.count({
    where: { ...empresesWhereBase, accountManagerId: { not: null } }
  })

  // Empreses en progres
  const empresesInProgress = await prismaClient.company.count({
    where: {
      ...empresesWhereBase,
      stage: { in: ['ASSIGNADA', 'ONBOARDING'] }
    }
  })

  // Empreses actives
  const empresesActive = await prismaClient.company.count({
    where: {
      ...empresesWhereBase,
      stage: 'ACTIVA'
    }
  })

  // Leads pendents de verificar
  const pendingVerification = await prismaClient.companyLead.count({
    where: {
      ...leadsWhereBase,
      stage: 'PER_VERIFICAR'
    }
  })

  // Leads en pre-contracte
  const pendingPreContract = await prismaClient.companyLead.count({
    where: {
      ...leadsWhereBase,
      stage: 'PRE_CONTRACTE'
    }
  })

  // Stats del mes
  const leadsCompletedThisMonth = await prismaClient.companyLead.count({
    where: {
      ...leadsWhereBase,
      stage: 'CONTRACTAT',
      contractedAt: { gte: startOfMonth }
    }
  })

  const empresesActivatedThisMonth = await prismaClient.company.count({
    where: {
      ...empresesWhereBase,
      stage: 'ACTIVA',
      onboardingCompletedAt: { gte: startOfMonth }
    }
  })

  // Calcular taxa de conversio
  const totalLeadsThisMonth = await prismaClient.companyLead.count({
    where: {
      ...leadsWhereBase,
      createdAt: { gte: startOfMonth }
    }
  })

  const conversionRate = totalLeadsThisMonth > 0
    ? (leadsCompletedThisMonth / totalLeadsThisMonth) * 100
    : 0

  return {
    leadsAssigned,
    leadsInProgress,
    leadsCompleted,
    empresesAssigned,
    empresesInProgress,
    empresesActive,
    pendingVerification,
    pendingPreContract,
    thisMonth: {
      leadsCompleted: leadsCompletedThisMonth,
      empresesActivated: empresesActivatedThisMonth,
      conversionRate: Math.round(conversionRate * 10) / 10
    }
  }
}

async function getPendingItems(userId: string, userRole: UserRoleType): Promise<PendingItem[]> {
  const now = new Date()
  const items: PendingItem[] = []

  // Configurar query segons rol
  let leadsWhere: any = {}
  let empresesWhere: any = {}

  if (['ADMIN_GESTIO'].includes(userRole)) {
    // Admin Gestio veu pre-contractes pendents de formalitzar
    leadsWhere = { stage: 'PRE_CONTRACTE' }
    empresesWhere = { stage: { in: ['CREADA', 'ASSIGNADA', 'ONBOARDING'] } }
  } else if (['CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)) {
    // CRM veu leads per assignar i per verificar
    leadsWhere = { stage: { in: ['NOU', 'PER_VERIFICAR'] } }
    empresesWhere = { stage: 'CREADA' }
  } else {
    // Gestors veuen els seus leads i empreses pendents
    leadsWhere = {
      assignedToId: userId,
      stage: { in: ['ASSIGNAT', 'TREBALLANT'] }
    }
    empresesWhere = {
      accountManagerId: userId,
      stage: { in: ['ASSIGNADA', 'ONBOARDING'] }
    }
  }

  // Obtenir leads pendents
  const leads = await prismaClient.companyLead.findMany({
    where: leadsWhere,
    include: {
      assignedTo: { select: { id: true, name: true } }
    },
    orderBy: { updatedAt: 'asc' },
    take: 20
  })

  for (const lead of leads) {
    const daysInStage = Math.floor(
      (now.getTime() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    items.push({
      id: lead.id,
      type: 'lead',
      name: lead.companyName,
      stage: lead.stage || 'NOU',
      priority: lead.priority,
      estimatedValue: Number(lead.estimatedValue || lead.estimatedRevenue) || 0,
      daysInStage,
      assignedTo: lead.assignedTo ? {
        id: lead.assignedTo.id,
        name: lead.assignedTo.name || 'Sense nom'
      } : undefined,
      createdAt: lead.createdAt.toISOString()
    })
  }

  // Obtenir empreses pendents
  const empreses = await prismaClient.company.findMany({
    where: empresesWhere,
    include: {
      accountManager: { select: { id: true, name: true } }
    },
    orderBy: { updatedAt: 'asc' },
    take: 20
  })

  for (const empresa of empreses) {
    const daysInStage = Math.floor(
      (now.getTime() - new Date(empresa.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    items.push({
      id: empresa.id,
      type: 'empresa',
      name: empresa.name,
      stage: empresa.stage || 'CREADA',
      daysInStage,
      assignedTo: empresa.accountManager ? {
        id: empresa.accountManager.id,
        name: empresa.accountManager.name || 'Sense nom'
      } : undefined,
      createdAt: empresa.createdAt.toISOString()
    })
  }

  // Ordenar per dies en stage (més antic primer)
  items.sort((a, b) => b.daysInStage - a.daysInStage)

  return items.slice(0, 30)
}

async function getSubordinateIds(userId: string, userRole: UserRoleType): Promise<string[]> {
  if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
    // Obtenir tots els subordinats recursivament
    return getAllSubordinatesRecursive(userId)
  }

  // Nomes subordinats directes
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    include: {
      subordinates: {
        where: { isActive: true },
        select: { id: true }
      }
    }
  })

  return user?.subordinates.map(s => s.id) || []
}

async function getAllSubordinatesRecursive(userId: string): Promise<string[]> {
  const result: string[] = []
  const visited = new Set<string>()

  async function collect(id: string) {
    if (visited.has(id)) return
    visited.add(id)

    const user = await prismaClient.user.findUnique({
      where: { id },
      include: {
        subordinates: {
          where: { isActive: true },
          select: { id: true }
        }
      }
    })

    if (user) {
      for (const sub of user.subordinates) {
        result.push(sub.id)
        await collect(sub.id)
      }
    }
  }

  await collect(userId)
  return result
}

async function getTeamMembersStats(memberIds: string[]): Promise<TeamMemberStats[]> {
  const stats: TeamMemberStats[] = []

  for (const memberId of memberIds) {
    const user = await prismaClient.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      }
    })

    if (!user) continue

    // Estadistiques de leads
    const leadsTotal = await prismaClient.companyLead.count({
      where: { assignedToId: memberId }
    })

    const leadsInProgress = await prismaClient.companyLead.count({
      where: {
        assignedToId: memberId,
        stage: { in: ['ASSIGNAT', 'TREBALLANT', 'PER_VERIFICAR', 'VERIFICAT', 'PRE_CONTRACTE'] }
      }
    })

    const leadsCompleted = await prismaClient.companyLead.count({
      where: {
        assignedToId: memberId,
        stage: 'CONTRACTAT'
      }
    })

    // Estadistiques d'empreses
    const empresesTotal = await prismaClient.company.count({
      where: { accountManagerId: memberId }
    })

    const empresesActive = await prismaClient.company.count({
      where: {
        accountManagerId: memberId,
        stage: 'ACTIVA'
      }
    })

    // Taxa de conversio
    const conversionRate = leadsTotal > 0
      ? (leadsCompleted / leadsTotal) * 100
      : 0

    // Ultimes activitats
    const lastLead = await prismaClient.companyLead.findFirst({
      where: { assignedToId: memberId },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    const lastEmpresa = await prismaClient.company.findFirst({
      where: { accountManagerId: memberId },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    // Temps mitja de conversio (simplificat)
    const completedLeads = await prismaClient.companyLead.findMany({
      where: {
        assignedToId: memberId,
        stage: 'CONTRACTAT',
        assignedAt: { not: null },
        contractedAt: { not: null }
      },
      select: {
        assignedAt: true,
        contractedAt: true
      },
      take: 50
    })

    let avgDays = 0
    if (completedLeads.length > 0) {
      const totalDays = completedLeads.reduce((acc, lead) => {
        if (lead.assignedAt && lead.contractedAt) {
          return acc + Math.floor(
            (lead.contractedAt.getTime() - lead.assignedAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        }
        return acc
      }, 0)
      avgDays = Math.round(totalDays / completedLeads.length)
    }

    stats.push({
      id: user.id,
      name: user.name || 'Sense nom',
      email: user.email,
      role: user.role,
      image: user.image || undefined,
      stats: {
        leadsTotal,
        leadsInProgress,
        leadsCompleted,
        empresesTotal,
        empresesActive,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgDaysToConvert: avgDays
      },
      recentActivity: {
        lastLeadUpdate: lastLead?.updatedAt.toISOString(),
        lastEmpresaUpdate: lastEmpresa?.updatedAt.toISOString()
      }
    })
  }

  // Ordenar per taxa de conversio
  stats.sort((a, b) => b.stats.conversionRate - a.stats.conversionRate)

  return stats
}

async function getRoleSpecificData(userRole: UserRoleType): Promise<SupervisionData['roleSpecific']> {
  const data: SupervisionData['roleSpecific'] = {}

  if (userRole === 'ADMIN_GESTIO') {
    // Pre-contractes rebuts (esperant formalitzacio)
    data.preContractsReceived = await prismaClient.companyLead.count({
      where: { stage: 'PRE_CONTRACTE' }
    })

    // Pendents de formalitzar
    data.pendingFormalization = await prismaClient.companyLead.count({
      where: {
        stage: 'PRE_CONTRACTE',
        updatedAt: {
          lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Mes de 3 dies
        }
      }
    })
  }

  if (['CRM_COMERCIAL', 'CRM_CONTINGUT'].includes(userRole)) {
    // Leads per assignar
    data.leadsToAssign = await prismaClient.companyLead.count({
      where: { stage: 'NOU' }
    })

    // Pendents de verificar
    data.pendingVerificationTotal = await prismaClient.companyLead.count({
      where: { stage: 'PER_VERIFICAR' }
    })
  }

  // Totals generals (per tots)
  data.totalLeads = await prismaClient.companyLead.count()
  data.totalEmpreses = await prismaClient.company.count()
  data.totalActive = await prismaClient.company.count({
    where: { stage: 'ACTIVA' }
  })

  return data
}
