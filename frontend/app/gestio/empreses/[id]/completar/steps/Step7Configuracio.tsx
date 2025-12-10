// steps/Step7Configuracio.tsx
'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Eye, Send, Settings, Shield, Globe } from 'lucide-react'
import { EmpresaCompletarData } from '@/lib/gestio-empreses/actions/empresa-completar-actions'

interface Props {
  formData: EmpresaCompletarData
  updateField: (field: keyof EmpresaCompletarData, value: any) => void
  errors: Record<string, string>
}

export function Step7Configuracio({ formData, updateField, errors }: Props) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Calcular completesa dels steps
  const getStepCompleteness = () => {
    const checks = {
      step1: !!(formData.nom && formData.cif && formData.email),
      step2: !!(formData.slogan && formData.description && formData.logo && formData.coverImage),
      step3: !!(formData.adminContactPerson && formData.adminPhone && formData.adminEmail),
      step4: !!(formData.publicEmail || formData.publicPhone),
      step5: !!(formData.sector && formData.services?.length),
      step6: !!(formData.brandColors || formData.gallery?.length || formData.socialMediaLinkedIn),
    }

    const completed = Object.values(checks).filter(Boolean).length
    const total = Object.keys(checks).length

    return { completed, total, percentage: Math.round((completed / total) * 100), checks }
  }

  const { completed, total, percentage, checks } = getStepCompleteness()

  const stepLabels = [
    'Dades Bàsiques',
    'Dades Obligatòries',
    'Contacte Administratiu',
    'Contacte Públic',
    'Informació Ampliada',
    'Branding i Xarxes'
  ]

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-blue-900">Configuració Final</p>
            <p className="text-sm text-blue-700 mt-1">
              Revisa la informació i configura les opcions finals abans d'enviar per verificació.
            </p>
          </div>
        </div>
      </div>

      {/* Estat de completesa */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
          Estat de completesa
        </h3>

        {/* Barra de progrés */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Progrés general</span>
            <span className="text-sm font-medium text-slate-900">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {completed} de {total} seccions completades
          </p>
        </div>

        {/* Detall per steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(checks).map(([step, completed], index) => (
            <div key={step} className="flex items-center gap-2">
              {completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" strokeWidth={1.5} />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
              )}
              <span className={`text-sm ${completed ? 'text-green-800' : 'text-amber-700'}`}>
                {stepLabels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vista prèvia */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <Eye className="h-4 w-4" strokeWidth={1.5} />
            Vista prèvia del perfil
          </h3>
          <button
            type="button"
            onClick={togglePreview}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {isPreviewMode ? 'Tancar vista prèvia' : 'Veure vista prèvia'}
          </button>
        </div>

        {isPreviewMode && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            {/* Preview del perfil com apareixerà al directori */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                {formData.logo && (
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 p-2">
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{formData.nom || 'Nom de l\'empresa'}</h4>
                  <p className="text-sm text-slate-600">{formData.slogan || 'Eslògan de l\'empresa'}</p>
                  <p className="text-xs text-slate-500 mt-1">{formData.sector} • {formData.location}</p>
                </div>
              </div>

              {/* Descripció */}
              {formData.description && (
                <div>
                  <p className="text-sm text-slate-700 line-clamp-3">{formData.description}</p>
                </div>
              )}

              {/* Serveis */}
              {formData.services && formData.services.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-slate-900 mb-2">Serveis</h5>
                  <div className="flex flex-wrap gap-1">
                    {formData.services.slice(0, 3).map((service, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {service}
                      </span>
                    ))}
                    {formData.services.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                        +{formData.services.length - 3} més
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Configuració de visibilitat */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4" strokeWidth={1.5} />
          Configuració de visibilitat
        </h3>

        <div className="space-y-3">
          {/* Publicar al directori */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Publicar al directori públic</p>
              <p className="text-xs text-slate-600">
                L'empresa apareixerà al directori públic de La Pública
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPubliclyVisible ?? true}
                onChange={(e) => updateField('isPubliclyVisible', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Permetre contacte directe */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Permetre contacte directe</p>
              <p className="text-xs text-slate-600">
                Els usuaris podran contactar directament amb l'empresa
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowDirectContact ?? true}
                onChange={(e) => updateField('allowDirectContact', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Terminis i condicions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" strokeWidth={1.5} />
          Acceptació de condicions
        </h3>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptsTerms ?? false}
              onChange={(e) => updateField('acceptsTerms', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="text-sm text-slate-900">
                Accepto els terminis i condicions de La Pública
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Incloent les condicions d'ús del directori i la política de privacitat
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptsDataProcessing ?? false}
              onChange={(e) => updateField('acceptsDataProcessing', e.target.value)}
              className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <div>
              <p className="text-sm text-slate-900">
                Accepto el tractament de dades personals
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Per la gestió del perfil d'empresa i comunicacions relacionades
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Resum final */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Send className="h-5 w-5 text-slate-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-slate-900">Llest per enviar</p>
            <p className="text-sm text-slate-600 mt-1">
              Un cop completat aquest pas, el perfil s'enviarà a l'equip CRM per verificació final.
              Rebràs una notificació quan sigui aprovat i publicat.
            </p>
            {percentage < 80 && (
              <p className="text-xs text-amber-600 mt-2">
                <strong>Recomanació:</strong> Completa més seccions per millorar la qualitat del perfil.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}