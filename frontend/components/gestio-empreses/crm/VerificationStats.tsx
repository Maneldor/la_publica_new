// components/gestio-empreses/crm/VerificationStats.tsx
import {
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  pending: number
  approvedToday: number
  rejectedToday: number
  approvedWeek: number
  avgWaitTime: number
  slaCompliance: number
  outsideSLA: number
}

export function VerificationStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Pendents',
      value: stats.pending,
      subtitle: stats.outsideSLA > 0 ? `${stats.outsideSLA} fora SLA` : 'Tots dins SLA',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      subtitleColor: stats.outsideSLA > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      label: 'Aprovats avui',
      value: stats.approvedToday,
      subtitle: `${stats.approvedWeek} aquesta setmana`,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Rebutjats avui',
      value: stats.rejectedToday,
      subtitle: 'Leads no vàlids',
      icon: XCircle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Temps mitjà',
      value: `${stats.avgWaitTime}h`,
      subtitle: 'Temps en espera',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'SLA',
      value: `${stats.slaCompliance}%`,
      subtitle: '< 24h objectiu',
      icon: AlertTriangle,
      color: stats.slaCompliance >= 90
        ? 'text-green-600 bg-green-50'
        : stats.slaCompliance >= 70
          ? 'text-amber-600 bg-amber-50'
          : 'text-red-600 bg-red-50',
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
            <div className={cn('p-2 rounded-lg', card.color)}>
              <card.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className={cn('text-xs mt-1', card.subtitleColor || 'text-slate-400')}>
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}