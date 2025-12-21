'use client'

import { useState, useEffect } from 'react'
import { X, Shield, Plus, Lock, Info } from 'lucide-react'
import { TYPOGRAPHY, BUTTONS, INPUTS, COLORS } from '@/lib/design-system'

interface SensitiveCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  departmentPatterns: string[]
  positionPatterns: string[]
  forceHidePosition: boolean
  forceHideDepartment: boolean
  forceHideBio: boolean
  forceHideLocation: boolean
  forceHidePhone: boolean
  forceHideEmail: boolean
  forceHideGroups: boolean
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<SensitiveCategory>) => Promise<void>
  category: SensitiveCategory | null
}

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Shield',
    color: 'indigo',
    isActive: true,
    departmentPatterns: [] as string[],
    positionPatterns: [] as string[],
    forceHidePosition: true,
    forceHideDepartment: false,
    forceHideBio: true,
    forceHideLocation: true,
    forceHidePhone: true,
    forceHideEmail: true,
    forceHideGroups: true,
  })
  const [newDeptPattern, setNewDeptPattern] = useState('')
  const [newPosPattern, setNewPosPattern] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || 'Shield',
        color: category.color || 'indigo',
        isActive: category.isActive,
        departmentPatterns: category.departmentPatterns || [],
        positionPatterns: category.positionPatterns || [],
        forceHidePosition: category.forceHidePosition,
        forceHideDepartment: category.forceHideDepartment,
        forceHideBio: category.forceHideBio,
        forceHideLocation: category.forceHideLocation,
        forceHidePhone: category.forceHidePhone,
        forceHideEmail: category.forceHideEmail,
        forceHideGroups: category.forceHideGroups,
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: 'Shield',
        color: 'indigo',
        isActive: true,
        departmentPatterns: [],
        positionPatterns: [],
        forceHidePosition: true,
        forceHideDepartment: false,
        forceHideBio: true,
        forceHideLocation: true,
        forceHidePhone: true,
        forceHideEmail: true,
        forceHideGroups: true,
      })
    }
    setError(null)
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('El nom és obligatori')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await onSave({
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      })
    } catch (err) {
      setError('Hi ha hagut un error guardant la categoria')
    } finally {
      setIsSaving(false)
    }
  }

  const addDeptPattern = () => {
    if (newDeptPattern.trim() && !formData.departmentPatterns.includes(newDeptPattern.trim())) {
      setFormData(prev => ({
        ...prev,
        departmentPatterns: [...prev.departmentPatterns, newDeptPattern.trim()]
      }))
      setNewDeptPattern('')
    }
  }

  const removeDeptPattern = (pattern: string) => {
    setFormData(prev => ({
      ...prev,
      departmentPatterns: prev.departmentPatterns.filter(p => p !== pattern)
    }))
  }

  const addPosPattern = () => {
    if (newPosPattern.trim() && !formData.positionPatterns.includes(newPosPattern.trim())) {
      setFormData(prev => ({
        ...prev,
        positionPatterns: [...prev.positionPatterns, newPosPattern.trim()]
      }))
      setNewPosPattern('')
    }
  }

  const removePosPattern = (pattern: string) => {
    setFormData(prev => ({
      ...prev,
      positionPatterns: prev.positionPatterns.filter(p => p !== pattern)
    }))
  }

  const restrictionFields = [
    { key: 'forceHidePosition', label: 'Càrrec / Posició' },
    { key: 'forceHideDepartment', label: 'Departament' },
    { key: 'forceHideBio', label: 'Bio / Descripció' },
    { key: 'forceHideLocation', label: 'Ubicació' },
    { key: 'forceHidePhone', label: 'Telèfon' },
    { key: 'forceHideEmail', label: 'Email' },
    { key: 'forceHideGroups', label: 'Grups' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className={TYPOGRAPHY.sectionTitle}>
              {category ? 'Editar Categoria' : 'Nova Categoria Sensible'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={BUTTONS.icon}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Dades bàsiques */}
            <div className="space-y-4">
              <h3 className={TYPOGRAPHY.label}>Informació bàsica</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-1`}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Policia"
                    className={INPUTS.base}
                  />
                </div>
                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-1`}>
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="policia-local (auto-generat)"
                    className={INPUTS.base}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${TYPOGRAPHY.label} mb-1`}>
                  Descripció
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripció de la categoria i qui inclou..."
                  rows={2}
                  className={INPUTS.textarea}
                />
              </div>
            </div>

            {/* Patrons de detecció */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className={TYPOGRAPHY.label}>Patrons d&apos;auto-detecció</h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Quan un usuari indica un departament o posició que coincideix amb aquests patrons, se li assignarà automàticament aquesta categoria.
                  </div>
                </div>
              </div>

              {/* Patrons de departament */}
              <div>
                <label className={`block ${TYPOGRAPHY.body} mb-2`}>
                  Patrons de departament
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDeptPattern}
                    onChange={(e) => setNewDeptPattern(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeptPattern())}
                    placeholder="Policia, Seguretat Ciutadana"
                    className={`flex-1 ${INPUTS.base}`}
                  />
                  <button
                    type="button"
                    onClick={addDeptPattern}
                    className={BUTTONS.secondary}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.departmentPatterns.map((pattern, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {pattern}
                      <button
                        type="button"
                        onClick={() => removeDeptPattern(pattern)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Patrons de posició */}
              <div>
                <label className={`block ${TYPOGRAPHY.body} mb-2`}>
                  Patrons de posició/càrrec
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPosPattern}
                    onChange={(e) => setNewPosPattern(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPosPattern())}
                    placeholder="Agent, Caporal, Inspector"
                    className={`flex-1 ${INPUTS.base}`}
                  />
                  <button
                    type="button"
                    onClick={addPosPattern}
                    className={BUTTONS.secondary}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.positionPatterns.map((pattern, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                    >
                      {pattern}
                      <button
                        type="button"
                        onClick={() => removePosPattern(pattern)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Restriccions forçades */}
            <div className="space-y-4">
              <h3 className={TYPOGRAPHY.label}>
                Camps amb privacitat forçada
              </h3>
              <p className={TYPOGRAPHY.small}>
                Aquests camps estaran SEMPRE ocults per als usuaris d&apos;aquesta categoria. No podran canviar-ho.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {restrictionFields.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData[field.key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [field.key]: e.target.checked
                      }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <Lock className={`w-4 h-4 ${
                        formData[field.key as keyof typeof formData] ? 'text-red-500' : 'text-gray-300'
                      }`} />
                      <span className={TYPOGRAPHY.body}>{field.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Estat */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className={TYPOGRAPHY.label}>Categoria activa</p>
                <p className={TYPOGRAPHY.small}>
                  Les categories desactivades no s&apos;apliquen als usuaris
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.isActive ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className={`p-3 rounded-lg ${COLORS.error.bg} border ${COLORS.error.border} ${COLORS.error.text}`}>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className={BUTTONS.ghost}
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`${BUTTONS.primary} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardant...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {category ? 'Guardar Canvis' : 'Crear Categoria'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
