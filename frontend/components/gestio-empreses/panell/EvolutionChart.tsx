'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getEvolutionData, type EvolutionData } from '@/lib/gestio-empreses/dashboard-actions'

interface EvolutionChartProps {
  userId: string
}

type ChartType = 'line' | 'bar'

export function EvolutionChart({ userId }: EvolutionChartProps) {
  const [data, setData] = useState<EvolutionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartType, setChartType] = useState<ChartType>('line')

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getEvolutionData(userId)
        setData(result)
      } catch (error) {
        console.error('Error carregant dades:', error)
      }
      setIsLoading(false)
    }

    loadData()
  }, [userId])

  const totalLeads = data.reduce((sum, d) => sum + d.leads, 0)
  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0)
  const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : '0'

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-900">Evolució (6 mesos)</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('line')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded transition-colors',
              chartType === 'line'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Línia
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded transition-colors',
              chartType === 'bar'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Barres
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
          <p className="text-xs text-slate-500">Leads totals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{totalConversions}</p>
          <p className="text-xs text-slate-500">Conversions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{conversionRate}%</p>
          <p className="text-xs text-slate-500">Taxa conversió</p>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" strokeWidth={1.5} />
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  name="Leads"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  name="Conversions"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="leads" name="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name="Conversions" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}