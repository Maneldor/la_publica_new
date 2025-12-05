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

interface ExtraTableProps {
  extras: Extra[]
  onEdit: (extra: Extra) => void
  onToggleActive: (extra: Extra) => void
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
  FIXED: 'Fix',
  MONTHLY: 'Mensual',
  ANNUAL: 'Anual',
  HOURLY: 'Per hora',
  CUSTOM: 'Personalitzat',
}

export function ExtraTable({ extras, onEdit, onToggleActive }: ExtraTableProps) {
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Servei
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Preu
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tipus
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estat
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Accions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {extras.map((extra) => {
              const CategoryIcon = CATEGORY_ICONS[extra.category]
              const categoryColor = CATEGORY_COLORS[extra.category]

              return (
                <tr
                  key={extra.id}
                  className={cn(
                    'hover:bg-slate-50 transition-colors',
                    !extra.active && 'opacity-60'
                  )}
                >
                  {/* Servei */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', categoryColor)}>
                        <CategoryIcon className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{extra.name}</span>
                          {extra.featured && (
                            <Star className="h-3 w-3 text-amber-500" fill="currentColor" strokeWidth={1.5} />
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{extra.slug}</span>
                      </div>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', categoryColor)}>
                      {CATEGORY_LABELS[extra.category]}
                    </span>
                  </td>

                  {/* Preu */}
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">
                      {formatPrice(extra.basePrice, extra.priceType)}
                    </span>
                  </td>

                  {/* Tipus */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">
                      {PRICE_TYPE_LABELS[extra.priceType]}
                    </span>
                  </td>

                  {/* Estat */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                        extra.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {extra.active ? (
                          <><Eye className="h-3 w-3" strokeWidth={1.5} /> Actiu</>
                        ) : (
                          <><EyeOff className="h-3 w-3" strokeWidth={1.5} /> Inactiu</>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Accions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(extra)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => onToggleActive(extra)}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          extra.active
                            ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                        )}
                        title={extra.active ? 'Desactivar' : 'Activar'}
                      >
                        {extra.active ? (
                          <ToggleRight className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {extras.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-8 w-8 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-500">No hi ha extras per mostrar</p>
        </div>
      )}
    </div>
  )
}