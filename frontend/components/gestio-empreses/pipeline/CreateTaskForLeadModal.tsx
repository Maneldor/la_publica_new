'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Calendar, User, Tag, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createTaskForLead,
  getAvailableAssignees
} from '@/lib/gestio-empreses/lead-tasks-actions'

interface CreateTaskForLeadModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName: string
  currentUserId: string
  onTaskCreated?: () => void
}

// Tipus de tasques amb etiquetes llegibles
const taskTypes = [
  { value: 'LEAD_VERIFICATION', label: 'Verificació lead' },
  { value: 'CONTACT_CALL', label: 'Trucada de contacte' },
  { value: 'CONTACT_EMAIL', label: 'Email de contacte' },
  { value: 'DOCUMENT_REQUEST', label: 'Sol·licitud documents' },
  { value: 'PROPOSAL_CREATION', label: 'Crear proposta' },
  { value: 'FOLLOW_UP', label: 'Seguiment' },
  { value: 'MEETING', label: 'Reunió' },
  { value: 'OTHER', label: 'Altres' },
]

const priorities = [
  { value: 'LOW', label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Mitjana', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700' },
]

export function CreateTaskForLeadModal({
  isOpen,
  onClose,
  leadId,
  leadName,
  currentUserId,
  onTaskCreated
}: CreateTaskForLeadModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('FOLLOW_UP')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [assignedToId, setAssignedToId] = useState(currentUserId)
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Carregar assignees
  useEffect(() => {
    if (isOpen) {
      getAvailableAssignees().then(setAssignees)
      // Reset form
      setTitle('')
      setDescription('')
      setType('FOLLOW_UP')
      setPriority('MEDIUM')
      setDueDate('')
      setAssignedToId(currentUserId)
      setError('')
    }
  }, [isOpen, currentUserId])

  // Tancar amb ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('El títol és obligatori')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await createTaskForLead({
        leadId,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId,
        createdById: currentUserId
      })

      if (result.success) {
        onTaskCreated?.()
        onClose()
      } else {
        setError(result.error || 'Error creant la tasca')
      }
    } catch (err) {
      setError('Error inesperat')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Nova Tasca</h2>
              <p className="text-sm text-slate-500">Per: {leadName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Títol */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Títol *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Trucar per confirmar reunió"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>

            {/* Descripció */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Descripció
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalls addicionals..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            {/* Tipus */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Tag className="h-4 w-4 inline mr-1" />
                Tipus
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {taskTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioritat */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prioritat
              </label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                      priority === p.value
                        ? cn(p.color, 'ring-2 ring-offset-1 ring-blue-500')
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data límit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data límit
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Assignar a */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Assignar a
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={cn(
                'px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors',
                'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creant...
                </>
              ) : (
                'Crear tasca'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}