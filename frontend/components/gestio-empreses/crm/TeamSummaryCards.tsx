// components/gestio-empreses/crm/TeamSummaryCards.tsx
import { Users, Target, TrendingUp, Euro } from 'lucide-react'

interface TeamSummary {
  totalGestors: number
  totalLeads: number
  activeLeads: number
  wonThisMonth: number
  totalPipelineValue: number
  avgLeadsPerGestor: number
}

export function TeamSummaryCards({ summary }: { summary: TeamSummary }) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`
    }
    return `${value} €`
  }

  const cards = [
    {
      label: 'Gestors actius',
      value: summary.totalGestors,
      subtitle: `${summary.avgLeadsPerGestor} leads/gestor`,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Leads actius',
      value: summary.activeLeads,
      subtitle: `de ${summary.totalLeads} totals`,
      icon: Target,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Conversions mes',
      value: summary.wonThisMonth,
      subtitle: 'leads guanyats',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Pipeline total',
      value: formatCurrency(summary.totalPipelineValue),
      subtitle: 'valor potencial',
      icon: Euro,
      color: 'text-amber-600 bg-amber-50',
      isText: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-xs text-slate-400 mt-0.5">{card.subtitle}</p>
            </div>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}