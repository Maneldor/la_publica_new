'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, Building2, User, Mail, Phone, Globe, Linkedin, MapPin, Euro, Calendar, Tag, FileText, ChevronRight, CheckCircle2, Clock, AlertCircle, ListTodo, Circle, CheckCircle, Loader2, Plus, ExternalLink, Pencil } from 'lucide-react'
import { LeadEditPanel } from '@/app/gestio/leads/components/LeadEditPanel'
import { cn } from '@/lib/utils'
import { getTasksByLeadId, completeTask, LeadTask } from '@/lib/gestio-empreses/lead-tasks-actions'
import { CreateTaskForLeadModal } from './CreateTaskForLeadModal'
import { PhaseChecklist } from './PhaseChecklist'
import { ResourcesPanel } from './ResourcesPanel'
import { getNextStage, STAGE_LABELS } from '@/lib/gestio-empreses/lead-stage-utils'
import { useSession } from 'next-auth/react'

// Tipus del Lead (adaptat al sistema existent)
interface Lead {
  id: string
  companyName: string
  sector?: string | null
  contactName?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  linkedinProfile?: string | null
  city?: string | null
  description?: string | null
  estimatedRevenue?: number | null
  status: string
  priority: string
  source?: string | null
  score?: number | null
  tags?: string[]
  notes?: string | null
  createdAt: string
  updatedAt: string
  assignedTo?: {
    id: string
    name: string | null
    email?: string | null
  } | null
}

interface LeadDetailPanelProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onAdvanceStage?: (leadId: string, newStatus: string) => Promise<void>
  currentUserId?: string
}

