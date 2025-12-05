'use client'

import { FileText, CheckCircle, Clock, AlertTriangle, Euro } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvoiceStatsData {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  monthlyTotal: number
  monthlyGrowth: number
}

interface InvoiceStatsProps {
  data: InvoiceStatsData
  isLoading?: boolean
}

export function InvoiceStats({ data, isLoading = false }: InvoiceStatsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`
    return `${value.toFixed(0)}€`
  }

  const stats = [
    {
      label: 'Total Factures',
      value: data.totalInvoices.toString(),
      subtitle: undefined,
      icon: FileText,
      color: 'text-emerald-600 bg-emerald-50',
      alert: false
    },
    {
      label: 'Pagades',
      value: data.paidInvoices.toString(),
      subtitle: undefined,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
      alert: false
    },
    {
      label: 'Pendents',
      value: data.pendingInvoices.toString(),
      subtitle: undefined,
      icon: Clock,
      color: 'text-blue-600 bg-blue-50',
      alert: false
    },
    {
      label: 'Endarrerides',
      value: data.overdueInvoices.toString(),
      subtitle: undefined,
      icon: AlertTriangle,
      color: data.overdueInvoices > 0 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-50',
      alert: data.overdueInvoices > 0
    },
    {
      label: 'Total Mes',
      value: formatCurrency(data.monthlyTotal),
      subtitle: data.monthlyGrowth ? `${data.monthlyGrowth >= 0 ? '+' : ''}${data.monthlyGrowth}% vs mes anterior` : undefined,
      icon: Euro,
      color: 'text-emerald-600 bg-emerald-50',
      alert: false
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-16 mb-1"></div>
                  <div className="h-5 bg-slate-200 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                </div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg ml-2 flex-shrink-0"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon

        return (
          <div
            key={index}
            className={cn(
              'bg-white rounded-xl border p-3',
              stat.alert ? 'border-red-200' : 'border-slate-200'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                <p className={cn(
                  'text-xl font-semibold mt-0.5',
                  stat.alert ? 'text-red-600' : 'text-slate-900'
                )}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{stat.subtitle}</p>
                )}
              </div>
              <div className={cn('p-2 rounded-lg ml-2 flex-shrink-0', stat.color)}>
                <IconComponent className="h-4 w-4" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}