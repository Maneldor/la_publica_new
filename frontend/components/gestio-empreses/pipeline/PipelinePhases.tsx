// components/gestio-empreses/pipeline/PipelinePhases.tsx
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PIPELINE_PHASES, PhaseId } from '@/lib/gestio-empreses/pipeline-utils-phases'
import { PhaseIndicator } from './PhaseIndicator'
import { PhaseColumn } from './PhaseColumn'

interface Lead {
  id: string
  companyName: string
  contactName: string | null
  status: string
  priority: string
  estimatedRevenue: number | null
}

interface PipelinePhasesProps {
  phaseData: Record<PhaseId, {
    leads: Record<string, Lead[]>
    totalLeads: number
    totalValue: number
  }>
  onRefresh: () => void
}

const phaseColors: Record<PhaseId, 'blue' | 'purple' | 'green'> = {
  1: 'blue',
  2: 'purple',
  3: 'green',
}

export function PipelinePhases({ phaseData, onRefresh }: PipelinePhasesProps) {
  const [currentPhase, setCurrentPhase] = useState<PhaseId>(1)

  const phase = PIPELINE_PHASES[currentPhase]
  const phaseCounts: Record<PhaseId, { leads: number; value: number }> = {
    1: { leads: phaseData[1].totalLeads, value: phaseData[1].totalValue },
    2: { leads: phaseData[2].totalLeads, value: phaseData[2].totalValue },
    3: { leads: phaseData[3].totalLeads, value: phaseData[3].totalValue },
  }

  const goToPrevPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase((currentPhase - 1) as PhaseId)
    }
  }

  const goToNextPhase = () => {
    if (currentPhase < 3) {
      setCurrentPhase((currentPhase + 1) as PhaseId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Phase Indicator */}
      <PhaseIndicator
        currentPhase={currentPhase}
        onPhaseChange={setCurrentPhase}
        phaseCounts={phaseCounts}
      />

      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(
            'text-lg font-semibold',
            phaseColors[currentPhase] === 'blue' ? 'text-blue-700' :
            phaseColors[currentPhase] === 'purple' ? 'text-purple-700' :
            'text-green-700'
          )}>
            Fase {currentPhase}: {phase.name}
          </h2>
          <p className="text-sm text-slate-500">{phase.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPhase}
            disabled={currentPhase === 1}
            className={cn(
              'p-2 rounded-lg border transition-colors',
              currentPhase === 1
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            )}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={goToNextPhase}
            disabled={currentPhase === 3}
            className={cn(
              'p-2 rounded-lg border transition-colors',
              currentPhase === 3
                ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            )}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {phase.statuses.map((status, index) => (
          <PhaseColumn
            key={status}
            status={status}
            label={phase.statusLabels[status as keyof typeof phase.statusLabels]}
            leads={phaseData[currentPhase].leads[status] || []}
            phaseColor={phaseColors[currentPhase]}
            isLastStatus={index === phase.statuses.length - 1}
            onMove={onRefresh}
          />
        ))}
      </div>

      {/* Phase navigation hint */}
      <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
        {currentPhase > 1 && (
          <button
            onClick={goToPrevPhase}
            className="flex items-center gap-1 hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            Fase anterior: {PIPELINE_PHASES[(currentPhase - 1) as PhaseId].name}
          </button>
        )}
        {currentPhase < 3 && (
          <button
            onClick={goToNextPhase}
            className="flex items-center gap-1 hover:text-slate-700"
          >
            Fase següent: {PIPELINE_PHASES[(currentPhase + 1) as PhaseId].name}
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}