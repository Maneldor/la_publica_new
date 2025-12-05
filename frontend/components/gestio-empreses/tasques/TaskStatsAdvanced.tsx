// components/gestio-empreses/tasques/TaskStatsAdvanced.tsx
import {
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  completionRate: number
  avgCompletionHours: number
  dueToday: number
  overduePercentage: number
}

export function TaskStatsAdvanced({ stats }: { stats: AdvancedStats }) {
  const cards = [
    {
      label: 'Total tasques',
      value: stats.total,
      subtitle: 'Total tasques',
      icon: ClipboardList,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pendents',
      value: stats.pending,
      subtitle: stats.dueToday > 0 ? `${stats.dueToday} per avui` : 'Cap per avui',
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      subtitleColor: stats.dueToday > 0 ? 'text-amber-600' : 'text-slate-500',
    },
    {
      label: 'En progrés',
      value: stats.inProgress,
      subtitle: 'Treball actiu',
      icon: PlayCircle,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Completades',
      value: stats.completed,
      subtitle: `${stats.completionRate}% taxa completat`,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      subtitleColor: 'text-green-600',
    },
    {
      label: 'Endarrerides',
      value: stats.overdue,
      subtitle: `${stats.overduePercentage}% del total`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      subtitleColor: stats.overdue > 0 ? 'text-red-600' : 'text-slate-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {card.value}
              </p>
              <p className={cn(
                'text-xs mt-1',
                card.subtitleColor || 'text-slate-500'
              )}>
                {card.subtitle}
              </p>
            </div>
            <div className={cn('p-2 rounded-lg', card.bgColor)}>
              <card.icon className={cn('h-5 w-5', card.color.replace('bg-', 'text-'))} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}