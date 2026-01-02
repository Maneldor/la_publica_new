'use client';

import { Building2, FileText, Calendar, Users } from 'lucide-react';
import { EmpresaWizardProps, COMPANY_SIZES } from '../types';
import { getCategoriesAsOptions } from '@/lib/constants/categories';

export const Step2BasicInfo = ({ formData, errors, updateField }: EmpresaWizardProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Informacio Basica</h2>
        <p className="text-gray-600">
          Dades essencials de l'empresa
        </p>
      </div>

      {/* Nom empresa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building2 className="w-4 h-4 inline mr-2" />
          Nom de l'empresa *
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Ex: Tech Solutions Barcelona SL"
          className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400 ${
            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* CIF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CIF/NIF *
        </label>
        <input
          type="text"
          value={formData.cif || ''}
          onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
          placeholder="B12345678"
          maxLength={9}
          className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400 ${
            errors.cif ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        />
        {errors.cif && <p className="text-sm text-red-600 mt-1">{errors.cif}</p>}
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sector *
        </label>
        <select
          value={formData.sector || ''}
          onChange={(e) => updateField('sector', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border text-gray-900 ${
            errors.sector ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        >
          <option value="" className="text-gray-400">Selecciona un sector</option>
          {getCategoriesAsOptions().map((category) => (
            <option key={category.value} value={category.value} className="text-gray-900">
              {category.label}
            </option>
          ))}
        </select>
        {errors.sector && <p className="text-sm text-red-600 mt-1">{errors.sector}</p>}
      </div>

      {/* Any fundacio i Mida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Any de fundacio
          </label>
          <input
            type="number"
            value={formData.founded || ''}
            onChange={(e) => updateField('founded', e.target.value)}
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Mida de l'empresa
          </label>
          <select
            value={formData.size || ''}
            onChange={(e) => updateField('size', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {COMPANY_SIZES.map((size) => (
              <option key={size.value} value={size.value} className="text-gray-900">
                {size.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Descripcio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Descripcio de l'empresa *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descriu breument la teva empresa, els seus valors i la seva missio..."
          rows={5}
          maxLength={1000}
          className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder:text-gray-400 ${
            errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          <p className="text-sm text-gray-500 ml-auto">
            {(formData.description || '').length}/1000
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          Consells per a una bona descripcio:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>- Explica que fa la teva empresa</li>
          <li>- Menciona els teus valors i missio</li>
          <li>- Destaca que us diferencia de la competencia</li>
        </ul>
      </div>
    </div>
  );
};
