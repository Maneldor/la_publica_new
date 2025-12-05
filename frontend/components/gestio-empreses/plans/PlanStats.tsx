'use client'

import { CreditCard, Eye, Clock, TrendingUp, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
  isActive: boolean
  isVisible: boolean
  hasFreeTrial: boolean
  basePrice: number
}

interface PlanStatsProps {
  plans: Plan[]
  totalSubscriptions?: number
}

export function PlanStats({ plans, totalSubscriptions = 0 }: PlanStatsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K €`
    return `${value.toFixed(0)} €`
  }

  const stats = [
    {
      label: 'Plans actius',
      value: plans.filter(p => p.isActive).length,
      total: plans.length,
      icon: CreditCard,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Plans visibles',
      value: plans.filter(p => p.isVisible).length,
      icon: Eye,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Amb trial',
      value: plans.filter(p => p.hasFreeTrial).length,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Subscripcions',
      value: totalSubscriptions,
      subtitle: 'empreses actives',
      icon: Building2,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Ingressos potencials',
      value: formatCurrency(plans.filter(p => p.isActive).reduce((sum, p) => sum + p.basePrice, 0)),
      subtitle: 'per any',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <div className={cn('p-2 rounded-lg', stat.color)}>
              <stat.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            {stat.total && (
              <span className="text-sm text-slate-400">/ {stat.total}</span>
            )}
          </div>
          {stat.subtitle && (
            <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  )
}