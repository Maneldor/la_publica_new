'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GESTOR_STAGES, STAGE_LABELS } from '@/lib/gestio-empreses/pipeline-config'
import { getLeadsByGestor } from '@/lib/gestio-empreses/pipeline-actions'
import { PipelineColumn } from './PipelineColumn'
import { LeadDetailPanel } from './LeadDetailPanel'
import { moveLeadToStage } from '@/lib/gestio-empreses/pipeline-actions'

interface GestorPipelineSectionProps {
  gestor: {
    id: string
    name: string
    email: string
    role: string
  }
  leadCount: number
  leadsByStage: Record<string, number>
}

const ROLE_LABELS: Record<string, string> = {
  'GESTOR_ESTANDARD': 'Gestor Estàndard',
  'GESTOR_ESTRATEGIC': 'Gestor Estratègic',
  'GESTOR_ENTERPRISE': 'Gestor Enterprise'
}

export function GestorPipelineSection({
  gestor,
  leadCount,
  leadsByStage
}: GestorPipelineSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)

  // Sistema de paginación como en WorkspaceSection
  const stagesPerPage = 3
  const totalPages = Math.ceil(GESTOR_STAGES.length / stagesPerPage)
  const paginatedStages = GESTOR_STAGES.slice(
    currentPage * stagesPerPage,
    (currentPage + 1) * stagesPerPage
  )

  const handleExpand = async () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)

    // Carregar leads només la primera vegada que s'expandeix
    if (newExpanded && !loaded) {
      setLoading(true)
      const result = await getLeadsByGestor(gestor.id)
      if (result.success && result.data) {
        setLeads(result.data)
      }
      setLoading(false)
      setLoaded(true)
    }
  }

  // Agrupar leads per fase
  const leadsByStageData = GESTOR_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead =>
      lead.stage === stage || lead.status === stage
    )
    return acc
  }, {} as Record<string, any[]>)

  // Calcular valor total per fase
  const getStageValue = (stageLeads: any[]) => {
    return stageLeads.reduce((total, lead) => {
      const value = Number(lead.estimatedRevenue) || 0
      return total + value
    }, 0)
  }

  const reloadData = async () => {
    if (loaded) {
      setLoading(true)
      const result = await getLeadsByGestor(gestor.id)
      if (result.success && result.data) {
        setLeads(result.data)
      }
      setLoading(false)
    }
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
      await reloadData()
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
      {/* Header - Sempre visible */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={handleExpand}
      >
        <div className="flex items-center gap-3">
          {isExpanded
            ? <ChevronDown className="w-5 h-5 text-slate-500" />
            : <ChevronRight className="w-5 h-5 text-slate-500" />
          }

          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">
              {gestor.name || gestor.email}
            </h4>
            <p className="text-sm text-slate-500">
              {ROLE_LABELS[gestor.role] || gestor.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mini-resum de leads per fase */}
          <div className="hidden md:flex items-center gap-2">
            {GESTOR_STAGES.slice(0, 4).map(stage => (
              <div
                key={stage}
                className="text-center px-2"
                title={STAGE_LABELS[stage]}
              >
                <div className="text-xs text-slate-400">
                  {STAGE_LABELS[stage].substring(0, 3)}
                </div>
                <div className="font-semibold text-slate-700">
                  {leadsByStage[stage] || 0}
                </div>
              </div>
            ))}
          </div>

          {/* Total leads */}
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {leadCount} leads
          </div>
        </div>
      </div>

      {/* Contingut expandible - Pipeline complet */}
      {isExpanded && (
        <div className="border-t p-4 bg-slate-50">
          {loading ? (
            <div className="animate-pulse flex gap-3">
              {GESTOR_STAGES.map(stage => (
                <div key={stage} className="flex-1 h-48 bg-slate-200 rounded-lg" />
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
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
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
                            ? "bg-purple-600 w-6"
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
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    )}
                  >
                    Fase següent
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Columnes del pipeline */}
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${paginatedStages.length}, 1fr)` }}>
                {paginatedStages.map(stage => {
                  const stageLeads = leadsByStageData[stage] || []
                  const stageValue = getStageValue(stageLeads)

                  return (
                    <PipelineColumn
                      key={stage}
                      id={stage}
                      label={STAGE_LABELS[stage] || stage}
                      color="purple"
                      leads={stageLeads}
                      totalValue={stageValue}
                      count={stageLeads.length}
                      isSupervisor={true}
                      onLeadMoved={reloadData}
                      onLeadClick={handleOpenLead}
                      compact={true}
                      fullWidth={true}
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
        currentUserId={gestor.id}
      />
    </div>
  )
}