'use client';

import { useState } from 'react';
import { CheckCircle, Eye, Save, Send } from 'lucide-react';
import { AdminEmpresaFormData } from '../../hooks/useAdminCreateEmpresa';

interface Step8Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const Step8Review = ({ formData, errors, onSaveDraft, onPublish }: Step8Props) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    await onPublish();
    setIsPublishing(false);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await onSaveDraft();
    setIsSaving(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'tecnologia': '💻',
      'consultoria-legal': '⚖️',
      'serveis': '🛠️',
      'construccio': '🏗️',
      'educacio': '🎓',
      'salud': '🏥',
      'financers': '💰',
      'transport': '🚛',
      'energia': '⚡',
      'comunicacio': '📢',
      'alimentacio': '🍽️',
      'altres': '📦'
    };
    return icons[category] || '🏢';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisió Final
        </h2>
        <p className="text-gray-600">
          Revisa tota la informació abans de publicar l'empresa a la plataforma
        </p>
      </div>

      {/* Success Alert */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-900">
            Tot llest per publicar!
          </p>
          <p className="text-sm text-green-700 mt-1">
            L'empresa estarà visible al directori públic de La Pública
          </p>
        </div>
      </div>

      {/* Resume Cards */}
      <div className="space-y-4">
        {/* Card 1: Branding */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            Imatges i Branding
          </h3>
          <div className="space-y-3">
            {/* Cover and Logo Preview */}
            <div className="relative">
              {formData.coverImageUrl && (
                <div className="relative">
                  <img
                    src={formData.coverImageUrl}
                    alt="Portada"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="absolute -bottom-6 left-6 w-12 h-12 object-contain rounded-full border-4 border-white shadow-lg"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="pt-2">
              <div className="text-lg font-bold text-gray-900">{formData.name}</div>
              <div className="text-sm text-gray-600">{formData.slogan}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Basic Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            Informació Bàsica
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Categoria:</span>
              <span className="font-medium text-gray-900">
                {getCategoryIcon(formData.category)} {formData.category}
              </span>
            </div>
            {formData.sector && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sector:</span>
                <span className="font-medium text-gray-900">{formData.sector}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Serveis:</span>
              <span className="font-medium text-gray-900">{formData.services.length} seleccionats</span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Descripció:</span>
              <p className="text-gray-900 mt-1 line-clamp-3">{formData.description}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Contact */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Contacte i Ubicació
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telèfon:</span>
              <span className="font-medium text-gray-900">{formData.phone}</span>
            </div>
            {formData.website && (
              <div className="flex justify-between">
                <span className="text-gray-600">Web:</span>
                <span className="font-medium text-blue-600">{formData.website}</span>
              </div>
            )}
            <div className="pt-2 border-t">
              <span className="text-gray-600">Adreça:</span>
              <p className="text-gray-900 mt-1">{formData.address}</p>
            </div>
          </div>
        </div>

        {/* Card 4: Professional Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              4
            </span>
            Informació Professional
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Empleats:</span>
              <span className="font-medium text-gray-900">{formData.employeeRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fundació:</span>
              <span className="font-medium text-gray-900">{formData.foundedYear}</span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Horari tipus:</span>
              <p className="text-gray-900 mt-1">
                Dilluns a Divendres: {formData.schedule.monday || 'No especificat'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 5: Certifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              5
            </span>
            Certificacions i Sectors
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Certificacions:</span>
              <span className="font-medium text-gray-900">{formData.certifications.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sectors públics:</span>
              <span className="font-medium text-gray-900">{formData.publicSectors.length}</span>
            </div>
            {formData.certifications.length > 0 && (
              <div className="pt-2 border-t">
                <span className="text-gray-600 block mb-2">Certificacions principals:</span>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.slice(0, 3).map((cert) => (
                    <span key={cert.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {cert.icon} {cert.name}
                    </span>
                  ))}
                  {formData.certifications.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      +{formData.certifications.length - 3} més
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 6: Team */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              6
            </span>
            Equip i Xarxes Socials
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Membres d'equip:</span>
              <span className="font-medium text-gray-900">{formData.teamMembers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Xarxes socials:</span>
              <span className="font-medium text-gray-900">
                {Object.values(formData.socialMedia).filter(v => v).length} configurades
              </span>
            </div>
          </div>
        </div>

        {/* Card 7: Admin Config */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
              7
            </span>
            👑 Configuració d'Administrador
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Empresa verificada:</span>
              <span className={`font-medium ${formData.isVerified ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.isVerified ? '✅ Sí' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Empresa destacada:</span>
              <span className={`font-medium ${formData.isFeatured ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.isFeatured ? '⭐ Sí' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Empresa premium:</span>
              <span className={`font-medium ${formData.isPremium ? 'text-yellow-600' : 'text-gray-500'}`}>
                {formData.isPremium ? '👑 Sí' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estat:</span>
              <span className={`font-medium ${
                formData.status === 'active' ? 'text-green-600' :
                formData.status === 'pending' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {formData.status === 'active' ? '🟢 Activa' :
                 formData.status === 'pending' ? '🟡 Pendent' : '🔴 Suspesa'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Vista Prèvia de l'Empresa</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Preview content - simplified company card */}
              <div className="space-y-4">
                {formData.coverImageUrl && (
                  <div className="relative">
                    <img
                      src={formData.coverImageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {formData.logoUrl && (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="absolute -bottom-8 left-6 w-16 h-16 object-contain rounded-full border-4 border-white shadow-lg"
                      />
                    )}
                  </div>
                )}

                <div className="pt-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                      <p className="text-gray-600">{formData.slogan}</p>
                      <div className="flex gap-2 mt-2">
                        {formData.isVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            ✅ VERIFICADA
                          </span>
                        )}
                        {formData.isFeatured && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                            ⭐ DESTACADA
                          </span>
                        )}
                        {formData.isPremium && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            👑 PREMIUM
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">📧 {formData.email}</p>
                      <p className="text-sm text-gray-500">📞 {formData.phone}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{formData.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Categoria:</span>
                      <p className="text-gray-600">{getCategoryIcon(formData.category)} {formData.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Empleats:</span>
                      <p className="text-gray-600">{formData.employeeRange}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
        >
          <Eye className="w-5 h-5" />
          {showPreview ? 'Tancar Vista Prèvia' : 'Vista Prèvia'}
        </button>

        <button
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Guardant...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Esborrany
            </>
          )}
        </button>

        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className={`
            flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all
            ${isPublishing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
            }
            text-white
          `}
        >
          {isPublishing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Publicant...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Publicar Empresa
            </>
          )}
        </button>
      </div>
    </div>
  );
};