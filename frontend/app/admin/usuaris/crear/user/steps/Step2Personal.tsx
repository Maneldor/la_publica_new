'use client'

import { useState, useEffect } from 'react'
import { MapPin, Building2, Briefcase, Lock } from 'lucide-react'

interface PersonalData {
  bio?: string
  headline?: string
  city?: string
  province?: string
  organization?: string
  department?: string
  position?: string
  professionalGroup?: string
  phone?: string
}

interface Step2PersonalProps {
  data: PersonalData
  onChange: (data: PersonalData) => void
}

function PrivateFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 font-normal">
        <Lock className="w-3 h-3" />
        Privat
      </span>
    </label>
  )
}

export default function Step2Personal({ data, onChange }: Step2PersonalProps) {
  const [formData, setFormData] = useState<PersonalData>({
    bio: data?.bio || '',
    headline: data?.headline || '',
    city: data?.city || '',
    province: data?.province || '',
    organization: data?.organization || '',
    department: data?.department || '',
    position: data?.position || '',
    professionalGroup: data?.professionalGroup || '',
    phone: data?.phone || ''
  })

  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])

  const handleChange = (field: keyof PersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Informació Personal i Professional</h3>
        <p className="text-sm text-gray-500">Dades addicionals de l&apos;usuari (opcionals)</p>
      </div>

      <div className="space-y-6">
        {/* Títol Professional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Títol Professional
          </label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            placeholder="Ex: Cap de Secció - Transformació Digital"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Descripció breu de l'usuari..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.bio?.length || 0)}/500 caràcters
          </p>
        </div>

        {/* Ubicació */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <MapPin className="w-4 h-4 inline mr-1" />
              Ciutat
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Barcelona"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Província
            </label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              placeholder="Barcelona"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Informació laboral - PRIVADA */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Informació Laboral
            <span className="text-xs text-amber-600 font-normal">(només visible per l&apos;usuari)</span>
          </h4>

          <div className="space-y-4">
            <div>
              <PrivateFieldLabel>
                <Building2 className="w-4 h-4 inline mr-1" />
                Organització
              </PrivateFieldLabel>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                placeholder="Ajuntament de Barcelona"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <PrivateFieldLabel>Departament</PrivateFieldLabel>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Gerència de Recursos"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <PrivateFieldLabel>Càrrec</PrivateFieldLabel>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Cap de Secció"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <PrivateFieldLabel>Grup Professional</PrivateFieldLabel>
                <select
                  value={formData.professionalGroup}
                  onChange={(e) => handleChange('professionalGroup', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                >
                  <option value="">Selecciona...</option>
                  <option value="A1">A1 - Titulació Superior</option>
                  <option value="A2">A2 - Titulació Grau Mitjà</option>
                  <option value="B">B - Tècnic Superior</option>
                  <option value="C1">C1 - Administratiu</option>
                  <option value="C2">C2 - Auxiliar</option>
                  <option value="E">E - Subaltern</option>
                </select>
              </div>
              <div>
                <PrivateFieldLabel>Telèfon</PrivateFieldLabel>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
