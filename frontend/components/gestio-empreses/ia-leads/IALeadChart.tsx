// components/gestio-empreses/ia-leads/IALeadChart.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGenerationPerformance } from '@/lib/gestio-empreses/ia-lead-actions'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'

interface PerformanceData {
  week: string
  generated: number
  accepted: number
}

interface IALeadChartProps {
  userId: string
  initialData?: PerformanceData[]
}

export function IALeadChart({ userId, initialData }: IALeadChartProps) {
  const [data, setData] = useState<PerformanceData[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const loadData = async () => {
    try {
      const performanceData = await getGenerationPerformance(userId)
      setData(performanceData)
    } catch (error) {
      console.error('Error carregant dades del gràfic:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialData) {
      loadData()
    }
  }, [userId])

  const formatWeekLabel = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'd MMM', { locale: ca })
  }

  const getPieData = () => {
    const totalGenerated = data.reduce((sum, item) => sum + item.generated, 0)
    const totalAccepted = data.reduce((sum, item) => sum + item.accepted, 0)
    const rejected = totalGenerated - totalAccepted

    return [
      { name: 'Acceptats', value: totalAccepted, color: '#10b981' },
      { name: 'Rebutjats', value: rejected, color: '#f59e0b' },
    ]
  }

  const pieData = getPieData()
  const totalGenerated = data.reduce((sum, item) => sum + item.generated, 0)
  const totalAccepted = data.reduce((sum, item) => sum + item.accepted, 0)
  const acceptanceRate = totalGenerated > 0 ? Math.round((totalAccepted / totalGenerated) * 100) : 0

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" strokeWidth={1.5} />
          <span className="ml-2 text-slate-500">Carregant gràfic...</span>
        </div>
      </div>
    )
  }

  // Si no hi ha dades, mostrar placeholder per evitar warnings de gràfic
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-slate-100">
            <BarChart3 className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Rendiment de generacions</h2>
            <p className="text-sm text-slate-500">Evolució dels leads generats i acceptats</p>
          </div>
        </div>
        <div className="h-[200px] flex items-center justify-center text-slate-400">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-300" strokeWidth={1} />
            <p className="font-medium">No hi ha dades de rendiment disponibles</p>
            <p className="text-sm mt-1">Genera alguns leads amb IA per veure estadístiques</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <BarChart3 className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Rendiment de generacions</h3>
              <p className="text-sm text-slate-500">Evolució dels leads generats i acceptats</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('bar')}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                chartType === 'bar'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              )}
            >
              <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={cn(
                'p-2 rounded-lg border transition-colors',
                chartType === 'pie'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              )}
            >
              <PieChartIcon className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {chartType === 'bar' ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="week"
                  tickFormatter={formatWeekLabel}
                  className="text-sm"
                  stroke="#64748b"
                />
                <YAxis className="text-sm" stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelFormatter={(value) => `Setmana ${formatWeekLabel(value)}`}
                />
                <Bar
                  dataKey="generated"
                  name="Generats"
                  fill="#8b5cf6"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="accepted"
                  name="Acceptats"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 ml-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-green-900">Leads acceptats</p>
                      <p className="text-sm text-green-700">{totalAccepted} de {totalGenerated}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-green-900">{acceptanceRate}%</p>
                    <p className="text-sm text-green-700">Taxa d'acceptació</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-amber-900">Leads rebutjats</p>
                      <p className="text-sm text-amber-700">{totalGenerated - totalAccepted} de {totalGenerated}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-amber-900">{100 - acceptanceRate}%</p>
                    <p className="text-sm text-amber-700">Taxa de rebuig</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <TrendingUp className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Tendència: {acceptanceRate >= 70 ? 'Molt bona' : acceptanceRate >= 50 ? 'Bona' : 'Millorable'}
                    </p>
                    <p className="text-xs text-blue-700">
                      {acceptanceRate >= 70
                        ? 'Excel·lent taxa d\'acceptació'
                        : acceptanceRate >= 50
                          ? 'Taxa d\'acceptació satisfactòria'
                          : 'Considera ajustar els criteris de generació'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}