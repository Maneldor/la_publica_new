'use client';

import { FileText, Tag, CheckSquare } from 'lucide-react';
import { AdminEmpresaFormData } from '../../hooks/useAdminCreateEmpresa';

interface Step2Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AdminEmpresaFormData, value: any) => void;
}

export const Step2BasicInfo = ({ formData, errors, updateField }: Step2Props) => {
  const categories = [
    { value: '', label: 'Selecciona una categoria' },
    { value: 'tecnologia', label: '💻 Tecnologia' },
    { value: 'consultoria-legal', label: '⚖️ Consultoria Legal' },
    { value: 'serveis', label: '🛠️ Serveis Professionals' },
    { value: 'construccio', label: '🏗️ Construcció' },
    { value: 'educacio', label: '🎓 Educació i Formació' },
    { value: 'salut', label: '🏥 Salut i Benestar' },
    { value: 'financers', label: '💰 Serveis Financers' },
    { value: 'transport', label: '🚛 Transport i Logística' },
    { value: 'energia', label: '⚡ Energia i Sostenibilitat' },
    { value: 'comunicacio', label: '📢 Comunicació i Marketing' },
    { value: 'alimentacio', label: '🍽️ Alimentació i Hostaleria' },
    { value: 'altres', label: '📦 Altres' },
  ];

  const availableServices = [
    'Desenvolupament de Software',
    'Consultoria IT',
    'Ciberseguretat',
    'Transformació Digital',
    'Manteniment Sistemes',
    'Formació Tecnològica',
    'Consultoria Legal',
    'Assessorament Fiscal',
    'Gestió Documental',
    'Auditories',
    'Gestió de Projectes',
    'Recursos Humans',
    'Marketing Digital',
    'Disseny Gràfic',
    'Arquitectura',
    'Enginyeria',
    'Manteniment d\'Edificis',
    'Neteja i Consergeria',
    'Seguretat',
    'Catering',
    'Transport',
    'Consultoria Ambiental',
    'Energia Renovable',
    'Altres Serveis'
  ];

  const toggleService = (service: string) => {
    const currentServices = formData.services || [];
    if (currentServices.includes(service)) {
      updateField('services', currentServices.filter(s => s !== service));
    } else {
      updateField('services', [...currentServices, service]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informació Bàsica
        </h2>
        <p className="text-gray-600">
          Proporciona els detalls principals sobre la teva empresa i els serveis que ofereix
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Sobre Nosaltres - Descripció Completa *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descriu la teva empresa: història, missió, valors, experiència, projectes destacats, etc. Aquesta informació apareixerà a la secció 'Sobre nosaltres' de la pàgina de l'empresa."
          rows={8}
          maxLength={2000}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all resize-none
          `}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.description.length}/2000
          </p>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline mr-2" />
          Categoria Principal *
        </label>
        <select
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-red-600 mt-1">{errors.category}</p>
        )}
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sector Específic
        </label>
        <input
          type="text"
          value={formData.sector}
          onChange={(e) => updateField('sector', e.target.value)}
          placeholder="Ex: Administració Electrònica, Consultoria Jurídica, Construcció Sostenible..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <CheckSquare className="w-4 h-4 inline mr-2" />
          Serveis Principals *
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Selecciona els serveis que ofereix la teva empresa (mínim 1)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {availableServices.map((service) => {
            const isSelected = formData.services?.includes(service) || false;
            return (
              <label
                key={service}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50
                  ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                  border-2
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleService(service)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className={`ml-3 text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                  {service}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            {errors.services && (
              <p className="text-sm text-red-600">{errors.services}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.services?.length || 0} serveis seleccionats
          </p>
        </div>
      </div>

      {/* Custom Service Input */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Afegir Servei Personalitzat
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: Consultoria especialitzada en RGPD"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const value = input.value.trim();
                if (value && !formData.services?.includes(value)) {
                  toggleService(value);
                  input.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
              const value = input.value.trim();
              if (value && !formData.services?.includes(value)) {
                toggleService(value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Afegir
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium mb-2">
          💡 Consells per a una bona descripció:
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Explica què fa única a la teva empresa</li>
          <li>• Menciona projectes o clients destacats (si és possible)</li>
          <li>• Inclou els vostres valors i compromís amb la qualitat</li>
          <li>• Destaca la vostra experiència en el sector públic</li>
          <li>• Selecciona només els serveis que realment oferiu</li>
        </ul>
      </div>
    </div>
  );
};