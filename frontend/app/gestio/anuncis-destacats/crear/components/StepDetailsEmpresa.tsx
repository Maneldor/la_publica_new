'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  WizardFormData,
  Pricing,
  Company,
  FeaturedAdLevel,
  AdvancedScheduling,
  LEVEL_CONFIG,
  calculatePrice
} from '@/lib/types/featuredAds'
import {
  FileText,
  Link as LinkIcon,
  Sparkles,
  Building2,
  Receipt,
  Search,
  X,
  CreditCard,
  Landmark,
  Info
} from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import { AdPreview } from './AdPreview'
import { SchedulingSection } from './SchedulingSection'

interface StepDetailsEmpresaProps {
  formData: WizardFormData
  onChange: (updates: Partial<WizardFormData>) => void
  pricing: Pricing[]
  errors: Record<string, string>
}

export function StepDetailsEmpresa({
  formData,
  onChange,
  pricing,
  errors
}: StepDetailsEmpresaProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const currentPrice = calculatePrice(pricing, formData.level, formData.scheduling.period)
  const taxRate = 21
  const subtotal = currentPrice
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  const handleSchedulingChange = (scheduling: AdvancedScheduling) => {
    onChange({
      scheduling,
      startsAt: scheduling.startsAt,
      period: scheduling.period
    })
  }

  // Search companies
  useEffect(() => {
    const searchCompanies = async () => {
      if (searchQuery.length < 2) {
        setCompanies([])
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(`/api/empreses/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setCompanies(data.empreses || [])
        }
      } catch (error) {
        console.error('Error searching companies:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchCompanies, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Load company if ID is set
  useEffect(() => {
    const loadCompany = async () => {
      if (formData.companyId && !selectedCompany) {
        try {
          const res = await fetch(`/api/gestio/empreses/${formData.companyId}`)
          if (res.ok) {
            const data = await res.json()
            setSelectedCompany(data.empresa || data)
            // Prefill invoice data
            if (data.empresa || data) {
              const company = data.empresa || data
              onChange({
                invoiceData: {
                  clientName: company.name,
                  clientCif: company.cif || '',
                  clientEmail: company.email || '',
                  clientAddress: company.address || '',
                  paymentMethod: formData.invoiceData?.paymentMethod || 'TRANSFER',
                  notes: formData.invoiceData?.notes || ''
                }
              })
            }
          }
        } catch (error) {
          console.error('Error loading company:', error)
        }
      }
    }
    loadCompany()
  }, [formData.companyId])

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
    setShowDropdown(false)
    setSearchQuery('')
    onChange({
      companyId: company.id,
      invoiceData: {
        clientName: company.name,
        clientCif: company.cif || '',
        clientEmail: company.email || '',
        clientAddress: company.address || '',
        paymentMethod: formData.invoiceData?.paymentMethod || 'TRANSFER',
        notes: formData.invoiceData?.notes || ''
      }
    })
  }

  const handleClearCompany = () => {
    setSelectedCompany(null)
    onChange({
      companyId: '',
      invoiceData: {
        clientName: '',
        clientCif: '',
        clientEmail: '',
        clientAddress: '',
        paymentMethod: 'TRANSFER',
        notes: ''
      }
    })
  }

  const updateInvoiceData = (field: string, value: string) => {
    onChange({
      invoiceData: {
        ...formData.invoiceData!,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Detalls de l'anunci d'Empresa</h2>
          <p className="text-gray-500">Amb generació de factura automàtica</p>
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
          {/* Company Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              Selecciona l'empresa *
            </h3>

            {selectedCompany ? (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  {selectedCompany.logo ? (
                    <Image
                      src={selectedCompany.logo}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{selectedCompany.name}</p>
                    {selectedCompany.cif && (
                      <p className="text-sm text-gray-500">CIF: {selectedCompany.cif}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCompany}
                  className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Cerca per nom o CIF..."
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.companyId ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {showDropdown && companies.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleSelectCompany(company)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          {company.cif && (
                            <p className="text-xs text-gray-500">CIF: {company.cif}</p>
                          )}
                        </div>
                        <span
                          className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                            company.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {company.status === 'APPROVED' ? 'Activa' : 'Pendent'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {errors.companyId && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
                )}
              </div>
            )}
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
              showPricing={false}
              currentPrice={currentPrice}
            />
          </div>

          {/* Invoice Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-500" />
                Facturació
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.generateInvoice}
                  onChange={(e) => onChange({ generateInvoice: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Generar factura</span>
              </label>
            </div>

            {formData.generateInvoice && (
              <>
                {/* Price Summary */}
                <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA ({taxRate}%)</span>
                      <span className="font-medium text-gray-900">{taxAmount.toFixed(2)} €</span>
                    </div>
                    <div className="border-t border-green-200 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-700">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom fiscal
                      </label>
                      <input
                        type="text"
                        value={formData.invoiceData?.clientName || ''}
                        onChange={(e) => updateInvoiceData('clientName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CIF/NIF</label>
                      <input
                        type="text"
                        value={formData.invoiceData?.clientCif || ''}
                        onChange={(e) => updateInvoiceData('clientCif', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.invoiceData?.clientEmail || ''}
                      onChange={(e) => updateInvoiceData('clientEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adreça</label>
                    <input
                      type="text"
                      value={formData.invoiceData?.clientAddress || ''}
                      onChange={(e) => updateInvoiceData('clientAddress', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mètode de pagament
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'TRANSFER', label: 'Transferència', icon: Landmark },
                        { value: 'CARD', label: 'Targeta', icon: CreditCard },
                        { value: 'DOMICILIATION', label: 'Domiciliació', icon: Receipt }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updateInvoiceData(
                              'paymentMethod',
                              value as 'TRANSFER' | 'CARD' | 'DOMICILIATION'
                            )
                          }
                          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                            formData.invoiceData?.paymentMethod === value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes de factura
                    </label>
                    <textarea
                      value={formData.invoiceData?.notes || ''}
                      onChange={(e) => updateInvoiceData('notes', e.target.value)}
                      placeholder="Notes opcionals per la factura..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    La factura es generarà automàticament un cop confirmat l'anunci i quedarà pendent
                    de pagament.
                  </p>
                </div>
              </>
            )}
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
              <AdPreview formData={formData} companyName={selectedCompany?.name} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
