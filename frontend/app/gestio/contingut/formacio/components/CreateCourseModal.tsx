'use client'

import { useState } from 'react'
import { X, Plus, Loader2, AlertCircle } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface CreateCourseModalProps {
  categories: Category[]
  onClose: () => void
  onSuccess: (courseId: string) => void
}

export function CreateCourseModal({ categories, onClose, onSuccess }: CreateCourseModalProps) {
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [type, setType] = useState<'MICRO' | 'BASIC' | 'COMPLETE' | 'PREMIUM'>('BASIC')
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('BEGINNER')
  const [categoryId, setCategoryId] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('El títol és obligatori')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gestio/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          shortDescription,
          type,
          level,
          categoryId: categoryId || undefined,
          isFree,
          price: isFree ? null : parseFloat(price) || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creant el curs')
      }

      onSuccess(data.course.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  function getTypeLabel(t: string) {
    const labels: Record<string, string> = {
      MICRO: 'Micro',
      BASIC: 'Bàsic',
      COMPLETE: 'Complet',
      PREMIUM: 'Premium'
    }
    return labels[t] || t
  }

  function getLevelLabel(l: string) {
    const labels: Record<string, string> = {
      BEGINNER: 'Principiant',
      INTERMEDIATE: 'Intermedi',
      ADVANCED: 'Avançat',
      EXPERT: 'Expert'
    }
    return labels[l] || l
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Crear curs manualment</h2>
            <p className="text-sm text-gray-500">Defineix les dades bàsiques del curs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Títol del curs *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Introducció a la Intel·ligència Artificial"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                required
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripció curta
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Una breu descripció del curs (màx. 160 caràcters)"
                rows={2}
                maxLength={160}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 bg-white placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">{shortDescription.length}/160</p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipus de curs
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['MICRO', 'BASIC', 'COMPLETE', 'PREMIUM'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      type === t
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {getTypeLabel(t)}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivell
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      level === l
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {getLevelLabel(l)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              >
                <option value="">Sense categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preu
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Curs gratuït</span>
                </label>
                {!isFree && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                    />
                    <span className="text-gray-500">€</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creant...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Crear curs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
