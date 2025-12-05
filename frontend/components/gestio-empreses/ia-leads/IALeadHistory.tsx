// components/gestio-empreses/ia-leads/IALeadHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  RotateCcw,
  Sparkles,
  Target,
  MapPin,
  Hash,
  CheckCircle,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGenerationHistory, repeatGeneration, GeneratedLead } from '@/lib/gestio-empreses/ia-lead-actions'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'

interface Generation {
  id: string
  sector: string
  location: string
  quantity: number
  model: string
  leadsGenerated: number
  leadsAccepted: number
  createdAt: Date
  status: string
}

interface IALeadHistoryProps {
  userId: string
  onGenerated?: (generationId: string, leads: GeneratedLead[]) => void
}

export function IALeadHistory({ userId, onGenerated }: IALeadHistoryProps) {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [repeating, setRepeating] = useState<string | null>(null)

  const loadHistory = async () => {
    try {
      const history = await getGenerationHistory(userId)
      setGenerations(history)
    } catch (error) {
      console.error('Error carregant historial:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [userId])

  const handleRepeat = async (generationId: string) => {
    setRepeating(generationId)
    try {
      const result = await repeatGeneration(generationId, userId)
      if (onGenerated) {
        onGenerated(result.generationId, result.leads)
      }
      await loadHistory()
    } catch (error) {
      console.error('Error repetint generació:', error)
    } finally {
      setRepeating(null)
    }
  }

  const getSectorLabel = (sector: string) => {
    const sectors: Record<string, string> = {
      TECHNOLOGY: 'Tecnologia',
      FINANCE: 'Finances',
      RETAIL: 'Comerç al detall',
      MARKETING: 'Màrqueting',
      CONSTRUCTION: 'Construcció',
      LOGISTICS: 'Logística',
      HEALTH: 'Salut',
      EDUCATION: 'Educació',
      HOSPITALITY: 'Hospitalitat',
      CONSULTING: 'Consultoria',
    }
    return sectors[sector] || sector
  }

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'claude': return '🟣'
      case 'gpt4': return '🟢'
      case 'gemini': return '🔵'
      default: return '🤖'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" strokeWidth={1.5} />
          <span className="ml-2 text-slate-500">Carregant historial...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Clock className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Historial de generacions</h3>
            <p className="text-sm text-slate-500">
              {generations.length === 0
                ? 'No hi ha generacions encara'
                : `${generations.length} generacions recents`
              }
            </p>
          </div>
        </div>
      </div>

      {generations.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
          </div>
          <h4 className="font-medium text-slate-900 mb-1">No hi ha historial encara</h4>
          <p className="text-sm text-slate-500">
            Quan generis els primers leads amb IA apareixeran aquí.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {generations.map((generation) => (
            <div key={generation.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getModelIcon(generation.model)}</span>
                      <h4 className="font-medium text-slate-900">
                        {getSectorLabel(generation.sector)}
                      </h4>
                      {generation.status === 'COMPLETED' && (
                        <CheckCircle className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" strokeWidth={1.5} />
                      <span>{generation.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4" strokeWidth={1.5} />
                      <span>{generation.quantity} leads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" strokeWidth={1.5} />
                      <span>
                        {formatDistanceToNow(generation.createdAt, {
                          addSuffix: true,
                          locale: ca
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" strokeWidth={1.5} />
                      <span className="text-sm text-slate-600">
                        <span className="font-medium text-slate-900">{generation.leadsGenerated}</span> generats
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                      <span className="text-sm text-slate-600">
                        <span className="font-medium text-slate-900">{generation.leadsAccepted}</span> acceptats
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRepeat(generation.id)}
                  disabled={repeating === generation.id}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                    'border border-slate-200 bg-white text-slate-700',
                    'hover:bg-slate-50 hover:border-slate-300',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {repeating === generation.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      Repetint...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                      Repetir
                      <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}