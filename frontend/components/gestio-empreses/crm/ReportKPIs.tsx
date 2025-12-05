// components/gestio-empreses/crm/ReportKPIs.tsx
import { TrendingUp, TrendingDown, Target, Trophy, Euro, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPIs {
  totalLeads: number
  leadsThisMonth: number
  leadsGrowth: number
  wonThisMonth: number
  wonGrowth: number
  totalPipeline: number
  avgConversionDays: number
}

export function ReportKPIs({ kpis }: { kpis: KPIs }) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`
    return `${value} €`
  }

  const cards = [
    {
      label: 'Leads nous aquest mes',
      value: kpis.leadsThisMonth,
      change: kpis.leadsGrowth,
      icon: Target,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Conversions aquest mes',
      value: kpis.wonThisMonth,
      change: kpis.wonGrowth,
      icon: Trophy,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Pipeline actiu',
      value: formatCurrency(kpis.totalPipeline),
      icon: Euro,
      color: 'text-purple-600 bg-purple-50',
      isText: true,
    },
    {
      label: 'Temps mitjà conversió',
      value: `${kpis.avgConversionDays} dies`,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      isText: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              {card.change !== undefined && (
                <div className={cn(
                  'flex items-center gap-1 mt-1 text-sm',
                  card.change >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {card.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <TrendingDown className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  <span>{Math.abs(card.change)}% vs mes anterior</span>
                </div>
              )}
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