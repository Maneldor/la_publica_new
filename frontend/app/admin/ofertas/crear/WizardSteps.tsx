'use client';

import { useState } from 'react';
import {
  Upload,
  X,
  Plus,
  Info,
  Tag,
  Calendar,
  ShoppingBag,
  Image,
  CheckCircle,
  ExternalLink,
  Phone,
  Mail,
  FileText,
  QrCode,
  Ticket,
  Trash2,
  AlertCircle
} from 'lucide-react';

// Step 1 - Información Básica
export const Step1Basic = ({ formData, updateField, errors, companies, categories }: any) => {
  const selectedCategory = categories.find((c: any) => c.value === formData.category);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Informació Bàsica de l'Oferta</h2>
        <p className="text-gray-600">Defineix els detalls principals de la teva oferta VIP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Títol de l'Oferta *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Ex: Descompte 25% en Portàtils Professionals"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            maxLength={120}
          />
          <div className="flex justify-between mt-1">
            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
            <span className="text-sm text-gray-500">{formData.title.length}/120</span>
          </div>
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Empresa *
          </label>
          <select
            value={formData.companyId}
            onChange={(e) => updateField('companyId', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.companyId ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">Selecciona una empresa</option>
            {companies.map((company: any) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId && <span className="text-sm text-red-500 mt-1">{errors.companyId}</span>}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              updateField('category', e.target.value);
              updateField('subcategory', '');
            }}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">Selecciona una categoria</option>
            {categories.map((category: any) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && <span className="text-sm text-red-500 mt-1">{errors.category}</span>}
        </div>

        {/* Subcategoría */}
        {selectedCategory && selectedCategory.subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategoria
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => updateField('subcategory', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una subcategoria</option>
              {selectedCategory.subcategories.map((sub: string) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripció Detallada *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Descriu l'oferta de forma completa i atractiva. Inclou tots els detalls rellevants..."
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
          />
          <div className="flex justify-between mt-1">
            {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
            <span className="text-sm text-gray-500">{formData.description.length} caràcters</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 2 - Precios y Descuentos
export const Step2Pricing = ({ formData, updateField, errors, calculateDiscount }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Preus i Descomptes</h2>
        <p className="text-gray-600">Configura els preus i descomptes de la teva oferta.</p>
      </div>

      {/* Oferta Gratuita */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFree}
            onChange={(e) => updateField('isFree', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">Oferta Gratuïta</span>
            <p className="text-sm text-gray-600">Marca aquesta opció si l'oferta és totalment gratuïta</p>
          </div>
        </label>
      </div>

      {!formData.isFree && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Precio Original */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preu Original (€) *
            </label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => {
                updateField('originalPrice', e.target.value);
                calculateDiscount(e.target.value, formData.discountPrice);
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.originalPrice ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.originalPrice && <span className="text-sm text-red-500 mt-1">{errors.originalPrice}</span>}
          </div>

          {/* Precio con Descuento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preu amb Descompte (€) *
            </label>
            <input
              type="number"
              value={formData.discountPrice}
              onChange={(e) => {
                updateField('discountPrice', e.target.value);
                calculateDiscount(formData.originalPrice, e.target.value);
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.discountPrice ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.discountPrice && <span className="text-sm text-red-500 mt-1">{errors.discountPrice}</span>}
          </div>

          {/* Porcentaje de Descuento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Percentatge de Descompte
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.discountPercentage}
                readOnly
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 bg-gray-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Calculat automàticament</p>
          </div>

          {/* Tipo de Descuento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipus de Descompte
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => updateField('discountType', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="percentage">Percentatge</option>
              <option value="fixed">Import Fix</option>
            </select>
          </div>
        </div>
      )}

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stock Disponible
        </label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => updateField('stock', e.target.value)}
          placeholder="Il·limitat (deixa buit)"
          min="0"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Deixa buit si no hi ha límit de stock
        </p>
      </div>

      {/* Vista Previa del Ahorro */}
      {!formData.isFree && formData.originalPrice && formData.discountPrice && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-3">Resum del Descompte</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Preu Original</p>
              <p className="text-lg font-bold text-gray-400 line-through">
                {formData.originalPrice}€
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estalvi</p>
              <p className="text-lg font-bold text-green-600">
                -{formData.discountPercentage || 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preu Final</p>
              <p className="text-lg font-bold text-green-800">
                {formData.discountPrice}€
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Step 3 - Validez y Límites
export const Step3Validity = ({ formData, updateField, errors }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Validesa i Límits</h2>
        <p className="text-gray-600">Defineix el període de validesa i els límits d'ús de l'oferta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha de Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data d'Inici *
          </label>
          <input
            type="date"
            value={formData.validFrom}
            onChange={(e) => updateField('validFrom', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.validFrom ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.validFrom && <span className="text-sm text-red-500 mt-1">{errors.validFrom}</span>}
        </div>

        {/* Fecha de Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Fi *
          </label>
          <input
            type="date"
            value={formData.validUntil}
            onChange={(e) => updateField('validUntil', e.target.value)}
            min={formData.validFrom || new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.validUntil ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.validUntil && <span className="text-sm text-red-500 mt-1">{errors.validUntil}</span>}
        </div>

        {/* Uso Máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ús Màxim Total
          </label>
          <input
            type="number"
            value={formData.maxUsage}
            onChange={(e) => updateField('maxUsage', e.target.value)}
            placeholder="Il·limitat"
            min="1"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Nombre màxim de vegades que es pot utilitzar l'oferta
          </p>
        </div>

        {/* Cantidad Mínima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantitat Mínima
          </label>
          <input
            type="number"
            value={formData.minQuantity}
            onChange={(e) => updateField('minQuantity', e.target.value)}
            placeholder="1"
            min="1"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Quantitat mínima per comanda
          </p>
        </div>

        {/* Cantidad Máxima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantitat Màxima
          </label>
          <input
            type="number"
            value={formData.maxQuantity}
            onChange={(e) => updateField('maxQuantity', e.target.value)}
            placeholder="Il·limitada"
            min="1"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Quantitat màxima per comanda
          </p>
        </div>
      </div>

      {/* Resumen de Validez */}
      {formData.validFrom && formData.validUntil && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Període de Validesa
          </h3>
          <p className="text-blue-700">
            Des del {new Date(formData.validFrom).toLocaleDateString('ca-ES')} fins al{' '}
            {new Date(formData.validUntil).toLocaleDateString('ca-ES')}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Durada: {Math.ceil((new Date(formData.validUntil).getTime() - new Date(formData.validFrom).getTime()) / (1000 * 60 * 60 * 24))} dies
          </p>
        </div>
      )}
    </div>
  );
};

// Step 4 - Detalles de la Oferta
export const Step4Details = ({ formData, addArrayItem, removeArrayItem, errors, updateField }: any) => {
  const [includesInput, setIncludesInput] = useState('');
  const [conditionsInput, setConditionsInput] = useState('');
  const [exclusionsInput, setExclusionsInput] = useState('');
  const [instructionsInput, setInstructionsInput] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Detalls de l'Oferta</h2>
        <p className="text-gray-600">Especifica què inclou l'oferta i les seves condicions.</p>
      </div>

      {/* Qué Incluye */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Què Inclou l'Oferta *
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={includesInput}
            onChange={(e) => setIncludesInput(e.target.value)}
            placeholder="Ex: Portàtil Dell OptiPlex 7080"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (includesInput.trim()) {
                  addArrayItem('includes', includesInput);
                  setIncludesInput('');
                }
              }
            }}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (includesInput.trim()) {
                addArrayItem('includes', includesInput);
                setIncludesInput('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {formData.includes.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded">
            <span className="flex-1 text-sm">{item}</span>
            <button
              onClick={() => removeArrayItem('includes', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {errors.includes && <span className="text-sm text-red-500">{errors.includes}</span>}
      </div>

      {/* Condiciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condicions d'Ús
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={conditionsInput}
            onChange={(e) => setConditionsInput(e.target.value)}
            placeholder="Ex: Només per a membres verificats"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (conditionsInput.trim()) {
                  addArrayItem('conditions', conditionsInput);
                  setConditionsInput('');
                }
              }
            }}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (conditionsInput.trim()) {
                addArrayItem('conditions', conditionsInput);
                setConditionsInput('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {formData.conditions.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded">
            <span className="flex-1 text-sm">{item}</span>
            <button
              onClick={() => removeArrayItem('conditions', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Exclusiones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exclusions
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={exclusionsInput}
            onChange={(e) => setExclusionsInput(e.target.value)}
            placeholder="Ex: No acumulable amb altres ofertes"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (exclusionsInput.trim()) {
                  addArrayItem('exclusions', exclusionsInput);
                  setExclusionsInput('');
                }
              }
            }}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (exclusionsInput.trim()) {
                addArrayItem('exclusions', exclusionsInput);
                setExclusionsInput('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {formData.exclusions.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded">
            <span className="flex-1 text-sm">{item}</span>
            <button
              onClick={() => removeArrayItem('exclusions', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Instrucciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instruccions per Obtenir l'Oferta *
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={instructionsInput}
            onChange={(e) => setInstructionsInput(e.target.value)}
            placeholder="Ex: Fes clic al botó Aprofitar oferta"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (instructionsInput.trim()) {
                  addArrayItem('instructions', instructionsInput);
                  setInstructionsInput('');
                }
              }
            }}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (instructionsInput.trim()) {
                addArrayItem('instructions', instructionsInput);
                setInstructionsInput('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {formData.instructions.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded">
            <span className="text-sm text-gray-500 font-medium">Pas {index + 1}:</span>
            <span className="flex-1 text-sm">{item}</span>
            <button
              onClick={() => removeArrayItem('instructions', index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {errors.instructions && <span className="text-sm text-red-500">{errors.instructions}</span>}
      </div>

      {/* Política de Devolución */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Política de Devolució
        </label>
        <textarea
          value={formData.returnPolicy}
          onChange={(e) => updateField('returnPolicy', e.target.value)}
          placeholder="Ex: Dret de devolució fins a 30 dies"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
};

// Step 5 - Métodos de Adquisición
export const Step5Acquisition = ({ formData, updateField, errors }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Mètodes d'Adquisició</h2>
        <p className="text-gray-600">Com poden els usuaris obtenir aquesta oferta?</p>
      </div>

      {errors.acquisitionModes && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <span className="text-sm text-red-700">{errors.acquisitionModes}</span>
        </div>
      )}

      {/* Métodos de Adquisición */}
      <div className="space-y-4">
        {/* Contacto Directo */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acquisitionModes.directContact}
              onChange={(e) => updateField('acquisitionModes.directContact', e.target.checked)}
              className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Contacte Directe</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Els usuaris contactaran directament amb l'empresa
              </p>

              {formData.acquisitionModes.directContact && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telèfon</label>
                    <input
                      type="tel"
                      value={formData.directContactConfig.phone}
                      onChange={(e) => updateField('directContactConfig.phone', e.target.value)}
                      placeholder="Ex: 93 123 45 67"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.directContactConfig.email}
                      onChange={(e) => updateField('directContactConfig.email', e.target.value)}
                      placeholder="Ex: ofertes@empresa.cat"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacte</label>
                    <input
                      type="text"
                      value={formData.directContactConfig.contactPerson}
                      onChange={(e) => updateField('directContactConfig.contactPerson', e.target.value)}
                      placeholder="Ex: Maria García - Dept. Vendes"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Link Externo */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acquisitionModes.externalLink}
              onChange={(e) => updateField('acquisitionModes.externalLink', e.target.checked)}
              className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Enllaç Extern</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Redirigeix a una pàgina web externa
              </p>

              {formData.acquisitionModes.externalLink && (
                <div className="space-y-3 mt-3 pt-3 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                    <input
                      type="url"
                      value={formData.externalLinkConfig.url}
                      onChange={(e) => updateField('externalLinkConfig.url', e.target.value)}
                      placeholder="https://exemple.com/oferta"
                      className={`w-full px-3 py-2 rounded border ${
                        errors['externalLinkConfig.url'] ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors['externalLinkConfig.url'] && (
                      <span className="text-sm text-red-500">{errors['externalLinkConfig.url']}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text del Botó</label>
                    <input
                      type="text"
                      value={formData.externalLinkConfig.buttonText}
                      onChange={(e) => updateField('externalLinkConfig.buttonText', e.target.value)}
                      placeholder="Ex: Anar a l'oferta"
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Código Promocional */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acquisitionModes.promoCode}
              onChange={(e) => updateField('acquisitionModes.promoCode', e.target.checked)}
              className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Codi Promocional</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Proporciona un codi de descompte
              </p>

              {formData.acquisitionModes.promoCode && (
                <div className="space-y-3 mt-3 pt-3 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codi *</label>
                    <input
                      type="text"
                      value={formData.promoCodeConfig.code}
                      onChange={(e) => updateField('promoCodeConfig.code', e.target.value.toUpperCase())}
                      placeholder="Ex: TECH25PUBLICA"
                      className={`w-full px-3 py-2 rounded border ${
                        errors['promoCodeConfig.code'] ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 font-mono`}
                    />
                    {errors['promoCodeConfig.code'] && (
                      <span className="text-sm text-red-500">{errors['promoCodeConfig.code']}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instruccions</label>
                    <textarea
                      value={formData.promoCodeConfig.instructions}
                      onChange={(e) => updateField('promoCodeConfig.instructions', e.target.value)}
                      placeholder="Ex: Utilitza aquest codi al checkout de la nostra web"
                      rows={2}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Cupón Digital */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acquisitionModes.digitalCoupon}
              onChange={(e) => updateField('acquisitionModes.digitalCoupon', e.target.checked)}
              className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Cupó Digital</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Genera un cupó descarregable amb QR
              </p>

              {formData.acquisitionModes.digitalCoupon && (
                <div className="space-y-3 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.digitalCouponConfig.qrEnabled}
                        onChange={(e) => updateField('digitalCouponConfig.qrEnabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">Codi QR</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.digitalCouponConfig.barcodeEnabled}
                        onChange={(e) => updateField('digitalCouponConfig.barcodeEnabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">Codi de Barres</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.digitalCouponConfig.validationRequired}
                        onChange={(e) => updateField('digitalCouponConfig.validationRequired', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">Requereix Validació</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Formulario Interno */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acquisitionModes.internalForm}
              onChange={(e) => updateField('acquisitionModes.internalForm', e.target.checked)}
              className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Formulari Intern</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Els usuaris emplenen un formulari a la plataforma
              </p>

              {formData.acquisitionModes.internalForm && (
                <div className="space-y-3 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.internalFormConfig.autoApproval}
                        onChange={(e) => updateField('internalFormConfig.autoApproval', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">Aprovació Automàtica</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.internalFormConfig.notifyCompany}
                        onChange={(e) => updateField('internalFormConfig.notifyCompany', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">Notificar Empresa</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

// Step 6 - Imágenes
export const Step6Images = ({ formData, handleImageUpload, removeImage, errors }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Imatges de l'Oferta</h2>
        <p className="text-gray-600">Afegeix imatges atractives per mostrar l'oferta.</p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Arrossega imatges aquí o fes clic per seleccionar</p>
        <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF fins a 10MB</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Seleccionar Imatges
        </label>
      </div>

      {errors.images && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <span className="text-sm text-red-700">{errors.images}</span>
        </div>
      )}

      {/* Preview Images */}
      {formData.imagePreviews.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Imatges seleccionades ({formData.imagePreviews.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.imagePreviews.map((preview: string, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                    Imatge Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Step 7 - Revisión
export const Step7Review = ({ formData, companies, categories, updateField }: any) => {
  const company = companies.find((c: any) => c.id == formData.companyId);
  const category = categories.find((c: any) => c.value === formData.category);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Revisió Final</h2>
        <p className="text-gray-600">Revisa tots els detalls abans de crear l'oferta.</p>
      </div>

      {/* Resumen de la Oferta */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Informació Bàsica
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Títol</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.title || 'No definit'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Empresa</dt>
            <dd className="mt-1 text-sm text-gray-900">{company?.name || 'No seleccionada'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Categoria</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {category?.label || 'No seleccionada'}
              {formData.subcategory && ` / ${formData.subcategory}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Descripció</dt>
            <dd className="mt-1 text-sm text-gray-900 truncate">{formData.description || 'No definida'}</dd>
          </div>
        </dl>
      </div>

      {/* Precios */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Preus i Descomptes
        </h3>
        {formData.isFree ? (
          <p className="text-green-600 font-semibold">Oferta Gratuïta</p>
        ) : (
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Preu Original</dt>
              <dd className="mt-1 text-sm text-gray-900 line-through">{formData.originalPrice}€</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Preu amb Descompte</dt>
              <dd className="mt-1 text-sm font-bold text-green-600">{formData.discountPrice}€</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Descompte</dt>
              <dd className="mt-1 text-sm text-gray-900">-{formData.discountPercentage}%</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Validez */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Validesa i Límits
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Període</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.validFrom && formData.validUntil
                ? `Del ${new Date(formData.validFrom).toLocaleDateString('ca-ES')} al ${new Date(formData.validUntil).toLocaleDateString('ca-ES')}`
                : 'No definit'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ús Màxim</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.maxUsage || 'Il·limitat'}</dd>
          </div>
        </dl>
      </div>

      {/* Métodos de Adquisición */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Mètodes d'Adquisició
        </h3>
        <div className="flex flex-wrap gap-2">
          {formData.acquisitionModes.directContact && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Contacte Directe
            </span>
          )}
          {formData.acquisitionModes.externalLink && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Enllaç Extern
            </span>
          )}
          {formData.acquisitionModes.promoCode && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Codi Promocional
            </span>
          )}
          {formData.acquisitionModes.digitalCoupon && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Cupó Digital
            </span>
          )}
          {formData.acquisitionModes.internalForm && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Formulari Intern
            </span>
          )}
        </div>
      </div>

      {/* Estado de Publicación */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-800 mb-3">Estat de Publicació</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="DRAFT"
              checked={formData.status === 'DRAFT'}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Esborrany (no visible)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="PUBLISHED"
              checked={formData.status === 'PUBLISHED'}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Publicar immediatament</span>
          </label>
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => updateField('featured', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm font-medium">Oferta Destacada</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.exclusive}
            onChange={(e) => updateField('exclusive', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm font-medium">Exclusiva per a Membres</span>
        </label>
      </div>
    </div>
  );
};

export default {
  Step1Basic,
  Step2Pricing,
  Step3Validity,
  Step4Details,
  Step5Acquisition,
  Step6Images,
  Step7Review
};