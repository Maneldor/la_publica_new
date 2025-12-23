'use client'

import Image from 'next/image'
import { WizardFormData, LEVEL_CONFIG, SOURCE_CONFIG } from '@/lib/types/featuredAds'
import { Star, ExternalLink, Eye } from 'lucide-react'

interface AdPreviewProps {
  formData: WizardFormData
  companyName?: string
}

export function AdPreview({ formData, companyName }: AdPreviewProps) {
  const levelConfig = LEVEL_CONFIG[formData.level]
  const sourceConfig = SOURCE_CONFIG[formData.source]
  const publisherName =
    formData.source === 'COMPANY'
      ? companyName
      : formData.source === 'PARTNER'
      ? formData.publisherName
      : 'La Pública'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-500" />
          Vista prèvia
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${levelConfig.bgGradient} ${levelConfig.textColor}`}>
          {levelConfig.icon} {levelConfig.label}
        </span>
      </div>

      {/* Preview card based on level */}
      {formData.level === 'PREMIUM' ? (
        // Slider preview
        <div className="relative aspect-[21/9] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden">
          {formData.images[0] ? (
            <Image
              src={formData.images[0]}
              alt="Preview"
              fill
              className="object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/50">
                <Star className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Afegeix una imatge</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                PREMIUM
              </span>
              {publisherName && (
                <span className="text-white/80 text-sm">{publisherName}</span>
              )}
            </div>
            <h4 className="text-xl font-bold text-white mb-1">
              {formData.title || 'Títol de l\'anunci'}
            </h4>
            <p className="text-white/80 text-sm line-clamp-2">
              {formData.shortDescription || 'Descripció curta de l\'anunci...'}
            </p>
            {formData.ctaText && (
              <button className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm flex items-center gap-2">
                {formData.ctaText}
                {formData.targetBlank && <ExternalLink className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      ) : (
        // Sidebar preview
        <div
          className={`p-4 rounded-xl border-2 transition-all ${
            formData.level === 'STANDARD'
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex gap-3">
            {/* Image or placeholder */}
            <div className="flex-shrink-0">
              {formData.images[0] ? (
                <div className="relative w-16 h-16">
                  <Image
                    src={formData.images[0]}
                    alt="Preview"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                  {formData.title || 'Títol de l\'anunci'}
                </h4>
                {formData.level === 'STANDARD' && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded">
                    DESTACAT
                  </span>
                )}
              </div>
              {publisherName && (
                <p className="text-xs text-gray-500 mt-0.5">{publisherName}</p>
              )}
              {formData.shortDescription && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {formData.shortDescription}
                </p>
              )}
            </div>
          </div>

          {formData.targetBlank && formData.ctaUrl && (
            <div className="flex justify-end mt-2">
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Origen:</span>
          <span className="font-medium text-gray-900 flex items-center gap-1">
            {sourceConfig.icon} {sourceConfig.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Nivell:</span>
          <span className="font-medium text-gray-900">
            {levelConfig.icon} {levelConfig.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Imatges:</span>
          <span className="font-medium text-gray-900">{formData.images.length}</span>
        </div>
        {formData.ctaUrl && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">CTA:</span>
            <span className="font-medium text-gray-900 truncate max-w-[150px]">
              {formData.ctaText || 'Veure més'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
