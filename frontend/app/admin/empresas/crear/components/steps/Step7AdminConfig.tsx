'use client';

import { Crown, Star, Award, CheckCircle } from 'lucide-react';
import { AdminEmpresaFormData } from '../../hooks/useAdminCreateEmpresa';

interface Step7Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AdminEmpresaFormData, value: any) => void;
}

export const Step7AdminConfig = ({ formData, errors, updateField }: Step7Props) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuració d'Administrador
        </h2>
        <p className="text-gray-600">
          Opcions especials disponibles només per a administradors de la plataforma
        </p>
      </div>

      {/* Empresa Verificada */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Empresa Verificada
            </h3>
            <p className="text-gray-600 mb-4">
              Les empreses verificades mostren un badge verd "VERIFICADA" que indica que han passat un procés de validació i són de confiança.
            </p>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => updateField('isVerified', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                ✅ Marcar com a empresa verificada
              </span>
            </label>
            {formData.isVerified && (
              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">
                  ✨ Aquesta empresa mostrarà el badge "VERIFICADA" en les targetes i pàgina de detall
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empresa Destacada */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Star className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Empresa Destacada
            </h3>
            <p className="text-gray-600 mb-4">
              Les empreses destacades apareixen amb un badge vermell "DESTACADA" i tenen prioritat en els resultats de cerca.
            </p>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => updateField('isFeatured', e.target.checked)}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                ⭐ Marcar com a empresa destacada
              </span>
            </label>
            {formData.isFeatured && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-800">
                  🌟 Aquesta empresa apareixerà amb prioritat alta en els llistats i cerques
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empresa Premium */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Empresa Premium
            </h3>
            <p className="text-gray-600 mb-4">
              Les empreses premium mostren un badge daurat "PREMIUM" i tenen accés a funcionalitats especials de la plataforma.
            </p>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => updateField('isPremium', e.target.checked)}
                className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                👑 Marcar com a empresa premium
              </span>
            </label>
            {formData.isPremium && (
              <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💎 Aquesta empresa tindrà accés a funcionalitats premium i visibilitat especial
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estado de la empresa */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-600" />
          Estat de l'Empresa
        </h3>
        <p className="text-gray-600 mb-4">
          Defineix l'estat actual de l'empresa a la plataforma.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.status === 'active' ? 'border-green-500 bg-green-50' : 'border-gray-200'}
          `}>
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === 'active'}
              onChange={(e) => updateField('status', e.target.value)}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Activa</span>
                <span className="text-2xl">🟢</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                L'empresa està activa i visible per a tots els usuaris
              </p>
            </div>
          </label>

          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.status === 'pending' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
          `}>
            <input
              type="radio"
              name="status"
              value="pending"
              checked={formData.status === 'pending'}
              onChange={(e) => updateField('status', e.target.value)}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Pendent</span>
                <span className="text-2xl">🟡</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                L'empresa està pendent de revisió o activació
              </p>
            </div>
          </label>

          <label className={`
            flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50
            ${formData.status === 'suspended' ? 'border-red-500 bg-red-50' : 'border-gray-200'}
          `}>
            <input
              type="radio"
              name="status"
              value="suspended"
              checked={formData.status === 'suspended'}
              onChange={(e) => updateField('status', e.target.value)}
              className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Suspesa</span>
                <span className="text-2xl">🔴</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                L'empresa està suspesa i no és visible públicament
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Resumen de privilegios */}
      {(formData.isVerified || formData.isFeatured || formData.isPremium) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800 font-medium mb-2">
            👑 Resum de Privilegis Seleccionats:
          </p>
          <ul className="text-sm text-purple-700 space-y-1">
            {formData.isVerified && (
              <li>• Badge "VERIFICADA" - mostra confiança i validació</li>
            )}
            {formData.isFeatured && (
              <li>• Badge "DESTACADA" - prioritat alta en cerques i llistats</li>
            )}
            {formData.isPremium && (
              <li>• Badge "PREMIUM" - accés a funcionalitats especials</li>
            )}
            <li>• Estat: <strong>{
              formData.status === 'active' ? 'Activa' :
              formData.status === 'pending' ? 'Pendent' : 'Suspesa'
            }</strong></li>
          </ul>
        </div>
      )}

      {/* Info Box de Privilegios */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          ℹ️ Informació Important:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Aquests privilegis només es poden assignar per administradors</li>
          <li>• Els badges es mostren de forma prominent a les targetes d'empresa</li>
          <li>• Les empreses destacades i premium tenen millor posicionament</li>
          <li>• L'estat "Suspesa" oculta completament l'empresa del directori públic</li>
        </ul>
      </div>
    </div>
  );
};