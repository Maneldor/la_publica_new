'use client'

import { useState } from 'react'
import {
  Plus,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  X,
  ChevronRight,
  Mail,
  Loader2,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonConfig {
  variant: string
  background: string
  color: string
  border: string
  hoverBackground: string
}

interface ButtonsPreviewProps {
  config?: Record<string, ButtonConfig>
  selectedVariant?: string
  onVariantSelect?: (variant: string) => void
}

export function ButtonsPreview({
  config,
  selectedVariant,
  onVariantSelect
}: ButtonsPreviewProps) {
  const [loadingButton, setLoadingButton] = useState<string | null>(null)

  const simulateLoading = (id: string) => {
    setLoadingButton(id)
    setTimeout(() => setLoadingButton(null), 2000)
  }

  const defaultVariants = [
    { name: 'primary', classes: 'bg-blue-600 text-white hover:bg-blue-700', label: 'Primary' },
    { name: 'secondary', classes: 'bg-slate-100 text-slate-700 hover:bg-slate-200', label: 'Secondary' },
    { name: 'outline', classes: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent', label: 'Outline' },
    { name: 'ghost', classes: 'text-slate-600 hover:bg-slate-100 bg-transparent', label: 'Ghost' },
    { name: 'danger', classes: 'bg-red-600 text-white hover:bg-red-700', label: 'Danger' },
    { name: 'success', classes: 'bg-green-600 text-white hover:bg-green-700', label: 'Success' },
  ]

  return (
    <div className="space-y-8">
      {/* Variants */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Variants
        </h4>
        <div className="flex flex-wrap gap-3">
          {defaultVariants.map((variant) => (
            <button
              key={variant.name}
              onClick={() => onVariantSelect?.(variant.name)}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                variant.classes,
                selectedVariant === variant.name && 'ring-2 ring-offset-2 ring-blue-500'
              )}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Mides
        </h4>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
            Extra Small
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Small
          </button>
          <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Default
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors">
            Large
          </button>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors">
            Extra Large
          </button>
        </div>
      </div>

      {/* With Icons */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Amb Icones
        </h4>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Afegir
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
              <Download className="h-4 w-4" />
              Descarregar
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Upload className="h-4 w-4" />
              Pujar
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              Veure mes
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Icon Only */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Nomes Icona
        </h4>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
          <button className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Mail className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
          <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
            <Edit className="h-5 w-5" />
          </button>
          <button className="p-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
            <Mail className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* States */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Estats
        </h4>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">Normal / Hover / Active</p>
            <div className="flex gap-3">
              <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                Normal
              </button>
              <button className="px-4 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-medium">
                Hover
              </button>
              <button className="px-4 py-2.5 bg-blue-800 text-white rounded-lg text-sm font-medium">
                Active
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Disabled</p>
            <div className="flex gap-3">
              <button
                disabled
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
              >
                Primary Disabled
              </button>
              <button
                disabled
                className="px-4 py-2.5 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                Secondary Disabled
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Loading</p>
            <div className="flex gap-3">
              <button
                onClick={() => simulateLoading('btn1')}
                disabled={loadingButton === 'btn1'}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {loadingButton === 'btn1' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardant...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={() => simulateLoading('btn2')}
                disabled={loadingButton === 'btn2'}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-70"
              >
                {loadingButton === 'btn2' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregant...
                  </>
                ) : (
                  'Carregar mes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Button Groups */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
          Grups de Botons
        </h4>
        <div className="space-y-4">
          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
            <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium">
              Opcio 1
            </button>
            <button className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium border-l border-slate-200 hover:bg-slate-50">
              Opcio 2
            </button>
            <button className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium border-l border-slate-200 hover:bg-slate-50">
              Opcio 3
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
              Cancel·lar
            </button>
            <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
