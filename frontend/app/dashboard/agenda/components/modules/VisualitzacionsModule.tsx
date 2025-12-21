'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Eye, Target, Check, Star, Trash2, Sparkles } from 'lucide-react'
import { VisualizationIcon } from '@/components/icons'

interface Visualization {
  id: string
  title: string
  description?: string
  category?: string
  imageUrl?: string
  isAchieved: boolean
  achievedAt?: string
}

interface VisualitzacionsModuleProps {
  onClose?: () => void
}

const CATEGORIES = [
  { id: 'career', label: 'Carrera', color: 'bg-blue-100 text-blue-700' },
  { id: 'health', label: 'Salut', color: 'bg-green-100 text-green-700' },
  { id: 'relationships', label: 'Relacions', color: 'bg-pink-100 text-pink-700' },
  { id: 'wealth', label: 'Riquesa', color: 'bg-amber-100 text-amber-700' },
  { id: 'personal', label: 'Personal', color: 'bg-purple-100 text-purple-700' }
]

export function VisualitzacionsModule({ onClose }: VisualitzacionsModuleProps) {
  const [visualizations, setVisualizations] = useState<Visualization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadVisualizations()
  }, [])

  const loadVisualizations = async () => {
    try {
      const res = await fetch('/api/agenda/visualizations')
      if (res.ok) {
        const data = await res.json()
        setVisualizations(data)
      }
    } catch (error) {
      console.error('Error carregant visualitzacions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addVisualization = async () => {
    if (!newTitle.trim()) return
    setSaving(true)

    try {
      const res = await fetch('/api/agenda/visualizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          category: newCategory || null
        })
      })

      if (res.ok) {
        setNewTitle('')
        setNewDescription('')
        setNewCategory('')
        setShowNewForm(false)
        loadVisualizations()
      }
    } catch (error) {
      console.error('Error afegint visualització:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleAchieved = async (id: string, currentAchieved: boolean) => {
    try {
      await fetch(`/api/agenda/visualizations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAchieved: !currentAchieved })
      })
      loadVisualizations()
    } catch (error) {
      console.error('Error actualitzant:', error)
    }
  }

  const deleteVisualization = async (id: string) => {
    try {
      await fetch(`/api/agenda/visualizations/${id}`, { method: 'DELETE' })
      loadVisualizations()
    } catch (error) {
      console.error('Error eliminant:', error)
    }
  }

  const activeVisualizations = visualizations.filter(v => !v.isAchieved)
  const achievedVisualizations = visualizations.filter(v => v.isAchieved)

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <VisualizationIcon size="md" />
          <h3 className="font-semibold text-gray-900">Visualitzacions</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Formulario nueva visualización */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-3"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Què visualitzes aconseguir?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descriu-ho amb detall: com et sentiràs, què veuràs..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewCategory(newCategory === cat.id ? '' : cat.id)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    newCategory === cat.id
                      ? cat.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel·lar
              </button>
              <button
                onClick={addVisualization}
                disabled={saving || !newTitle.trim()}
                className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
              >
                {saving ? 'Afegint...' : 'Afegir'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de visualizaciones */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activeVisualizations.length === 0 && achievedVisualizations.length === 0 ? (
          <div className="text-center py-6">
            <Eye className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Visualitza els teus objectius
            </p>
            <p className="text-xs text-gray-400 mt-1">
              El cervell no distingeix entre experiències reals i vívides visualitzacions
            </p>
          </div>
        ) : (
          <>
            {activeVisualizations.map((viz) => {
              const category = CATEGORIES.find(c => c.id === viz.category)
              return (
                <motion.div
                  key={viz.id}
                  layout
                  className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100 group"
                >
                  <button
                    onClick={() => toggleAchieved(viz.id, viz.isAchieved)}
                    className="p-1.5 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors flex-shrink-0"
                  >
                    <Target className="w-4 h-4 text-indigo-600" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-900">{viz.title}</p>
                    {viz.description && (
                      <p className="text-xs text-indigo-600 mt-0.5 line-clamp-2">{viz.description}</p>
                    )}
                    {category && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${category.color}`}>
                        {category.label}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteVisualization(viz.id)}
                    className="p-1 hover:bg-indigo-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-indigo-400 hover:text-red-500" />
                  </button>
                </motion.div>
              )
            })}

            {achievedVisualizations.length > 0 && (
              <div className="pt-2 mt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Aconseguits
                </p>
                {achievedVisualizations.map((viz) => (
                  <motion.div
                    key={viz.id}
                    layout
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <button
                      onClick={() => toggleAchieved(viz.id, viz.isAchieved)}
                      className="p-1.5 bg-green-100 rounded-lg"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <p className="text-sm text-gray-500 line-through flex-1">{viz.title}</p>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Resumen */}
      {visualizations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            {achievedVisualizations.length} de {visualizations.length} aconseguits
          </p>
        </div>
      )}
    </div>
  )
}
