// components/gestio-empreses/leads/ai/LeadQualifier.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { qualifyLeadWithAI } from '@/lib/gestio-empreses/ai-actions'
import { AIScoreBadge } from './AIScoreBadge'

interface LeadQualifierProps {
  leadId: string
  currentScore?: number | null
  className?: string
}

interface QualificationResult {
  score: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  insights: string[]
  recommendations: string[]
  risks: string[]
}

export function LeadQualifier({ leadId, currentScore, className }: LeadQualifierProps) {
  const router = useRouter()
  const [isQualifying, setIsQualifying] = useState(false)
  const [result, setResult] = useState<QualificationResult | null>(null)
  const [error, setError] = useState('')

  const handleQualify = async () => {
    setIsQualifying(true)
    setError('')
    setResult(null)

    const response = await qualifyLeadWithAI(leadId)

    if (response.success && response.qualification) {
      setResult(response.qualification)
      router.refresh()
    } else {
      setError(response.error || 'Error qualificant el lead')
    }

    setIsQualifying(false)
  }

  const priorityLabels = {
    HIGH: 'Alta',
    MEDIUM: 'Mitjana',
    LOW: 'Baixa',
  }

  const priorityColors = {
    HIGH: 'text-red-600',
    MEDIUM: 'text-amber-600',
    LOW: 'text-slate-600',
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Botó de qualificació */}
      {!result && (
        <button
          onClick={handleQualify}
          disabled={isQualifying}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50"
        >
          {isQualifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              Analitzant amb IA...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              {currentScore ? 'Re-qualificar amb IA' : 'Qualificar amb IA'}
            </>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Resultats */}
      {result && (
        <div className="space-y-4">
          {/* Score i prioritat */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500 mb-1">Puntuació IA</p>
              <AIScoreBadge score={result.score} size="lg" showLabel />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Prioritat recomanada</p>
              <span className={cn("text-lg font-semibold", priorityColors[result.priority])}>
                {priorityLabels[result.priority]}
              </span>
            </div>
          </div>

          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                <span className="text-sm font-medium text-blue-800">Insights</span>
              </div>
              <ul className="space-y-1">
                {result.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recomanacions */}
          {result.recommendations.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                <span className="text-sm font-medium text-green-800">Recomanacions</span>
              </div>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5" strokeWidth={1.5} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Riscos */}
          {result.risks.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
                <span className="text-sm font-medium text-amber-800">Riscos</span>
              </div>
              <ul className="space-y-1">
                {result.risks.map((risk, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5" strokeWidth={1.5} />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tornar a qualificar */}
          <button
            onClick={handleQualify}
            disabled={isQualifying}
            className="w-full text-center text-sm text-slate-500 hover:text-violet-600 transition-colors"
          >
            Tornar a analitzar
          </button>
        </div>
      )}
    </div>
  )
}