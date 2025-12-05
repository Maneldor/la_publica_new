'use client'

import { FileText, Tag, AlignLeft } from 'lucide-react'
import { IconSelector } from './IconSelector'
import { cn } from '@/lib/utils'

type ExtraCategory =
  | 'WEB_MAINTENANCE' | 'BRANDING' | 'MARKETING' | 'SEO'
  | 'CONTENT' | 'CONSULTING' | 'TRAINING' | 'DEVELOPMENT'
  | 'SUPPORT' | 'OTHER'

interface BasicInfoData {
  name: string
  slug: string
  description: string
  category: ExtraCategory
  icon: string
}

interface BasicInfoStepProps {
  data: BasicInfoData
  onChange: (data: BasicInfoData) => void
}

const CATEGORIES: { value: ExtraCategory; label: string }[] = [
  { value: 'WEB_MAINTENANCE', label: 'Manteniment Web' },
  { value: 'BRANDING', label: 'Branding' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SEO', label: 'SEO' },
  { value: 'CONTENT', label: 'Contingut' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'TRAINING', label: 'Formació' },
  { value: 'DEVELOPMENT', label: 'Desenvolupament' },
  { value: 'SUPPORT', label: 'Suport' },
  { value: 'OTHER', label: 'Altres' },
]

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const updateField = (field: keyof BasicInfoData, value: string) => {
    const updates: Partial<BasicInfoData> = { [field]: value }

    // Auto-generar slug des del nom
    if (field === 'name') {
      updates.slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    onChange({ ...data, ...updates })
  }

  return (
    <div className="space-y-6">
      {/* Nom i Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nom del servei <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Manteniment Web Premium"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Slug (URL)
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              value={data.slug}
              onChange={(e) => onChange({ ...data, slug: e.target.value })}
              placeholder="manteniment-web-premium"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Es genera automàticament des del nom</p>
        </div>
      </div>

      {/* Descripció */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripció <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descripció detallada del servei..."
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Categoria <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateField('category', cat.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                data.category === cat.value
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector d'icona */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Icona del servei <span className="text-red-500">*</span>
        </label>
        <IconSelector
          selectedIcon={data.icon}
          onSelect={(iconName) => onChange({ ...data, icon: iconName })}
          color="#8B5CF6"
        />
      </div>
    </div>
  )
}