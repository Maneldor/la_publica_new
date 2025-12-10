// components/gestio-empreses/pipeline/CompactLeadCard.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Building2,
  User,
  Euro,
  ChevronRight,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { moveLeadToStatus } from '@/lib/gestio-empreses/pipeline-actions'
import { getNextStatusInPhase, getFirstStatusOfNextPhase } from '@/lib/gestio-empreses/pipeline-utils-phases'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
}

interface CompactLeadCardProps {
  lead: Lead
  phaseColor: 'blue' | 'purple' | 'green'
  isLastInPhase: boolean
  onMove: () => void
  onLeadClick?: (lead: Lead) => void
  highlightLeadId?: string | null
}

const priorityColors: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-slate-300',
}

const phaseColorClasses = {
  blue: 'hover:border-blue-300 hover:bg-blue-50/50',
  purple: 'hover:border-purple-300 hover:bg-purple-50/50',
  green: 'hover:border-green-300 hover:bg-green-50/50',
}

export function CompactLeadCard({ lead, phaseColor, isLastInPhase, onMove, onLeadClick, highlightLeadId }: CompactLeadCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showActions, setShowActions] = useState(false)

  // Verificar si este lead está destacado
  const isHighlighted = highlightLeadId === lead.id

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`
    return `${value} €`
  }

  const handleMoveNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const nextStatus = getNextStatusInPhase(lead.status)
    if (!nextStatus) return

    startTransition(async () => {
      await moveLeadToStatus(lead.id, nextStatus, 'current-user-id')
      onMove()
    })
  }

  const handleMoveToNextPhase = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const nextStatus = getFirstStatusOfNextPhase(lead.status)
    if (!nextStatus) return

    startTransition(async () => {
      await moveLeadToStatus(lead.id, nextStatus, 'current-user-id')
      onMove()
    })
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Si se hace clic en un botón de acción, no abrir el panel
    if (e.currentTarget !== e.target && (e.target as HTMLElement).closest('button')) {
      return
    }

    if (onLeadClick) {
      e.preventDefault()
      e.stopPropagation()
      onLeadClick(lead)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'bg-white rounded-lg border border-slate-200 border-l-4 p-3 transition-all cursor-pointer',
        priorityColors[lead.priority],
        phaseColorClasses[phaseColor],
        // Estilo de highlight cuando el lead está destacado
        isHighlighted && 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 shadow-lg animate-pulse'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* Company name */}
          <p className="font-medium text-slate-900 text-sm truncate">
            {lead.companyName}
          </p>

          {/* Contact & Value in one line */}
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            {lead.contactName && (
              <span className="flex items-center gap-1 truncate">
                <User className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
                <span className="truncate">{lead.contactName}</span>
              </span>
            )}
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Euro className="h-3 w-3" strokeWidth={1.5} />
              {formatCurrency(lead.estimatedRevenue)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={cn(
          'flex items-center gap-1 transition-opacity',
          showActions ? 'opacity-100' : 'opacity-0'
        )}>
          {isPending ? (
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" strokeWidth={1.5} />
          ) : (
            <>
              {/* Move to next status */}
              {getNextStatusInPhase(lead.status) && (
                <button
                  onClick={handleMoveNext}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  title="Moure al següent estat"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}

              {/* Move to next phase (only if last in phase) */}
              {isLastInPhase && getFirstStatusOfNextPhase(lead.status) && (
                <button
                  onClick={handleMoveToNextPhase}
                  className={cn(
                    'p-1 rounded text-white',
                    phaseColor === 'blue' ? 'bg-purple-500 hover:bg-purple-600' :
                    phaseColor === 'purple' ? 'bg-green-500 hover:bg-green-600' :
                    'bg-slate-500 hover:bg-slate-600'
                  )}
                  title="Passar a la següent fase"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}