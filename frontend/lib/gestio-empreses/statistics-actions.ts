'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
  dateFrom: string
  dateTo: string
  gestorId?: string
  companyId?: string
  leadSource?: string
}

// Funciones principales
export async function getKPIData(filters: StatisticsFilters): Promise<KPIData> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Datos ficticios hasta implementar conexión real
    const mockData: KPIData = {
      totalLeads: 1247,
      totalConversions: 186,
      conversionRate: 14.9,
      averageTimeToClose: 23.5,
      pipelineValue: 2450000,
      activeDeals: 89,
      totalRevenue: 1875000,
      monthlyGrowth: 8.3
    }

    return mockData
  } catch (error) {
    console.error('Error obteniendo KPIs:', error)
    throw new Error('Error obtenint dades de KPIs')
  }
}

export async function getChartData(filters: StatisticsFilters): Promise<ChartDataPoint[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Generar datos de ejemplo para los últimos 6 meses
    const months = ['Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des']
    const mockData: ChartDataPoint[] = months.map((month, index) => ({
      date: month,
      leads: 180 + Math.floor(Math.random() * 60),
      conversions: 25 + Math.floor(Math.random() * 15),
      revenue: 280000 + Math.floor(Math.random() * 100000)
    }))

    return mockData
  } catch (error) {
    console.error('Error obteniendo datos del gráfico:', error)
    throw new Error('Error obtenint dades del gràfic')
  }
}

export async function getFunnelData(filters: StatisticsFilters): Promise<FunnelStage[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Datos ficticios del embudo de conversión
    const mockData: FunnelStage[] = [
      {
        name: 'Leads Inicials',
        count: 1247,
        percentage: 100,
        color: 'bg-blue-500'
      },
      {
        name: 'Contacte Establert',
        count: 892,
        percentage: 71.5,
        color: 'bg-green-500'
      },
      {
        name: 'Reunió Concertada',
        count: 456,
        percentage: 36.6,
        color: 'bg-yellow-500'
      },
      {
        name: 'Proposta Enviada',
        count: 234,
        percentage: 18.8,
        color: 'bg-orange-500'
      },
      {
        name: 'Conversió',
        count: 186,
        percentage: 14.9,
        color: 'bg-purple-500'
      }
    ]

    return mockData
  } catch (error) {
    console.error('Error obteniendo datos del embudo:', error)
    throw new Error('Error obtenint dades de l\'embut')
  }
}

export async function getPipelineData(filters: StatisticsFilters): Promise<PipelineData[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Datos ficticios del pipeline
    const mockData: PipelineData[] = [
      {
        stage: 'Nou Lead',
        count: 45,
        value: 450000,
        averageTime: 3.2
      },
      {
        stage: 'Contacte Inicial',
        count: 32,
        value: 380000,
        averageTime: 5.8
      },
      {
        stage: 'Reunió Programada',
        count: 28,
        value: 560000,
        averageTime: 12.5
      },
      {
        stage: 'Proposta Enviada',
        count: 15,
        value: 425000,
        averageTime: 18.3
      },
      {
        stage: 'Negociació',
        count: 8,
        value: 320000,
        averageTime: 25.7
      },
      {
        stage: 'Tancament',
        count: 5,
        value: 275000,
        averageTime: 32.1
      }
    ]

    return mockData
  } catch (error) {
    console.error('Error obteniendo datos del pipeline:', error)
    throw new Error('Error obtenint dades del pipeline')
  }
}

export async function getActivityData(filters: StatisticsFilters): Promise<ActivityData[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Datos de actividad de los últimos 30 días
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    const mockData: ActivityData[] = days.map(date => ({
      date,
      calls: Math.floor(Math.random() * 15) + 5,
      emails: Math.floor(Math.random() * 25) + 10,
      meetings: Math.floor(Math.random() * 8) + 2,
      tasks: Math.floor(Math.random() * 12) + 8
    }))

    return mockData
  } catch (error) {
    console.error('Error obteniendo datos de actividad:', error)
    throw new Error('Error obtenint dades d\'activitat')
  }
}

export async function getGestorRanking(filters: StatisticsFilters): Promise<GestorRanking[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Ranking ficticio de gestores
    const mockData: GestorRanking[] = [
      {
        id: '1',
        name: 'Maria González',
        totalLeads: 156,
        conversions: 34,
        conversionRate: 21.8,
        revenue: 425000,
        tasksCompleted: 89,
        rank: 1,
        change: 2
      },
      {
        id: '2',
        name: 'Joan Martínez',
        totalLeads: 142,
        conversions: 28,
        conversionRate: 19.7,
        revenue: 380000,
        tasksCompleted: 76,
        rank: 2,
        change: -1
      },
      {
        id: '3',
        name: 'Anna López',
        totalLeads: 138,
        conversions: 26,
        conversionRate: 18.8,
        revenue: 365000,
        tasksCompleted: 82,
        rank: 3,
        change: 1
      },
      {
        id: '4',
        name: 'Pere Rodríguez',
        totalLeads: 134,
        conversions: 22,
        conversionRate: 16.4,
        revenue: 310000,
        tasksCompleted: 71,
        rank: 4,
        change: -2
      },
      {
        id: '5',
        name: 'Laura Fernández',
        totalLeads: 129,
        conversions: 21,
        conversionRate: 16.3,
        revenue: 295000,
        tasksCompleted: 68,
        rank: 5,
        change: 0
      }
    ]

    return mockData
  } catch (error) {
    console.error('Error obteniendo ranking de gestores:', error)
    throw new Error('Error obtenint rànking de gestors')
  }
}

export async function getGestoresList(): Promise<{ id: string; name: string }[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Lista de gestores ficticios
    const mockData = [
      { id: '1', name: 'Maria González' },
      { id: '2', name: 'Joan Martínez' },
      { id: '3', name: 'Anna López' },
      { id: '4', name: 'Pere Rodríguez' },
      { id: '5', name: 'Laura Fernández' }
    ]

    return mockData
  } catch (error) {
    console.error('Error obteniendo lista de gestores:', error)
    throw new Error('Error obtenint llista de gestors')
  }
}

export async function exportStatisticsData(filters: StatisticsFilters, format: 'pdf' | 'excel'): Promise<Blob> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  try {
    // TEMPORAL: Simulación de exportación
    if (format === 'pdf') {
      // Simular generación de PDF
      const pdfContent = 'PDF content would be generated here...'
      return new Blob([pdfContent], { type: 'application/pdf' })
    } else {
      // Simular generación de Excel
      const excelContent = 'Excel content would be generated here...'
      return new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }
  } catch (error) {
    console.error('Error exportando datos:', error)
    throw new Error('Error exportant dades')
  }
}