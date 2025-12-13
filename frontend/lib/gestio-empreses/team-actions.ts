// lib/gestio-empreses/team-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

const MONTHLY_TARGET_LEADS = 5 // Objectiu leads/mes per gestor
const MONTHLY_TARGET_REVENUE = 50000 // Objectiu facturació/mes per gestor

/**
 * Obtenir estadístiques detallades de l'equip
 */
export async function getTeamStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const gestors = await prismaClient.user.findMany({
    where: {
      userType: {
        in: ['EMPLOYEE', 'ADMIN', 'ACCOUNT_MANAGER'],
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userType: true,
      createdAt: true,
      assignedLeads: {
        select: {
          id: true,
          status: true,
          priority: true,
          estimatedRevenue: true,
          createdAt: true,
          convertedAt: true,
        },
      },
      managedCompanies: {
        where: {
          status: 'PUBLISHED',
        },
        select: {
          id: true,
        },
      },
      leadActivities: {
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
      },
    },
  })

  return gestors.map((gestor) => {
    const leads = gestor.assignedLeads
    const activeLeads = leads.filter((l) => !['WON', 'LOST'].includes(l.status))
    const wonLeads = leads.filter((l) => l.status === 'WON')
    const lostLeads = leads.filter((l) => l.status === 'LOST')
    const wonThisMonth = wonLeads.filter((l) => l.convertedAt && new Date(l.convertedAt) >= startOfMonth)

    const totalValue = activeLeads.reduce((sum, l) => sum + (Number(l.estimatedRevenue) || 0), 0)
    const wonValue = wonLeads.reduce((sum, l) => sum + (Number(l.estimatedRevenue) || 0), 0)

    const conversionRate = leads.length > 0
      ? Math.round((wonLeads.length / leads.length) * 100)
      : 0

    const activitiesThisMonth = gestor.leadActivities.length
    const callsThisMonth = gestor.leadActivities.filter((a) => a.type === 'CALL').length
    const emailsThisMonth = gestor.leadActivities.filter((a) => a.type === 'EMAIL').length

    return {
      id: gestor.id,
      name: gestor.name,
      email: gestor.email,
      image: gestor.image,
      role: gestor.userType,
      memberSince: gestor.createdAt,
      metrics: {
        activeLeads: activeLeads.length,
        totalLeads: leads.length,
        wonLeads: wonLeads.length,
        lostLeads: lostLeads.length,
        wonThisMonth: wonThisMonth.length,
        activeCompanies: gestor.managedCompanies.length,
        pipelineValue: totalValue,
        wonValue: wonValue,
        conversionRate: conversionRate,
        activitiesThisMonth: activitiesThisMonth,
        callsThisMonth: callsThisMonth,
        emailsThisMonth: emailsThisMonth,
      },
    }
  })
}

/**
 * Obtenir resum global de l'equip
 */
export async function getTeamSummary() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalGestors,
    totalLeads,
    activeLeads,
    wonThisMonth,
    totalPipelineValue,
  ] = await Promise.all([
    prismaClient.user.count({
      where: {
        userType: { in: ['EMPLOYEE', 'ADMIN', 'ACCOUNT_MANAGER'] },
        isActive: true,
      },
    }),
    prismaClient.companyLead.count(),
    prismaClient.companyLead.count({
      where: {
        status: { notIn: ['WON', 'LOST'] },
      },
    }),
    prismaClient.companyLead.count({
      where: {
        status: 'WON',
        convertedAt: { gte: startOfMonth },
      },
    }),
    prismaClient.companyLead.aggregate({
      where: {
        status: { notIn: ['WON', 'LOST'] },
      },
      _sum: {
        estimatedRevenue: true,
      },
    }),
  ])

  return {
    totalGestors,
    totalLeads,
    activeLeads,
    wonThisMonth,
    totalPipelineValue: Number(totalPipelineValue._sum.estimatedRevenue) || 0,
    avgLeadsPerGestor: totalGestors > 0 ? Math.round(activeLeads / totalGestors) : 0,
  }
}

/**
 * Obtenir detall d'un gestor específic
 */
