'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Trash2, Clock, MapPin, Bell, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AgendaEvent, CATEGORIES } from '@/lib/constants/agenda'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<AgendaEvent>) => void
  onDelete?: () => void
  event: AgendaEvent | null
  defaultDate: Date
}

export function EventModal({ isOpen, onClose, onSave, onDelete, event, defaultDate }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(defaultDate, 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    allDay: false,
    category: 'personal',
    reminder: false,
    location: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar dades de l'event si estem editant
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: format(new Date(event.date), 'yyyy-MM-dd'),
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        allDay: event.allDay,
        category: event.category,
        reminder: event.reminder,
        location: event.location || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        date: format(defaultDate, 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        allDay: false,
        category: 'personal',
        reminder: false,
        location: ''
      })
    }
  }, [event, defaultDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        startTime: formData.allDay ? null : formData.startTime || null,
        endTime: formData.allDay ? null : formData.endTime || null,
        allDay: formData.allDay,
        category: formData.category,
        reminder: formData.reminder,
        location: formData.location || null
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm("Estàs segur que vols eliminar aquest esdeveniment?")) return

    setIsSubmitting(true)
    try {
      await onDelete()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">
            {event ? 'Editar esdeveniment' : 'Nou esdeveniment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Títol */}
          <div>
            <Label htmlFor="title">Títol *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nom de l'esdeveniment"
              required
              autoFocus
            />
          </div>

          {/* Descripció */}
          <div>
            <Label htmlFor="description">Descripció</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Afegeix detalls..."
              rows={2}
            />
          </div>

          {/* Data */}
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Tot el dia */}
          <div className="flex items-center justify-between">
            <Label htmlFor="allDay" className="cursor-pointer">Tot el dia</Label>
            <Switch
              id="allDay"
              checked={formData.allDay}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, allDay: checked }))}
            />
          </div>

          {/* Hores (si no és tot el dia) */}
          {!formData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Hora inici
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora fi</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Categoria */}
          <div>
            <Label className="flex items-center gap-1 mb-2">
              <Tag className="w-3 h-3" />
              Categoria
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${formData.category === cat.id
                      ? `${cat.bgClass} text-white`
                      : `${cat.bgLight} ${cat.textClass} hover:opacity-80`
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ubicació */}
          <div>
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Ubicació
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="On serà?"
            />
          </div>

          {/* Recordatori */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <Label htmlFor="reminder" className="cursor-pointer flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              Activar recordatori
            </Label>
            <Switch
              id="reminder"
              checked={formData.reminder}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, reminder: checked }))}
            />
          </div>

          {/* Accions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {event && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel·lar
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
                {isSubmitting ? 'Guardant...' : event ? 'Guardar canvis' : 'Crear'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
