// lib/gestio-empreses/data.ts
// FITXER NOU - Funcions d'accés a dades reals per Gestió d'Empreses

import { prismaClient } from '@/lib/prisma'
import { LeadStatus, LeadPriority } from '@prisma/client'
import type { DashboardStats, LeadSummary, LeadFilters, PaginatedResponse } from '@/types/gestio-empreses'

/**
 * Obté les estadístiques del dashboard per a un gestor
 */
export async function getDashboardStats(userId: string, isSupervidor: boolean = false): Promise<DashboardStats> {
  // Condició de filtre: supervisor veu tot, gestor només els seus
  const assignedFilter = isSupervidor ? {} : { assignedToId: userId }

  // Comptar leads per estat
  const leadCounts = await prismaClient.companyLead.groupBy({
    by: ['status'],
    where: assignedFilter,
    _count: { id: true }
  })

  // Convertir a objecte
  const leadsByStatus: Record<string, number> = {}
  let totalLeads = 0
  leadCounts.forEach(item => {
    leadsByStatus[item.status] = item._count.id
    totalLeads += item._count.id
  })

  // Calcular valor del pipeline (suma de estimatedRevenue dels leads actius)
  const pipelineResult = await prismaClient.companyLead.aggregate({
    where: {
      ...assignedFilter,
      status: { notIn: ['WON', 'LOST'] }
    },
    _sum: { estimatedRevenue: true }
  })
  const pipelineValue = Number(pipelineResult._sum.estimatedRevenue || 0)

  // Comptar empreses actives
  const totalEmpreses = await prismaClient.company.count({
    where: { isActive: true }
  })

  const empresesActives = await prismaClient.company.count({
    where: {
      isActive: true,
      status: 'PUBLISHED'
    }
  })

  // Comptar tasques pendents
  const tasquesPendents = await prismaClient.leadTask.count({
    where: {
      userId: userId,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    }
  })

  // Tasques per avui
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tasquesAvui = await prismaClient.leadTask.count({
    where: {
      userId: userId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      dueDate: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  // Stats addicionals per supervisors
  let pendentsVerificacio = 0
  let totalGestors = 0
  let conversionsSetmana = 0
  let conversionsMes = 0

  if (isSupervidor) {
    // Leads pendents de verificació (estat QUALIFIED o similar)
    pendentsVerificacio = await prismaClient.companyLead.count({
      where: { status: 'QUALIFIED' }
    })

    // Total gestors (usuaris amb rol ACCOUNT_MANAGER)
    totalGestors = await prismaClient.user.count({
      where: {
        userType: 'ACCOUNT_MANAGER',
        isActive: true
      }
    })

    // Conversions aquesta setmana
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    conversionsSetmana = await prismaClient.companyLead.count({
      where: {
        status: 'WON',
        updatedAt: { gte: weekAgo }
      }
    })

    // Conversions aquest mes
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    conversionsMes = await prismaClient.companyLead.count({
      where: {
        status: 'WON',
        updatedAt: { gte: monthAgo }
      }
    })
  }

  return {
    totalLeads,
    leadsNous: leadsByStatus['NEW'] || 0,
    leadsContactats: leadsByStatus['CONTACTED'] || 0,
    leadsNegociant: leadsByStatus['NEGOTIATION'] || 0,
    leadsConvertits: leadsByStatus['WON'] || 0,
    leadsPerduts: leadsByStatus['LOST'] || 0,
    totalEmpreses,
    empresesActives,
    tasquesPendents,
    tasquesAvui,
    pipelineValue,
    pendentsVerificacio: isSupervidor ? pendentsVerificacio : undefined,
    totalGestors: isSupervidor ? totalGestors : undefined,
    conversionsSetmana: isSupervidor ? conversionsSetmana : undefined,
    conversionsMes: isSupervidor ? conversionsMes : undefined,
  }
}

/**
 * Obté la llista de leads amb paginació i filtres
 */
export async function getLeads(
  userId: string,
  isSupervisor: boolean = false,
  filters: LeadFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<LeadSummary>> {
  // Construir where clause
  const where: any = {}

  // Filtrar per assignació (supervisor veu tot)
  if (!isSupervisor) {
    where.assignedToId = userId
  }

  // Aplicar filtres
  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status }
  }
  if (filters.priority && filters.priority.length > 0) {
    where.priority = { in: filters.priority }
  }
  if (filters.source && filters.source.length > 0) {
    where.source = { in: filters.source }
  }
  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId
  }
  if (filters.search) {
    where.OR = [
      { companyName: { contains: filters.search, mode: 'insensitive' } },
      { contactName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  if (filters.dateFrom) {
    where.createdAt = { ...where.createdAt, gte: filters.dateFrom }
  }
  if (filters.dateTo) {
    where.createdAt = { ...where.createdAt, lte: filters.dateTo }
  }
  if (filters.scoreMin !== undefined) {
    where.score = { ...where.score, gte: filters.scoreMin }
  }
  if (filters.scoreMax !== undefined) {
    where.score = { ...where.score, lte: filters.scoreMax }
  }

  // Comptar total
  const total = await prismaClient.companyLead.count({ where })

  // Obtenir leads paginats
  const leads = await prismaClient.companyLead.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
      sector: true,
      status: true,
      priority: true,
      source: true,
      score: true,
      estimatedRevenue: true,
      createdAt: true,
      lastContactDate: true,
      nextFollowUpDate: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })

  // Transformar a LeadSummary
  const data: LeadSummary[] = leads.map(lead => ({
    id: lead.id,
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    status: lead.status,
    priority: lead.priority,
    score: lead.score,
    estimatedValue: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : null,
    createdAt: lead.createdAt,
    lastContactDate: lead.lastContactDate,
    nextFollowUpDate: lead.nextFollowUpDate,
  }))

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * Obté un lead per ID amb totes les seves relacions
 */
export async function getLeadById(leadId: string) {
  return prismaClient.companyLead.findUnique({
    where: { id: leadId },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      },
      tasks: {
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        orderBy: { dueDate: 'asc' },
        take: 5
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      },
      convertedCompany: {
        select: {
          id: true,
          name: true,
          status: true
        }
      }
    }
  })
}

/**
 * Obté les tasques pendents d'un gestor
 */
export async function getPendingTasks(userId: string, limit: number = 10) {
  return prismaClient.leadTask.findMany({
    where: {
      userId,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    },
    orderBy: [
      { priority: 'desc' },
      { dueDate: 'asc' }
    ],
    take: limit,
    include: {
      lead: {
        select: {
          id: true,
          companyName: true
        }
      }
    }
  })
}

/**
 * Obté els leads recents per al dashboard
 */
export async function getRecentLeads(userId: string, isSupervisor: boolean = false, limit: number = 5) {
  const where = isSupervisor ? {} : { assignedToId: userId }

  return prismaClient.companyLead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      companyName: true,
      contactName: true,
      status: true,
      priority: true,
      score: true,
      createdAt: true,
      assignedTo: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
}

/**
 * Obté estadístiques del pipeline per al gràfic
 */
export async function getPipelineStats(userId: string, isSupervisor: boolean = false) {
  const where = isSupervisor ? {} : { assignedToId: userId }

  const stats = await prismaClient.companyLead.groupBy({
    by: ['status'],
    where: {
      ...where,
      status: { notIn: ['WON', 'LOST'] }
    },
    _count: { id: true },
    _sum: { estimatedRevenue: true }
  })

  return stats.map(s => ({
    status: s.status,
    count: s._count.id,
    value: Number(s._sum.estimatedRevenue || 0)
  }))
}

/**
 * Obté les empreses gestionades per un gestor
 */
export async function getManagedCompanies(userId: string, isSupervisor: boolean = false, limit?: number) {
  // TODO: Quan implementem relació gestor-empresa
  // Per ara retornem les empreses actives
  return prismaClient.company.findMany({
    where: {
      isActive: true,
      status: 'PUBLISHED'
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentPlan: {
        select: {
          id: true,
          name: true,
          tier: true,
        }
      },
      createdAt: true,
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
}