export async function getGestorDetail(gestorId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const gestor = await prismaClient.user.findUnique({
    where: { id: gestorId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userType: true,
      createdAt: true,
      assignedLeads: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          companyName: true,
          status: true,
          priority: true,
          estimatedRevenue: true,
          createdAt: true,
        },
      },
      managedCompanies: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      },
      leadActivities: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          type: true,
          description: true,
          createdAt: true,
        },
      },
    },
  })

  return gestor
}

/**
 * Obtenir estadístiques de l'equip per als nous KPIs
 */
export async function getTeamStatsKPIs() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    activeGestors,
    activeLeads,
    totalLeads,
    conversionsThisMonth,
    conversionsLastMonth,
    pipelineTotal,
  ] = await Promise.all([
    // Gestors actius
    prismaClient.user.count({
      where: {
        userType: { in: ['EMPLOYEE', 'ADMIN', 'ACCOUNT_MANAGER'] },
        isActive: true,
      },
    }),
    // Leads actius (no tancats)
    prismaClient.companyLead.count({
      where: { status: { notIn: ['WON', 'LOST'] } },
    }),
    // Total leads
    prismaClient.companyLead.count(),
    // Conversions aquest mes
    prismaClient.companyLead.count({
      where: {
        status: 'WON',
        convertedAt: { gte: startOfMonth },
      },
    }),
    // Conversions mes passat
    prismaClient.companyLead.count({
      where: {
        status: 'WON',
        convertedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    // Pipeline total
    prismaClient.companyLead.aggregate({
      where: { status: { notIn: ['WON', 'LOST'] } },
      _sum: { estimatedRevenue: true },
    }),
  ])

  // Calcular tendència conversions
  const conversionTrend = conversionsLastMonth > 0
    ? Math.round(((conversionsThisMonth - conversionsLastMonth) / conversionsLastMonth) * 100)
    : conversionsThisMonth > 0 ? 100 : 0

  // Calcular objectiu mensual de l'equip
  const teamTarget = activeGestors * MONTHLY_TARGET_LEADS
  const teamProgress = teamTarget > 0 ? Math.round((conversionsThisMonth / teamTarget) * 100) : 0

  return {
    activeGestors,
    activeLeads,
    totalLeads,
    leadsPerGestor: activeGestors > 0 ? Math.round((activeLeads / activeGestors) * 10) / 10 : 0,
    conversionsThisMonth,
    conversionTrend,
    pipelineTotal: Number(pipelineTotal._sum.estimatedRevenue) || 0,
    teamProgress: Math.min(teamProgress, 100),
    teamTarget,
  }
}

/**
 * Obtenir ranking mensual
 */
export async function getMonthlyRanking() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const gestors = await prismaClient.user.findMany({
    where: {
      userType: { in: ['EMPLOYEE', 'ADMIN', 'ACCOUNT_MANAGER'] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userType: true,
      assignedLeads: {
        where: { status: { notIn: ['LOST'] } },
        select: {
          id: true,
          status: true,
          estimatedRevenue: true,
          convertedAt: true,
          createdAt: true,
        },
      },
    },
  })

  const ranking = gestors.map((gestor) => {
    const activeLeads = gestor.assignedLeads.filter((l) => l.status !== 'WON')
    const wonThisMonth = gestor.assignedLeads.filter(
      (l) => l.status === 'WON' && l.convertedAt && new Date(l.convertedAt) >= startOfMonth
    )
    const pipeline = activeLeads.reduce((sum, l) => sum + (Number(l.estimatedRevenue) || 0), 0)
    const wonRevenue = wonThisMonth.reduce((sum, l) => sum + (Number(l.estimatedRevenue) || 0), 0)
    const conversionRate = gestor.assignedLeads.length > 0
      ? Math.round((wonThisMonth.length / gestor.assignedLeads.length) * 100)
      : 0

    return {
      id: gestor.id,
      name: gestor.name,
      email: gestor.email,
      image: gestor.image,
      role: gestor.userType,
      activeLeads: activeLeads.length,
      wonThisMonth: wonThisMonth.length,
      pipeline,
      wonRevenue,
      conversionRate,
      // Score per ranking (ponderat)
      score: wonRevenue * 0.5 + pipeline * 0.3 + wonThisMonth.length * 1000 + conversionRate * 100,
    }
  })

  // Ordenar per score
  return ranking.sort((a, b) => b.score - a.score)
}

/**
 * Obtenir tots els gestors amb estadístiques completes
 */
export async function getGestorsWithFullStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const gestors = await prismaClient.user.findMany({
    where: {
      userType: { in: ['EMPLOYEE', 'ADMIN', 'ACCOUNT_MANAGER'] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userType: true,
      // phone: true, // Field does not exist in User model
      createdAt: true,
      assignedLeads: {
        select: {
          id: true,
          companyName: true,
          status: true,
          priority: true,
          estimatedRevenue: true,
          convertedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      managedCompanies: {
        select: { id: true },
      },
      leadActivities: {
        select: { id: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return gestors.map((gestor) => {
    const activeLeads = gestor.assignedLeads.filter((l) => !['WON', 'LOST'].includes(l.status))
    const wonThisMonth = gestor.assignedLeads.filter(
      (l) => l.status === 'WON' && l.convertedAt && new Date(l.convertedAt) >= startOfMonth
    )
    const wonLastMonth = gestor.assignedLeads.filter(
      (l) => l.status === 'WON' &&
        l.convertedAt &&
        new Date(l.convertedAt) >= startOfLastMonth &&
        new Date(l.convertedAt) <= endOfLastMonth
    )
    const pipeline = activeLeads.reduce((sum, l) => sum + (Number(l.estimatedRevenue) || 0), 0)
    const totalWon = gestor.assignedLeads.filter((l) => l.status === 'WON').length
    const conversionRate = gestor.assignedLeads.length > 0
      ? Math.round((totalWon / gestor.assignedLeads.length) * 100)
      : 0

    // Objectiu mensual
    const monthlyProgress = Math.min(
      Math.round((wonThisMonth.length / MONTHLY_TARGET_LEADS) * 100),
      100
    )

    // Tendència vs mes passat
    const trend = wonLastMonth.length > 0
      ? Math.round(((wonThisMonth.length - wonLastMonth.length) / wonLastMonth.length) * 100)
      : wonThisMonth.length > 0 ? 100 : 0

    return {
      id: gestor.id,
      name: gestor.name,
      email: gestor.email,
      image: gestor.image,
      role: gestor.userType,
      phone: null, // gestor.phone not available
      createdAt: gestor.createdAt,
      activeLeads: activeLeads.length,
      totalLeads: gestor.assignedLeads.length,
      wonThisMonth: wonThisMonth.length,
      wonLastMonth: wonLastMonth.length,
      pipeline,
      conversionRate,
      monthlyProgress,
      trend,
      companiesCount: gestor.managedCompanies.length,
      messagesCount: gestor.leadActivities.length,
      tasksCount: 0, // No hay tabla de tareas en este schema
      recentLeads: gestor.assignedLeads.slice(0, 5),
    }
  })
}

/**
 * Obtenir detall complet d'un gestor amb històric
 */
export async function getGestorDetailWithHistory(gestorId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const gestor = await prismaClient.user.findUnique({
    where: { id: gestorId },
    include: {
      assignedLeads: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          companyName: true,
          contactName: true,
          status: true,
          priority: true,
          estimatedRevenue: true,
          createdAt: true,
        },
      },
      managedCompanies: {
        take: 5,
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
  })

  if (!gestor) return null

  // Obtenir històric de rendiment (últims 6 mesos)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Simular dades mensuals per al gràfic
  const performanceHistory = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const won = await prismaClient.companyLead.count({
      where: {
        assignedToId: gestorId,
        status: 'WON',
        convertedAt: { gte: monthStart, lte: monthEnd },
      },
    })

    const created = await prismaClient.companyLead.count({
      where: {
        assignedToId: gestorId,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    })

    performanceHistory.push({
      month: date.toLocaleDateString('ca-ES', { month: 'short' }),
      won,
      created,
    })
  }

  return {
    ...gestor,
    performanceHistory,
  }
}