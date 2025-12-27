'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, FolderOpen, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Folder {
  id: string
  name: string
  icon?: string | null
  color: string
  _count: {
    favoriteLinks: number
    customLinks: number
  }
}

interface CreateFolderModalProps {
  onClose: () => void
  onUpdated: () => void
  folders: Folder[]
}

const COLOR_OPTIONS = [
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6'
]

export function CreateFolderModal({ onClose, onUpdated, folders }: CreateFolderModalProps) {
  const [showForm, setShowForm] = useState(folders.length === 0)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6'
  })

  const openEditForm = (folder: Folder) => {
    setEditingFolder(folder)
    setFormData({
      name: folder.name,
      color: folder.color
    })
    setShowForm(true)
  }

  const openNewForm = () => {
    setEditingFolder(null)
    setFormData({ name: '', color: '#3b82f6' })
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
      const url = editingFolder
        ? `/api/user/links/folders/${editingFolder.id}`
        : '/api/user/links/folders'

      const method = editingFolder ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error()

      toast.success(editingFolder ? 'Carpeta actualitzada' : 'Carpeta creada')
      setShowForm(false)
      onUpdated()
    } catch {
      toast.error('Error guardant la carpeta')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId)
    const totalItems = (folder?._count.favoriteLinks || 0) + (folder?._count.customLinks || 0)

    if (totalItems > 0) {
      if (!confirm(`Aquesta carpeta té ${totalItems} enllaços. Es mouran fora de la carpeta. Segur?`)) {
        return
      }
    }

    setActionLoading(folderId)

    try {
      const res = await fetch(`/api/user/links/folders/${folderId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error()

      toast.success('Carpeta eliminada')
      onUpdated()
    } catch {
      toast.error('Error eliminant la carpeta')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-semibold text-gray-900">Les Meves Carpetes</h2>
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
                  placeholder="Ex: Feina, Personal, Projectes..."
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
                {folders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel·lar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={actionLoading === 'form'}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50"
                >
                  {actionLoading === 'form' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingFolder ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                onClick={openNewForm}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors mb-4"
              >
                <FolderOpen className="w-5 h-5" />
                Nova carpeta
              </button>

              {folders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No tens cap carpeta creada
                </p>
              ) : (
                <div className="space-y-2">
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: folder.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{folder.name}</p>
                        <p className="text-xs text-gray-500">
                          {folder._count.favoriteLinks + folder._count.customLinks} enllaços
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditForm(folder)}
                          className="p-1.5 hover:bg-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(folder.id)}
                          disabled={actionLoading === folder.id}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {actionLoading === folder.id ? (
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
