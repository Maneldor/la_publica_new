'use client';

import { FileText, Tag, Type } from 'lucide-react';
import { AnunciFormData } from '../../hooks/useCreateAnunci';

interface Step1Props {
  formData: AnunciFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AnunciFormData, value: any) => void;
}

export const Step1BasicInfo = ({ formData, errors, updateField }: Step1Props) => {
  const categories = [
    { value: '', label: 'Selecciona una categoria' },
    { value: 'tecnologia', label: '💻 Tecnologia' },
    { value: 'vehicles', label: '🚗 Vehicles' },
    { value: 'immobiliaria', label: '🏠 Immobiliària' },
    { value: 'moda', label: '👔 Moda i Complements' },
    { value: 'esports', label: '⚽ Esports i Oci' },
    { value: 'llar', label: '🏡 Llar i Jardí' },
    { value: 'serveis', label: '🔧 Serveis Professionals' },
    { value: 'altres', label: '📦 Altres' },
  ];

  return (
    <div className="space-y-6">
      {/* Header del Step */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informació Bàsica
        </h2>
        <p className="text-gray-600">
          Comença amb els detalls principals del teu anunci
        </p>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Type className="w-4 h-4 inline mr-2" />
          Títol de l'anunci *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Ex: iPhone 13 Pro en perfecte estat"
          maxLength={100}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.title ? 'border-error bg-error/10' : 'border-border'}
            focus:ring-2 focus:ring-info focus:border-transparent
            transition-all
          `}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.title && (
              <p className="text-sm text-error">{errors.title}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.title.length}/100
          </p>
        </div>
      </div>

      {/* Tipo: Oferta / Demanda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipus d'anunci *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('type', 'oferta')}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${formData.type === 'oferta'
                ? 'border-info bg-info/10 text-info-dark'
                : 'border-border-light bg-white text-text-secondary hover:border-border'
              }
            `}
          >
            <div className="text-3xl mb-2">📤</div>
            <div className="font-semibold">Oferta</div>
            <div className="text-sm mt-1 opacity-75">Vull vendre</div>
          </button>

          <button
            type="button"
            onClick={() => updateField('type', 'demanda')}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${formData.type === 'demanda'
                ? 'border-success bg-success/10 text-success-dark'
                : 'border-border-light bg-white text-text-secondary hover:border-border'
              }
            `}
          >
            <div className="text-3xl mb-2">📥</div>
            <div className="font-semibold">Demanda</div>
            <div className="text-sm mt-1 opacity-75">Vull comprar</div>
          </button>
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline mr-2" />
          Categoria *
        </label>
        <select
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.category ? 'border-error bg-error/10' : 'border-border'}
            focus:ring-2 focus:ring-info focus:border-transparent
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
          <p className="text-sm text-error mt-1">{errors.category}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Descripció *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descriu el teu anunci amb detall. Inclou característiques, estat, motiu de venda, etc."
          rows={8}
          maxLength={2000}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.description ? 'border-error bg-error/10' : 'border-border'}
            focus:ring-2 focus:ring-info focus:border-transparent
            transition-all resize-none
          `}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.description && (
              <p className="text-sm text-error">{errors.description}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.description.length}/2000
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-info/10 border border-info/30 rounded-lg p-4">
        <p className="text-sm text-info-dark font-medium mb-2">
          💡 Consells per a un bon anunci:
        </p>
        <ul className="text-sm text-info space-y-1">
          <li>• Usa un títol clar i descriptiu</li>
          <li>• Inclou totes les característiques importants</li>
          <li>• Sigues honest sobre l'estat del producte</li>
          <li>• Revisa l'ortografia abans de publicar</li>
        </ul>
      </div>
    </div>
  );
};