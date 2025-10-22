'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Eye, Send } from 'lucide-react';
import { AnunciFormData } from '../../hooks/useCreateAnunci';

interface Step5Props {
  formData: AnunciFormData;
  errors: Record<string, string>;
  onPublish: () => void;
}

export const Step5Review = ({ formData, errors, onPublish }: Step5Props) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);

    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000));

    onPublish();
  };

  // Obtener preview de la primera imagen
  const getMainImagePreview = () => {
    if (formData.images.length === 0) return null;
    const mainImage = formData.images[formData.mainImageIndex];
    return URL.createObjectURL(mainImage);
  };

  const getCategoryLabel = (value: string) => {
    const categories: Record<string, string> = {
      'tecnologia': '💻 Tecnologia',
      'vehicles': '🚗 Vehicles',
      'immobiliaria': '🏠 Immobiliària',
      'moda': '👔 Moda i Complements',
      'esports': '⚽ Esports i Oci',
      'llar': '🏡 Llar i Jardí',
      'serveis': '🔧 Serveis Professionals',
      'altres': '📦 Altres',
    };
    return categories[value] || value;
  };

  const getConditionLabel = (value: string) => {
    const conditions: Record<string, string> = {
      'nou': '🆕 Nou - Sense estrenar',
      'com_nou': '✨ Com nou - Usat molt poc',
      'usat': '📦 Usat - Bon estat',
    };
    return conditions[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisió Final
        </h2>
        <p className="text-gray-600">
          Revisa la informació abans de publicar el teu anunci
        </p>
      </div>

      {/* Alert de éxito potencial */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-900">
            Tot llest per publicar!
          </p>
          <p className="text-sm text-green-700 mt-1">
            El teu anunci estarà visible per a tots els usuaris de La Pública
          </p>
        </div>
      </div>

      {/* Resumen en Cards */}
      <div className="space-y-4">
        {/* Card 1: Información Básica */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            Informació Bàsica
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Títol:</span>
              <span className="font-medium text-gray-900 text-right max-w-xs">
                {formData.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tipus:</span>
              <span className={`font-medium ${formData.type === 'oferta' ? 'text-blue-600' : 'text-green-600'}`}>
                {formData.type === 'oferta' ? '📤 Oferta' : '📥 Demanda'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Categoria:</span>
              <span className="font-medium text-gray-900">
                {getCategoryLabel(formData.category)}
              </span>
            </div>
            <div className="pt-3 border-t">
              <span className="text-gray-600">Descripció:</span>
              <p className="text-gray-900 mt-1 line-clamp-3">
                {formData.description}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Detalles y Precio */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            Detalls i Preu
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Preu:</span>
              <span className="font-bold text-lg text-gray-900">
                {formData.price ? `${formData.price.toFixed(2)}€` : 'A consultar'}
              </span>
            </div>
            {formData.price && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tipus de preu:</span>
                <span className="font-medium text-gray-900">
                  {formData.priceType === 'fix' ? 'Fix' : 'Negociable'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Estat:</span>
              <span className="font-medium text-gray-900">
                {getConditionLabel(formData.condition)}
              </span>
            </div>
            {Object.keys(formData.specifications).length > 0 && (
              <div className="pt-3 border-t">
                <span className="text-gray-600 block mb-2">Especificacions:</span>
                <div className="space-y-1">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Ubicación */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Ubicació i Enviament
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Província:</span>
              <span className="font-medium text-gray-900 capitalize">
                {formData.province}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Població:</span>
              <span className="font-medium text-gray-900">
                {formData.city}
              </span>
            </div>
            {formData.postalCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Codi Postal:</span>
                <span className="font-medium text-gray-900">
                  {formData.postalCode}
                </span>
              </div>
            )}
            <div className="pt-3 border-t">
              <span className="text-gray-600 block mb-2">Opcions d'entrega:</span>
              <div className="flex flex-wrap gap-2">
                {formData.pickupAvailable && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    📦 Recollida
                  </span>
                )}
                {formData.shippingAvailable && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    🚚 Enviament
                  </span>
                )}
                {formData.shippingIncluded && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✅ Enviament inclòs
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Imágenes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              4
            </span>
            Imatges ({formData.images.length})
          </h3>
          {getMainImagePreview() && (
            <div className="relative">
              <img
                src={getMainImagePreview()!}
                alt="Vista prèvia"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Imatge principal
              </div>
              {formData.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  +{formData.images.length - 1} més
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vista Previa Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Vista Prèvia de l'Anunci</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Preview content */}
              <div className="space-y-4">
                {getMainImagePreview() && (
                  <img
                    src={getMainImagePreview()!}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{formData.title}</h2>
                    <p className="text-gray-600">{getCategoryLabel(formData.category)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formData.price ? `${formData.price.toFixed(2)}€` : 'A consultar'}
                    </p>
                    {formData.price && formData.priceType === 'negociable' && (
                      <p className="text-sm text-gray-500">Negociable</p>
                    )}
                  </div>
                </div>

                <p className="text-gray-700">{formData.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Ubicació:</span>
                    <p className="text-gray-600">{formData.city}, {formData.province}</p>
                  </div>
                  <div>
                    <span className="font-medium">Estat:</span>
                    <p className="text-gray-600">{getConditionLabel(formData.condition)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
        >
          <Eye className="w-5 h-5" />
          {showPreview ? 'Tancar Vista Prèvia' : 'Vista Prèvia'}
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
              Publicar Anunci
            </>
          )}
        </button>
      </div>
    </div>
  );
};