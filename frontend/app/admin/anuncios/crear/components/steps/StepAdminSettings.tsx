'use client';

import { Star, AlertTriangle, Crown } from 'lucide-react';
import { AdminAnunciFormData, UpdateAdminAnunciField } from '../../hooks/useAdminCreateAnunci';

interface StepAdminSettingsProps {
  formData: AdminAnunciFormData;
  updateField: UpdateAdminAnunciField;
}

export const StepAdminSettings = ({ formData, updateField }: StepAdminSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuració d'Administrador
        </h2>
        <p className="text-gray-600">
          Opcions especials disponibles només per a administradors
        </p>
      </div>

      {/* Anuncio destacado */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Anunci Destacat
            </h3>
            <p className="text-gray-600 mb-4">
              Els anuncis destacats apareixen a la part superior dels resultats de cerca amb un disseny especial que crida l'atenció.
            </p>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => updateField('isFeatured', e.target.checked)}
                className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                ⭐ Marcar com a anunci destacat
              </span>
            </label>
            {formData.isFeatured && (
              <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ✨ Aquest anunci apareixerà amb una corona daurada i serà més visible per als usuaris
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prioridad */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Prioritat de l'Anunci
        </h3>
        <p className="text-gray-600 mb-4">
          La prioritat determina l'ordre en què apareix l'anunci dins de la seva categoria.
        </p>

        <div className="space-y-3">
          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.priority === 'normal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
          `}>
            <input
              type="radio"
              name="priority"
              value="normal"
              checked={formData.priority === 'normal'}
              onChange={(e) => updateField('priority', e.target.value)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Normal</span>
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Prioritat estàndard. L'anunci apareix en ordre cronològic normal.
              </p>
            </div>
          </label>

          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.priority === 'high' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
          `}>
            <input
              type="radio"
              name="priority"
              value="high"
              checked={formData.priority === 'high'}
              onChange={(e) => updateField('priority', e.target.value)}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Alta</span>
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Prioritat alta. L'anunci apareix abans que els normals.
              </p>
            </div>
          </label>

          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.priority === 'urgent' ? 'border-red-500 bg-red-50' : 'border-gray-200'}
          `}>
            <input
              type="radio"
              name="priority"
              value="urgent"
              checked={formData.priority === 'urgent'}
              onChange={(e) => updateField('priority', e.target.value)}
              className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Urgent</span>
                <span className="text-2xl">🚨</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Màxima prioritat. L'anunci apareix al principi de tots els llistats.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Estado de moderación */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-600" />
          Estat de Moderació
        </h3>
        <p className="text-gray-600 mb-4">
          Com a administrador, pots aprovar l'anunci immediatament o deixar-lo pendent per a revisió posterior.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('moderationStatus', 'approved')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${formData.moderationStatus === 'approved'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-gray-900">Aprovat</span>
            </div>
            <div className="text-sm text-gray-600">
              L'anunci es publica immediatament i és visible per a tots els usuaris
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('moderationStatus', 'pending')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${formData.moderationStatus === 'pending'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏳</span>
              <span className="font-semibold text-gray-900">Pendent</span>
            </div>
            <div className="text-sm text-gray-600">
              L'anunci queda guardat però no visible fins a aprovació manual
            </div>
          </button>
        </div>
      </div>

      {/* Info Box de Privilegios */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800 font-medium mb-2">
          👑 Privilegis d'Administrador:
        </p>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Els anuncis destacats tenen més visibilitat i apareixen amb efectes especials</li>
          <li>• La prioritat urgent col·loca l'anunci al capdamunt de tots els llistats</li>
          <li>• Pots aprovar immediatament sense passar per moderació</li>
          <li>• Aquests anuncis no tenen límit de durada i poden estar actius indefinidament</li>
        </ul>
      </div>
    </div>
  );
};