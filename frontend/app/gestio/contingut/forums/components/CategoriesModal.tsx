'use client'

import { useState } from 'react'
import { X, Loader2, Plus, Edit, Trash2, GripVertical, FolderOpen, Check } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  order: number
  _count: { forums: number }
}

interface CategoriesModalProps {
  categories: Category[]
  onClose: () => void
  onSuccess: () => void
}

const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#84CC16'
]

const EMOJI_OPTIONS = ['📁', '💬', '📢', '💡', '❓', '🎯', '⭐', '🎨', '🎮', '📚', '💻', '🌍']

export default function CategoriesModal({
  categories: initialCategories,
  onClose,
  onSuccess
}: CategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editColor, setEditColor] = useState('#3B82F6')
  const [editIcon, setEditIcon] = useState('📁')

  // New category state
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [newIcon, setNewIcon] = useState('📁')

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditSlug(category.slug)
    setEditDescription(category.description || '')
    setEditColor(category.color || '#3B82F6')
    setEditIcon(category.icon || '📁')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditSlug('')
    setEditDescription('')
    setEditColor('#3B82F6')
    setEditIcon('📁')
  }

  const handleUpdate = async (categoryId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/gestio/forums/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryId,
          name: editName,
          slug: editSlug,
          description: editDescription || null,
          color: editColor,
          icon: editIcon
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualitzar')
      }

      const data = await res.json()
      setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...data.category } : c))
      cancelEdit()
      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconegut')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/gestio/forums/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug: newSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: newDescription || null,
          color: newColor,
          icon: newIcon,
          order: categories.length
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear')
      }

      const data = await res.json()
      setCategories(prev => [...prev, data.category])
      setShowNew(false)
      setNewName('')
      setNewSlug('')
      setNewDescription('')
      setNewColor('#3B82F6')
      setNewIcon('📁')
      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconegut')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return

    if (category._count.forums > 0) {
      setError('No es pot eliminar una categoria amb fòrums assignats')
      return
    }

    if (!confirm(`Estàs segur que vols eliminar "${category.name}"?`)) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/gestio/forums/categories?id=${categoryId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar')
      }

      setCategories(prev => prev.filter(c => c.id !== categoryId))
      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconegut')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Gestió de Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-3 mb-4">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hi ha categories. Crea la primera!
              </div>
            ) : (
              categories.map(category => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 bg-white"
                >
                  {editingId === category.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nom"
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          placeholder="Slug"
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Descripció (opcional)"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Icona:</span>
                          <div className="flex gap-1">
                            {EMOJI_OPTIONS.slice(0, 6).map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => setEditIcon(emoji)}
                                className={`w-8 h-8 rounded text-lg flex items-center justify-center ${
                                  editIcon === emoji ? 'bg-blue-100 ring-1 ring-blue-500' : 'hover:bg-gray-100'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Color:</span>
                          <div className="flex gap-1">
                            {COLOR_OPTIONS.slice(0, 5).map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setEditColor(c)}
                                className={`w-6 h-6 rounded ${editColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel·lar
                        </button>
                        <button
                          onClick={() => handleUpdate(category.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Desar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: category.color || '#f3f4f6' }}
                        >
                          {category.icon || '📁'}
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500">
                            /{category.slug} · {category._count.forums} fòrums
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={category._count.forums > 0}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={category._count.forums > 0 ? 'No es pot eliminar' : 'Eliminar'}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* New Category Form */}
          {showNew ? (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50/50">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value)
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'))
                      }
                    }}
                    placeholder="Nom de la categoria"
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="Slug"
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descripció (opcional)"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Icona:</span>
                    <div className="flex gap-1">
                      {EMOJI_OPTIONS.slice(0, 6).map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewIcon(emoji)}
                          className={`w-8 h-8 rounded text-lg flex items-center justify-center ${
                            newIcon === emoji ? 'bg-blue-100 ring-1 ring-blue-500' : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Color:</span>
                    <div className="flex gap-1">
                      {COLOR_OPTIONS.slice(0, 5).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColor(c)}
                          className={`w-6 h-6 rounded ${newColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowNew(false)
                      setNewName('')
                      setNewSlug('')
                      setNewDescription('')
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel·lar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isLoading || !newName.trim()}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Crear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Afegir Categoria
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
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
