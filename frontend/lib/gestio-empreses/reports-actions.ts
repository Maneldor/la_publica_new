// lib/gestio-empreses/reports-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * Obtenir dades per gràfic de leads per mes (últims 6 mesos)
 */
export async function getLeadsPerMonth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const leads = await prismaClient.companyLead.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      convertedAt: true,
    },
  })

  // Agrupar per mes
  const months: Record<string, { created: number; won: number; lost: number }> = {}

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months[key] = { created: 0, won: 0, lost: 0 }
  }

  leads.forEach((lead) => {
    const createdMonth = `${lead.createdAt.getFullYear()}-${String(lead.createdAt.getMonth() + 1).padStart(2, '0')}`
    if (months[createdMonth]) {
      months[createdMonth].created++
    }

    if (lead.status === 'WON' && lead.convertedAt) {
      const wonMonth = `${lead.convertedAt.getFullYear()}-${String(lead.convertedAt.getMonth() + 1).padStart(2, '0')}`
      if (months[wonMonth]) {
        months[wonMonth].won++
      }
    }

    if (lead.status === 'LOST') {
      if (months[createdMonth]) {
        months[createdMonth].lost++
      }
    }
  })

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
    }))
}

/**
 * Obtenir distribució de leads per estat
 */
export async function getLeadsByStatus() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const statusCounts = await prismaClient.companyLead.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  const statusLabels: Record<string, string> = {
    NEW: 'Nous',
    PROSPECTING: 'Prospectant',
    CONTACTED: 'Contactats',
    QUALIFIED: 'Qualificats',
    PROPOSAL_SENT: 'Proposta enviada',
    NEGOTIATION: 'Negociant',
    DOCUMENTATION: 'Documentació',
    WON: 'Guanyats',
    LOST: 'Perduts',
    ON_HOLD: 'En pausa',
  }

  const colors: Record<string, string> = {
    NEW: '#3b82f6',
    PROSPECTING: '#f59e0b',
    CONTACTED: '#8b5cf6',
    QUALIFIED: '#06b6d4',
    PROPOSAL_SENT: '#ec4899',
    NEGOTIATION: '#f97316',
    DOCUMENTATION: '#6366f1',
    WON: '#22c55e',
    LOST: '#64748b',
    ON_HOLD: '#94a3b8',
  }

  return statusCounts.map((s) => ({
    status: s.status,
    label: statusLabels[s.status] || s.status,
    count: s._count.id,
    color: colors[s.status] || '#94a3b8',
  }))
}

/**
 * Obtenir distribució de leads per font
 */
export async function getLeadsBySource() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const sourceCounts = await prismaClient.companyLead.groupBy({
    by: ['source'],
    _count: { id: true },
    _sum: { estimatedRevenue: true },
  })

  const sourceLabels: Record<string, string> = {
    MANUAL: 'Manual',
    WEB_FORM: 'Formulari Web',
    AI_PROSPECTING: 'IA Prospecting',
    REFERRAL: 'Referit',
    EMPLOYEE_SUGGESTION: 'Suggeriment empleat',
    INBOUND: 'Marketing inbound',
    COLD_OUTREACH: 'Outreach fred',
  }

  return sourceCounts.map((s) => ({
    source: s.source || 'MANUAL',
    label: sourceLabels[s.source || 'MANUAL'] || s.source || 'Manual',
    count: s._count.id,
    value: Number(s._sum.estimatedRevenue) || 0,
  }))
}

/**
 * Obtenir rendiment per gestor
 */
export async function getPerformanceByGestor() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const gestors = await prismaClient.user.findMany({
    where: {
      userType: { in: ['EMPLOYEE', 'ACCOUNT_MANAGER', 'ADMIN'] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      userType: true,
      assignedLeads: {
        select: {
          id: true,
          status: true,
          estimatedRevenue: true,
        },
      },
    },
  })

  return gestors.map((g) => {
    const total = g.assignedLeads.length
    const won = g.assignedLeads.filter((l) => l.status === 'WON').length
    const active = g.assignedLeads.filter((l) => !['WON', 'LOST'].includes(l.status)).length
    const pipeline = g.assignedLeads
      .filter((l) => !['WON', 'LOST'].includes(l.status))
      .reduce((sum, l) => sum + (Number(l.estimatedRevenue) || 0), 0)

    return {
      name: g.name || g.email.split('@')[0],
      role: g.userType,
      total,
      won,
      active,
      pipeline,
      conversion: total > 0 ? Math.round((won / total) * 100) : 0,
    }
  }).sort((a, b) => b.pipeline - a.pipeline)
}

/**
 * Obtenir valor del pipeline per mes
 */
export async function getPipelineValuePerMonth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const leads = await prismaClient.companyLead.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      status: { notIn: ['LOST'] },
    },
    select: {
      estimatedRevenue: true,
      createdAt: true,
      status: true,
    },
  })

  const months: Record<string, { pipeline: number; won: number }> = {}

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months[key] = { pipeline: 0, won: 0 }
  }

  leads.forEach((lead) => {
    const month = `${lead.createdAt.getFullYear()}-${String(lead.createdAt.getMonth() + 1).padStart(2, '0')}`
    if (months[month]) {
      const value = Number(lead.estimatedRevenue) || 0
      months[month].pipeline += value
      if (lead.status === 'WON') {
        months[month].won += value
      }
    }
  })

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      pipeline: data.pipeline,
      won: data.won,
    }))
}

/**
 * Obtenir KPIs generals
 */
export async function getReportKPIs() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalLeads,
    leadsThisMonth,
    leadsLastMonth,
    wonThisMonth,
    wonLastMonth,
    totalPipeline,
    avgConversionTime,
  ] = await Promise.all([
    prismaClient.companyLead.count(),
    prismaClient.companyLead.count({ where: { createdAt: { gte: startOfMonth } } }),
    prismaClient.companyLead.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prismaClient.companyLead.count({
      where: { status: 'WON', convertedAt: { gte: startOfMonth } },
    }),
    prismaClient.companyLead.count({
      where: {
        status: 'WON',
        convertedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prismaClient.companyLead.aggregate({
      where: { status: { notIn: ['WON', 'LOST'] } },
      _sum: { estimatedRevenue: true },
    }),
    prismaClient.companyLead.findMany({
      where: { status: 'WON', convertedAt: { not: null } },
      select: { createdAt: true, convertedAt: true },
    }),
  ])

  // Calcular temps mitjà de conversió
  let avgDays = 0
  if (avgConversionTime.length > 0) {
    const totalDays = avgConversionTime.reduce((sum, lead) => {
      if (!lead.convertedAt) return sum
      const days = Math.floor(
        (new Date(lead.convertedAt).getTime() - new Date(lead.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      return sum + Math.max(0, days) // Assegurar que no sigui negatiu
    }, 0)
    avgDays = Math.round(totalDays / avgConversionTime.length)
  }

  return {
    totalLeads,
    leadsThisMonth,
    leadsGrowth: leadsLastMonth > 0
      ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
      : 0,
    wonThisMonth,
    wonGrowth: wonLastMonth > 0
      ? Math.round(((wonThisMonth - wonLastMonth) / wonLastMonth) * 100)
      : 0,
    totalPipeline: Number(totalPipeline._sum.estimatedRevenue) || 0,
    avgConversionDays: avgDays,
  }
}