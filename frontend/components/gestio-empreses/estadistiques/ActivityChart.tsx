'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts'
import { Activity, Phone, Mail, Calendar, CheckSquare, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ActivityData } from '@/lib/gestio-empreses/statistics-actions'

interface ActivityChartProps {
  data: ActivityData[] | null
  isLoading?: boolean
}

type ChartType = 'line' | 'area' | 'bar'

const chartTypes = [
  { type: 'line' as const, label: 'Línies', icon: TrendingUp },
  { type: 'area' as const, label: 'Àrees', icon: Activity },
  { type: 'bar' as const, label: 'Barres', icon: BarChart }
]

const activityTypes = [
  { key: 'calls', label: 'Trucades', color: '#3b82f6', icon: Phone },
  { key: 'emails', label: 'Emails', color: '#10b981', icon: Mail },
  { key: 'meetings', label: 'Reunions', color: '#f59e0b', icon: Calendar },
  { key: 'tasks', label: 'Tasques', color: '#8b5cf6', icon: CheckSquare }
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
    const date = new Date(label)
    const formattedDate = date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short'
    })

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
        <p className="font-medium text-slate-900 mb-2">{formattedDate}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => {
            const activity = activityTypes.find(a => a.key === entry.dataKey)
            if (!activity) return null

            const Icon = activity.icon
            return (
              <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4" style={{ color: entry.color }} strokeWidth={1.5} />
                <span className="text-slate-600">{activity.label}:</span>
                <span className="font-medium">{entry.value}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Total:</span>
            <span className="font-medium">
              {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function ActivityChart({ data, isLoading = false }: ActivityChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    activityTypes.map(a => a.key)
  )

  if (isLoading || !data) {
    return <ChartSkeleton />
  }

  // Obtener datos de los últimos 30 días para el resumen
  const recentData = data.slice(-30)
  const totals = activityTypes.map(activity => ({
    ...activity,
    total: recentData.reduce((sum, day) => sum + day[activity.key as keyof ActivityData], 0)
  }))

  const toggleActivity = (activityKey: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityKey)
        ? prev.filter(key => key !== activityKey)
        : [...prev, activityKey]
    )
  }

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 350,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    const filteredActivityTypes = activityTypes.filter(activity =>
      selectedActivities.includes(activity.key)
    )

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
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {filteredActivityTypes.map(activity => (
                <Line
                  key={activity.key}
                  type="monotone"
                  dataKey={activity.key}
                  stroke={activity.color}
                  strokeWidth={2}
                  dot={{ fill: activity.color, strokeWidth: 2, r: 3 }}
                  name={activity.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {filteredActivityTypes.map(activity => (
                <Area
                  key={activity.key}
                  type="monotone"
                  dataKey={activity.key}
                  stroke={activity.color}
                  fill={activity.color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name={activity.label}
                />
              ))}
            </AreaChart>
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
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
                }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {filteredActivityTypes.map(activity => (
                <Bar
                  key={activity.key}
                  dataKey={activity.key}
                  fill={activity.color}
                  name={activity.label}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-orange-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Activitat Diària</h3>
            <p className="text-sm text-slate-600">Seguiment de l'activitat comercial</p>
          </div>
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
                    ? 'bg-white shadow-sm text-orange-600'
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

      {/* Activity type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activityTypes.map((activity) => {
          const Icon = activity.icon
          const isSelected = selectedActivities.includes(activity.key)
          return (
            <Button
              key={activity.key}
              variant="outline"
              size="sm"
              onClick={() => toggleActivity(activity.key)}
              className={cn(
                'h-8 transition-all',
                isSelected
                  ? 'border-current text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
              style={{
                backgroundColor: isSelected ? activity.color : 'transparent',
                borderColor: activity.color
              }}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="ml-1">{activity.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Chart */}
      <div className="w-full">
        {renderChart()}
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
        {totals.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.key} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="h-4 w-4" style={{ color: activity.color }} strokeWidth={1.5} />
                <span className="text-sm text-slate-600">{activity.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: activity.color }}>
                {activity.total}
              </div>
              <div className="text-xs text-slate-500">últims 30 dies</div>
            </div>
          )
        })}
      </div>

      {/* Daily average */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-slate-600 mb-1">Mitjana diària</div>
          <div className="flex items-center justify-center gap-6 text-sm">
            {totals.map((activity) => (
              <div key={activity.key} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activity.color }}
                />
                <span className="text-slate-600">{activity.label}:</span>
                <span className="font-medium">{(activity.total / 30).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}