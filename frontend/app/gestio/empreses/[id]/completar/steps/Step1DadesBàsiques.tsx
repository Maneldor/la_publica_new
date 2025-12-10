// steps/Step1DadesBàsiques.tsx
'use client'

import { useState, useEffect } from 'react'
import { Building2, FileText, Mail, CreditCard } from 'lucide-react'
import { EmpresaCompletarData } from '@/lib/gestio-empreses/actions/empresa-completar-actions'

interface Props {
  formData: EmpresaCompletarData
  updateField: (field: keyof EmpresaCompletarData, value: any) => void
  errors: Record<string, string>
}

export function Step1DadesBàsiques({ formData, updateField, errors }: Props) {
  const [plans, setPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setPlans(result.data)
          }
        }
      } catch (error) {
        console.error('Error carregant plans:', error)
      } finally {
        setLoadingPlans(false)
      }
    }
    fetchPlans()
  }, [])
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-blue-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-blue-900">Dades Bàsiques de l'Empresa</p>
            <p className="text-sm text-blue-700 mt-1">
              Informació fonamental per identificar l'empresa al sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nom de l'empresa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-slate-200'
            }`}
            placeholder="Ex: TechSolutions BCN"
            maxLength={100}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">{formData.name?.length || 0}/100 caràcters</p>
        </div>

        {/* CIF */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            CIF <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cif || ''}
            onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
            className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cif ? 'border-red-500' : 'border-slate-200'
            }`}
            placeholder="Ex: B12345678"
            maxLength={9}
          />
          {errors.cif && (
            <p className="mt-1 text-xs text-red-600">{errors.cif}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Email corporatiu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full h-10 pl-10 pr-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-slate-200'
            }`}
            placeholder="contacte@empresa.cat"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Pla */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Pla contractat
        </label>

        {/* Mostrar pla actual si existeix */}
        {formData.currentPlan && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Pla actual: {formData.currentPlan.nombreCorto || formData.currentPlan.tier}
            </p>
          </div>
        )}

        {loadingPlans ? (
          <p className="text-sm text-slate-500">Carregant plans...</p>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => updateField('currentPlanId', plan.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.currentPlanId === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.currentPlanId === plan.id
                      ? 'border-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {formData.currentPlanId === plan.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {plan.name || plan.nameEs || plan.tier}
                    </p>
                    {plan.description && (
                      <p className="text-xs text-slate-500">{plan.description}</p>
                    )}
                    {plan.basePrice !== null && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {plan.basePrice}€/mes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hi ha plans disponibles</p>
        )}
      </div>
    </div>
  )
}