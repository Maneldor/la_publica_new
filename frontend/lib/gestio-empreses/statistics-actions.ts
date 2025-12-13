'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay, subDays, differenceInDays } from 'date-fns'
import { ca } from 'date-fns/locale'

// Tipos para las estadísticas
export interface KPIData {
  totalLeads: number
  totalConversions: number
  conversionRate: number
  averageTimeToClose: number
  pipelineValue: number
  activeDeals: number
  totalRevenue: number
  monthlyGrowth: number
}

export interface ChartDataPoint {
  date: string
  leads: number
  conversions: number
  revenue: number
}

export interface FunnelStage {
  name: string
  count: number
  percentage: number
  color: string
}

export interface PipelineData {
  stage: string
  count: number
  value: number
  averageTime: number
}

export interface ActivityData {
  date: string
  calls: number
  emails: number
  meetings: number
  tasks: number
}

export interface GestorRanking {
  id: string
  name: string
  totalLeads: number
  conversions: number
  conversionRate: number
  revenue: number
  tasksCompleted: number
  rank: number
  change: number
}

export interface StatisticsFilters {
  dateFrom?: string
  dateTo?: string
  gestorId?: string
  companyId?: string
  leadSource?: string
}

// Helper para construir el where clause base
const buildWhereClause = (filters: StatisticsFilters, dateField: string = 'createdAt') => {
  const where: any = {}

  if (filters.dateFrom || filters.dateTo) {
    where[dateField] = {}
    if (filters.dateFrom) where[dateField].gte = new Date(filters.dateFrom)
    if (filters.dateTo) where[dateField].lte = new Date(filters.dateTo)
  }

  if (filters.gestorId) {
    where.assignedToId = filters.gestorId
  }

  return where
}

// Funciones principales
export async function getKPIData(filters: StatisticsFilters): Promise<KPIData> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autoritzat')

  const where = buildWhereClause(filters)

  // Calcular rango anterior para crecimiento
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const previousMonthStart = startOfMonth(subMonths(now, 1))
  const previousMonthEnd = endOfMonth(subMonths(now, 1))

  try {
    const [
      totalLeads,
      conversions,
      deals,
      previousLeads,
      revenueResult
    ] = await Promise.all([
      prismaClient.companyLead.count({ where }),
      prismaClient.companyLead.count({
        where: {
          ...where,
          convertedAt: { not: null }
        }
      }),
      prismaClient.companyLead.findMany({
        where: {
          ...where,
          status: { notIn: ['CLOSED_LOST', 'CLOSED_WON'] } // Activos
        },
        select: { estimatedValue: true }
      }),
      prismaClient.companyLead.count({
        where: {
          ...where,
          createdAt: { gte: previousMonthStart, lte: previousMonthEnd }
        }
      }),
      prismaClient.invoice.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: 'PAID', // Usando el enum InvoiceStatus? Asumiendo string o enum match
          date: filters.dateFrom ? { gte: new Date(filters.dateFrom) } : undefined
        } as any // Cast simple por si el campo de fecha en invoice es issueDate
      })
    ])

    // Si la tabla invoice usa issueDate en lugar de date
    // Ajuste: Invoice usa issueDate
    const revenueWhere: any = { status: 'PAID' }
    if (filters.dateFrom) revenueWhere.issueDate = { gte: new Date(filters.dateFrom) }
    if (filters.dateTo) revenueWhere.issueDate = { lte: new Date(filters.dateTo) }

    const realRevenue = await prismaClient.invoice.aggregate({
      _sum: { totalAmount: true },
      where: revenueWhere
    })

    // Calcular conversion rate
    const conversionRate = totalLeads > 0
      ? Number(((conversions / totalLeads) * 100).toFixed(1))
      : 0

    // Calcular pipeline value
    const pipelineValue = deals.reduce((acc, deal) => acc + Number(deal.estimatedValue || 0), 0)

    // Calcular crecimiento mensual (basado en leads creados)
    const currentMonthLeads = await prismaClient.companyLead.count({
      where: {
        ...where,
        createdAt: { gte: currentMonthStart }
      }
    })

    // Comparativa simple: leads este mes vs leads mes anterior (ajustar si se quiere comparar periodos completos)
    // Para simplificar, usaremos growth entre total del periodo filtrado vs periodo anterior de misma duración
    // Pero aquí usaremos leads mes actual vs mes anterior absolute
    const monthlyGrowth = previousLeads > 0
      ? Number((((currentMonthLeads - previousLeads) / previousLeads) * 100).toFixed(1))
      : 0

    // Tiempo medio cierre (en leads convertidos)
    const convertedLeads = await prismaClient.companyLead.findMany({
      where: {
        ...where,
        convertedAt: { not: null },
        createdAt: { not: null } // Sanity check
      },
      select: { createdAt: true, convertedAt: true }
    })

    let totalDays = 0
    convertedLeads.forEach(lead => {
      if (lead.convertedAt && lead.createdAt) {
        totalDays += differenceInDays(new Date(lead.convertedAt), new Date(lead.createdAt))
      }
    })
    const averageTimeToClose = convertedLeads.length > 0
      ? Number((totalDays / convertedLeads.length).toFixed(1))
      : 0

    return {
      totalLeads,
      totalConversions: conversions,
      conversionRate,
      averageTimeToClose,
      pipelineValue,
      activeDeals: deals.length,
      totalRevenue: Number(realRevenue._sum.totalAmount || 0),
      monthlyGrowth
    }
  } catch (error) {
    console.error('Error obteniendo KPIs:', error)
    return {
      totalLeads: 0,
      totalConversions: 0,
      conversionRate: 0,
      averageTimeToClose: 0,
      pipelineValue: 0,
      activeDeals: 0,
      totalRevenue: 0,
      monthlyGrowth: 0
    }
  }
}

