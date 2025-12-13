// components/gestio-empreses/leads/LeadForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCategoriesAsOptions } from '@/lib/constants/categories'

interface LeadFormData {
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  source: string
  estimatedRevenue: string
  notes: string
  sector: string
}

interface LeadFormProps {
  lead?: Partial<LeadFormData>
  isEditing?: boolean
}

const priorityOptions = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Mitjana' },
  { value: 'LOW', label: 'Baixa' },
]

const sourceOptions = [
  'Web',
  'Trucada telefònica',
  'Email',
  'Referència',
  'Xarxes socials',
  'Fira comercial',
  'Publicitat',
  'Altre'
]

export function LeadForm({ lead, isEditing = false }: LeadFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<LeadFormData>({
    companyName: lead?.companyName || '',
    contactName: lead?.contactName || '',
    contactEmail: lead?.contactEmail || '',
    contactPhone: lead?.contactPhone || '',
    priority: lead?.priority || 'MEDIUM',
    source: lead?.source || '',
    estimatedRevenue: lead?.estimatedRevenue || '',
    notes: lead?.notes || '',
    sector: '',
  })

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'El nom de l\'empresa és obligatori'
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'El nom del contacte és obligatori'
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Format d\'email invàlid'
    }

    if (formData.estimatedRevenue && isNaN(Number(formData.estimatedRevenue))) {
      newErrors.estimatedRevenue = 'El valor ha de ser un número'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        estimatedRevenue: formData.estimatedRevenue ? Number(formData.estimatedRevenue) : null,
      }

      const url = isEditing ? `/api/leads/${(lead as any)?.id}` : '/api/leads'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/gestio/leads/${result.id}`)
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || 'Error guardant el lead' })
      }
    } catch (error) {
      setErrors({ submit: 'Error de connexió' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom de l'empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                errors.companyName ? "border-red-300 bg-red-50" : "border-slate-300"
              )}
              placeholder="Nom de l'empresa"
            />
            {errors.companyName && (
              <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sector
            </label>
            <select
              value={formData.sector}
              onChange={(e) => handleInputChange('sector', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona un sector</option>
              {getCategoriesAsOptions().map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Persona de contacte <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                errors.contactName ? "border-red-300 bg-red-50" : "border-slate-300"
              )}
              placeholder="Nom del contacte"
            />
            {errors.contactName && (
              <p className="text-sm text-red-600 mt-1">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                errors.contactEmail ? "border-red-300 bg-red-50" : "border-slate-300"
              )}
              placeholder="email@empresa.com"
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telèfon
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+34 600 000 000"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prioritat
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Font
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona la font</option>
              {sourceOptions.map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Valor estimat (€)
            </label>
            <input
              type="number"
              value={formData.estimatedRevenue}
              onChange={(e) => handleInputChange('estimatedRevenue', e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                errors.estimatedRevenue ? "border-red-300 bg-red-50" : "border-slate-300"
              )}
              placeholder="10000"
              min="0"
              step="100"
            />
            {errors.estimatedRevenue && (
              <p className="text-sm text-red-600 mt-1">{errors.estimatedRevenue}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Notes adicionals sobre el lead..."
        />
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          disabled={isLoading}
        >
          Cancel·lar
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.5} />
          )}
          {isEditing ? 'Actualitzar lead' : 'Crear lead'}
        </button>
      </div>
    </form>
  )
}