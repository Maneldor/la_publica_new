'use client';

import { useState } from 'react';
import { Euro, Package, Plus, X } from 'lucide-react';
import { AnunciFormData } from '../../hooks/useCreateAnunci';

interface Step2Props {
  formData: AnunciFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AnunciFormData, value: any) => void;
}

export const Step2Details = ({ formData, errors, updateField }: Step2Props) => {
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      const newSpecs = {
        ...formData.specifications,
        [newSpecKey.trim()]: newSpecValue.trim()
      };
      updateField('specifications', newSpecs);
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    updateField('specifications', newSpecs);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Detalls i Preu
        </h2>
        <p className="text-gray-600">
          Afegeix informació sobre el preu i l'estat del producte
        </p>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Euro className="w-4 h-4 inline mr-2" />
          Preu
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => updateField('price', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`
              w-full px-4 py-3 pl-12 rounded-lg border
              ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all
            `}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            €
          </div>
        </div>
        {errors.price && (
          <p className="text-sm text-red-600 mt-1">{errors.price}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Deixa buit si és gratuït o a consultar
        </p>
      </div>

      {/* Tipo de Precio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipus de preu
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('priceType', 'fix')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${formData.priceType === 'fix'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="font-semibold text-gray-900">Preu Fix</div>
            <div className="text-sm text-gray-600 mt-1">
              El preu no és negociable
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('priceType', 'negociable')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${formData.priceType === 'negociable'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="font-semibold text-gray-900">Negociable</div>
            <div className="text-sm text-gray-600 mt-1">
              El preu és negociable
            </div>
          </button>
        </div>
      </div>

      {/* Estado del Producto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Package className="w-4 h-4 inline mr-2" />
          Estat del producte
        </label>
        <select
          value={formData.condition}
          onChange={(e) => updateField('condition', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="nou">🆕 Nou - Sense estrenar</option>
          <option value="com_nou">✨ Com nou - Usat molt poc</option>
          <option value="usat">📦 Usat - Bon estat</option>
        </select>
      </div>

      {/* Especificaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Especificacions (opcional)
        </label>

        {/* Lista de especificaciones existentes */}
        {Object.keys(formData.specifications).length > 0 && (
          <div className="space-y-2 mb-4">
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600 ml-2">{value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Añadir nueva especificación */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="Nom (Ex: Marca)"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              placeholder="Valor (Ex: Apple)"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={addSpecification}
            disabled={!newSpecKey.trim() || !newSpecValue.trim()}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${newSpecKey.trim() && newSpecValue.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Plus className="w-5 h-5" />
            Afegir Especificació
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Ex: Marca, Model, Any, Color, Mida, etc.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800 font-medium mb-2">
          💰 Consells sobre el preu:
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Investiga preus similars abans de publicar</li>
          <li>• Sigues realista amb l'estat del producte</li>
          <li>• Considera els costos d'enviament</li>
          <li>• La negociació pot accelerar la venda</li>
        </ul>
      </div>
    </div>
  );
};