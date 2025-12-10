// steps/Step4ContactePublic.tsx
'use client'

import { Globe, Phone, Mail, MessageCircle, Clock, MapPin, User } from 'lucide-react'
import { EmpresaCompletarData } from '@/lib/gestio-empreses/actions/empresa-completar-actions'

interface Props {
  formData: EmpresaCompletarData
  updateField: (field: keyof EmpresaCompletarData, value: any) => void
  errors: Record<string, string>
}

export function Step4ContactePublic({ formData, updateField, errors }: Props) {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-green-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-green-900">Contacte Públic</p>
            <p className="text-sm text-green-700 mt-1">
              Aquesta informació serà visible al directori públic per facilitar el contacte amb l'empresa.
            </p>
          </div>
        </div>
      </div>

      {/* Contacte directe */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4" strokeWidth={1.5} />
          Contacte directe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Telèfon públic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Telèfon de contacte
            </label>
            <input
              type="tel"
              value={formData.publicPhone || ''}
              onChange={(e) => updateField('publicPhone', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: +34 93 123 45 67"
              maxLength={20}
            />
            <p className="mt-1 text-xs text-slate-400">
              Telèfon visible al directori públic
            </p>
          </div>

          {/* Email públic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email de contacte
            </label>
            <input
              type="email"
              value={formData.publicEmail || ''}
              onChange={(e) => updateField('publicEmail', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="contacte@empresa.cat"
            />
            <p className="mt-1 text-xs text-slate-400">
              Email visible al directori públic
            </p>
          </div>

          {/* Persona de contacte */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Persona de contacte
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={formData.contactPerson || ''}
                onChange={(e) => updateField('contactPerson', e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Anna Martínez"
                maxLength={100}
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              WhatsApp
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="tel"
                value={formData.whatsappNumber || ''}
                onChange={(e) => updateField('whatsappNumber', e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: +34 600 123 456"
                maxLength={20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Web i ubicació */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4" strokeWidth={1.5} />
          Web i ubicació
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Lloc web
            </label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => updateField('website', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.empresa.cat"
            />
          </div>

          {/* Adreça */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Adreça
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <textarea
                value={formData.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                rows={2}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Carrer Example, 123&#10;08001 Barcelona"
                maxLength={200}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Horari */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" strokeWidth={1.5} />
          Horari d'atenció
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Horari de contacte
          </label>
          <textarea
            value={formData.workingHours || ''}
            onChange={(e) => updateField('workingHours', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Dilluns a divendres: 9:00 - 18:00&#10;Dissabtes: 9:00 - 14:00&#10;Diumenges: Tancat"
            maxLength={300}
          />
          <p className="mt-1 text-xs text-slate-400">
            {formData.workingHours?.length || 0}/300 caràcters
          </p>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-600">
          <strong>Nota:</strong> Tota aquesta informació serà visible al directori públic.
          Assegura't que les dades són correctes i actualitzades.
        </p>
      </div>
    </div>
  )
}