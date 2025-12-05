// components/gestio-empreses/dashboard/PipelineOverview.tsx
// FITXER NOU - Resum visual del pipeline

'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineStage {
  status: string
  count: number
  value: number
}

interface PipelineOverviewProps {
  stages: PipelineStage[]
  totalValue: number
  className?: string
}

const stageConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nous', color: 'bg-blue-500' },
  CONTACTED: { label: 'Contactats', color: 'bg-yellow-500' },
  NEGOTIATION: { label: 'Negociant', color: 'bg-purple-500' },
  QUALIFIED: { label: 'Qualificats', color: 'bg-indigo-500' },
  PROPOSAL_SENT: { label: 'Proposta', color: 'bg-cyan-500' },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function PipelineOverview({ stages, totalValue, className }: PipelineOverviewProps) {
  // Crear stages por defecto y combinar con datos reales
  const defaultStages = Object.keys(stageConfig).map(status => ({
    status,
    count: 0,
    value: 0
  }))

  const mergedStages = defaultStages.map(defaultStage => {
    const realStage = stages.find(s => s.status === defaultStage.status)
    return realStage || defaultStage
  })

  const maxCount = Math.max(...mergedStages.map(s => s.count), 1)

  return (
    <div className={cn("bg-white rounded-lg border border-slate-200", className)}>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-800">Pipeline de vendes</h3>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="h-4 w-4 text-green-500" strokeWidth={1.5} />
            <span className="text-sm text-slate-500">
              Valor total: <span className="font-medium text-slate-800">{formatCurrency(totalValue)}</span>
            </span>
          </div>
        </div>
        <Link
          href="/gestor-empreses/pipeline"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Veure pipeline
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {mergedStages.map((stage) => {
            const config = stageConfig[stage.status]
            if (!config) return null

            const widthPercent = (stage.count / maxCount) * 100

            return (
              <div key={stage.status}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">{config.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-800">
                      {stage.count}
                    </span>
                    <span className="text-xs text-slate-400 w-20 text-right">
                      {formatCurrency(stage.value)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", config.color)}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}