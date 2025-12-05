// components/gestio-empreses/pipeline/PhaseIndicator.tsx
'use client'

import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PIPELINE_PHASES, PhaseId } from '@/lib/gestio-empreses/pipeline-utils-phases'

interface PhaseIndicatorProps {
  currentPhase: PhaseId
  onPhaseChange: (phase: PhaseId) => void
  phaseCounts: Record<PhaseId, { leads: number; value: number }>
}

const phaseColors = {
  1: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' },
  2: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100' },
  3: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' },
}

export function PhaseIndicator({ currentPhase, onPhaseChange, phaseCounts }: PhaseIndicatorProps) {
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
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        {Object.entries(PIPELINE_PHASES).map(([id, phase], index) => {
          const phaseId = Number(id) as PhaseId
          const isActive = currentPhase === phaseId
          const isPast = currentPhase > phaseId
          const colors = phaseColors[phaseId]
          const counts = phaseCounts[phaseId]

          return (
            <div key={phaseId} className="flex items-center flex-1">
              {/* Connector line */}
              {index > 0 && (
                <div className={cn(
                  'h-1 flex-1 -mx-2',
                  isPast || isActive ? colors.bg : 'bg-slate-200'
                )} />
              )}

              {/* Phase circle and info */}
              <button
                onClick={() => onPhaseChange(phaseId)}
                className={cn(
                  'flex flex-col items-center gap-2 px-4 py-2 rounded-xl transition-all',
                  isActive && 'bg-slate-50'
                )}
              >
                {/* Circle */}
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                  isActive ? colors.bg + ' text-white shadow-lg' :
                  isPast ? colors.bg + ' text-white' :
                  'bg-slate-200 text-slate-500'
                )}>
                  {isPast ? (
                    <Check className="h-5 w-5" strokeWidth={2} />
                  ) : (
                    <span className="font-semibold">{phaseId}</span>
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className={cn(
                    'font-medium text-sm',
                    isActive ? colors.text : 'text-slate-600'
                  )}>
                    {phase.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {counts.leads} leads · {formatCurrency(counts.value)}
                  </p>
                </div>
              </button>

              {/* Connector line */}
              {index < Object.keys(PIPELINE_PHASES).length - 1 && (
                <div className={cn(
                  'h-1 flex-1 -mx-2',
                  isPast ? phaseColors[(phaseId + 1) as PhaseId].bg : 'bg-slate-200'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}