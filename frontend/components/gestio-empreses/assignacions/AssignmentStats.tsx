// components/gestio-empreses/assignacions/AssignmentStats.tsx
import { Users, UserX, Gauge, BarChart3, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  totalLeads: number
  unassignedLeads: number
  teamLoad: number
  avgPerGestor: number
  reassignedToday: number
}

export function AssignmentStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Leads actius',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Sense assignar',
      value: stats.unassignedLeads,
      icon: UserX,
      color: stats.unassignedLeads > 0
        ? 'text-amber-600 bg-amber-50'
        : 'text-green-600 bg-green-50',
      alert: stats.unassignedLeads > 0,
    },
    {
      label: 'Càrrega equip',
      value: `${stats.teamLoad}%`,
      icon: Gauge,
      color: stats.teamLoad > 80
        ? 'text-red-600 bg-red-50'
        : stats.teamLoad > 50
          ? 'text-amber-600 bg-amber-50'
          : 'text-green-600 bg-green-50',
      progress: stats.teamLoad,
    },
    {
      label: 'Mitjana/gestor',
      value: stats.avgPerGestor,
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Reassignats avui',
      value: stats.reassignedToday,
      icon: RefreshCw,
      color: 'text-slate-600 bg-slate-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            'bg-white rounded-xl border border-slate-200 p-4',
            card.alert && 'border-amber-300'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className={cn('p-2 rounded-lg', card.color)}>
              <card.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
          <p className="text-sm text-slate-500">{card.label}</p>
          {card.progress !== undefined && (
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  card.progress > 80 ? 'bg-red-500' :
                  card.progress > 50 ? 'bg-amber-500' : 'bg-green-500'
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