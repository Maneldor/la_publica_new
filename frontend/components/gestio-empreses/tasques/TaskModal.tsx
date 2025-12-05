// components/gestio-empreses/tasques/TaskModal.tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  User,
  Building2,
  Target,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import {
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  type TaskPriority,
  type TaskStatus
} from '@/lib/gestio-empreses/task-actions'

interface TaskModalProps {
  task?: {
    id: string
    title: string
    description: string | null
    priority: TaskPriority
    status: TaskStatus
    dueDate: Date | null
    leadId: string | null
    companyId: string | null
    assignedToId: string | null
    lead?: { id: string; companyName: string } | null
    company?: { id: string; name: string } | null
    assignedTo?: { id: string; name: string; email: string } | null
    completedAt: Date | null
  } | null
  onClose: () => void
  onSave: () => void
  availableUsers?: Array<{
    id: string
    name: string
    email: string
  }>
  availableLeads?: Array<{
    id: string
    companyName: string
  }>
  availableCompanies?: Array<{
    id: string
    name: string
  }>
}

const priorityOptions: Array<{
  value: TaskPriority
  label: string
  icon: any
  color: string
}> = [
  {
    value: 'URGENT',
    label: 'Urgent',
    icon: ArrowUp,
    color: 'border-red-500 bg-red-50 text-red-700'
  },
  {
    value: 'HIGH',
    label: 'Alta',
    icon: ArrowUp,
    color: 'border-orange-500 bg-orange-50 text-orange-700'
  },
  {
    value: 'MEDIUM',
    label: 'Mitjana',
    icon: Minus,
    color: 'border-yellow-500 bg-yellow-50 text-yellow-700'
  },
  {
    value: 'LOW',
    label: 'Baixa',
    icon: ArrowDown,
    color: 'border-blue-500 bg-blue-50 text-blue-700'
  }
]

export function TaskModal({
  task,
  onClose,
  onSave,
  availableUsers = [],
  availableLeads = [],
  availableCompanies = []
}: TaskModalProps) {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')

  // Form state
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'MEDIUM')
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId || '')
  const [leadId, setLeadId] = useState(task?.leadId || '')
  const [companyId, setCompanyId] = useState(task?.companyId || '')

  const isEditing = !!task
  const currentUserId = session?.user?.id || ''

  // Reset company if lead is selected
  useEffect(() => {
    if (leadId) {
      setCompanyId('')
    }
  }, [leadId])

  const handleSave = () => {
    if (!title.trim()) return

    startTransition(async () => {
      try {
        const taskData = {
          title,
          description: description || undefined,
          priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          leadId: leadId || undefined,
          companyId: companyId || undefined,
          assignedToId: assignedToId || undefined
        }

        if (isEditing) {
          await updateTask(task.id, taskData, currentUserId)
        } else {
          await createTask(taskData, currentUserId)
        }

        onSave()
        onClose()
      } catch (error) {
        console.error('Error guardant tasca:', error)
      }
    })
  }

  const handleComplete = () => {
    if (!task) return

    startTransition(async () => {
      try {
        await completeTask(task.id, currentUserId, completionNotes || undefined)
        onSave()
        onClose()
      } catch (error) {
        console.error('Error completant tasca:', error)
      }
    })
  }

  const handleDelete = () => {
    if (!task) return

    startTransition(async () => {
      try {
        await deleteTask(task.id)
        onSave()
        onClose()
      } catch (error) {
        console.error('Error eliminant tasca:', error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">
            {isEditing ? 'Editar tasca' : 'Nova tasca'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Informació de relació */}
          {task && (task.lead || task.company) && (
            <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-3">
              {task.lead ? (
                <>
                  <Target className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-slate-900">Lead relacionat</p>
                    <p className="text-sm text-slate-600">{task.lead.companyName}</p>
                  </div>
                </>
              ) : task.company ? (
                <>
                  <Building2 className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-slate-900">Empresa relacionada</p>
                    <p className="text-sm text-slate-600">{task.company.name}</p>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Títol */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Títol *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Trucar per seguir amb la proposta..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Prioritat */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Prioritat
            </label>
            <div className="grid grid-cols-4 gap-3">
              {priorityOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-center transition-all',
                      priority === option.value
                        ? option.color
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Data límit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Data límit
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Assignat a */}
          {availableUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assignar a
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Assignar automàticament</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Lead relacionat */}
          {availableLeads.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lead relacionat
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No relacionat amb cap lead</option>
                  {availableLeads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Empresa relacionada (només si no hi ha lead) */}
          {!leadId && availableCompanies.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Empresa relacionada
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No relacionat amb cap empresa</option>
                  {availableCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Descripció */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripció
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalls addicionals sobre la tasca..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Completar tasca (només si editem i no està completada) */}
          {isEditing && task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">Completar tasca</h3>
              <div className="space-y-3">
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Notes sobre el resultat de la tasca..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
                <button
                  onClick={handleComplete}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
                  Marcar com completada
                </button>
              </div>
            </div>
          )}

          {/* Confirmació d'eliminació */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium text-red-900 mb-2">
                Eliminar tasca
              </p>
              <p className="text-sm text-red-700 mb-4">
                Segur que vols eliminar aquesta tasca? Aquesta acció no es pot desfer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Cancel·lar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          {isEditing && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Eliminar
            </button>
          )}
          {!isEditing && <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !title.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
              {isEditing ? 'Guardar canvis' : 'Crear tasca'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}