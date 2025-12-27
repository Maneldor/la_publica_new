'use client'

import { useState } from 'react'
import {
  X,
  Loader2,
  Link2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Image
} from 'lucide-react'
import { toast } from 'sonner'

interface UsefulLink {
  id: string
  name: string
  slogan: string | null
  description: string | null
  website: string
  phone: string | null
  email: string | null
  address: string | null
  logo: string | null
  categoryId?: string
  category: { id: string; name: string }
  isHighlighted: boolean
}

interface Category {
  id: string
  name: string
  color: string
  isActive?: boolean
}

interface CreateLinkModalProps {
  link?: UsefulLink | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export function CreateLinkModal({ link, categories, onClose, onSaved }: CreateLinkModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: link?.name || '',
    slogan: link?.slogan || '',
    description: link?.description || '',
    website: link?.website || '',
    phone: link?.phone || '',
    email: link?.email || '',
    address: link?.address || '',
    logo: link?.logo || '',
    categoryId: link?.category?.id || link?.categoryId || '',
    isHighlighted: link?.isHighlighted || false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nom és obligatori')
      return
    }

    if (!formData.website.trim()) {
      toast.error('La URL és obligatòria')
      return
    }

    if (!formData.categoryId) {
      toast.error('La categoria és obligatòria')
      return
    }

    // Validar URL
    try {
      new URL(formData.website)
    } catch {
      toast.error('La URL no és vàlida')
      return
    }

    setIsLoading(true)

    try {
      const url = link?.id
        ? `/api/gestio/enllacos/${link.id}`
        : '/api/gestio/enllacos'

      const method = link?.id ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error')
      }

      toast.success(link?.id ? 'Enllaç actualitzat' : 'Enllaç creat')
      onSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error guardant l\'enllaç')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6 text-cyan-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {link?.id ? 'Editar Enllaç' : 'Nou Enllaç'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Generalitat de Catalunya"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eslògan / Subtítol
            </label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
              placeholder="Ex: Portal oficial del Govern"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del lloc web *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.exemple.cat"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white"
            >
              <option value="">Selecciona una categoria</option>
              {categories.filter(c => c.isActive !== false).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Descripció */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripció
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripció breu de l'organisme o servei..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 resize-none text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>

          {/* Contacte */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telèfon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="012"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@exemple.cat"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Adreça */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adreça
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Plaça Sant Jaume, 4, Barcelona"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del logo
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                placeholder="https://exemple.cat/logo.png"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Destacat */}
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.isHighlighted}
              onChange={(e) => setFormData(prev => ({ ...prev, isHighlighted: e.target.checked }))}
              className="w-4 h-4 rounded text-cyan-600"
            />
            <div>
              <span className="font-medium text-gray-900">Enllaç destacat</span>
              <p className="text-xs text-gray-500">Apareixerà primer a la llista</p>
            </div>
          </label>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {link?.id ? 'Guardar Canvis' : 'Crear Enllaç'}
          </button>
        </div>
      </div>
    </div>
  )
}