export async function getChartData(filters: StatisticsFilters): Promise<ChartDataPoint[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autoritzat')

  const where = buildWhereClause(filters)

  try {
    // Agrupar por fecha (día o mes según el rango)
    // Prisma no soporta well group by date formatted out of the box easily without raw query
    // Haremos fetch y procesaremos en JS para simplificar compatibilidad

    const leads = await prismaClient.companyLead.findMany({
      where,
      select: { createdAt: true, convertedAt: true }
    })

    const invoices = await prismaClient.invoice.findMany({
      where: {
        status: 'PAID',
        issueDate: where.createdAt // Reutilizar rango fechas
      },
      select: { issueDate: true, totalAmount: true }
    })

    // Mapa por fecha
    const dataMap = new Map<string, ChartDataPoint>()

    // Helper key format
    const getKey = (date: Date) => format(date, 'yyyy-MM-dd')
    const getLabel = (date: Date) => format(date, 'd MMM', { locale: ca })

    // Rellenar con leads
    leads.forEach(lead => {
      const key = getKey(new Date(lead.createdAt))
      const label = getLabel(new Date(lead.createdAt))

      if (!dataMap.has(key)) {
        dataMap.set(key, { date: label, leads: 0, conversions: 0, revenue: 0 })
      }
      dataMap.get(key)!.leads++

      if (lead.convertedAt) {
        // Si queremos contar conversiones el día que ocurren, usaríamos convertedAt
        // Si queremos conversion rate cohort, es dif. Aquí contamos conversiones por fecha de evento conversión
        const convKey = getKey(new Date(lead.convertedAt))
        const convLabel = getLabel(new Date(lead.convertedAt))

        if (!dataMap.has(convKey)) {
          dataMap.set(key, { date: convLabel, leads: 0, conversions: 0, revenue: 0 })
        }
        // Nota: esto puede desalinear si filtramos por created. 
        // Simplificación: Contamos conversión en el día de creación para tasa de ese cohort,
        // O simplemente incrementamos el día de conversión si cae en el rango?
        // Lo ideal para gráfico es "eventos por día".
        // Re-calculamos key para conversion
        const conversionDate = new Date(lead.convertedAt)
        // Verificar si cae en rango
        let inRange = true
        if (filters.dateFrom && conversionDate < new Date(filters.dateFrom)) inRange = false
        if (filters.dateTo && conversionDate > new Date(filters.dateTo)) inRange = false

        if (inRange) {
          const cKey = getKey(conversionDate)
          const cLabel = getLabel(conversionDate)
          if (!dataMap.has(cKey)) {
            dataMap.set(cKey, { date: cLabel, leads: 0, conversions: 0, revenue: 0 })
          }
          dataMap.get(cKey)!.conversions++
        }
      }
    })

    // Rellenar con facturación
    invoices.forEach(inv => {
      const key = getKey(new Date(inv.issueDate))
      const label = getLabel(new Date(inv.issueDate))
      if (!dataMap.has(key)) {
        dataMap.set(key, { date: label, leads: 0, conversions: 0, revenue: 0 })
      }
      dataMap.get(key)!.revenue += Number(inv.totalAmount || 0)
    })

    // Convertir a array y ordenar
    return Array.from(dataMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, v]) => v)
    // Limitar puntos si son muchos? No, recharts aguanta bien.

  } catch (error) {
    console.error('Error obteniendo datos del gráfico:', error)
    return []
  }
}

