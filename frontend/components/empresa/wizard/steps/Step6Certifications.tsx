'use client';

import { Award, Plus, Trash2, Calendar, Building } from 'lucide-react';
import { CertificationStepProps, Certification } from '../types';

export const Step6Certifications = ({
  formData,
  errors,
  updateField,
  addCertification,
  updateCertification,
  removeCertification,
}: CertificationStepProps) => {
  const certifications = formData.certifications || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificacions i Acreditacions</h2>
        <p className="text-gray-600">
          Afegeix les certificacions que avalen la qualitat de la teva empresa
        </p>
      </div>

      {/* Lista de certificaciones */}
      <div className="space-y-4">
        {certifications.map((cert: Certification, index: number) => (
          <div
            key={cert.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-medium text-gray-900">
                  Certificacio {index + 1}
                </span>
              </div>
              <button
                onClick={() => removeCertification(cert.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la certificacio *
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                  placeholder="Ex: ISO 9001:2015"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="w-3.5 h-3.5 inline mr-1" />
                  Entitat emissora
                </label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                  placeholder="Ex: AENOR"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Any d'obtencio
                </label>
                <input
                  type="number"
                  value={cert.year}
                  onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                  placeholder="2024"
                  min="1990"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del document (opcional)
                </label>
                <input
                  type="url"
                  value={cert.documentUrl || ''}
                  onChange={(e) => updateCertification(cert.id, 'documentUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {certifications.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No hi ha certificacions afegides</p>
            <p className="text-sm text-gray-400">
              Les certificacions augmenten la confianca dels clients
            </p>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={addCertification}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Afegir certificacio
      </button>

      {/* Common certifications */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          Certificacions comunes:
        </p>
        <div className="flex flex-wrap gap-2">
          {['ISO 9001', 'ISO 14001', 'ISO 27001', 'B Corp', 'EFQM', 'Great Place to Work'].map((name) => (
            <span
              key={name}
              className="px-2 py-1 bg-white text-blue-700 rounded text-xs border border-blue-200"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
