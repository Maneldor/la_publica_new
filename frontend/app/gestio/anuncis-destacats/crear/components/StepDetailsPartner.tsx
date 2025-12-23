'use client'

import { useState } from 'react'
import {
  WizardFormData,
  Pricing,
  FeaturedAdLevel,
  AdvancedScheduling,
  LEVEL_CONFIG,
  calculatePrice
} from '@/lib/types/featuredAds'
import {
  FileText,
  Link as LinkIcon,
  Sparkles,
  Users,
  Mail,
  User,
  Image as ImageIcon
} from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import { AdPreview } from './AdPreview'
import { SchedulingSection } from './SchedulingSection'

interface StepDetailsPartnerProps {
  formData: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  pricing: Pricing[]
  errors: Record<string, string>
}

export function StepDetailsPartner({
  formData,
  onChange,
  pricing,
  errors
}: StepDetailsPartnerProps) {
  const [showPreview, setShowPreview] = useState(false)
  const currentPrice = calculatePrice(pricing, formData.level, formData.scheduling.period)

  const handleSchedulingChange = (scheduling: AdvancedScheduling) => {
    onChange({
      scheduling,
      startsAt: scheduling.startsAt,
      period: scheduling.period
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Detalls de l'anunci de Partner</h2>
          <p className="text-gray-500">Anunci extern - requereix dades del partner</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          {showPreview ? 'Amagar vista prèvia' : 'Veure vista prèvia'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Partner Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Informació del Partner
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nom del Partner *
                </label>
                <input
                  type="text"
                  value={formData.publisherName}
                  onChange={(e) => onChange({ publisherName: e.target.value })}
                  placeholder="Nom de l'empresa partner"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.publisherName ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.publisherName && (
                  <p className="text-red-500 text-sm mt-1">{errors.publisherName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Logo (URL)
                </label>
                <input
                  type="url"
                  value={formData.publisherLogo}
                  onChange={(e) => onChange({ publisherLogo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Persona de contacte
                </label>
                <input
                  type="text"
                  value={formData.partnerContact}
                  onChange={(e) => onChange({ partnerContact: e.target.value })}
                  placeholder="Nom del contacte"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email de contacte
                </label>
                <input
                  type="email"
                  value={formData.partnerEmail}
                  onChange={(e) => onChange({ partnerEmail: e.target.value })}
                  placeholder="email@partner.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Level Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Nivell de l'anunci
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(LEVEL_CONFIG) as [FeaturedAdLevel, typeof LEVEL_CONFIG.PREMIUM][]).map(
                ([level, config]) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange({ level })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.level === level
                        ? `border-${config.color}-500 bg-gradient-to-br ${config.bgGradient}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <p className="font-semibold text-gray-900">{config.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Advanced Scheduling */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SchedulingSection
              scheduling={formData.scheduling}
              onChange={handleSchedulingChange}
              showPricing={true}
              currentPrice={currentPrice}
            />
            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-green-700">Partner extern</span>
              <span className="text-sm font-medium text-green-700">Gestió manual de pagament</span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Contingut
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Títol *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  placeholder="Títol de l'anunci destacat"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripció curta
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => onChange({ shortDescription: e.target.value })}
                  placeholder="Breu descripció per al slider (màx. 200 caràcters)"
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.shortDescription.length}/200 caràcters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripció completa *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder="Descripció detallada de l'anunci"
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ImageUploader
              images={formData.images}
              onChange={(images) => onChange({ images })}
              error={errors.images}
            />
          </div>

          {/* CTA */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-orange-500" />
              Crida a l'acció (CTA)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text del botó
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => onChange({ ctaText: e.target.value })}
                  placeholder="Veure més"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de destí</label>
                <input
                  type="url"
                  value={formData.ctaUrl}
                  onChange={(e) => onChange({ ctaUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={formData.targetBlank}
                onChange={(e) => onChange({ targetBlank: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">Obrir en una nova pestanya</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AdPreview formData={formData} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
