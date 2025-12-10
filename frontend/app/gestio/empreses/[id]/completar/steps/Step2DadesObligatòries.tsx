// steps/Step2DadesObligatòries.tsx
'use client'

import { useState } from 'react'
import { Star, Upload, X, Image as ImageIcon } from 'lucide-react'
import { EmpresaCompletarData } from '@/lib/gestio-empreses/actions/empresa-completar-actions'

interface Props {
  formData: EmpresaCompletarData
  updateField: (field: keyof EmpresaCompletarData, value: any) => void
  errors: Record<string, string>
}

export function Step2DadesObligatòries({ formData, updateField, errors }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logo)
  const [coverPreview, setCoverPreview] = useState<string | null>(formData.coverImage)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
      // TODO: Upload i guardar URL real
      updateField('logo', url)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCoverPreview(url)
      // TODO: Upload i guardar URL real
      updateField('coverImage', url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Star className="h-5 w-5 text-amber-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-amber-900">Dades Obligatòries per Publicar</p>
            <p className="text-sm text-amber-700 mt-1">
              Aquests camps són necessaris perquè l'empresa aparegui al directori públic.
            </p>
          </div>
        </div>
      </div>

      {/* Eslògan */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Eslògan de l'empresa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.slogan || ''}
          onChange={(e) => updateField('slogan', e.target.value)}
          className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.slogan ? 'border-red-500' : 'border-slate-200'
          }`}
          placeholder="Ex: Transformació digital per al sector públic"
          maxLength={150}
        />
        {errors.slogan && (
          <p className="mt-1 text-xs text-red-600">{errors.slogan}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">{formData.slogan?.length || 0}/150 caràcters</p>
      </div>

      {/* Descripció */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripció de l'empresa <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={5}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
            errors.description ? 'border-red-500' : 'border-slate-200'
          }`}
          placeholder="Descriu els serveis i activitats de l'empresa..."
          maxLength={1000}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          {formData.description?.length || 0}/1000 caràcters (mínim 50)
        </p>
      </div>

      {/* Logo i Portada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Logo de l'empresa <span className="text-red-500">*</span>
          </label>
          <div className="flex items-start gap-4">
            <div className={`w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${
              errors.logo ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
            }`}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4" strokeWidth={1.5} />
                {logoPreview ? 'Canviar logo' : 'Pujar logo'}
              </label>
              <p className="text-xs text-slate-500 mt-2">
                Recomanat: 150x150px, JPG o PNG
              </p>
              {errors.logo && (
                <p className="text-xs text-red-600 mt-1">{errors.logo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cover */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Imatge de portada <span className="text-red-500">*</span>
          </label>
          <div className="flex items-start gap-4">
            <div className={`w-36 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${
              errors.coverImage ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
            }`}>
              {coverPreview ? (
                <img src={coverPreview} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4" strokeWidth={1.5} />
                {coverPreview ? 'Canviar portada' : 'Pujar portada'}
              </label>
              <p className="text-xs text-slate-500 mt-2">
                Recomanat: 1200x400px, JPG o PNG
              </p>
              {errors.coverImage && (
                <p className="text-xs text-red-600 mt-1">{errors.coverImage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}