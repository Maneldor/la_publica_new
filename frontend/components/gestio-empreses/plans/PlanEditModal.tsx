'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  Loader2,
  CreditCard,
  Percent,
  Users,
  Megaphone,
  Sparkles,
  HardDrive,
  Clock,
  Eye,
  Star,
  Palette,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  slug: string
  tier: string
  description?: string
  basePrice: number
  precioMensual?: number
  precioAnual?: number
  firstYearDiscount: number
  maxTeamMembers: number
  maxActiveOffers: number
  maxFeaturedOffers: number
  maxStorage: number
  hasFreeTrial: boolean
  trialDurationDays: number
  isActive: boolean
  isVisible: boolean
  destacado: boolean
  color: string
  icono?: string
  funcionalidades?: string
}

interface PlanEditModalProps {
  plan: Plan | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function PlanEditModal({ plan, isOpen, onClose, onSave }: PlanEditModalProps) {
  const [formData, setFormData] = useState<Plan | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'limits' | 'funcionalitats'>('general')

  useEffect(() => {
    if (plan) {
      setFormData({ ...plan })
    }
  }, [plan])

  if (!isOpen || !formData) return null

  const updateField = (field: keyof Plan, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = async () => {
    if (!formData) return

    // Validacions
    if (formData.basePrice < 0) {
      toast.error('El preu base no pot ser negatiu')
      return
    }
    if (formData.firstYearDiscount < 0 || formData.firstYearDiscount > 1) {
      toast.error('El descompte ha d\'estar entre 0% i 100%')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/plans/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Pla actualitzat correctament')
        onSave()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error('Error de connexió')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: CreditCard },
    { id: 'limits', label: 'Límits', icon: Users },
    { id: 'funcionalitats', label: 'Funcionalitats', icon: FileText },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Editar pla</h2>
              <p className="text-sm text-slate-500">{formData.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <tab.icon className="h-4 w-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {/* Tab General */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                {/* Preus */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Preu base anual (€)
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => updateField('basePrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Descompte 1r any (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round((formData.firstYearDiscount || 0) * 100)}
                        onChange={(e) => updateField('firstYearDiscount', (parseFloat(e.target.value) || 0) / 100)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Trial */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                    <h3 className="font-medium text-slate-900">Prova gratuïta</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasFreeTrial}
                        onChange={(e) => updateField('hasFreeTrial', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">Oferir trial</span>
                    </label>
                    {formData.hasFreeTrial && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={formData.trialDurationDays}
                          onChange={(e) => updateField('trialDurationDays', parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                        />
                        <span className="text-sm text-slate-500">dies</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visibilitat */}
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900">Visibilitat i estat</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => updateField('isActive', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">Actiu</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isVisible}
                        onChange={(e) => updateField('isVisible', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">Visible</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.destacado}
                        onChange={(e) => updateField('destacado', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">Destacat</span>
                    </label>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Color del pla
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => updateField('color', e.target.value)}
                      className="h-10 w-20 border border-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm text-slate-500">{formData.color}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Límits */}
            {activeTab === 'limits' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-4">
                  Usa -1 per indicar il·limitat
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Users className="inline h-4 w-4 mr-1.5" strokeWidth={1.5} />
                      Membres d'equip
                    </label>
                    <input
                      type="number"
                      value={formData.maxTeamMembers}
                      onChange={(e) => updateField('maxTeamMembers', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Megaphone className="inline h-4 w-4 mr-1.5" strokeWidth={1.5} />
                      Ofertes actives
                    </label>
                    <input
                      type="number"
                      value={formData.maxActiveOffers}
                      onChange={(e) => updateField('maxActiveOffers', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Sparkles className="inline h-4 w-4 mr-1.5" strokeWidth={1.5} />
                      Ofertes destacades
                    </label>
                    <input
                      type="number"
                      value={formData.maxFeaturedOffers}
                      onChange={(e) => updateField('maxFeaturedOffers', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <HardDrive className="inline h-4 w-4 mr-1.5" strokeWidth={1.5} />
                      Emmagatzematge (GB)
                    </label>
                    <input
                      type="number"
                      value={formData.maxStorage}
                      onChange={(e) => updateField('maxStorage', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab Funcionalitats */}
            {activeTab === 'funcionalitats' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Funcionalitats del pla (una per línia)
                </label>
                <textarea
                  value={formData.funcionalidades || ''}
                  onChange={(e) => updateField('funcionalidades', e.target.value)}
                  rows={15}
                  placeholder="Escriu una funcionalitat per línia..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Per plans superiors, comença amb "Tot de [PLA], més:" i afegeix les funcionalitats addicionals.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  Guardant...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" strokeWidth={1.5} />
                  Guardar canvis
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}