'use client'

import { Trophy, Medal, Award, TrendingUp, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RankingItem {
  id: string
  name: string | null
  email: string
  image: string | null
  activeLeads: number
  wonThisMonth: number
  pipeline: number
  wonRevenue: number
  conversionRate: number
}

interface MonthlyRankingProps {
  ranking: RankingItem[]
  onSelectGestor: (id: string) => void
}

const positionConfig = [
  { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: '1r' },
  { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', label: '2n' },
  { icon: Award, color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-100', label: '3r' },
]

export function MonthlyRanking({ ranking, onSelectGestor }: MonthlyRankingProps) {
  const topThree = ranking.slice(0, 3)
  const maxRevenue = Math.max(...topThree.map((r) => r.wonRevenue + r.pipeline), 1)

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`
    if (value >= 1000) return `${Math.round(value / 1000)}K €`
    return `${value} €`
  }

  if (topThree.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-xl border border-amber-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-100">
          <Trophy className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Ranking del mes</h2>
          <p className="text-sm text-slate-500">Top performers per facturació i conversions</p>
        </div>
      </div>

      <div className="space-y-3">
        {topThree.map((gestor, index) => {
          const config = positionConfig[index]
          const Icon = config.icon
          const barWidth = ((gestor.wonRevenue + gestor.pipeline) / maxRevenue) * 100

          return (
            <div
              key={gestor.id}
              onClick={() => onSelectGestor(gestor.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                config.bg,
                config.border
              )}
            >
              {/* Position */}
              <div className={cn('flex items-center justify-center h-10 w-10 rounded-full', config.bg)}>
                <Icon className={cn('h-5 w-5', config.color)} strokeWidth={1.5} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-sm font-bold', config.color)}>{config.label}</span>
                  <p className="font-semibold text-slate-900 truncate">
                    {gestor.name || gestor.email}
                  </p>
                  {index === 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      Top performer
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                      index === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                      'bg-gradient-to-r from-amber-600 to-amber-700'
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-medium">{formatCurrency(gestor.wonRevenue + gestor.pipeline)}</span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                    {gestor.activeLeads} leads
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                    {gestor.conversionRate}% conv.
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}