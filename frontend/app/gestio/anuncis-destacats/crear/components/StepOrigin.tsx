'use client'

import { FeaturedAdSource, SOURCE_CONFIG, WizardFormData } from '@/lib/types/featuredAds'
import { Building2, Users, Home } from 'lucide-react'

interface StepOriginProps {
  formData: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
}

const SOURCE_ICONS = {
  LA_PUBLICA: Home,
  PARTNER: Users,
  COMPANY: Building2
}

export function StepOrigin({ formData, onChange }: StepOriginProps) {
  const handleSelect = (source: FeaturedAdSource) => {
    onChange({
      source,
      // Reset source-specific fields when changing
      companyId: '',
      publisherName: '',
      publisherLogo: '',
      partnerContact: '',
      partnerEmail: '',
      internalNotes: '',
      generateInvoice: source === 'COMPANY'
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Selecciona l'origen de l'anunci</h2>
        <p className="text-gray-500 mt-2">
          Això determinarà les opcions disponibles i el procés de facturació
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(SOURCE_CONFIG) as [FeaturedAdSource, typeof SOURCE_CONFIG.LA_PUBLICA][]).map(
          ([source, config]) => {
            const Icon = SOURCE_ICONS[source]
            const isSelected = formData.source === source
            const colorClasses = {
              LA_PUBLICA: {
                selected: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
                icon: 'bg-blue-100 text-blue-600',
                badge: 'bg-blue-100 text-blue-700'
              },
              PARTNER: {
                selected: 'border-green-500 bg-green-50 ring-2 ring-green-200',
                icon: 'bg-green-100 text-green-600',
                badge: 'bg-green-100 text-green-700'
              },
              COMPANY: {
                selected: 'border-purple-500 bg-purple-50 ring-2 ring-purple-200',
                icon: 'bg-purple-100 text-purple-600',
                badge: 'bg-purple-100 text-purple-700'
              }
            }[source]

            return (
              <button
                key={source}
                type="button"
                onClick={() => handleSelect(source)}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? colorClasses.selected
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? colorClasses.icon : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{config.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900">{config.label}</h3>
                </div>

                <p className="text-sm text-gray-600">{config.description}</p>

                {source === 'COMPANY' && (
                  <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Genera factura
                  </div>
                )}

                {source === 'LA_PUBLICA' && (
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    Sense cost
                  </div>
                )}
              </button>
            )
          }
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-medium text-gray-900 mb-2">
          {formData.source === 'LA_PUBLICA' && "Anunci intern de La Pública"}
          {formData.source === 'PARTNER' && "Anunci de Partner"}
          {formData.source === 'COMPANY' && "Anunci d'Empresa"}
        </h4>
        <p className="text-sm text-gray-600">
          {formData.source === 'LA_PUBLICA' &&
            "Promociona contingut propi de la plataforma. No requereix facturació ni dades externes."}
          {formData.source === 'PARTNER' &&
            "Anuncis de partners externs. Només requereix nom i logo del partner per identificar l'origen."}
          {formData.source === 'COMPANY' &&
            "Anuncis per empreses registrades. Permet seleccionar l'empresa i generar factura automàticament amb les seves dades fiscals."}
        </p>
      </div>
    </div>
  )
}
