'use client'

import { TrendingDown, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FunnelStage } from '@/lib/gestio-empreses/statistics-actions'

interface ConversionFunnelProps {
  data: FunnelStage[] | null
  isLoading?: boolean
}

interface FunnelStageProps {
  stage: FunnelStage
  isLast: boolean
  maxCount: number
}

function FunnelStageComponent({ stage, isLast, maxCount }: FunnelStageProps) {
  const width = (stage.count / maxCount) * 100

  return (
    <div className="flex items-center gap-4 group hover:bg-slate-50 rounded-lg p-3 transition-colors">
      {/* Stage bar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-slate-900 text-sm">{stage.name}</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {stage.count.toLocaleString('ca-ES')}
            </span>
            <span className="text-xs text-slate-500">
              ({stage.percentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
          <div
            className={cn(
              'h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center',
              stage.color,
              'relative'
            )}
            style={{ width: `${width}%` }}
          >
            <span className="text-white text-xs font-medium">
              {stage.count > 50 ? stage.count.toLocaleString('ca-ES') : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      {!isLast && (
        <div className="flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors">
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

function FunnelSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-slate-200 rounded" />
        <div className="h-6 bg-slate-200 rounded w-48" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
            <div className="h-8 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConversionFunnel({ data, isLoading = false }: ConversionFunnelProps) {
  if (isLoading || !data) {
    return <FunnelSkeleton />
  }

  const maxCount = Math.max(...data.map(stage => stage.count))
  const totalDropOff = data[0]?.count - data[data.length - 1]?.count || 0
  const dropOffRate = data[0]?.count ? ((totalDropOff / data[0].count) * 100).toFixed(1) : '0'

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Embut de Conversió</h3>
            <p className="text-sm text-slate-600">Analisi del procés de conversió</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {data[data.length - 1]?.percentage.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">taxa de conversió final</div>
        </div>
      </div>

      {/* Funnel stages */}
      <div className="space-y-1">
        {data.map((stage, index) => (
          <FunnelStageComponent
            key={stage.name}
            stage={stage}
            isLast={index === data.length - 1}
            maxCount={maxCount}
          />
        ))}
      </div>

      {/* Footer stats */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
              <span className="text-sm font-medium text-slate-600">Leads Perduts</span>
            </div>
            <div className="text-xl font-bold text-red-600">
              {totalDropOff.toLocaleString('ca-ES')}
            </div>
            <div className="text-xs text-slate-500">
              {dropOffRate}% del total inicial
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-green-500 rotate-180" strokeWidth={1.5} />
              <span className="text-sm font-medium text-green-600">Conversions</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {data[data.length - 1]?.count.toLocaleString('ca-ES')}
            </div>
            <div className="text-xs text-green-500">
              {data[data.length - 1]?.percentage.toFixed(1)}% èxit
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">Insights</h4>
        <p className="text-xs text-blue-700">
          La major caiguda es produeix entre "{data[1]?.name}" i "{data[2]?.name}" amb una pèrdua del{' '}
          {data[1] && data[2] ? ((data[1].count - data[2].count) / data[1].count * 100).toFixed(1) : 0}%.
          Considera optimitzar aquest punt del procés.
        </p>
      </div>
    </div>
  )
}