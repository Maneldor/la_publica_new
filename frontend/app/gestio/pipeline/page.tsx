// app/gestio/pipeline/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, Plus, RefreshCw } from 'lucide-react'
import { PipelineStats } from '@/components/gestio-empreses/pipeline/PipelineStats'
import { PipelinePhases } from '@/components/gestio-empreses/pipeline/PipelinePhases'
import { getLeadsByPhase, getPipelineStats } from '@/lib/gestio-empreses/pipeline-actions'

export default function PipelinePage() {
  const [phaseData, setPhaseData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [phaseDataResult, statsResult] = await Promise.all([
        getLeadsByPhase(),
        getPipelineStats(),
      ])
      setPhaseData(phaseDataResult)
      setStats(statsResult)
    } catch (error) {
      console.error('Error carregant pipeline:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pipeline</h1>
            <p className="text-sm text-slate-500">Vista Kanban dels leads per fase</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            Actualitzar
          </button>
          <Link
            href="/gestio/leads"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
            Vista llista
          </Link>
          <Link
            href="/gestio/leads/nou"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nou lead
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && <PipelineStats stats={stats} />}

      {/* Pipeline Phases */}
      {phaseData && (
        <PipelinePhases
          phaseData={phaseData}
          onRefresh={loadData}
        />
      )}

      {/* Loading state */}
      {isLoading && !phaseData && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}