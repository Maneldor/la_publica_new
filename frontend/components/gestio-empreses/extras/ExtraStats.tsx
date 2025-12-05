'use client'

import { Package, Eye, Star, EyeOff, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Extra {
  active: boolean
  featured: boolean
  basePrice: number
}

interface ExtraStatsProps {
  extras: Extra[]
}

export function ExtraStats({ extras }: ExtraStatsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K €`
    return `${value.toFixed(0)} €`
  }

  const totalRevenue = extras.filter(e => e.active).reduce((sum, e) => sum + e.basePrice, 0)

  const stats = [
    {
      label: 'Total extras',
      value: extras.length,
      icon: Package,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Actius',
      value: extras.filter(e => e.active).length,
      icon: Eye,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Destacats',
      value: extras.filter(e => e.featured).length,
      icon: Star,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Inactius',
      value: extras.filter(e => !e.active).length,
      icon: EyeOff,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Ingressos potencials',
      value: formatCurrency(totalRevenue),
      subtitle: 'serveis actius',
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
          <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
          {stat.subtitle && (
            <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  )
}