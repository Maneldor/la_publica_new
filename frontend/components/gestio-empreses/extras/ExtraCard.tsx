'use client'

import {
  Eye,
  EyeOff,
  Star,
  Edit,
  ToggleLeft,
  ToggleRight,
  Wrench,
  Palette,
  Megaphone,
  Search,
  FileText,
  Lightbulb,
  GraduationCap,
  Code,
  LifeBuoy,
  Package,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ExtraCategory =
  | 'WEB_MAINTENANCE' | 'BRANDING' | 'MARKETING' | 'SEO'
  | 'CONTENT' | 'CONSULTING' | 'TRAINING' | 'DEVELOPMENT'
  | 'SUPPORT' | 'OTHER'

type PriceType = 'FIXED' | 'MONTHLY' | 'ANNUAL' | 'HOURLY' | 'CUSTOM'

interface Extra {
  id: string
  name: string
  slug: string
  description: string
  category: ExtraCategory
  basePrice: number
  priceType: PriceType
  active: boolean
  featured: boolean
  icon?: string
}

interface ExtraCardProps {
  extra: Extra
  onEdit: (extra: Extra) => void
  onToggleActive: (extra: Extra) => void
  onClick: () => void
  isSelected: boolean
}

const CATEGORY_ICONS: Record<ExtraCategory, LucideIcon> = {
  WEB_MAINTENANCE: Wrench,
  BRANDING: Palette,
  MARKETING: Megaphone,
  SEO: Search,
  CONTENT: FileText,
  CONSULTING: Lightbulb,
  TRAINING: GraduationCap,
  DEVELOPMENT: Code,
  SUPPORT: LifeBuoy,
  OTHER: Package,
}

const CATEGORY_COLORS: Record<ExtraCategory, string> = {
  WEB_MAINTENANCE: 'text-slate-600 bg-slate-100',
  BRANDING: 'text-pink-600 bg-pink-100',
  MARKETING: 'text-orange-600 bg-orange-100',
  SEO: 'text-green-600 bg-green-100',
  CONTENT: 'text-blue-600 bg-blue-100',
  CONSULTING: 'text-amber-600 bg-amber-100',
  TRAINING: 'text-purple-600 bg-purple-100',
  DEVELOPMENT: 'text-cyan-600 bg-cyan-100',
  SUPPORT: 'text-red-600 bg-red-100',
  OTHER: 'text-slate-600 bg-slate-100',
}

const CATEGORY_LABELS: Record<ExtraCategory, string> = {
  WEB_MAINTENANCE: 'Manteniment',
  BRANDING: 'Branding',
  MARKETING: 'Marketing',
  SEO: 'SEO',
  CONTENT: 'Contingut',
  CONSULTING: 'Consultoria',
  TRAINING: 'Formació',
  DEVELOPMENT: 'Desenvolupament',
  SUPPORT: 'Suport',
  OTHER: 'Altres',
}

export function ExtraCard({ extra, onEdit, onToggleActive, onClick, isSelected }: ExtraCardProps) {
  const CategoryIcon = CATEGORY_ICONS[extra.category]
  const categoryColor = CATEGORY_COLORS[extra.category]

  const formatPrice = (price: number, type: PriceType) => {
    const suffix = {
      FIXED: '',
      MONTHLY: '/mes',
      ANNUAL: '/any',
      HOURLY: '/h',
      CUSTOM: '',
    }[type]
    return `${price.toFixed(0)}€${suffix}`
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md',
        isSelected ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-200',
        !extra.active && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('p-2.5 rounded-xl', categoryColor)}>
          <CategoryIcon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{extra.name}</h3>
            {extra.featured && (
              <Star className="h-4 w-4 text-amber-500 flex-shrink-0" fill="currentColor" strokeWidth={1.5} />
            )}
          </div>
          <p className="text-xs text-slate-500">{extra.slug}</p>
        </div>
      </div>

      {/* Descripció */}
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
        {extra.description}
      </p>

      {/* Preu */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-bold text-slate-900">
          {formatPrice(extra.basePrice, extra.priceType)}
        </span>
        <span className="text-xs text-slate-400">IVA inclòs</span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-full',
          categoryColor
        )}>
          {CATEGORY_LABELS[extra.category]}
        </span>
        <span className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-full',
          extra.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        )}>
          {extra.active ? 'Actiu' : 'Inactiu'}
        </span>
      </div>

      {/* Accions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(extra); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          <Edit className="h-4 w-4" strokeWidth={1.5} />
          Editar
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleActive(extra); }}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg',
            extra.active
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-green-600 bg-green-50 hover:bg-green-100'
          )}
        >
          {extra.active ? (
            <ToggleRight className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  )
}