// Mapeig d'estats a colors i etiquetes
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  NEW: { label: 'Nou', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  PROSPECTING: { label: 'Prospecció', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  CONTACTED: { label: 'Contactat', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  QUALIFIED: { label: 'Qualificat', color: 'text-green-700', bgColor: 'bg-green-100' },
  PROPOSAL_SENT: { label: 'Proposta enviada', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  PENDING_CRM: { label: 'Pendent CRM', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  CRM_APPROVED: { label: 'Aprovat CRM', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  PENDING_ADMIN: { label: 'Pendent Admin', color: 'text-red-700', bgColor: 'bg-red-100' },
  NEGOTIATION: { label: 'Negociació', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  DOCUMENTATION: { label: 'Documentació', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  WON: { label: 'Guanyat', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  LOST: { label: 'Perdut', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  ON_HOLD: { label: 'En pausa', color: 'text-gray-700', bgColor: 'bg-gray-100' },
}

const priorityConfig: Record<string, { label: string; color: string; icon: typeof AlertCircle }> = {
  LOW: { label: 'Baixa', color: 'text-slate-500', icon: ChevronRight },
  MEDIUM: { label: 'Mitjana', color: 'text-blue-500', icon: Clock },
  HIGH: { label: 'Alta', color: 'text-orange-500', icon: AlertCircle },
  URGENT: { label: 'Urgent', color: 'text-red-500', icon: AlertCircle },
}

const taskStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pendent', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  IN_PROGRESS: { label: 'En progrés', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  COMPLETED: { label: 'Completada', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  CANCELLED: { label: 'Cancel·lada', color: 'text-slate-700', bgColor: 'bg-slate-100' },
}

// Ordre de les fases per "Avançar"
const stageOrder = [
  'NEW',
  'PROSPECTING',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'PENDING_CRM',
  'PENDING_ADMIN',
  'NEGOTIATION',
  'DOCUMENTATION',
  'WON'
]

export function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onAdvanceStage,
  currentUserId
}: LeadDetailPanelProps) {
  const { data: session } = useSession()
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [tasks, setTasks] = useState<LeadTask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [canAdvancePhase, setCanAdvancePhase] = useState(true)
  const [isResourcesPanelOpen, setIsResourcesPanelOpen] = useState(false)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [currentLead, setCurrentLead] = useState<Lead | null>(lead)

  // Sincronitzar currentLead amb lead prop
  useEffect(() => {
    setCurrentLead(lead)
  }, [lead])

  // Tancar amb ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditPanelOpen) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, isEditPanelOpen])

  // Callback quan es guarda l'edició
  const handleEditSaved = async () => {
    // Recarregar les dades del lead
    if (lead?.id) {
      try {
        const res = await fetch(`/api/gestio/leads/${lead.id}`)
        if (res.ok) {
          const updatedLead = await res.json()
          setCurrentLead(updatedLead)
        }
      } catch (error) {
        console.error('Error reloading lead:', error)
      }
    }
  }

  // Carregar tasques quan s'obre el panel
  const loadTasks = useCallback(async () => {
    if (!lead?.id) return

    setLoadingTasks(true)
    try {
      const result = await getTasksByLeadId(lead.id)
      if (result.success) {
        setTasks(result.tasks)
      }
    } catch (error) {
      console.error('Error carregant tasques:', error)
    } finally {
      setLoadingTasks(false)
    }
  }, [lead?.id])

  useEffect(() => {
    if (isOpen && lead?.id) {
      loadTasks()
    }
  }, [isOpen, lead?.id, loadTasks])

  // Completar tasca
  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId)
    try {
      const result = await completeTask(taskId)
      if (result.success) {
        // Actualitzar llista local
        setTasks(prev => prev.map(t =>
          t.id === taskId
            ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() }
            : t
        ))
      }
    } catch (error) {
      console.error('Error completant tasca:', error)
    } finally {
      setCompletingTaskId(null)
    }
  }

  if (!lead) return null

  const status = statusConfig[lead.status] || statusConfig.NEW
  const priority = priorityConfig[lead.priority] || priorityConfig.MEDIUM
  const PriorityIcon = priority.icon

  // Calcular següent fase
  const nextStage = getNextStage(lead.status)
  const nextStageConfig = nextStage ? statusConfig[nextStage] : null

  const handleAdvance = async () => {
    if (!nextStage || !onAdvanceStage) return
    setIsAdvancing(true)
    try {
      await onAdvanceStage(lead.id, nextStage)
    } finally {
      setIsAdvancing(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', status.bgColor, status.color)}>
                {status.label}
              </span>
              <span className={cn('flex items-center gap-1 text-xs font-medium', priority.color)}>
                <PriorityIcon className="h-3.5 w-3.5" />
                {priority.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {lead.companyName}
            </h2>
            {lead.sector && (
              <p className="text-sm text-slate-500 mt-1">{lead.sector}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditPanelOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Editar lead"
            >
              <Pencil className="h-5 w-5 text-slate-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Informació de contacte */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              Contacte
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              {lead.contactName && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{lead.contactName}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline truncate">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <a href={`tel:${lead.phone}`} className="text-sm text-blue-600 hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                    {lead.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {lead.linkedinProfile && (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <a href={lead.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                    LinkedIn
                  </a>
                </div>
              )}
              {lead.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{lead.city}</span>
                </div>
              )}
              {!lead.contactName && !lead.email && !lead.phone && (
                <p className="text-sm text-slate-400 italic">No hi ha dades de contacte</p>
              )}
            </div>
          </section>

          {/* Valor i mètriques */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Euro className="h-4 w-4 text-slate-400" />
              Valor i Mètriques
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-emerald-600 font-medium">Valor estimat</p>
                <p className="text-lg font-bold text-emerald-700">
                  {lead.estimatedRevenue
                    ? `${lead.estimatedRevenue.toLocaleString('ca-ES')} €`
                    : '-'}
                </p>
              </div>
              {lead.score !== null && lead.score !== undefined && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium">Puntuació IA</p>
                  <p className="text-lg font-bold text-blue-700">{lead.score}/100</p>
                </div>
              )}
            </div>
          </section>

          {/* Descripció */}
          {lead.description && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Descripció
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                {lead.description}
              </p>
            </section>
          )}

          {/* Notes */}
          {lead.notes && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Notes
              </h3>
              <p className="text-sm text-slate-600 bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400">
                {lead.notes}
              </p>
            </section>
          )}

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-400" />
                Etiquetes
              </h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Assignat a */}
          {lead.assignedTo && (
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Assignat a
              </h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700">{lead.assignedTo.name || 'Sense nom'}</p>
                {lead.assignedTo.email && (
                  <p className="text-xs text-slate-500">{lead.assignedTo.email}</p>
                )}
              </div>
            </section>
          )}

          {/* Dates */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              Dates
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Creat:</span>
                <span className="text-slate-700">
                  {new Date(lead.createdAt).toLocaleDateString('ca-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Actualitzat:</span>
                <span className="text-slate-700">
                  {new Date(lead.updatedAt).toLocaleDateString('ca-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </section>

          {/* Tasques del lead */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-slate-400" />
                Tasques ({tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length} pendents)
              </h3>
              <div className="flex items-center gap-2">
                {tasks.length > 0 && (
                  <Link
                    href={`/gestio/tasques?leadId=${lead.id}`}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Veure totes
                  </Link>
                )}
                {currentUserId && (
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nova
                  </button>
                )}
              </div>
            </div>

            {loadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <ListTodo className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No hi ha tasques per aquest lead</p>
                {currentUserId && (
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Crear primera tasca
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const taskStatus = taskStatusConfig[task.status] || taskStatusConfig.PENDING
                  const isCompleted = task.status === 'COMPLETED'
                  const isCompleting = completingTaskId === task.id

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'bg-slate-50 rounded-lg p-3 transition-all',
                        isCompleted && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox per completar */}
                        <button
                          onClick={() => !isCompleted && handleCompleteTask(task.id)}
                          disabled={isCompleted || isCompleting}
                          className={cn(
                            'mt-0.5 flex-shrink-0 transition-colors',
                            isCompleted
                              ? 'text-emerald-500 cursor-default'
                              : 'text-slate-300 hover:text-emerald-500 cursor-pointer'
                          )}
                        >
                          {isCompleting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>

                        {/* Contingut */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium',
                            isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'
                          )}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-0.5 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={cn(
                              'px-1.5 py-0.5 rounded text-xs font-medium',
                              taskStatus.bgColor, taskStatus.color
                            )}>
                              {taskStatus.label}
                            </span>
                            {task.dueDate && (
                              <span className={cn(
                                'text-xs flex items-center gap-1',
                                new Date(task.dueDate) < new Date() && !isCompleted
                                  ? 'text-red-500'
                                  : 'text-slate-500'
                              )}>
                                <Clock className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString('ca-ES', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Checklist de fase */}
          <section>
            <PhaseChecklist
              leadId={lead.id}
              onChecklistChange={(canAdvance) => setCanAdvancePhase(canAdvance)}
            />
          </section>

          {/* Panel d'eines/recursos per a la fase actual */}
          {session?.user?.id && (
            <section>
              <ResourcesPanel
                leadId={lead.id}
                currentPhase={lead.status as any}
                userId={session.user.id}
                userName={session.user.name || undefined}
                userRole={session.user.role || 'USER'}
                isOpen={isResourcesPanelOpen}
                onToggle={() => setIsResourcesPanelOpen(!isResourcesPanelOpen)}
              />
            </section>
          )}

        </div>

        {/* Footer - Accions */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
          {/* Botó crear tasca */}
          {currentUserId && (
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Crear tasca per aquest lead
            </button>
          )}

          {/* Botó avançar fase */}
          {nextStage && nextStageConfig && onAdvanceStage && (
            <button
              onClick={handleAdvance}
              disabled={isAdvancing || !canAdvancePhase}
              className={cn(
                'w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
                canAdvancePhase
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isAdvancing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Avançant...
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  Avançar a: {nextStageConfig.label}
                </>
              )}
            </button>
          )}

          {/* Si és WON o LOST */}
          {(lead.status === 'WON' || lead.status === 'LOST') && (
            <div className={cn(
              'w-full py-2.5 px-4 rounded-lg font-medium text-center',
              lead.status === 'WON' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
            )}>
              {lead.status === 'WON' ? '🎉 Lead guanyat!' : 'Lead perdut'}
            </div>
          )}
        </div>
      </div>

      {/* Modal crear tasca */}
      {currentUserId && lead && (
        <CreateTaskForLeadModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          leadId={lead.id}
          leadName={lead.companyName}
          currentUserId={currentUserId}
          onTaskCreated={() => {
            loadTasks()  // Recarregar tasques
          }}
        />
      )}

      {/* Panel d'edició del lead */}
      {currentLead && (
        <LeadEditPanel
          lead={currentLead as any}
          isOpen={isEditPanelOpen}
          onClose={() => setIsEditPanelOpen(false)}
          onSaved={handleEditSaved}
        />
      )}
    </>
  )
}