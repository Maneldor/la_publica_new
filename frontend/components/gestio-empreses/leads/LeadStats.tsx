'use client'

import { Target, TrendingUp, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface LeadStatsProps {
  stats: {
    total: number
    new: number
    qualified: number
    won: number
    lost: number
    conversionRate: number
  }
}

export function LeadStats({ stats }: LeadStatsProps) {
  const statsData = [
    {
      label: 'Total Leads',
      value: stats.total.toString(),
      trend: 'Total de leads al sistema',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Nous',
      value: stats.new.toString(),
      trend: 'Leads nous aquest mes',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Qualificats',
      value: stats.qualified.toString(),
      trend: 'Leads qualificats actius',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      label: 'Guanyats',
      value: stats.won.toString(),
      trend: `${stats.conversionRate.toFixed(1)}% de conversió`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Perduts',
      value: stats.lost.toString(),
      trend: 'Leads perduts',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Taxa Conversió',
      value: `${stats.conversionRate.toFixed(1)}%`,
      trend: 'Rendiment general',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat) => {
        const IconComponent = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${stat.color}`} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}