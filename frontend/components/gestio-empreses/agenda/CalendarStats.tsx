// components/gestio-empreses/agenda/CalendarStats.tsx
import { Calendar, CalendarDays, CalendarRange, CheckCircle } from 'lucide-react'

interface Stats {
  today: number
  thisWeek: number
  thisMonth: number
  completedThisMonth: number
}

export function CalendarStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Avui',
      value: stats.today,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Aquesta setmana',
      value: stats.thisWeek,
      icon: CalendarDays,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Aquest mes',
      value: stats.thisMonth,
      icon: CalendarRange,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Completats/mes',
      value: stats.completedThisMonth,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}