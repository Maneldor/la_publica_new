// steps/Step5InformacioAmpliada.tsx
'use client'

import { useState } from 'react'
import { Briefcase, Users, Calendar, MapPin, Tag, Handshake, Euro, X } from 'lucide-react'
import { EmpresaCompletarData } from '@/lib/gestio-empreses/actions/empresa-completar-actions'
import { getCategoriesAsOptions } from '@/lib/constants/categories'

interface Props {
  formData: EmpresaCompletarData
  updateField: (field: keyof EmpresaCompletarData, value: any) => void
  errors: Record<string, string>
}



const COMPANY_SIZES = [
  '1-5 empleats', '6-20 empleats', '21-50 empleats', '51-100 empleats',
  '101-200 empleats', '201-500 empleats', 'Més de 500 empleats'
]

const EMPLOYEE_COUNTS = [
  '1-5', '6-20', '21-50', '51-100', '101-200', '201-500', '500+'
]

const COLLABORATION_TYPES = [
  'Projectes puntuals', 'Serveis recurrents', 'Consultoria estratègica',
  'Outsourcing complet', 'Assessorament especialitzat'
]

const BUDGET_RANGES = [
  'Menys de 5.000€', '5.000€ - 15.000€', '15.000€ - 50.000€',
  '50.000€ - 100.000€', '100.000€ - 250.000€', 'Més de 250.000€'
]

export function Step5InformacioAmpliada({ formData, updateField, errors }: Props) {
  const [newService, setNewService] = useState('')
  const [newSpecialization, setNewSpecialization] = useState('')

  const addService = () => {
    if (newService.trim()) {
      const services = [...(formData.services || []), newService.trim()]
      updateField('services', services)
      setNewService('')
    }
  }

  const removeService = (index: number) => {
    const services = formData.services?.filter((_, i) => i !== index) || []
    updateField('services', services)
  }

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      const specializations = [...(formData.specializations || []), newSpecialization.trim()]
      updateField('specializations', specializations)
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (index: number) => {
    const specializations = formData.specializations?.filter((_, i) => i !== index) || []
    updateField('specializations', specializations)
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-purple-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-purple-900">Informació Ampliada</p>
            <p className="text-sm text-purple-700 mt-1">
              Detalls sobre l'empresa per millorar la visibilitat al directori i facilitar les col·laboracions.
            </p>
          </div>
        </div>
      </div>

      {/* Informació bàsica empresa */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4" strokeWidth={1.5} />
          Informació de l'empresa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Sector
            </label>
            <select
              value={formData.sector || ''}
              onChange={(e) => updateField('sector', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona un sector</option>
              {getCategoriesAsOptions().map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Any fundació */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Any de fundació
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="number"
                value={formData.yearEstablished || ''}
                onChange={(e) => updateField('yearEstablished', parseInt(e.target.value) || null)}
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 2015"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          {/* Nombre empleats */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre d'empleats
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <select
                value={formData.employeeCount || ''}
                onChange={(e) => updateField('employeeCount', e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Selecciona un rang</option>
                {EMPLOYEE_COUNTS.map(count => (
                  <option key={count} value={count}>{count} empleats</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ubicació */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4" strokeWidth={1.5} />
          Ubicació i àmbit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ubicació principal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Ubicació principal
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Barcelona, Catalunya"
              maxLength={100}
            />
          </div>

          {/* Grandària empresa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Grandària de l'empresa
            </label>
            <select
              value={formData.size || ''}
              onChange={(e) => updateField('size', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona grandària</option>
              {COMPANY_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Serveis */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4" strokeWidth={1.5} />
          Serveis principals
        </h3>

        <div className="space-y-3">
          {/* Afegir servei */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addService()}
              className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Desenvolupament web"
              maxLength={50}
            />
            <button
              type="button"
              onClick={addService}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Afegir
            </button>
          </div>

          {/* Llista serveis */}
          {formData.services && formData.services.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.services.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Especialitzacions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4" strokeWidth={1.5} />
          Especialitzacions
        </h3>

        <div className="space-y-3">
          {/* Afegir especialització */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
              className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: E-commerce"
              maxLength={50}
            />
            <button
              type="button"
              onClick={addSpecialization}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Afegir
            </button>
          </div>

          {/* Llista especialitzacions */}
          {formData.specializations && formData.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tipus de col·laboració */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Handshake className="h-4 w-4" strokeWidth={1.5} />
          Tipus de col·laboració i pressupost
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipus col·laboració */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tipus de col·laboració preferida
            </label>
            <select
              value={formData.collaborationType || ''}
              onChange={(e) => updateField('collaborationType', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona tipus</option>
              {COLLABORATION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Pressupost mitjà */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Rang de pressupost mitjà
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <select
                value={formData.averageBudget || ''}
                onChange={(e) => updateField('averageBudget', e.target.value)}
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Selecciona rang</option>
                {BUDGET_RANGES.map(budget => (
                  <option key={budget} value={budget}>{budget}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}