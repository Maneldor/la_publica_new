'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  getPipelineViewType,
  getWorkspaceStages,
  canViewGestorPipelines,
  STAGE_LABELS
} from '@/lib/gestio-empreses/pipeline-config'
import { WorkspaceSection } from './WorkspaceSection'
import { GestorPipelineSection } from './GestorPipelineSection'
import { getGestorsWithLeads } from '@/lib/gestio-empreses/pipeline-actions'

interface GestorInfo {
  gestor: {
    id: string
    name: string
    email: string
    role: string
  }
  leadCount: number
  leadsByStage: Record<string, number>
}

interface PipelineBoardProps {
  initialGestors?: GestorInfo[]
  initialWorkspaceLeads?: any[]
}

export function PipelineBoard({ initialGestors, initialWorkspaceLeads }: PipelineBoardProps) {
  const { data: session } = useSession()
  const [gestors, setGestors] = useState<GestorInfo[]>(initialGestors || [])
  const [loading, setLoading] = useState(!initialGestors)

  const userRole = session?.user?.role as string || ''
  const viewType = getPipelineViewType(userRole)
  const workspaceStages = getWorkspaceStages(userRole)
  const showGestorPipelines = canViewGestorPipelines(userRole)

  // Carregar gestors si és CRM/Admin
  // Carregar gestors si és CRM/Admin i no tenim dades inicials
  useEffect(() => {
    if (showGestorPipelines && !initialGestors) {
      loadGestors()
    } else if (!showGestorPipelines || initialGestors) {
      setLoading(false)
    }
  }, [showGestorPipelines])

  const loadGestors = async () => {
    const result = await getGestorsWithLeads()
    if (result.success && result.data) {
      setGestors(result.data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="animate-pulse">Carregant pipeline...</div>
  }

  // ========== VISTA GESTOR ==========
  if (viewType === 'gestor') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          El meu Pipeline
        </h2>
        <WorkspaceSection
          stages={workspaceStages}
          userId={session?.user?.id}
        />
      </div>
    )
  }

  // ========== VISTA CRM / ADMIN ==========
  return (
    <div className="space-y-6">
      {/* Espai de treball propi */}
      <WorkspaceSection
        stages={workspaceStages}
        title="El meu espai de treball"
        defaultExpanded={true}
        collapsible={true}
        initialLeads={initialWorkspaceLeads}
      />

      {/* Pipelines dels Gestors */}
      {showGestorPipelines && gestors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-700">
            Pipelines dels Gestors
          </h3>

          {gestors.map((gestorInfo) => (
            <GestorPipelineSection
              key={gestorInfo.gestor.id}
              gestor={gestorInfo.gestor}
              leadCount={gestorInfo.leadCount}
              leadsByStage={gestorInfo.leadsByStage}
            />
          ))}
        </div>
      )}

      {showGestorPipelines && gestors.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No hi ha gestors amb leads assignats
        </div>
      )}
    </div>
  )
}