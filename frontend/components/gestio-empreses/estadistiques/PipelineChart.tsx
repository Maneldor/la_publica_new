'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PipelineData } from '@/lib/gestio-empreses/statistics-actions'

interface PipelineChartProps {
  data: PipelineData[] | null
  isLoading?: boolean
}

type ChartView = 'count' | 'value' | 'time' | 'distribution'

const chartViews = [
  { type: 'count' as const, label: 'Quantitat', icon: BarChart3 },
  { type: 'value' as const, label: 'Valor', icon: DollarSign },
  { type: 'time' as const, label: 'Temps', icon: Clock },
  { type: 'distribution' as const, label: 'Distribució', icon: PieChartIcon }
]

const stageColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4'  // cyan
]

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-20 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
      <div className="h-80 bg-slate-100 rounded" />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload
    if (!data) return null

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
        <p className="font-medium text-slate-900 mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-600">Deals:</span>
            <span className="font-medium">{data.count}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-600">Valor:</span>
            <span className="font-medium">{(data.value / 1000).toFixed(0)}K €</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-600">Temps mitjà:</span>
            <span className="font-medium">{data.averageTime.toFixed(1)} dies</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-medium text-slate-900">{data.payload.stage}</p>
        <p className="text-sm text-slate-600">
          {data.value} deals ({((data.value / data.payload.total) * 100).toFixed(1)}%)
        </p>
        <p className="text-sm text-slate-600">
          Valor: {(data.payload.value / 1000).toFixed(0)}K €
        </p>
      </div>
    )
  }
  return null
}

export function PipelineChart({ data, isLoading = false }: PipelineChartProps) {
  const [chartView, setChartView] = useState<ChartView>('count')

  if (isLoading || !data) {
    return <ChartSkeleton />
  }

  const totalDeals = data.reduce((sum, stage) => sum + stage.count, 0)
  const totalValue = data.reduce((sum, stage) => sum + stage.value, 0)

  // Preparar datos para el gráfico de distribución
  const pieData = data.map((stage, index) => ({
    ...stage,
    total: totalDeals,
    fill: stageColors[index % stageColors.length]
  }))

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 350,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    if (chartView === 'distribution') {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ stage, percent }) => `${stage} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={stageColors[index % stageColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer {...commonProps}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="stage"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (chartView === 'value') return `${(value / 1000).toFixed(0)}K €`
              if (chartView === 'time') return `${value.toFixed(1)}d`
              return value.toString()
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={chartView === 'value' ? 'value' : chartView === 'time' ? 'averageTime' : 'count'}
            radius={[4, 4, 0, 0]}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={stageColors[index % stageColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const getChartTitle = () => {
    switch (chartView) {
      case 'count': return 'Nombre de Deals per Etapa'
      case 'value': return 'Valor del Pipeline per Etapa'
      case 'time': return 'Temps Mitjà per Etapa'
      case 'distribution': return 'Distribució de Deals'
      default: return 'Pipeline'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{getChartTitle()}</h3>
          <p className="text-sm text-slate-600 mt-1">Anàlisi del pipeline de vendes</p>
        </div>

        {/* View selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {chartViews.map((view) => {
            const Icon = view.icon
            return (
              <Button
                key={view.type}
                variant="ghost"
                size="sm"
                onClick={() => setChartView(view.type)}
                className={cn(
                  'h-8 px-3 transition-all',
                  chartView === view.type
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline ml-1">{view.label}</span>
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
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalDeals}
          </div>
          <div className="text-sm text-slate-500">Total Deals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {(totalValue / 1000000).toFixed(1)}M €
          </div>
          <div className="text-sm text-slate-500">Valor Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(totalValue / totalDeals / 1000).toFixed(0)}K €
          </div>
          <div className="text-sm text-slate-500">Valor Mitjà</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {(data.reduce((sum, stage) => sum + (stage.averageTime * stage.count), 0) / totalDeals).toFixed(1)}d
          </div>
          <div className="text-sm text-slate-500">Temps Mitjà</div>
        </div>
      </div>

      {/* Stage details */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Detall per Etapes</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {data.map((stage, index) => (
            <div
              key={stage.stage}
              className="flex items-center justify-between p-2 bg-slate-50 rounded"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stageColors[index % stageColors.length] }}
                />
                <span className="font-medium">{stage.stage}</span>
              </div>
              <div className="text-slate-600">
                {stage.count} deals • {(stage.value / 1000).toFixed(0)}K €
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}