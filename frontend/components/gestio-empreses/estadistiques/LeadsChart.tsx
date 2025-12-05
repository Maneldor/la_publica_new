'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts'
import { BarChart3, LineChart as LineChartIcon, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from '@/lib/gestio-empreses/statistics-actions'

interface LeadsChartProps {
  data: ChartDataPoint[] | null
  isLoading?: boolean
}

type ChartType = 'line' | 'bar' | 'combined'

const chartTypes = [
  { type: 'line' as const, label: 'Línies', icon: LineChartIcon },
  { type: 'bar' as const, label: 'Barres', icon: BarChart3 },
  { type: 'combined' as const, label: 'Combinat', icon: Activity }
]

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-16 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
      <div className="h-80 bg-slate-100 rounded" />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-medium text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.dataKey === 'leads' ? 'Leads' : entry.dataKey === 'conversions' ? 'Conversions' : 'Ingressos'}:</span>
            <span className="font-medium">
              {entry.dataKey === 'revenue'
                ? `${(entry.value / 1000).toFixed(0)}K €`
                : entry.value.toLocaleString('ca-ES')
              }
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function LeadsChart({ data, isLoading = false }: LeadsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('combined')

  if (isLoading || !data) {
    return <ChartSkeleton />
  }

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 350,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString('ca-ES')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Leads"
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString('ca-ES')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="leads"
                fill="#3b82f6"
                name="Leads"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="conversions"
                fill="#10b981"
                name="Conversions"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'combined':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString('ca-ES')}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K €`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="leads"
                fill="#3b82f6"
                name="Leads"
                radius={[2, 2, 0, 0]}
                fillOpacity={0.8}
              />
              <Bar
                yAxisId="left"
                dataKey="conversions"
                fill="#10b981"
                name="Conversions"
                radius={[2, 2, 0, 0]}
                fillOpacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Ingressos"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Evolució de Leads i Conversions</h3>
          <p className="text-sm text-slate-600 mt-1">Seguiment temporal del rendiment</p>
        </div>

        {/* Chart type selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {chartTypes.map((type) => {
            const Icon = type.icon
            return (
              <Button
                key={type.type}
                variant="ghost"
                size="sm"
                onClick={() => setChartType(type.type)}
                className={cn(
                  'h-8 px-3 transition-all',
                  chartType === type.type
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline ml-1">{type.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        {renderChart()}
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + item.leads, 0).toLocaleString('ca-ES')}
          </div>
          <div className="text-sm text-slate-500">Total Leads</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.reduce((sum, item) => sum + item.conversions, 0).toLocaleString('ca-ES')}
          </div>
          <div className="text-sm text-slate-500">Total Conversions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {((data.reduce((sum, item) => sum + item.revenue, 0)) / 1000000).toFixed(1)}M €
          </div>
          <div className="text-sm text-slate-500">Ingressos Totals</div>
        </div>
      </div>
    </div>
  )
}