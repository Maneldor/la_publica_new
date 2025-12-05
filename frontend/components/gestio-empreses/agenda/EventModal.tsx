// components/gestio-empreses/agenda/EventModal.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Target,
  Phone,
  Users,
  Trash2,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  completeCalendarEvent,
  EventType
} from '@/lib/gestio-empreses/calendar-actions'

interface EventModalProps {
  event?: {
    id: string
    title: string
    description: string | null
    type: string
    startDate: Date
    endDate: Date | null
    allDay: boolean
    location: string | null
    completed: boolean
    leadId: string | null
    companyId: string | null
    lead?: { id: string; companyName: string } | null
    company?: { id: string; name: string } | null
  } | null
  initialDate?: Date
  onClose: () => void
  onSave: () => void
}

const eventTypes: { value: EventType; label: string; icon: any }[] = [
  { value: 'CALL', label: 'Trucada', icon: Phone },
  { value: 'MEETING', label: 'Reunió', icon: Users },
  { value: 'FOLLOW_UP', label: 'Seguiment', icon: Clock },
  { value: 'DEMO', label: 'Demo', icon: Target },
  { value: 'OTHER', label: 'Altre', icon: Calendar },
]

export function EventModal({ event, initialDate, onClose, onSave }: EventModalProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [type, setType] = useState<EventType>((event?.type as EventType) || 'CALL')
  const [startDate, setStartDate] = useState(
    event?.startDate
      ? format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm")
      : initialDate
        ? format(initialDate, "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [endDate, setEndDate] = useState(
    event?.endDate
      ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm")
      : ''
  )
  const [allDay, setAllDay] = useState(event?.allDay || false)
  const [location, setLocation] = useState(event?.location || '')
  const [completionNotes, setCompletionNotes] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditing = !!event

  const handleSave = () => {
    if (!title.trim()) return

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateCalendarEvent(event.id, {
            title,
            description: description || undefined,
            type,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            allDay,
            location: location || undefined,
          }, 'current-user-id')
        } else {
          await createCalendarEvent({
            title,
            description: description || undefined,
            type,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            allDay,
            location: location || undefined,
          }, 'current-user-id')
        }
        onSave()
        onClose()
      } catch (error) {
        console.error('Error guardant esdeveniment:', error)
      }
    })
  }

  const handleDelete = () => {
    if (!event) return

    startTransition(async () => {
      try {
        await deleteCalendarEvent(event.id)
        onSave()
        onClose()
      } catch (error) {
        console.error('Error eliminant esdeveniment:', error)
      }
    })
  }

  const handleComplete = () => {
    if (!event) return

    startTransition(async () => {
      try {
        await completeCalendarEvent(event.id, 'current-user-id', completionNotes || undefined)
        onSave()
        onClose()
      } catch (error) {
        console.error('Error completant esdeveniment:', error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">
            {isEditing ? 'Editar esdeveniment' : 'Nou esdeveniment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Relacionat amb lead/empresa */}
          {event && (event.lead || event.company) && (
            <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2">
              {event.lead ? (
                <>
                  <Target className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  <span className="text-sm text-slate-700">
                    Lead: {event.lead.companyName}
                  </span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  <span className="text-sm text-slate-700">
                    Empresa: {event.company?.name}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Tipus */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipus
            </label>
            <div className="grid grid-cols-5 gap-2">
              {eventTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    'p-2 rounded-lg border text-center transition-colors',
                    type === t.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <t.icon className="h-4 w-4 mx-auto mb-1" strokeWidth={1.5} />
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Títol */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Títol *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Trucada de seguiment..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tot el dia */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Tot el dia</span>
          </label>

          {/* Data i hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Inici *
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startDate.split('T')[0] : startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fi
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Ubicació */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ubicació
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Oficina, Google Meet..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Descripció */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripció
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes addicionals..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Completar esdeveniment (només si editem i no està completat) */}
          {isEditing && !event?.completed && (
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Marcar com completat
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Notes sobre el resultat..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none mb-2"
              />
              <button
                onClick={handleComplete}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                Completar
              </button>
            </div>
          )}

          {/* Confirmació d'eliminació */}
          {showDeleteConfirm && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                Segur que vols eliminar aquest esdeveniment?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancel·lar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          {isEditing && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700"
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
              {isEditing ? 'Guardar canvis' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}