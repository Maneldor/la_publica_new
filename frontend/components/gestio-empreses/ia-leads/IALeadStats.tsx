// components/gestio-empreses/ia-leads/IALeadStats.tsx
import {
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  totalGenerated: number
  totalQualified: number
  qualificationRate: number
  highPriority: number
  avgScore: number
  creditsRemaining: number
  creditsUsed: number
  monthlyLimit: number
}

export function IALeadStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Leads generats',
      value: stats.totalGenerated,
      subtitle: 'Últims 30 dies',
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Qualificats',
      value: stats.totalQualified,
      subtitle: `${stats.qualificationRate}% taxa`,
      icon: Target,
      color: 'text-green-600 bg-green-50',
      subtitleColor: 'text-green-600',
    },
    {
      label: 'Puntuació mitjana',
      value: `${stats.avgScore}%`,
      subtitle: 'Score IA',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Alta prioritat',
      value: stats.highPriority,
      subtitle: 'Score ≥85%',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Crèdits',
      value: stats.creditsRemaining,
      subtitle: `${stats.creditsUsed}/${stats.monthlyLimit} usats`,
      icon: Zap,
      color: stats.creditsRemaining < 20 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50',
      progress: (stats.creditsRemaining / stats.monthlyLimit) * 100,
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
          <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
          <p className={cn('text-xs mt-1', card.subtitleColor || 'text-slate-500')}>
            {card.subtitle}
          </p>
          {card.progress !== undefined && (
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  card.progress > 50 ? 'bg-green-500' : card.progress > 20 ? 'bg-amber-500' : 'bg-red-500'
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