'use client';

import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import { AdminEmpresaFormData } from '../../hooks/useAdminCreateEmpresa';

interface Step3Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AdminEmpresaFormData, value: any) => void;
}

export const Step3Contact = ({ formData, errors, updateField }: Step3Props) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Contacte i Ubicació
        </h2>
        <p className="text-gray-600">
          Informació de contacte per facilitar que les administracions públiques es posin en contacte amb vosaltres
        </p>
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email de Contacte *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="contacte@empresa.com"
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all
            `}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Telèfon de Contacte *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="93 123 45 67"
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all
            `}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Lloc Web
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="https://www.empresa.cat"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-sm text-gray-500 mt-1">
          Si teniu lloc web, afegiu-lo per donar més credibilitat a l'empresa
        </p>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Adreça Completa *
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Carrer Principal 123, 3r 2a&#10;08001 Barcelona&#10;Catalunya, Espanya"
          rows={3}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all resize-none
          `}
        />
        {errors.address && (
          <p className="text-sm text-red-600 mt-1">{errors.address}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Inclou carrer, número, pis, codi postal i ciutat
        </p>
      </div>

      {/* Map Coordinates (Optional) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Ubicació en Mapa (Opcional)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Afegiu les coordenades per mostrar l'ubicació exacta en un mapa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitud
            </label>
            <input
              type="number"
              step="any"
              value={formData.coordinates?.lat || ''}
              onChange={(e) => updateField('coordinates', {
                ...formData.coordinates,
                lat: e.target.value ? parseFloat(e.target.value) : undefined,
                lng: formData.coordinates?.lng
              })}
              placeholder="41.3851"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitud
            </label>
            <input
              type="number"
              step="any"
              value={formData.coordinates?.lng || ''}
              onChange={(e) => updateField('coordinates', {
                lat: formData.coordinates?.lat,
                lng: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              placeholder="2.1734"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Podeu obtenir les coordenades buscant la vostra adreça a Google Maps i copiant els números que apareixen a la URL
          </p>
        </div>
      </div>

      {/* Contact Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 font-medium mb-2">
          📞 Consells per al contacte:
        </p>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Utilitzeu un email professional amb el domini de l'empresa</li>
          <li>• Assegureu-vos que el telèfon estigui sempre atès en horari laboral</li>
          <li>• Si teniu lloc web, que estigui actualitzat i sigui professional</li>
          <li>• L'adreça ha de ser precisa per facilitar visites presencials</li>
        </ul>
      </div>
    </div>
  );
};