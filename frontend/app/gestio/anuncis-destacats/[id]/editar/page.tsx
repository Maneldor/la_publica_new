'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Star,
  Save,
  Upload,
  X,
  Building2,
  Calendar,
  Link as LinkIcon,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'

type FeaturedAdLevel = 'PREMIUM' | 'STANDARD' | 'BASIC'
type FeaturedAdSource = 'LA_PUBLICA' | 'PARTNER' | 'COMPANY'
type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual'

interface Company {
  id: string
  name: string
  logo?: string
}

interface Pricing {
  level: FeaturedAdLevel
  name: string
  priceWeekly: number
  priceMonthly: number
  priceQuarterly: number
  priceBiannual: number
  priceAnnual: number
  features: string[]
}

const LEVEL_CONFIG = {
  PREMIUM: { label: 'Premium', icon: '🌟', description: 'Slider hero principal amb màxima visibilitat', color: 'purple' },
  STANDARD: { label: 'Standard', icon: '⭐', description: 'Sidebar destacat amb badge especial', color: 'amber' },
  BASIC: { label: 'Bàsic', icon: '📌', description: 'Badge destacat i millor posició al llistat', color: 'gray' }
}

const SOURCE_CONFIG = {
  LA_PUBLICA: { label: 'La Pública', description: 'Anunci intern de la plataforma' },
  PARTNER: { label: 'Partner', description: 'Anunci de partner extern' },
  COMPANY: { label: 'Empresa', description: 'Anunci d\'una empresa registrada' }
}

export default function EditarAnunciDestacat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [searchCompany, setSearchCompany] = useState('')
  const [showCompanySearch, setShowCompanySearch] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    level: 'STANDARD' as FeaturedAdLevel,
    source: 'LA_PUBLICA' as FeaturedAdSource,
    companyId: '',
    publisherName: '',
    publisherLogo: '',
    ctaText: 'Veure oferta',
    ctaUrl: '',
    targetBlank: true,
    images: [] as string[],
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Fetch existing ad and companies
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [adRes, companiesRes, pricingRes] = await Promise.all([
          fetch(`/api/gestio/anuncis-destacats/${id}`),
          fetch('/api/gestio/empreses?limit=100'),
          fetch('/api/featured-ads/pricing')
        ])

        if (adRes.ok) {
          const data = await adRes.json()
          const ad = data.ad
          setFormData({
            title: ad.title,
            description: ad.description,
            shortDescription: ad.shortDescription || '',
            level: ad.level,
            source: ad.source,
            companyId: ad.company?.id || '',
            publisherName: ad.publisherName || '',
            publisherLogo: ad.publisherLogo || '',
            ctaText: ad.ctaText || 'Veure oferta',
            ctaUrl: ad.ctaUrl || '',
            targetBlank: ad.targetBlank,
            images: ad.images || [],
            isActive: ad.isActive
          })
          if (ad.company) {
            setSelectedCompany(ad.company)
          }
        }

        if (companiesRes.ok) {
          const data = await companiesRes.json()
          setCompanies(data.empreses || data.data || [])
        }

        if (pricingRes.ok) {
          const data = await pricingRes.json()
          setPricing(data.pricing || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Handle company selection
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
    setFormData(prev => ({ ...prev, companyId: company.id }))
    setShowCompanySearch(false)
    setSearchCompany('')
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages = Array.from(files).map((_, i) =>
      `https://picsum.photos/800/400?random=${Date.now() + i}`
    )
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'El títol és obligatori'
    if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria'
    if (formData.source === 'COMPANY' && !formData.companyId) {
      newErrors.companyId = 'Has de seleccionar una empresa'
    }
    if (formData.source !== 'COMPANY' && !formData.publisherName) {
      newErrors.publisherName = 'El nom del publicador és obligatori'
    }
    if (formData.images.length === 0) newErrors.images = 'Cal afegir almenys una imatge'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/gestio/anuncis-destacats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push(`/gestio/anuncis-destacats/${id}`)
      } else {
        const data = await res.json()
        setErrors({ submit: data.error || 'Error actualitzant l\'anunci' })
      }
    } catch (error) {
      setErrors({ submit: 'Error de connexió' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchCompany.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/gestio/anuncis-destacats/${id}`}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Anunci Destacat</h1>
              <p className="text-gray-500">Modifica les dades de l'anunci</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Active toggle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-semibold text-gray-900">Anunci actiu</p>
                <p className="text-sm text-gray-500">L'anunci es mostrarà als usuaris</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${formData.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </div>
            </label>
          </div>

          {/* Level Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nivell de l'anunci</h2>
            <div className="grid grid-cols-3 gap-4">
              {(Object.entries(LEVEL_CONFIG) as [FeaturedAdLevel, typeof LEVEL_CONFIG.PREMIUM][]).map(([level, config]) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, level }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.level === level
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <p className="font-semibold text-gray-900">{config.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Origen</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {(Object.entries(SOURCE_CONFIG) as [FeaturedAdSource, typeof SOURCE_CONFIG.LA_PUBLICA][]).map(([source, config]) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, source, companyId: '', publisherName: '' }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.source === source
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{config.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                </button>
              ))}
            </div>

            {/* Company selector */}
            {formData.source === 'COMPANY' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Empresa
                </label>
                {selectedCompany ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {selectedCompany.logo ? (
                        <Image src={selectedCompany.logo} alt="" width={40} height={40} className="rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <p className="font-medium text-gray-900">{selectedCompany.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCompany(null)
                        setFormData(prev => ({ ...prev, companyId: '' }))
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cerca una empresa..."
                      value={searchCompany}
                      onChange={(e) => {
                        setSearchCompany(e.target.value)
                        setShowCompanySearch(true)
                      }}
                      onFocus={() => setShowCompanySearch(true)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                    {showCompanySearch && filteredCompanies.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {filteredCompanies.map(company => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleSelectCompany(company)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            {company.logo ? (
                              <Image src={company.logo} alt="" width={32} height={32} className="rounded" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span>{company.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>}
              </div>
            )}

            {/* Publisher name for non-company sources */}
            {formData.source !== 'COMPANY' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom del publicador</label>
                  <input
                    type="text"
                    value={formData.publisherName}
                    onChange={(e) => setFormData(prev => ({ ...prev, publisherName: e.target.value }))}
                    placeholder="Nom de l'empresa o partner"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.publisherName && <p className="text-red-500 text-sm mt-1">{errors.publisherName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo (URL)</label>
                  <input
                    type="url"
                    value={formData.publisherLogo}
                    onChange={(e) => setFormData(prev => ({ ...prev, publisherLogo: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <FileText className="w-5 h-5 inline mr-2" />
              Contingut
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Títol *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Títol de l'anunci destacat"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripció curta</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Breu descripció per al slider (màx. 200 caràcters)"
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripció completa *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripció detallada de l'anunci"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Upload className="w-5 h-5 inline mr-2" />
              Imatges
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  <Image src={img} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Afegir imatge</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
          </div>

          {/* CTA */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <LinkIcon className="w-5 h-5 inline mr-2" />
              Crida a l'acció (CTA)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text del botó</label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                  placeholder="Veure oferta"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de destí</label>
                <input
                  type="url"
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={formData.targetBlank}
                onChange={(e) => setFormData(prev => ({ ...prev, targetBlank: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">Obrir en una nova pestanya</span>
            </label>
          </div>

          {/* Submit */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Link
              href={`/gestio/anuncis-destacats/${id}`}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel·lar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Guardar Canvis
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