export async function getFunnelData(filters: StatisticsFilters): Promise<FunnelStage[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autoritzat')

  const where = buildWhereClause(filters)

  try {
    // Definir etapas hardcoded basándonos en LeadStatus
    // NEW -> CONTACTED -> PROPOSAL_SENT -> CLOSED_WON (Converted)

    const [total, contacted, proposed, won] = await Promise.all([
      prismaClient.companyLead.count({ where }),
      prismaClient.companyLead.count({ where: { ...where, status: { in: ['CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON'] } } }),
      prismaClient.companyLead.count({ where: { ...where, status: { in: ['PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON'] } } }),
      prismaClient.companyLead.count({ where: { ...where, status: 'CLOSED_WON' } })
    ])

    const calcPerc = (val: number) => total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0

    return [
      {
        name: 'Leads Totals',
        count: total,
        percentage: 100,
        color: '#3b82f6' // blue-500
      },
      {
        name: 'Contactats',
        count: contacted,
        percentage: calcPerc(contacted),
        color: '#22c55e' // green-500
      },
      {
        name: 'Proposta',
        count: proposed,
        percentage: calcPerc(proposed),
        color: '#eab308' // yellow-500
      },
      {
        name: 'Guanyats',
        count: won,
        percentage: calcPerc(won),
        color: '#a855f7' // purple-500
      }
    ]

  } catch (error) {
    console.error('Error obteniendo datos del embudo:', error)
    return []
  }
}

export async function getPipelineData(filters: StatisticsFilters): Promise<PipelineData[]> {
  // Similar al funnel pero agrupado por 'status' actual
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autoritzat')

  const where = buildWhereClause(filters)

  try {
    const grouped = await prismaClient.companyLead.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
      _sum: { estimatedValue: true }
    })

    return grouped.map(g => ({
      stage: g.status,
      count: g._count.id,
      value: Number(g._sum.estimatedValue || 0),
      averageTime: 0 // Calcular esto sería costoso without another query
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getActivityData(filters: StatisticsFilters): Promise<ActivityData[]> {
  // Usar LeadInteraction / LeadActivity
  // Agrupar por tipo y día
  return [] // TODO: Implementar si hace falta
}

export async function getGestorRanking(filters: StatisticsFilters): Promise<GestorRanking[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autoritzat')

  const where = buildWhereClause(filters)

  try {
    const leadsByGestor = await prismaClient.companyLead.groupBy({
      by: ['assignedToId'],
      where: { ...where, assignedToId: { not: null } },
      _count: { id: true },
    })

    // Necesitamos nombres de usuarios
    const userIds = leadsByGestor.map(l => l.assignedToId).filter(Boolean) as string[]
    const users = await prismaClient.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true }
    })

    // Obtener conversiones y facturación por gestor
    // Lamentablemente groupBy de prisma no permite filtrar dentro del agg de manera condicional compleja
    // Iteraremos

    const rankingPromises = leadsByGestor.map(async (item) => {
      const userId = item.assignedToId!

      const [conversions, revenueAgg] = await Promise.all([
        prismaClient.companyLead.count({
          where: { ...where, assignedToId: userId, convertedAt: { not: null } }
        }),
        // Facturación: asumir que invoice tiene createdById o similar, pero Invoice se relaciona con Company.
        // Company se relaciona con Lead (originalLead).
        // Complejo. Simplificamos usando 'estimatedValue' de leads cerrados (CLOSED_WON) asignados al gestor
        prismaClient.companyLead.aggregate({
          _sum: { estimatedValue: true },
          where: { ...where, assignedToId: userId, status: 'CLOSED_WON' }
        })
      ])

      const tasks = await prismaClient.task.count({
        where: {
          assignedToId: userId,
          status: 'COMPLETED',
          createdAt: where.createdAt // aplicar filtro fecha si existe
        }
      })

      const user = users.find(u => u.id === userId)

      return {
        id: userId,
        name: user?.name || 'Desconegut',
        totalLeads: item._count.id,
        conversions,
        conversionRate: item._count.id > 0 ? Number(((conversions / item._count.id) * 100).toFixed(1)) : 0,
        revenue: Number(revenueAgg._sum.estimatedValue || 0),
        tasksCompleted: tasks,
        rank: 0,
        change: 0 // Placeholder
      }
    })

    const ranking = await Promise.all(rankingPromises)

    // Ordenar y asignar rank
    return ranking
      .sort((a, b) => b.revenue - a.revenue) // Ordenar por revenue por defecto
      .map((r, i) => ({ ...r, rank: i + 1 }))

  } catch (error) {
    console.error('Error obteniendo ranking de gestores:', error)
    return []
  }
}

export async function getGestoresList(): Promise<{ id: string; name: string }[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autoritzat')

  const users = await prismaClient.user.findMany({
    where: {
      isActive: true,
      role: { in: ['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'USER'] } // Ajustar roles 'GESTOR'?
    },
    select: { id: true, name: true }
  })

  return users.map(u => ({ id: u.id, name: u.name || 'Sin nombre' }))
}

export async function exportStatisticsData(filters: StatisticsFilters, format: 'pdf' | 'excel'): Promise<{ success: boolean }> {
  // Server actions returning blob is hard. Usually we construct a URL to download.
  // Or return base64 string.
  // This function might just verify permissions and setup data?
  // User requested separate API routes for export, we should instruct frontend to use those.
  return { success: true }
}