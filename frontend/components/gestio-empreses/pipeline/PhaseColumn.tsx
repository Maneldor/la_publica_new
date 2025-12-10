// components/gestio-empreses/pipeline/PhaseColumn.tsx
'use client'

import { cn } from '@/lib/utils'
import { CompactLeadCard } from './CompactLeadCard'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
}

interface PhaseColumnProps {
  status: string
  label: string
  leads: Lead[]
  phaseColor: 'blue' | 'purple' | 'green'
  isLastStatus: boolean
  onMove: () => void
  onLeadClick?: (lead: Lead) => void
  highlightLeadId?: string | null
}

const colorClasses = {
  blue: {
    header: 'bg-blue-50 border-blue-200',
    title: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    empty: 'text-blue-400',
  },
  purple: {
    header: 'bg-purple-50 border-purple-200',
    title: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    empty: 'text-purple-400',
  },
  green: {
    header: 'bg-green-50 border-green-200',
    title: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    empty: 'text-green-400',
  },
}

export function PhaseColumn({
  status,
  label,
  leads,
  phaseColor,
  isLastStatus,
  onMove,
  onLeadClick,
  highlightLeadId
}: PhaseColumnProps) {
  const colors = colorClasses[phaseColor]
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedRevenue || 0), 0)

  const formatCurrency = (value: number | null | undefined): string => {
    const numValue = Number(value) || 0
    const rounded = Math.round(numValue)

    if (rounded >= 1000000) {
      return `${(rounded / 1000000).toFixed(1)}M €`
    }
    if (rounded >= 1000) {
      return `${Math.round(rounded / 1000)}K €`
    }
    return `${rounded.toLocaleString('ca-ES')} €`
  }

  return (
    <div className="flex flex-col bg-slate-50/50 rounded-xl border border-slate-200 min-w-[280px] max-w-[280px]">
      {/* Header */}
      <div className={cn('p-3 rounded-t-xl border-b', colors.header)}>
        <div className="flex items-center justify-between">
          <h3 className={cn('font-medium text-sm', colors.title)}>
            {label}
          </h3>
          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', colors.badge)}>
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Cards */}
      <div className="p-2 flex-1 overflow-y-auto max-h-[400px] space-y-2">
        {leads.length === 0 ? (
          <p className={cn('text-sm text-center py-8', colors.empty)}>
            Cap lead
          </p>
        ) : (
          leads.map((lead) => (
            <CompactLeadCard
              key={lead.id}
              lead={lead}
              phaseColor={phaseColor}
              isLastInPhase={isLastStatus}
              onMove={onMove}
              onLeadClick={onLeadClick}
              highlightLeadId={highlightLeadId}
            />
          ))
        )}
      </div>
    </div>
  )
}