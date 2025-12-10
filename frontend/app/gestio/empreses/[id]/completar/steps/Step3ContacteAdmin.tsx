// steps/Step3ContacteAdmin.tsx
'use client'

import { Phone, Mail, User, Building2 } from 'lucide-react'
import { EmpresaCompletarData } from '@/lib/gestio-empreses/actions/empresa-completar-actions'

interface Props {
  formData: EmpresaCompletarData
  updateField: (field: keyof EmpresaCompletarData, value: any) => void
  errors: Record<string, string>
}

export function Step3ContacteAdmin({ formData, updateField, errors }: Props) {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-red-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-red-900">Contacte Administratiu</p>
            <p className="text-sm text-red-700 mt-1">
              Dades privades per la gestió interna de l'empresa. No es mostren al públic.
            </p>
          </div>
        </div>
      </div>

      {/* Contacte personal administratiu */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <User className="h-4 w-4" strokeWidth={1.5} />
          Persona de contacte administratiu
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nom persona */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.adminContactPerson || ''}
              onChange={(e) => updateField('adminContactPerson', e.target.value)}
              className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.adminContactPerson ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="Ex: Maria García"
              maxLength={100}
            />
            {errors.adminContactPerson && (
              <p className="mt-1 text-xs text-red-600">{errors.adminContactPerson}</p>
            )}
          </div>

          {/* Telèfon admin */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Telèfon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.adminPhone || ''}
              onChange={(e) => updateField('adminPhone', e.target.value)}
              className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.adminPhone ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="Ex: +34 600 123 456"
              maxLength={20}
            />
            {errors.adminPhone && (
              <p className="mt-1 text-xs text-red-600">{errors.adminPhone}</p>
            )}
          </div>

          {/* Email admin */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.adminEmail || ''}
              onChange={(e) => updateField('adminEmail', e.target.value)}
              className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.adminEmail ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="maria@empresa.cat"
            />
            {errors.adminEmail && (
              <p className="mt-1 text-xs text-red-600">{errors.adminEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contacte general empresa */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4" strokeWidth={1.5} />
          Contacte general de l'empresa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Telèfon empresa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Telèfon principal
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="tel"
                value={formData.companyPhone || ''}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: +34 93 123 45 67"
                maxLength={20}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Telèfon principal per contactar amb l'empresa
            </p>
          </div>

          {/* Email empresa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email principal
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="email"
                value={formData.companyEmail || ''}
                onChange={(e) => updateField('companyEmail', e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="info@empresa.cat"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Email principal per contactar amb l'empresa
            </p>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-600">
          <strong>Nota:</strong> Les dades administratives només són visibles per l'equip de gestió intern.
          Les dades de contacte general poden ser utilitzades per comunicacions oficials.
        </p>
      </div>
    </div>
  )
}