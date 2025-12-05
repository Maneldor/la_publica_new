'use client'

import { useState, useEffect } from 'react'
import {
  Target,
  TrendingUp,
  CheckCircle,
  Calendar,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPerformanceData, type PerformanceData } from '@/lib/gestio-empreses/dashboard-actions'

interface PerformanceWidgetProps {
  userId: string
}

interface MetricProps {
  icon: any
  label: string
  current: number
  target: number
  color: string
}

function PerformanceMetric({ icon: Icon, label, current, target, color }: MetricProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isAchieved = current >= target

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', color)} strokeWidth={1.5} />
          <span className="text-sm text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn(
            'text-sm font-semibold',
            isAchieved ? 'text-green-600' : 'text-slate-900'
          )}>
            {current}
          </span>
          <span className="text-sm text-slate-400">/ {target}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isAchieved ? 'bg-green-500' : color.replace('text-', 'bg-')
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function PerformanceWidget({ userId }: PerformanceWidgetProps) {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getPerformanceData(userId)
        setData(result)
      } catch (error) {
        console.error('Error carregant rendiment:', error)
      }
      setIsLoading(false)
    }

    loadData()
  }, [userId])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" strokeWidth={1.5} />
        </div>
      </div>
    )
  }

  if (!data) return null

  const totalAchieved = [
    data.leadsCreated >= data.leadsTarget,
    data.conversions >= data.conversionsTarget,
    data.tasksCompleted >= data.tasksTarget,
    data.eventsHeld >= data.eventsTarget
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-900">Rendiment mensual</h3>
        </div>
        <span className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-full',
          totalAchieved >= 3
            ? 'bg-green-100 text-green-700'
            : totalAchieved >= 2
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-700'
        )}>
          {totalAchieved}/4 objectius
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        <PerformanceMetric
          icon={TrendingUp}
          label="Leads creats"
          current={data.leadsCreated}
          target={data.leadsTarget}
          color="text-blue-500"
        />
        <PerformanceMetric
          icon={Target}
          label="Conversions"
          current={data.conversions}
          target={data.conversionsTarget}
          color="text-green-500"
        />
        <PerformanceMetric
          icon={CheckCircle}
          label="Tasques completades"
          current={data.tasksCompleted}
          target={data.tasksTarget}
          color="text-purple-500"
        />
        <PerformanceMetric
          icon={Calendar}
          label="Esdeveniments"
          current={data.eventsHeld}
          target={data.eventsTarget}
          color="text-amber-500"
        />
      </div>

      {/* Summary */}
      <div className={cn(
        'mt-6 p-3 rounded-lg text-center',
        totalAchieved >= 3 ? 'bg-green-50' : 'bg-slate-50'
      )}>
        {totalAchieved >= 4 ? (
          <p className="text-sm font-medium text-green-700">
            Excel·lent! Has assolit tots els objectius del mes.
          </p>
        ) : totalAchieved >= 3 ? (
          <p className="text-sm font-medium text-green-700">
            Molt bé! Vas pel bon camí.
          </p>
        ) : totalAchieved >= 2 ? (
          <p className="text-sm font-medium text-amber-700">
            Segueix així! Pots millorar en alguns aspectes.
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-600">
            Encara tens marge per assolir els teus objectius.
          </p>
        )}
      </div>
    </div>
  )
}