'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CreditCard, Palette, ClipboardCheck } from 'lucide-react'

import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import { BasicInfoStep } from '@/components/gestio-empreses/plans/BasicInfoStep'
import { PricingStep } from '@/components/gestio-empreses/plans/PricingStep'
import { AppearanceStep } from '@/components/gestio-empreses/plans/AppearanceStep'
import { FeaturesStep } from '@/components/gestio-empreses/plans/FeaturesStep'

interface Feature {
  id: string
  text: string
}

interface PlanFormData {
  name: string
  slug: string
  tier: string
  description: string
  basePrice: number
  firstYearDiscount: number
  maxTeamMembers: number
  maxActiveOffers: number
  maxFeaturedOffers: number
  maxStorage: number
  color: string
  isActive: boolean
  isVisible: boolean
  destacado: boolean
  hasFreeTrial: boolean
  trialDurationDays: number
  features: Feature[]
}

const wizardSteps = [
  {
    label: 'Bàsic',
    description: 'Informació fonamental',
    icon: Building2
  },
  {
    label: 'Preus',
    description: 'Configurar preus i límits',
    icon: CreditCard
  },
  {
    label: 'Aparença',
    description: 'Personalitzar estil',
    icon: Palette
  },
  {
    label: 'Funcionalitats',
    description: 'Revisar i finalitzar',
    icon: ClipboardCheck
  },
]

export default function CrearPlanPage() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    slug: '',
    tier: '',
    description: '',
    basePrice: 0,
    firstYearDiscount: 0,
    maxTeamMembers: 5,
    maxActiveOffers: 10,
    maxFeaturedOffers: 2,
    maxStorage: 10,
    color: '#3b82f6',
    isActive: true,
    isVisible: true,
    destacado: false,
    hasFreeTrial: false,
    trialDurationDays: 30,
    features: [],
  })

  const updateFormData = (updates: Partial<PlanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))

    // Clear errors for updated fields
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => {
        delete newErrors[field]
      })
      return newErrors
    })
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'El nom del pla és obligatori'
        if (!formData.slug.trim()) newErrors.slug = 'El slug és obligatori'
        if (!formData.tier) newErrors.tier = 'Has de seleccionar un tier'
        if (formData.description.length > 200) newErrors.description = 'La descripció no pot superar els 200 caràcters'
        break
      case 2:
        if (formData.basePrice < 0) newErrors.basePrice = 'El preu no pot ser negatiu'
        if (formData.firstYearDiscount < 0 || formData.firstYearDiscount > 1) {
          newErrors.firstYearDiscount = 'El descompte ha de ser entre 0 i 100%'
        }
        if (formData.maxTeamMembers < -1 || formData.maxTeamMembers === 0) {
          newErrors.maxTeamMembers = 'Els membres han de ser -1 (il·limitat) o > 0'
        }
        break
      case 3:
        if (!formData.color) newErrors.color = 'Has de seleccionar un color'
        if (formData.hasFreeTrial && (formData.trialDurationDays < 1 || formData.trialDurationDays > 365)) {
          newErrors.trialDurationDays = 'La durada del trial ha de ser entre 1 i 365 dies'
        }
        break
      case 4:
        // No additional validations for step 4
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const canProceedToStep = (step: number) => {
    if (step === 1) return true

    // Check previous step validations without calling setErrors
    for (let i = 1; i < step; i++) {
      const stepErrors: Record<string, string> = {}

      switch (i) {
        case 1:
          if (!formData.name.trim()) stepErrors.name = 'El nom del pla és obligatori'
          if (!formData.slug.trim()) stepErrors.slug = 'El slug és obligatori'
          if (!formData.tier) stepErrors.tier = 'Has de seleccionar un tier'
          if (formData.description.length > 200) stepErrors.description = 'La descripció no pot superar els 200 caràcters'
          break
        case 2:
          if (formData.basePrice < 0) stepErrors.basePrice = 'El preu no pot ser negatiu'
          if (formData.firstYearDiscount < 0 || formData.firstYearDiscount > 1) {
            stepErrors.firstYearDiscount = 'El descompte ha de ser entre 0 i 100%'
          }
          if (formData.maxTeamMembers < -1 || formData.maxTeamMembers === 0) {
            stepErrors.maxTeamMembers = 'Els membres han de ser -1 (il·limitat) o > 0'
          }
          break
        case 3:
          if (!formData.color) stepErrors.color = 'Has de seleccionar un color'
          if (formData.hasFreeTrial && (formData.trialDurationDays < 1 || formData.trialDurationDays > 365)) {
            stepErrors.trialDurationDays = 'La durada del trial ha de ser entre 1 i 365 dies'
          }
          break
      }

      if (Object.keys(stepErrors).length > 0) return false
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1)
      } else {
        handleCreatePlan()
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleCreatePlan = async () => {
    setIsLoading(true)

    try {
      const planData = {
        ...formData,
        funcionalidades: formData.features.map(f => f.text).join('\n'),
      }

      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/gestio/admin/plans/${result.data.id}`)
      } else {
        alert('Error al crear el pla: ' + (result.error || 'Error desconegut'))
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('Error al crear el pla')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )
      case 2:
        return (
          <PricingStep
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )
      case 3:
        return (
          <AppearanceStep
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )
      case 4:
        return (
          <FeaturesStep
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )
      default:
        return null
    }
  }

  return (
    <WizardLayout
      title="Crear Nou Pla"
      description="Wizard de creació de plans de subscripció"
      steps={wizardSteps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onCancel={() => router.back()}
      canProceed={canProceedToStep(currentStep + 1) || currentStep === 4}
      isLoading={isLoading}
      nextLabel="Següent"
      prevLabel="Anterior"
      finalLabel="Crear Pla"
      centerContent={false}
    >
      {renderStepContent()}
    </WizardLayout>
  )
}