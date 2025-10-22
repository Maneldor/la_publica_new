'use client';

import { MapPin, Package, Truck } from 'lucide-react';
import { AnunciFormData } from '../../hooks/useCreateAnunci';

interface Step3Props {
  formData: AnunciFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AnunciFormData, value: any) => void;
}

export const Step3Location = ({ formData, errors, updateField }: Step3Props) => {
  const provinces = [
    { value: '', label: 'Selecciona una província' },
    { value: 'barcelona', label: 'Barcelona' },
    { value: 'girona', label: 'Girona' },
    { value: 'lleida', label: 'Lleida' },
    { value: 'tarragona', label: 'Tarragona' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ubicació i Enviament
        </h2>
        <p className="text-gray-600">
          On està ubicat el producte i com es pot recollir
        </p>
      </div>

      {/* Provincia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Província *
        </label>
        <select
          value={formData.province}
          onChange={(e) => updateField('province', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.province ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        >
          {provinces.map((prov) => (
            <option key={prov.value} value={prov.value}>
              {prov.label}
            </option>
          ))}
        </select>
        {errors.province && (
          <p className="text-sm text-red-600 mt-1">{errors.province}</p>
        )}
      </div>

      {/* Ciudad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Població *
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
          placeholder="Ex: Barcelona, Girona, Lleida..."
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        />
        {errors.city && (
          <p className="text-sm text-red-600 mt-1">{errors.city}</p>
        )}
      </div>

      {/* Código Postal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Codi Postal (opcional)
        </label>
        <input
          type="text"
          value={formData.postalCode}
          onChange={(e) => updateField('postalCode', e.target.value)}
          placeholder="Ex: 08001"
          maxLength={5}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-sm text-gray-500 mt-1">
          No es mostrarà públicament, només per filtrar cerca
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Opciones de Entrega */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <Truck className="w-4 h-4 inline mr-2" />
          Opcions d'entrega *
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona com els compradors poden obtenir el producte
        </p>

        <div className="space-y-3">
          {/* Recogida en persona */}
          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.pickupAvailable ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
          `}>
            <input
              type="checkbox"
              checked={formData.pickupAvailable}
              onChange={(e) => updateField('pickupAvailable', e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Recollida en persona
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                El comprador pot venir a recollir el producte
              </p>
            </div>
          </label>

          {/* Envío disponible */}
          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.shippingAvailable ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
          `}>
            <input
              type="checkbox"
              checked={formData.shippingAvailable}
              onChange={(e) => updateField('shippingAvailable', e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Enviament disponible
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Pots enviar el producte (el comprador paga l'enviament)
              </p>
            </div>
          </label>

          {/* Envío incluido */}
          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.shippingIncluded ? 'border-green-500 bg-green-50' : 'border-gray-200'}
          `}>
            <input
              type="checkbox"
              checked={formData.shippingIncluded}
              onChange={(e) => updateField('shippingIncluded', e.target.checked)}
              className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">
                  Enviament inclòs
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                L'enviament està inclòs en el preu
              </p>
            </div>
          </label>
        </div>

        {errors.delivery && (
          <p className="text-sm text-red-600 mt-2">{errors.delivery}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800 font-medium mb-2">
          📍 Privacitat i ubicació:
        </p>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• La ubicació exacta només es comparteix després del contacte</li>
          <li>• El codi postal no es mostra públicament</li>
          <li>• Només es mostra la província i població</li>
          <li>• Mai comparteixis la teva adreça completa en la descripció</li>
        </ul>
      </div>
    </div>
  );
};