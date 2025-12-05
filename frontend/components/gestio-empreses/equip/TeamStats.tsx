import { Users, Target, TrendingUp, Euro, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  activeGestors: number
  activeLeads: number
  leadsPerGestor: number
  conversionsThisMonth: number
  conversionTrend: number
  pipelineTotal: number
  teamProgress: number
  teamTarget: number
}

export function TeamStats({ stats }: { stats: Stats }) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`
    if (value >= 1000) return `${Math.round(value / 1000)}K €`
    return `${value} €`
  }

  const cards = [
    {
      label: 'Gestors actius',
      value: stats.activeGestors,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Leads actius',
      value: stats.activeLeads,
      subtitle: `${stats.leadsPerGestor} per gestor`,
      icon: Target,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Conversions mes',
      value: stats.conversionsThisMonth,
      trend: stats.conversionTrend,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Pipeline total',
      value: formatCurrency(stats.pipelineTotal),
      subtitle: 'valor potencial',
      icon: Euro,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Objectiu equip',
      value: `${stats.teamProgress}%`,
      subtitle: `${stats.conversionsThisMonth}/${stats.teamTarget} leads`,
      icon: Award,
      color: stats.teamProgress >= 80
        ? 'text-green-600 bg-green-50'
        : stats.teamProgress >= 50
          ? 'text-amber-600 bg-amber-50'
          : 'text-red-600 bg-red-50',
      progress: stats.teamProgress,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-slate-500">{card.label}</p>
            <div className={cn('p-2 rounded-lg', card.color)}>
              <card.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            {card.trend !== undefined && (
              <span className={cn(
                'text-sm font-medium',
                card.trend >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {card.trend >= 0 ? '↑' : '↓'}{Math.abs(card.trend)}%
              </span>
            )}
          </div>
          {card.subtitle && (
            <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
          )}
          {card.progress !== undefined && (
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  card.progress >= 80 ? 'bg-green-500' :
                  card.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${card.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}