// app/gestio/empreses/[id]/completar/CompletarEmpresaWizard.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  FileText,
  Phone,
  Globe,
  Briefcase,
  Image,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import {
  EmpresaCompletarData,
  updateEmpresaStep,
  enviarAVerificacio
} from '@/lib/gestio-empreses/actions/empresa-completar-actions'
import { toast } from 'sonner'

// Steps
import { Step1DadesBàsiques } from './steps/Step1DadesBàsiques'
import { Step2DadesObligatòries } from './steps/Step2DadesObligatòries'
import { Step3ContacteAdmin } from './steps/Step3ContacteAdmin'
import { Step4ContactePublic } from './steps/Step4ContactePublic'
import { Step5InformacioAmpliada } from './steps/Step5InformacioAmpliada'
import { Step6BrandingXarxes } from './steps/Step6BrandingXarxes'
import { Step7Configuracio } from './steps/Step7Configuracio'

interface Props {
  empresa: EmpresaCompletarData
}

const STEPS = [
  { label: 'Bàsiques', description: 'Nom, CIF, Email, Pla', icon: Building2 },
  { label: 'Obligatòries', description: 'Eslògan, Descripció, Logo', icon: FileText },
  { label: 'Admin', description: 'Dades privades gestió', icon: Phone },
  { label: 'Públic', description: 'Visible al directori', icon: Globe },
  { label: 'Ampliada', description: 'Sector, serveis', icon: Briefcase },
  { label: 'Branding', description: 'Galeria, xarxes socials', icon: Image },
  { label: 'Configuració', description: 'Estat i revisió final', icon: Settings }
]

export function CompletarEmpresaWizard({ empresa }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<EmpresaCompletarData>(empresa)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stepValid, setStepValid] = useState(true)

  const updateField = useCallback((field: keyof EmpresaCompletarData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name?.trim()) newErrors.name = 'El nom és obligatori'
        if (!formData.cif?.trim()) newErrors.cif = 'El CIF és obligatori'
        if (!formData.email?.trim()) newErrors.email = 'L\'email és obligatori'
        break

      case 2:
        if (!formData.slogan?.trim()) newErrors.slogan = 'L\'eslògan és obligatori'
        if (!formData.description?.trim()) newErrors.description = 'La descripció és obligatòria'
        if (formData.description && formData.description.length < 50) {
          newErrors.description = 'La descripció ha de tenir mínim 50 caràcters'
        }
        break

      case 3:
        if (!formData.adminContactPerson?.trim()) newErrors.adminContactPerson = 'Persona de contacte és obligatòria'
        if (!formData.adminPhone?.trim()) newErrors.adminPhone = 'Telèfon admin és obligatori'
        if (!formData.adminEmail?.trim()) newErrors.adminEmail = 'Email admin és obligatori'
        break

      // Steps 4, 5, 6 són opcionals
      case 4:
      case 5:
      case 6:
        break

      case 7:
        // Validació final
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Revisa els camps marcats en vermell')
      return
    }

    setIsLoading(true)

    try {
      // Guardar dades del step actual
      const result = await updateEmpresaStep(formData.id, currentStep, formData)

      if (!result.success) {
        toast.error(result.error || 'Error guardant les dades')
        setIsLoading(false)
        return
      }

      if (currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1)
        toast.success('Pas guardat correctament')
      } else {
        // Últim pas - Enviar a verificació
        const verifyResult = await enviarAVerificacio(formData.id)

        if (verifyResult.success) {
          toast.success('Perfil completat i enviat a verificació')
          router.push('/gestio/empreses')
        } else {
          toast.error(verifyResult.error || 'Error enviant a verificació')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error inesperat')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleCancel = () => {
    if (confirm('Vols sortir? Els canvis no guardats es perdran.')) {
      router.push('/gestio/empreses')
    }
  }

  const renderStep = () => {
    const stepProps = {
      formData,
      updateField,
      errors
    }

    switch (currentStep) {
      case 1:
        return <Step1DadesBàsiques {...stepProps} />
      case 2:
        return <Step2DadesObligatòries {...stepProps} />
      case 3:
        return <Step3ContacteAdmin {...stepProps} />
      case 4:
        return <Step4ContactePublic {...stepProps} />
      case 5:
        return <Step5InformacioAmpliada {...stepProps} />
      case 6:
        return <Step6BrandingXarxes {...stepProps} />
      case 7:
        return <Step7Configuracio {...stepProps} />
      default:
        return null
    }
  }

  return (
    <WizardLayout
      title={`Completar Perfil: ${formData.name}`}
      description={`${formData.completionPercentage ?? 0}% completat`}
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onCancel={handleCancel}
      canProceed={true}
      isLoading={isLoading}
      nextLabel="Desar i Continuar"
      prevLabel="Anterior"
      finalLabel="Completar i Enviar a Verificació"
      showProgress={true}
      centerContent={false}
    >
      {/* Barra de completitud */}
      <div className="mb-6 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Perfil completat</span>
          <span className="text-sm font-semibold text-blue-600">{formData.completionPercentage ?? 0}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${formData.completionPercentage ?? 0}%` }}
          />
        </div>
        {(formData.completionPercentage ?? 0) < 100 && (
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
            Completa tots els camps obligatoris per poder publicar
          </p>
        )}
      </div>

      {/* Step content */}
      {renderStep()}
    </WizardLayout>
  )
}