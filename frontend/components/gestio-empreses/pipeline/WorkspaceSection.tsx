'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STAGE_LABELS } from '@/lib/gestio-empreses/pipeline-config'
import { getPipelineLeads } from '@/lib/gestio-empreses/pipeline-actions'
import { PipelineColumn } from './PipelineColumn'
import { LeadDetailPanel } from './LeadDetailPanel'
import { moveLeadToStage } from '@/lib/gestio-empreses/pipeline-actions'

interface WorkspaceSectionProps {
  stages: string[]
  title?: string
  userId?: string
  defaultExpanded?: boolean
  collapsible?: boolean
  initialLeads?: any[]
}

export function WorkspaceSection({
  stages,
  title = "Pipeline",
  userId,
  defaultExpanded = true,
  collapsible = false,
  initialLeads
}: WorkspaceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [leads, setLeads] = useState<any[]>(initialLeads || [])
  const [loading, setLoading] = useState(!initialLeads)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)

  // Dividir stages en páginas de 3 columnas si hay más de 4 stages
  const stagesPerPage = stages.length > 4 ? 3 : stages.length
  const totalPages = Math.ceil(stages.length / stagesPerPage)
  const paginatedStages = stages.slice(
    currentPage * stagesPerPage,
    (currentPage + 1) * stagesPerPage
  )

  useEffect(() => {
    if (!initialLeads) {
      loadLeads()
    }
  }, [stages, userId])

  const loadLeads = async () => {
    setLoading(true)
    const result = await getPipelineLeads({ stages, userId })
    if (result.success && result.data) {
      setLeads(result.data)
    }
    setLoading(false)
  }

  // Agrupar leads per fase
  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead => {
      // Comprobar tanto stage como status para compatibilidad
      return lead.stage === stage || lead.status === stage
    })
    return acc
  }, {} as Record<string, any[]>)

  const totalLeads = leads.length

  // Calcular valor total per fase
  const getStageValue = (stageLeads: any[]) => {
    return stageLeads.reduce((total, lead) => {
      const value = Number(lead.estimatedRevenue) || 0
      return total + value
    }, 0)
  }

  // Handlers per obrir/tancar el panel de detalls
  const handleOpenLead = (lead: any) => {
    setSelectedLead(lead)
    setIsDetailPanelOpen(true)
  }

  const handleCloseLead = () => {
    setIsDetailPanelOpen(false)
    setSelectedLead(null)
  }

  const handleAdvanceStage = async (leadId: string, newStatus: string) => {
    const result = await moveLeadToStage(leadId, newStatus)
    if (result.success) {
      await loadLeads()
      // Actualitzar el lead seleccionat si és el mateix
      if (selectedLead?.id === leadId) {
        const updatedLead = leads.find(l => l.id === leadId)
        if (updatedLead) {
          setSelectedLead({ ...updatedLead, status: newStatus })
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 bg-slate-50",
          collapsible && "cursor-pointer hover:bg-slate-100"
        )}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {collapsible && (
            isExpanded
              ? <ChevronDown className="w-5 h-5 text-slate-500" />
              : <ChevronRight className="w-5 h-5 text-slate-500" />
          )}
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <span className="text-sm text-slate-500">
            {totalLeads} {totalLeads === 1 ? 'lead' : 'leads'}
          </span>
        </div>
      </div>

      {/* Contingut expandible */}
      {isExpanded && (
        <div className="p-4 overflow-hidden">
          {loading ? (
            <div className="animate-pulse flex gap-4">
              {paginatedStages.map(stage => (
                <div key={stage} className="flex-1 h-64 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Controls de navegació si hi ha més d'una pàgina */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      currentPage === 0
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Fase anterior
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentPage === i
                            ? "bg-blue-600 w-6"
                            : "bg-slate-300 hover:bg-slate-400"
                        )}
                        aria-label={`Pàgina ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      currentPage === totalPages - 1
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    )}
                  >
                    Fase següent
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Columnes del pipeline */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${paginatedStages.length}, 1fr)` }}>
                {paginatedStages.map(stage => {
                  const stageLeads = leadsByStage[stage] || []
                  const stageValue = getStageValue(stageLeads)

                  return (
                    <PipelineColumn
                      key={stage}
                      id={stage}
                      label={STAGE_LABELS[stage] || stage}
                      color="blue"
                      leads={stageLeads}
                      totalValue={stageValue}
                      count={stageLeads.length}
                      isSupervisor={false}
                      onLeadMoved={loadLeads}
                      onLeadClick={handleOpenLead}
                      compact={false}
                      fullWidth={true} // Nueva prop para indicar ancho completo
                    />
                  )
                })}
              </div>

              {/* Indicador de fase actual */}
              {totalPages > 1 && (
                <div className="text-center mt-4 text-sm text-slate-500">
                  Fase {currentPage + 1} de {totalPages}
                  {currentPage === 0 && " - Prospecció"}
                  {currentPage === 1 && " - Tancament"}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Panel de detalls del lead */}
      <LeadDetailPanel
        lead={selectedLead}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseLead}
        onAdvanceStage={handleAdvanceStage}
        currentUserId={userId}
      />
    </div>
  )
}