'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Star, Save, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  WizardFormData,
  Pricing,
  INITIAL_FORM_DATA,
  calculatePrice,
  calculateEndDate
} from '@/lib/types/featuredAds'
import {
  StepOrigin,
  StepDetailsLaPublica,
  StepDetailsPartner,
  StepDetailsEmpresa
} from './components'

const STEPS = [
  { id: 1, title: 'Origen', description: "Selecciona el tipus d'anunciant" },
  { id: 2, title: 'Detalls', description: 'Configura contingut i programació' }
]

export default function CrearAnunciDestacat() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA)
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch pricing data
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/featured-ads/pricing')
        if (res.ok) {
          const data = await res.json()
          setPricing(data.pricing || [])
        }
      } catch (error) {
        console.error('Error fetching pricing:', error)
      }
    }
    fetchPricing()
  }, [])

  const handleChange = (updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear related errors
    const errorKeys = Object.keys(updates)
    if (errorKeys.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        errorKeys.forEach((key) => delete newErrors[key])
        return newErrors
      })
    }
  }

  const validateStep1 = (): boolean => {
    // Step 1 just requires a source selection, which is always set
    return true
  }

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El títol és obligatori'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripció és obligatòria'
    }

    if (formData.images.length === 0) {
      newErrors.images = 'Cal afegir almenys una imatge'
    }

    // Source-specific validation
    if (formData.source === 'COMPANY' && !formData.companyId) {
      newErrors.companyId = 'Has de seleccionar una empresa'
    }

    if (formData.source === 'PARTNER' && !formData.publisherName?.trim()) {
      newErrors.publisherName = 'El nom del partner és obligatori'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) {
      toast.error('Si us plau, revisa els camps obligatoris')
      return
    }

    setIsSubmitting(true)
    try {
      const endDate = calculateEndDate(formData.startsAt, formData.period)
      const price = calculatePrice(pricing, formData.level, formData.period)

      const payload = {
        ...formData,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: endDate.toISOString(),
        price: Math.round(price * 100) // Convert to cents
      }

      const res = await fetch('/api/gestio/anuncis-destacats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Anunci creat correctament!')

        // If invoice was generated, show info
        if (data.invoice) {
          toast.info(`Factura generada: ${data.invoice.invoiceNumber}`)
        }

        router.push('/gestio/anuncis-destacats')
      } else {
        const data = await res.json()
        toast.error(data.error || "Error creant l'anunci")
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de connexió')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepOrigin formData={formData} onChange={handleChange} />
      case 2:
        switch (formData.source) {
          case 'LA_PUBLICA':
            return (
              <StepDetailsLaPublica
                formData={formData}
                onChange={handleChange}
                pricing={pricing}
                errors={errors}
              />
            )
          case 'PARTNER':
            return (
              <StepDetailsPartner
                formData={formData}
                onChange={handleChange}
                pricing={pricing}
                errors={errors}
              />
            )
          case 'COMPANY':
            return (
              <StepDetailsEmpresa
                formData={formData}
                onChange={handleChange}
                pricing={pricing}
                errors={errors}
              />
            )
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/gestio/anuncis-destacats"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Nou Anunci Destacat</h1>
                  <p className="text-sm text-gray-500">
                    Pas {currentStep} de {STEPS.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Step indicator */}
            <div className="hidden md:flex items-center gap-3">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentStep === step.id
                        ? 'bg-purple-100 text-purple-700'
                        : currentStep > step.id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === step.id
                          ? 'bg-purple-600 text-white'
                          : currentStep > step.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">{renderStepContent()}</div>

      {/* Footer actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/gestio/anuncis-destacats"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel·lar
            </Link>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Següent
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creant...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Crear Anunci
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
