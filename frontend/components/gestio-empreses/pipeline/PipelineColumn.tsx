// components/gestio-empreses/pipeline/PipelineColumn.tsx
'use client'

import { cn } from '@/lib/utils'
import { PipelineCard } from './PipelineCard'

interface Lead {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
  score: number | null
  createdAt: Date
  updatedAt: Date
  assignedTo: {
    id: string
    name: string | null
  } | null
}

interface PipelineColumnProps {
  id: string
  label: string
  color: string
  leads: Lead[]
  totalValue: number
  count: number
  isSupervisor: boolean
  onLeadMoved?: () => void
  onLeadClick?: (lead: Lead) => void
  compact?: boolean
  fullWidth?: boolean
}

const colorVariants: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-700'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600'
  },
}

const formatCurrency = (value: number) => {
  const numValue = typeof value === 'number' ? value : Number(value) || 0
  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M €`
  }
  if (numValue >= 1000) {
    return `${Math.round(numValue / 1000)}K €`
  }
  return `${numValue} €`
}

export function PipelineColumn({
  id,
  label,
  color,
  leads,
  totalValue,
  count,
  isSupervisor,
  onLeadMoved,
  onLeadClick,
  compact = false,
  fullWidth = false,
}: PipelineColumnProps) {
  const colors = colorVariants[color] || colorVariants.slate

  return (
    <div className={cn(
      "flex flex-col rounded-lg border",
      fullWidth
        ? "w-full" // Ocupa todo el ancho disponible cuando se usa en grid
        : compact
          ? "min-w-[180px] max-w-[220px] flex-shrink-0"
          : "min-w-[240px] max-w-[280px] flex-shrink-0",
      colors.bg,
      colors.border
    )}>
      {/* Capçalera */}
      <div className={cn(
        "border-b border-inherit",
        compact ? "p-2" : "p-3"
      )}>
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "font-medium",
            compact ? "text-sm" : "text-base",
            colors.text
          )}>{label}</h3>
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full",
            colors.badge
          )}>
            {count}
          </span>
        </div>
        <p className={cn(
          "text-slate-500",
          compact ? "text-xs" : "text-sm"
        )}>
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Llista de leads */}
      <div className={cn(
        "flex-1 space-y-2 overflow-y-auto",
        compact ? "p-1.5 max-h-[300px]" : "p-2 max-h-[calc(100vh-300px)]"
      )}>
        {leads.length === 0 ? (
          <div className={cn(
            "text-center text-slate-400",
            compact ? "py-4 text-xs" : "py-8 text-sm"
          )}>
            Cap lead en aquest estat
          </div>
        ) : (
          leads.map((lead) => (
            <PipelineCard
              key={lead.id}
              lead={lead}
              isSupervisor={isSupervisor}
              onMoved={onLeadMoved}
              onLeadClick={onLeadClick}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  )
}