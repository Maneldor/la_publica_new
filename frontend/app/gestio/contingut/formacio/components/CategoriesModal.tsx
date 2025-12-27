'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, Loader2, Save, FolderOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  slug: string
  _count: { courses: number }
}

interface CategoriesModalProps {
  onClose: () => void
}

export function CategoriesModal({ onClose }: CategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const response = await fetch('/api/gestio/courses?categoriesOnly=true')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!name.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/gestio/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createCategory',
          name,
          description: description || undefined
        })
      })

      if (response.ok) {
        setName('')
        setDescription('')
        setShowCreateForm(false)
        loadCategories()
      }
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!name.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/gestio/courses/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined
        })
      })

      if (response.ok) {
        setEditingId(null)
        setName('')
        setDescription('')
        loadCategories()
      }
    } catch (error) {
      console.error('Error updating category:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, coursesCount: number) {
    if (coursesCount > 0) {
      alert(`No es pot eliminar: hi ha ${coursesCount} cursos en aquesta categoria`)
      return
    }

    if (!confirm('Estàs segur que vols eliminar aquesta categoria?')) return

    try {
      const response = await fetch(`/api/gestio/courses/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setName(category.name)
    setDescription(category.description || '')
    setShowCreateForm(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setDescription('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              <p className="text-sm text-gray-500">Gestiona les categories dels cursos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create button */}
          {!showCreateForm && !editingId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              Nova categoria
            </button>
          )}

          {/* Create form */}
          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-3">Nova categoria</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom de la categoria"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                  autoFocus
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripció (opcional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 bg-white placeholder:text-gray-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setName('')
                      setDescription('')
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel·lar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={saving || !name.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories list */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hi ha categories creades
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id}>
                  {editingId === category.id ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-400"
                          autoFocus
                        />
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Descripció (opcional)"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 bg-white placeholder:text-gray-400"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            Cancel·lar
                          </button>
                          <button
                            onClick={() => handleUpdate(category.id)}
                            disabled={saving || !name.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {category._count.courses} cursos
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category._count.courses)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  )
}
