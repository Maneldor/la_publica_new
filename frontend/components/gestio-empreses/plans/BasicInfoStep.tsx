'use client'

import { Building2, Hash, Type, FileText, Palette, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BasicInfoStepProps {
  formData: {
    name: string
    slug: string
    tier: string
    description: string
  }
  onChange: (data: any) => void
  errors: Record<string, string>
}

const tierOptions = [
  { value: '', label: 'Selecciona un tier...' },
  { value: 'PIONERES', label: 'Pioneres', description: 'Pla gratuït per començar' },
  { value: 'STANDARD', label: 'Estàndard', description: 'Pla bàsic per empreses petites' },
  { value: 'STRATEGIC', label: 'Estratègic', description: 'Pla avançat per empreses mitjanes' },
  { value: 'ENTERPRISE', label: 'Enterprise', description: 'Pla complet per grans empreses' },
]

export function BasicInfoStep({ formData, onChange, errors }: BasicInfoStepProps) {
  const updateField = (field: string, value: string) => {
    const updates: Record<string, string> = { [field]: value }

    // Auto-generar slug quan es canvia el nom
    if (field === 'name' && value) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      if (!formData.slug || formData.slug === '') {
        updates.slug = autoSlug
      }
    }

    onChange(updates)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Informació Bàsica
        </h2>
        <p className="text-slate-600">
          Configura la informació fonamental del nou pla de subscripció
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        {/* Nom del pla */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Type className="h-4 w-4" strokeWidth={1.5} />
            Nom del pla
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Ex: Pla Estàndard"
            className={cn(
              "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
              errors.name ? "border-red-300" : "border-slate-200"
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Hash className="h-4 w-4" strokeWidth={1.5} />
            Slug (URL)
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            placeholder="pla-estandard"
            className={cn(
              "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
              errors.slug ? "border-red-300" : "border-slate-200"
            )}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            S'utilitza en les URLs. Es genera automàticament des del nom.
          </p>
        </div>

        {/* Tier */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Palette className="h-4 w-4" strokeWidth={1.5} />
            Tier del pla
          </label>
          <div className="relative">
            <select
              value={formData.tier}
              onChange={(e) => updateField('tier', e.target.value)}
              className={cn(
                "w-full appearance-none px-4 py-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                errors.tier ? "border-red-300" : "border-slate-200"
              )}
            >
              {tierOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
          </div>
          {errors.tier && (
            <p className="mt-1 text-sm text-red-600">{errors.tier}</p>
          )}
          {formData.tier && tierOptions.find(t => t.value === formData.tier)?.description && (
            <p className="mt-1 text-xs text-slate-500">
              {tierOptions.find(t => t.value === formData.tier)?.description}
            </p>
          )}
        </div>

        {/* Descripció */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <FileText className="h-4 w-4" strokeWidth={1.5} />
            Descripció
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Descripció breu del pla i els seus beneficis..."
            rows={4}
            className={cn(
              "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none",
              errors.description ? "border-red-300" : "border-slate-200"
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Màxim 200 caràcters. {formData.description.length}/200
          </p>
        </div>
      </div>
    </div>
  )
}