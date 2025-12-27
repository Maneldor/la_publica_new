'use client'

import { useState } from 'react'
import { X, Loader2, Calendar, Clock, Bell, Languages, FileText } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string | null
}

interface Schedule {
  id: string
  name: string
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  daysOfWeek: number[]
  publishTime: string
  autoPublish: boolean
  language: string
  tone: string
  articleLength: 'SHORT' | 'MEDIUM' | 'LONG' | 'EXTRA_LONG'
  defaultCategoryId: string | null
  defaultVisibility: 'PUBLIC' | 'GROUPS' | 'PRIVATE'
  notifyOnGenerate: boolean
}

interface ScheduleConfigModalProps {
  schedule: Schedule | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

const DAYS = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge']
const FREQUENCIES = [
  { value: 'DAILY', label: 'Diari' },
  { value: 'WEEKLY', label: 'Setmanal' },
  { value: 'BIWEEKLY', label: 'Quinzenal' },
  { value: 'MONTHLY', label: 'Mensual' }
]
const LENGTHS = [
  { value: 'SHORT', label: 'Curt (~500 paraules)' },
  { value: 'MEDIUM', label: 'Mitjà (~1000 paraules)' },
  { value: 'LONG', label: 'Llarg (~1500 paraules)' },
  { value: 'EXTRA_LONG', label: 'Molt llarg (~2000 paraules)' }
]
const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'academic', label: 'Acadèmic' },
  { value: 'friendly', label: 'Amigable' },
  { value: 'formal', label: 'Formal' }
]
const VISIBILITIES = [
  { value: 'PUBLIC', label: 'Públic' },
  { value: 'GROUPS', label: 'Només grups' },
  { value: 'PRIVATE', label: 'Privat' }
]

export default function ScheduleConfigModal({
  schedule,
  categories,
  onClose,
  onSaved
}: ScheduleConfigModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: schedule?.name || 'Programació principal',
    frequency: schedule?.frequency || 'DAILY',
    daysOfWeek: schedule?.daysOfWeek || [0, 1, 2, 3, 4], // Lunes a Viernes
    publishTime: schedule?.publishTime || '08:00',
    autoPublish: schedule?.autoPublish || false,
    language: schedule?.language || 'ca',
    tone: schedule?.tone || 'professional',
    articleLength: schedule?.articleLength || 'MEDIUM',
    defaultCategoryId: schedule?.defaultCategoryId || '',
    defaultVisibility: schedule?.defaultVisibility || 'PUBLIC',
    notifyOnGenerate: schedule?.notifyOnGenerate ?? true
  })

  const toggleDay = (dayIndex: number) => {
    const days = formData.daysOfWeek.includes(dayIndex)
      ? formData.daysOfWeek.filter(d => d !== dayIndex)
      : [...formData.daysOfWeek, dayIndex].sort()
    setFormData({ ...formData, daysOfWeek: days })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = schedule
        ? `/api/gestio/blog/auto-schedule/${schedule.id}`
        : '/api/gestio/blog/auto-schedule'

      const res = await fetch(url, {
        method: schedule ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          defaultCategoryId: formData.defaultCategoryId || null
        })
      })

      if (res.ok) {
        onSaved()
      } else {
        const data = await res.json()
        alert(data.error || 'Error desant')
      }
    } catch (error) {
      console.error('Error desant:', error)
      alert('Error desant')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold text-gray-900">
              {schedule ? 'Editar programació' : 'Nova programació'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la programació
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Ex: Blog principal"
                required
              />
            </div>

            {/* Freqüència i hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Freqüència
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as typeof formData.frequency })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  {FREQUENCIES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hora de publicació
                </label>
                <input
                  type="time"
                  value={formData.publishTime}
                  onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
            </div>

            {/* Dies de la setmana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dies actius
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.daysOfWeek.includes(index)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuració de l'article */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Configuració de l&apos;article
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud
                  </label>
                  <select
                    value={formData.articleLength}
                    onChange={(e) => setFormData({ ...formData, articleLength: e.target.value as typeof formData.articleLength })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    {LENGTHS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    {TONES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Languages className="w-4 h-4 inline mr-1" />
                    Idioma
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="ca">Català</option>
                    <option value="es">Castellà</option>
                    <option value="en">Anglès</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria per defecte
                  </label>
                  <select
                    value={formData.defaultCategoryId}
                    onChange={(e) => setFormData({ ...formData, defaultCategoryId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="">Sense categoria</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibilitat per defecte
                </label>
                <div className="flex gap-4">
                  {VISIBILITIES.map(v => (
                    <label key={v.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        value={v.value}
                        checked={formData.defaultVisibility === v.value}
                        onChange={(e) => setFormData({ ...formData, defaultVisibility: e.target.value as typeof formData.defaultVisibility })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{v.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Opcions addicionals */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoPublish}
                  onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Publicació automàtica</span>
                  <p className="text-xs text-gray-500">Publica directament sense revisió</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyOnGenerate}
                  onChange={(e) => setFormData({ ...formData, notifyOnGenerate: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <Bell className="w-4 h-4" />
                    Notificar en generar
                  </span>
                  <p className="text-xs text-gray-500">Envia notificació quan es genera un article</p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {schedule ? 'Desar canvis' : 'Crear programació'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
