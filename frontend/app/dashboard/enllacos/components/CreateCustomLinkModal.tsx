'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Link2, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface Folder {
  id: string
  name: string
  color: string
}

interface CreateCustomLinkModalProps {
  onClose: () => void
  onCreated: () => void
  folders: Folder[]
  editingLink?: {
    id: string
    name: string
    url: string
    description?: string
    icon?: string
    color?: string
    folderId?: string | null
  } | null
}

const COLOR_OPTIONS = [
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6'
]

export function CreateCustomLinkModal({ onClose, onCreated, folders, editingLink }: CreateCustomLinkModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    color: '#3b82f6',
    folderId: ''
  })

  useEffect(() => {
    if (editingLink) {
      setFormData({
        name: editingLink.name,
        url: editingLink.url,
        description: editingLink.description || '',
        color: editingLink.color || '#3b82f6',
        folderId: editingLink.folderId || ''
      })
    }
  }, [editingLink])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error('El nom i la URL són obligatoris')
      return
    }

    // Validar URL
    try {
      new URL(formData.url)
    } catch {
      toast.error('La URL no és vàlida')
      return
    }

    setIsLoading(true)

    try {
      const url = editingLink
        ? `/api/user/links/custom/${editingLink.id}`
        : '/api/user/links/custom'

      const method = editingLink ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          folderId: formData.folderId || null
        })
      })

      if (!res.ok) throw new Error()

      toast.success(editingLink ? 'Enllaç actualitzat' : 'Enllaç creat')
      onCreated()
      onClose()
    } catch {
      toast.error('Error guardant l\'enllaç')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {editingLink ? 'Editar Enllaç' : 'Nou Enllaç Personal'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Intranet corporativa"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://exemple.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripció
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breu descripció..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400 resize-none"
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

          {folders.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carpeta
              </label>
              <select
                value={formData.folderId}
                onChange={(e) => setFormData(prev => ({ ...prev, folderId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white"
              >
                <option value="">Sense carpeta</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingLink ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
