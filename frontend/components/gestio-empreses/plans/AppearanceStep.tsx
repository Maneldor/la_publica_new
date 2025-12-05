'use client'

import { Palette, Eye, EyeOff, Gift, Calendar, ToggleLeft, ToggleRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppearanceStepProps {
  formData: {
    color: string
    isActive: boolean
    isVisible: boolean
    destacado: boolean
    hasFreeTrial: boolean
    trialDurationDays: number
  }
  onChange: (data: any) => void
  errors: Record<string, string>
}

const colorOptions = [
  { value: '#f59e0b', label: 'Àmbar', bg: 'bg-amber-500' },
  { value: '#10b981', label: 'Verd', bg: 'bg-emerald-500' },
  { value: '#3b82f6', label: 'Blau', bg: 'bg-blue-500' },
  { value: '#8b5cf6', label: 'Violeta', bg: 'bg-violet-500' },
  { value: '#ef4444', label: 'Vermell', bg: 'bg-red-500' },
  { value: '#6366f1', label: 'Índigo', bg: 'bg-indigo-500' },
  { value: '#ec4899', label: 'Rosa', bg: 'bg-pink-500' },
  { value: '#14b8a6', label: 'Teal', bg: 'bg-teal-500' },
]

export function AppearanceStep({ formData, onChange, errors }: AppearanceStepProps) {
  const updateField = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const selectedColor = colorOptions.find(c => c.value === formData.color) || colorOptions[0]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Palette className="h-8 w-8 text-purple-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Aparença i Trial
        </h2>
        <p className="text-slate-600">
          Personalitza l'aparença del pla i configura les opcions de prova gratuïta
        </p>
      </div>

      <div className="space-y-6">
        {/* Secció de color */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Palette className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
            Color del Pla
          </h3>

          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => updateField('color', color.value)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                  formData.color === color.value
                    ? "border-slate-400 ring-2 ring-offset-2 ring-slate-300"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg mx-auto mb-2", color.bg)} />
                <p className="text-sm font-medium text-slate-700">{color.label}</p>
              </button>
            ))}
          </div>

          {errors.color && (
            <p className="mt-2 text-sm text-red-600">{errors.color}</p>
          )}
        </div>

        {/* Secció de visibilitat i estat */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Eye className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
            Visibilitat i Estat
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Actiu */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Pla actiu</label>
                <button
                  onClick={() => updateField('isActive', !formData.isActive)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    formData.isActive
                      ? "text-green-700 bg-green-50 hover:bg-green-100"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  )}
                >
                  {formData.isActive ? (
                    <ToggleRight className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <ToggleLeft className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {formData.isActive ? 'Actiu' : 'Inactiu'}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Els plans inactius no es poden contractar
              </p>
            </div>

            {/* Visible */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Visible públicament</label>
                <button
                  onClick={() => updateField('isVisible', !formData.isVisible)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    formData.isVisible
                      ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  )}
                >
                  {formData.isVisible ? (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {formData.isVisible ? 'Visible' : 'Ocult'}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Els plans ocults només es veuen a l'administració
              </p>
            </div>

            {/* Destacat */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Pla destacat</label>
                <button
                  onClick={() => updateField('destacado', !formData.destacado)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    formData.destacado
                      ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  )}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      formData.destacado ? "fill-current" : ""
                    )}
                    strokeWidth={1.5}
                  />
                  {formData.destacado ? 'Destacat' : 'Normal'}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Els plans destacats apareixen amb més prominència
              </p>
            </div>
          </div>
        </div>

        {/* Secció de trial gratuït */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
            <Gift className="h-5 w-5 text-green-600" strokeWidth={1.5} />
            Prova Gratuïta
          </h3>

          <div className="space-y-4">
            {/* Activar trial */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Oferir prova gratuïta</label>
                <p className="text-xs text-slate-500">Permet als usuaris provar el pla gratuïtament</p>
              </div>
              <button
                onClick={() => updateField('hasFreeTrial', !formData.hasFreeTrial)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  formData.hasFreeTrial
                    ? "text-green-700 bg-green-50 hover:bg-green-100"
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                )}
              >
                <Gift className="h-4 w-4" strokeWidth={1.5} />
                {formData.hasFreeTrial ? 'Activat' : 'Desactivat'}
              </button>
            </div>

            {/* Durada del trial */}
            {formData.hasFreeTrial && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="h-4 w-4" strokeWidth={1.5} />
                  Durada de la prova (dies)
                </label>
                <input
                  type="number"
                  value={formData.trialDurationDays}
                  onChange={(e) => updateField('trialDurationDays', Number(e.target.value))}
                  placeholder="30"
                  min="1"
                  max="365"
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
                    errors.trialDurationDays ? "border-red-300" : "border-slate-200"
                  )}
                />
                {errors.trialDurationDays && (
                  <p className="mt-1 text-sm text-red-600">{errors.trialDurationDays}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Recomanat: 7, 14 o 30 dies
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preview del pla */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Vista Prèvia</h3>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.color + '20' }}
              >
                <Palette className="h-4 w-4" style={{ color: formData.color }} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Nom del Pla</h4>
                <p className="text-sm text-slate-500">slug-del-pla</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                formData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {formData.isActive ? 'Actiu' : 'Inactiu'}
              </span>
              {formData.isVisible && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  Visible
                </span>
              )}
              {formData.hasFreeTrial && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Trial {formData.trialDurationDays}d
                </span>
              )}
              {formData.destacado && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                  Destacat
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}