'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Euro, CheckCircle } from 'lucide-react'
import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import { BasicInfoStep } from '@/components/gestio-empreses/extras/crear/BasicInfoStep'
import { PricingStep } from '@/components/gestio-empreses/extras/crear/PricingStep'
import { ReviewStep } from '@/components/gestio-empreses/extras/crear/ReviewStep'
import toast from 'react-hot-toast'

const steps = [
  { label: 'Bàsic', description: 'Informació bàsica', icon: FileText },
  { label: 'Preus', description: 'Preu i descompte', icon: Euro },
  { label: 'Revisar', description: 'Confirmar i crear', icon: CheckCircle },
]

type ExtraCategory =
  | 'WEB_MAINTENANCE' | 'BRANDING' | 'MARKETING' | 'SEO'
  | 'CONTENT' | 'CONSULTING' | 'TRAINING' | 'DEVELOPMENT'
  | 'SUPPORT' | 'OTHER'

type PriceType = 'FIXED' | 'MONTHLY' | 'ANNUAL' | 'HOURLY' | 'CUSTOM'

export default function CrearExtraPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Form data
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'WEB_MAINTENANCE' as ExtraCategory,
    icon: 'Wrench',
  })

  const [pricing, setPricing] = useState({
    basePrice: 0,
    discount: 0,
    priceType: 'MONTHLY' as PriceType,
    active: true,
    featured: false,
  })

  // Validació per pas
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return basicInfo.name && basicInfo.description && basicInfo.icon
      case 2:
        return pricing.basePrice > 0
      case 3:
        return true
      default:
        return false
    }
  }

  // Navegació
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleCreate()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCancel = () => {
    router.push('/gestio/admin/extras')
  }

  // Crear extra
  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const extraData = {
        name: basicInfo.name,
        slug: basicInfo.slug,
        description: basicInfo.description,
        category: basicInfo.category,
        icon: basicInfo.icon,
        basePrice: pricing.basePrice,
        discount: pricing.discount,
        priceType: pricing.priceType,
        active: pricing.active,
        featured: pricing.featured,
      }

      const response = await fetch('/api/admin/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extraData),
      })

      if (response.ok) {
        toast.success('Extra creat correctament!')
        router.push('/gestio/admin/extras')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error creant l\'extra')
      }
    } catch (error) {
      console.error('Error creant extra:', error)
      toast.error('Error de connexió')
    } finally {
      setIsLoading(false)
    }
  }

  // Renderitzar contingut del pas
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={basicInfo} onChange={setBasicInfo} />
      case 2:
        return <PricingStep data={pricing} onChange={setPricing} />
      case 3:
        return <ReviewStep basicInfo={basicInfo} pricing={pricing} />
      default:
        return null
    }
  }

  return (
    <WizardLayout
      title="Crear Nou Extra"
      description="Configura un nou servei extra per oferir als clients"
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onCancel={handleCancel}
      canProceed={canProceed()}
      isLoading={isLoading}
      nextLabel="Següent"
      finalLabel="Crear Extra"
    >
      {renderStepContent()}
    </WizardLayout>
  )
}