// components/gestio-empreses/pressupostos/BudgetStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, AlertTriangle, Send } from 'lucide-react'
import { getBudgetStats, type BudgetStats } from '@/lib/gestio-empreses/budget-actions'

export function BudgetStats() {
  const [stats, setStats] = useState<BudgetStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getBudgetStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading budget stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-slate-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-6 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">Error al carregar les estadístiques</p>
      </div>
    )
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const statItems = [
    {
      id: 'total',
      label: 'Total Pressupostos',
      value: stats.total.toString(),
      subtitle: formatAmount(stats.totalAmount),
      icon: FileText,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600'
    },
    {
      id: 'draft',
      label: 'Esborranys',
      value: stats.draft.toString(),
      icon: FileText,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600'
    },
    {
      id: 'sent',
      label: 'Enviats',
      value: stats.sent.toString(),
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'approved',
      label: 'Aprovats',
      value: stats.approved.toString(),
      subtitle: formatAmount(stats.approvedAmount),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'expiring',
      label: 'Per vèncer',
      value: stats.expiring.toString(),
      subtitle: 'pròxims 7 dies',
      icon: AlertTriangle,
      color: stats.expiring > 0 ? 'text-amber-600' : 'text-slate-400',
      bgColor: stats.expiring > 0 ? 'bg-amber-50' : 'bg-slate-50',
      iconColor: stats.expiring > 0 ? 'text-amber-600' : 'text-slate-400',
      alert: stats.expiring > 0
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-1">
                  {item.label}
                </p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-slate-500 mt-1">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.iconColor}`} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}