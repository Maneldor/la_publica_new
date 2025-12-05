'use client'

import {
  X,
  Package,
  Euro,
  Tag,
  FileText,
  Eye,
  EyeOff,
  Star,
  Edit,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Clock,
  Wrench,
  Palette,
  Megaphone,
  Search,
  Lightbulb,
  GraduationCap,
  Code,
  LifeBuoy,
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
  _count?: {
    budgetItems: number
    invoiceItems: number
  }
}

interface ExtraPreviewPanelProps {
  extra: Extra | null
  onClose: () => void
  onEdit: (extra: Extra) => void
  onToggleActive: (extra: Extra) => void
  onDelete: (extra: Extra) => void
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
  WEB_MAINTENANCE: 'Manteniment Web',
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

const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  FIXED: 'Preu fix',
  MONTHLY: 'Mensual',
  ANNUAL: 'Anual',
  HOURLY: 'Per hores',
  CUSTOM: 'Personalitzat',
}

export function ExtraPreviewPanel({ extra, onClose, onEdit, onToggleActive, onDelete }: ExtraPreviewPanelProps) {
  if (!extra) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center h-[500px] flex flex-col items-center justify-center">
        <Package className="h-12 w-12 text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-slate-500">Selecciona un extra per veure els detalls</p>
      </div>
    )
  }

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
    return `${price.toFixed(2)}€${suffix}`
  }

  const totalUses = (extra._count?.budgetItems || 0) + (extra._count?.invoiceItems || 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 h-fit flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl', categoryColor)}>
              <CategoryIcon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900">{extra.name}</h2>
                {extra.featured && (
                  <Star className="h-4 w-4 text-amber-500" fill="currentColor" strokeWidth={1.5} />
                )}
              </div>
              <p className="text-sm text-slate-500">{extra.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[400px]">
        {/* Descripció */}
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <FileText className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase">Descripció</span>
          </div>
          <p className="text-sm text-slate-700">{extra.description}</p>
        </div>

        {/* Categoria */}
        <div>
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Tag className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase">Categoria</span>
          </div>
          <span className={cn('px-3 py-1 text-sm font-medium rounded-full', categoryColor)}>
            {CATEGORY_LABELS[extra.category]}
          </span>
        </div>

        {/* Preu */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Euro className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase">Preu</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {formatPrice(extra.basePrice, extra.priceType)}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            {PRICE_TYPE_LABELS[extra.priceType]} · IVA inclòs
          </p>
        </div>

        {/* Ús */}
        {totalUses > 0 && (
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Clock className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase">Ús</span>
            </div>
            <p className="text-sm text-slate-700">
              {totalUses} {totalUses === 1 ? 'vegada utilitzat' : 'vegades utilitzat'}
            </p>
          </div>
        )}

        {/* Estat */}
        <div>
          <span className="text-xs font-medium uppercase text-slate-500">Estat</span>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
              extra.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}>
              {extra.active ? (
                <><Eye className="h-3 w-3" strokeWidth={1.5} /> Actiu</>
              ) : (
                <><EyeOff className="h-3 w-3" strokeWidth={1.5} /> Inactiu</>
              )}
            </span>
            {extra.featured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                <Star className="h-3 w-3" strokeWidth={1.5} /> Destacat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Accions */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={() => onEdit(extra)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
        >
          <Edit className="h-4 w-4" strokeWidth={1.5} />
          Editar extra
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleActive(extra)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border',
              extra.active
                ? 'text-red-600 border-red-200 hover:bg-red-50'
                : 'text-green-600 border-green-200 hover:bg-green-50'
            )}
          >
            {extra.active ? (
              <><ToggleRight className="h-4 w-4" strokeWidth={1.5} /> Desactivar</>
            ) : (
              <><ToggleLeft className="h-4 w-4" strokeWidth={1.5} /> Activar</>
            )}
          </button>
          <button
            onClick={() => onDelete(extra)}
            className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}