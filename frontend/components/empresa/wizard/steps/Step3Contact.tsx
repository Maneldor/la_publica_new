'use client';

import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import { EmpresaWizardProps, PROVINCES } from '../types';

export const Step3Contact = ({ formData, errors, updateField }: EmpresaWizardProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dades de Contacte</h2>
        <p className="text-gray-600">
          Com poden contactar amb la teva empresa
        </p>
      </div>

      {/* Email i Telefon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email corporatiu *
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="contacte@empresa.cat"
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400 ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Telefon
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="93 123 45 67"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Lloc web
        </label>
        <input
          type="url"
          value={formData.website || ''}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="https://www.empresa.cat"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Adreca
        </h3>
      </div>

      {/* Adreca */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adreca
        </label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Carrer Major, 123"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Ciutat, CP, Provincia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciutat
          </label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="Barcelona"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Codi Postal
          </label>
          <input
            type="text"
            value={formData.postalCode || ''}
            onChange={(e) => updateField('postalCode', e.target.value)}
            placeholder="08001"
            maxLength={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provincia
          </label>
          <select
            value={formData.province || ''}
            onChange={(e) => updateField('province', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {PROVINCES.map((prov) => (
              <option key={prov.value} value={prov.value} className="text-gray-900">
                {prov.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          L'adreca es mostrara al teu perfil public i ajudara als usuaris a trobar-te.
        </p>
      </div>
    </div>
  );
};
