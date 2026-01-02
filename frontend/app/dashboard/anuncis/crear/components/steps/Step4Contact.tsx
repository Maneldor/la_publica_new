'use client';

import { User, Phone, Mail, Clock } from 'lucide-react';
import { AnunciFormData } from '../../hooks/useCreateAnunci';

interface Step4ContactProps {
  formData: AnunciFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AnunciFormData, value: any) => void;
}

export function Step4Contact({ formData, errors, updateField }: Step4ContactProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📞 Informació de contacte
        </h2>
        <p className="text-gray-600">
          Facilita als interessats com contactar-te (tots els camps són opcionals)
        </p>
      </div>

      <div className="bg-info/10 border-l-4 border-info p-4 mb-6">
        <p className="text-sm text-info-dark">
          💬 Si no omples aquests camps, els interessats podran contactar-te via missatge intern
        </p>
      </div>

      <div className="space-y-6">
        {/* Nom complet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nom complet de contacte
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-info focus:border-transparent transition-colors ${
              errors.contactName ? 'border-error' : 'border-border'
            }`}
            placeholder="Ex: Joan Garcia"
          />
          {errors.contactName && (
            <p className="mt-1 text-sm text-error">{errors.contactName}</p>
          )}
        </div>

        {/* Telèfon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Telèfon de contacte
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => updateField('contactPhone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-info focus:border-transparent transition-colors ${
              errors.contactPhone ? 'border-error' : 'border-border'
            }`}
            placeholder="Ex: 666 123 456"
          />
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-error">{errors.contactPhone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email de contacte
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-info focus:border-transparent transition-colors ${
              errors.contactEmail ? 'border-error' : 'border-border'
            }`}
            placeholder="Ex: joan.garcia@example.com"
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-error">{errors.contactEmail}</p>
          )}
        </div>

        {/* Horari de contacte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Horari de contacte preferit
          </label>
          <textarea
            value={formData.contactSchedule}
            onChange={(e) => updateField('contactSchedule', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-info focus:border-transparent transition-colors"
            placeholder="Ex: Disponible de dilluns a divendres de 9h a 18h. Caps de setmana només matins."
          />
          <p className="mt-1 text-sm text-gray-500">
            Indica quan prefereixes que et contactin els interessats (opcional)
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-gray-400">💡</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">Consell</h3>
            <div className="mt-1 text-sm text-gray-600">
              Proporcionar informació de contacte directe pot accelerar les transaccions,
              però sempre pots gestionar les converses a través del sistema de missatgeria interna.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}