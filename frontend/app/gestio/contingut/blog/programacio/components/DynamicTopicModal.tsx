'use client'

import { useState } from 'react'
import { X, Loader2, Plus, Calendar } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string | null
}

interface DynamicTopic {
  id?: string
  topic?: string
  description?: string | null
  category?: Category | null
  keywords?: string[]
  priority?: number
  useAfterDate?: string | null
  useBeforeDate?: string | null
}

interface DynamicTopicModalProps {
  scheduleId: string
  topic: DynamicTopic | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function DynamicTopicModal({
  scheduleId,
  topic,
  categories,
  onClose,
  onSaved
}: DynamicTopicModalProps) {
  const isEditing = !!topic?.id
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    topic: topic?.topic || '',
    description: topic?.description || '',
    categoryId: topic?.category?.id || '',
    keywords: topic?.keywords || [],
    priority: topic?.priority || 0,
    useAfterDate: topic?.useAfterDate ? topic.useAfterDate.split('T')[0] : '',
    useBeforeDate: topic?.useBeforeDate ? topic.useBeforeDate.split('T')[0] : ''
  })
  const [newKeyword, setNewKeyword] = useState('')

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      })
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch(`/api/gestio/blog/auto-schedule/${scheduleId}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'dynamic',
          ...formData,
          categoryId: formData.categoryId || null,
          useAfterDate: formData.useAfterDate || null,
          useBeforeDate: formData.useBeforeDate || null
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
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Editar tema dinàmic' : 'Nou tema dinàmic'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Ex: Intel·ligència artificial en l'educació"
                required
              />
            </div>

            {/* Descripció */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripció (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900"
                placeholder="Context o indicacions addicionals per a la IA..."
              />
            </div>

            {/* Categoria i Prioritat */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="">Per defecte</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioritat
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">0-100. Més alt = més prioritari</p>
              </div>
            </div>

            {/* Dates de disponibilitat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Finestra de disponibilitat (opcional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Des de</label>
                  <input
                    type="date"
                    value={formData.useAfterDate}
                    onChange={(e) => setFormData({ ...formData, useAfterDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fins</label>
                  <input
                    type="date"
                    value={formData.useBeforeDate}
                    onChange={(e) => setFormData({ ...formData, useBeforeDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El tema només s&apos;utilitzarà dins d&apos;aquesta finestra temporal
              </p>
            </div>

            {/* Paraules clau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paraules clau
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="Afegir paraula clau..."
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(keyword => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                {isEditing ? 'Desar canvis' : 'Afegir tema'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
