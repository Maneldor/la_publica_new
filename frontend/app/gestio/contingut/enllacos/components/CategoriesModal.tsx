'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  FolderOpen
} from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  isActive: boolean
  _count: { links: number }
}

interface CategoriesModalProps {
  onClose: () => void
  onUpdated: () => void
}

const COLOR_OPTIONS = [
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6'
]

export function CategoriesModal({ onClose, onUpdated }: CategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#06b6d4'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/gestio/enllacos/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      toast.error('Error carregant categories')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditForm = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    })
    setShowForm(true)
  }

  const openNewForm = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '', color: '#06b6d4' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nom és obligatori')
      return
    }

    setActionLoading('form')

    try {
      const url = editingCategory
        ? `/api/gestio/enllacos/categories/${editingCategory.id}`
        : '/api/gestio/enllacos/categories'

      const method = editingCategory ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error()

      toast.success(editingCategory ? 'Categoria actualitzada' : 'Categoria creada')
      setShowForm(false)
      fetchCategories()
      onUpdated()
    } catch {
      toast.error('Error guardant la categoria')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category && category._count.links > 0) {
      if (!confirm(`Aquesta categoria té ${category._count.links} enllaços. S'eliminaran tots. Segur?`)) {
        return
      }
    }

    setActionLoading(categoryId)

    try {
      const res = await fetch(`/api/gestio/enllacos/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error()

      toast.success('Categoria eliminada')
      fetchCategories()
      onUpdated()
    } catch {
      toast.error('Error eliminant la categoria')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-semibold text-gray-900">Categories d'Enllaços</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Administració Autonòmica"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripció
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breu descripció..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'form'}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50"
                >
                  {actionLoading === 'form' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                onClick={openNewForm}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors mb-4"
              >
                <Plus className="w-5 h-5" />
                Nova categoria
              </button>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hi ha categories creades
                </p>
              ) : (
                <div className="space-y-2">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category._count.links} enllaços</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditForm(category)}
                          className="p-1.5 hover:bg-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={actionLoading === category.id}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {actionLoading === category.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
