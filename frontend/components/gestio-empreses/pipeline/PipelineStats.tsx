'use client'

import { FileText, Send, CheckCircle, Receipt, BadgeCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineStatsProps {
  stats: {
    draft: { count: number; amount: number }
    sent: { count: number; amount: number }
    approved: { count: number; amount: number }
    invoiced: { count: number; amount: number }
    paid: { count: number; amount: number }
    overdue: { count: number; amount: number }
    conversionRate: number
  } | null
}

export function PipelineStats({ stats }: PipelineStatsProps) {
  if (!stats) return null

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K€`
    return `${value.toFixed(0)}€`
  }

  // Valors per defecte per evitar errors
  const draft = stats.draft || { count: 0, amount: 0 }
  const sent = stats.sent || { count: 0, amount: 0 }
  const approved = stats.approved || { count: 0, amount: 0 }
  const invoiced = stats.invoiced || { count: 0, amount: 0 }
  const paid = stats.paid || { count: 0, amount: 0 }
  const overdue = stats.overdue || { count: 0, amount: 0 }

  const totalPipeline = draft.amount + sent.amount + approved.amount + invoiced.amount

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Pipeline Total</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalPipeline)}</p>
            <p className="text-xs text-slate-400">
              {draft.count + sent.count + approved.count + invoiced.count} oberts
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Pendent Cobrament</p>
            <p className="text-xl font-semibold text-purple-600">{formatCurrency(invoiced.amount)}</p>
            <p className="text-xs text-slate-400">{invoiced.count} factures</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Receipt className="h-4 w-4" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Cobrat (Total)</p>
            <p className="text-xl font-semibold text-green-600">{formatCurrency(paid.amount)}</p>
            <p className="text-xs text-slate-400">{paid.count} completats</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 text-green-600">
            <BadgeCheck className="h-4 w-4" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className={cn(
        'bg-white rounded-xl border p-3',
        overdue.count > 0 ? 'border-red-200' : 'border-slate-200'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Endarrerits</p>
            <p className={cn(
              'text-xl font-semibold',
              overdue.count > 0 ? 'text-red-600' : 'text-slate-400'
            )}>
              {overdue.count > 0 ? formatCurrency(overdue.amount) : '0€'}
            </p>
            <p className="text-xs text-slate-400">
              {overdue.count} {overdue.count === 1 ? 'element' : 'elements'}
            </p>
          </div>
          <div className={cn(
            'p-2 rounded-lg',
            overdue.count > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
          )}>
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  )
}