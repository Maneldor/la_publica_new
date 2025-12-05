// components/gestio-empreses/empreses/CompanyStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { Building2, Users, CheckCircle, Clock } from 'lucide-react'
import { getCompanyStats } from '@/lib/gestio-empreses/company-actions'

interface CompanyStatsData {
  total: number
  active: number
  pending: number
  byPlan: Array<{
    tier: string
    count: number
  }>
}

interface CompanyStatsProps {
  gestorId: string | null
}

export function CompanyStats({ gestorId }: CompanyStatsProps) {
  const [stats, setStats] = useState<CompanyStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getCompanyStats(gestorId)
        setStats(data)
      } catch (error) {
        console.error('Error carregant estadístiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [gestorId])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-slate-200 rounded mb-3"></div>
              <div className="h-6 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 text-center text-slate-500">
        No s'han pogut carregar les estadístiques
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total empreses',
      value: stats.total,
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Empreses actives',
      value: stats.active,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pendents aprovació',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Usuaris totals',
      value: stats.byPlan.reduce((sum, plan) => sum + plan.count, 0),
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Estadístiques principals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const IconComponent = card.icon
          return (
            <div key={card.title} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <IconComponent className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                  <p className="text-sm text-slate-500">{card.title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Distribució per plans */}
      {stats.byPlan.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Distribució per plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.byPlan.map((plan) => (
              <div key={plan.tier} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{plan.tier}</span>
                <span className="text-lg font-semibold text-slate-900">{plan.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}