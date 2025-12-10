// steps/Step6BrandingXarxes.tsx
'use client'

import { useState } from 'react'
import { Image as ImageIcon, Upload, X, Palette, Award, Share2, Award as AwardIcon } from 'lucide-react'
import { EmpresaCompletarData } from '@/lib/gestio-empreses/actions/empresa-completar-actions'

interface Props {
  formData: EmpresaCompletarData
  updateField: (field: keyof EmpresaCompletarData, value: any) => void
  errors: Record<string, string>
}

export function Step6BrandingXarxes({ formData, updateField, errors }: Props) {
  const [newCertification, setNewCertification] = useState('')

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const urls = files.map(file => URL.createObjectURL(file))
    const gallery = [...(formData.gallery || []), ...urls]
    updateField('gallery', gallery)
  }

  const removeGalleryImage = (index: number) => {
    const gallery = formData.gallery?.filter((_, i) => i !== index) || []
    updateField('gallery', gallery)
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      const certifications = [...(formData.certifications || []), newCertification.trim()]
      updateField('certifications', certifications)
      setNewCertification('')
    }
  }

  const removeCertification = (index: number) => {
    const certifications = formData.certifications?.filter((_, i) => i !== index) || []
    updateField('certifications', certifications)
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="h-5 w-5 text-purple-600 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-purple-900">Branding i Xarxes Socials</p>
            <p className="text-sm text-purple-700 mt-1">
              Imatges, colors corporatius i presència digital per millorar la presentació de l'empresa.
            </p>
          </div>
        </div>
      </div>

      {/* Galeria d'imatges */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
          Galeria d'imatges
        </h3>

        <div className="space-y-4">
          {/* Upload */}
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
              id="gallery-upload"
            />
            <label
              htmlFor="gallery-upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" strokeWidth={1.5} />
              Afegir imatges
            </label>
            <p className="text-xs text-slate-500 mt-2">
              Puja imatges de l'empresa, oficines, equip o projectes (màx 10 imatges)
            </p>
          </div>

          {/* Galeria actual */}
          {formData.gallery && formData.gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.gallery.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Galeria ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colors corporatius */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4" strokeWidth={1.5} />
          Colors corporatius
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Color principal
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.brandColors?.primary || '#000000'}
                onChange={(e) => updateField('brandColors', { ...formData.brandColors, primary: e.target.value })}
                className="w-12 h-10 border border-slate-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.brandColors?.primary || '#000000'}
                onChange={(e) => updateField('brandColors', { ...formData.brandColors, primary: e.target.value })}
                className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Color secundari
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.brandColors?.secondary || '#666666'}
                onChange={(e) => updateField('brandColors', { ...formData.brandColors, secondary: e.target.value })}
                className="w-12 h-10 border border-slate-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.brandColors?.secondary || '#666666'}
                onChange={(e) => updateField('brandColors', { ...formData.brandColors, secondary: e.target.value })}
                className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#666666"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Color d'accent
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.brandColors?.accent || '#0066cc'}
                onChange={(e) => updateField('brandColors', { ...formData.brandColors, accent: e.target.value })}
                className="w-12 h-10 border border-slate-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.brandColors?.accent || '#0066cc'}
                onChange={(e) => updateField('brandColors', { ...formData.brandColors, accent: e.target.value })}
                className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#0066cc"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Xarxes socials */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Share2 className="h-4 w-4" strokeWidth={1.5} />
          Xarxes socials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.socialMediaLinkedIn || ''}
              onChange={(e) => updateField('socialMediaLinkedIn', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.linkedin.com/company/empresa"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Facebook
            </label>
            <input
              type="url"
              value={formData.socialMediaFacebook || ''}
              onChange={(e) => updateField('socialMediaFacebook', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.facebook.com/empresa"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Instagram
            </label>
            <input
              type="url"
              value={formData.socialMediaInstagram || ''}
              onChange={(e) => updateField('socialMediaInstagram', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.instagram.com/empresa"
            />
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Twitter
            </label>
            <input
              type="url"
              value={formData.socialMediaTwitter || ''}
              onChange={(e) => updateField('socialMediaTwitter', e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.twitter.com/empresa"
            />
          </div>
        </div>
      </div>

      {/* Certificacions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
          <AwardIcon className="h-4 w-4" strokeWidth={1.5} />
          Certificacions i reconeixements
        </h3>

        <div className="space-y-3">
          {/* Afegir certificació */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCertification()}
              className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: ISO 9001:2015"
              maxLength={100}
            />
            <button
              type="button"
              onClick={addCertification}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Afegir
            </button>
          </div>

          {/* Llista certificacions */}
          {formData.certifications && formData.certifications.length > 0 && (
            <div className="space-y-2">
              {formData.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                    <span className="text-sm text-slate-900">{cert}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-600">
          <strong>Nota:</strong> La galeria d'imatges i colors corporatius ajuden a millorar
          la presentació de l'empresa al directori. Les xarxes socials permeten als usuaris
          connectar fàcilment amb l'empresa.
        </p>
      </div>
    </div>
  )
}