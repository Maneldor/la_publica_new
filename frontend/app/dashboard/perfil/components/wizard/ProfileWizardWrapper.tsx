/**
 * @deprecated Aquest component ja no s'utilitza.
 * El wizard de perfil ara es troba a /dashboard/perfil/editar/page.tsx
 * i s'integra dins del layout del dashboard amb sidebar.
 * Aquest fitxer es manté temporalment per referència.
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  User,
  Info,
  Share2,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Globe,
  CheckCircle
} from 'lucide-react'
import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import { useProfileData } from '../../hooks/useProfileData'
import { useProfileWizard, ProfileFormData } from '../../hooks/useProfileWizard'

// Importar los steps existentes
import { Step1Basic } from './Step1Basic'
import { Step2Personal } from './Step2Personal'
import { Step3Social } from './Step3Social'
import { Step4Education } from './Step4Education'
import { Step5Experience } from './Step5Experience'
import { Step6Skills } from './Step6Skills'
import { Step7Languages } from './Step7Languages'
import { Step8Review } from './Step8Review'

interface ProfileWizardWrapperProps {
  isOpen: boolean
  onClose: () => void
}

// Componente interno que solo se monta cuando isOpen es true
function ProfileWizardContent({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const initializedRef = useRef(false)

  // Hook para datos de API
  const apiData = useProfileData()

  // Hook para estado local del wizard
  const wizard = useProfileWizard()

  // Sincronizar datos del API al estado local (solo una vez)
  useEffect(() => {
    if (!apiData.isLoading && apiData.data && !initializedRef.current) {
      initializedRef.current = true

      const { profile, education, experiences, skills, languages, socialLinks } = apiData.data

      const formDataFromApi: Partial<ProfileFormData> = {
        fullName: profile?.headline || '',
        username: '',
        profileType: 'Local',
        personalWebsite: profile?.website || '',
        bio: profile?.bio || '',
        birthDate: profile?.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
        location: [profile?.city, profile?.province, profile?.country].filter(Boolean).join(', '),
        currentJob: [profile?.position, profile?.organization].filter(Boolean).join(' a '),
        socialNetworks: socialLinks?.reduce((acc: Record<string, string>, link: { platform: string; username?: string; url?: string }) => {
          acc[link.platform.toLowerCase()] = link.username || link.url || ''
          return acc
        }, {}) || {},
        education: education?.map((edu: { id: string; degree?: string; institution?: string; field?: string; startDate?: string; endDate?: string; isCurrent?: boolean }) => ({
          id: edu.id,
          title: edu.degree || '',
          institution: edu.institution || '',
          specialization: edu.field || '',
          startYear: edu.startDate ? new Date(edu.startDate).getFullYear().toString() : '',
          endYear: edu.isCurrent ? '' : (edu.endDate ? new Date(edu.endDate).getFullYear().toString() : ''),
        })) || [],
        experience: experiences?.map((exp: { id: string; position?: string; organization?: string; description?: string; startDate?: string; endDate?: string; isCurrent?: boolean }) => ({
          id: exp.id,
          position: exp.position || '',
          company: exp.organization || '',
          description: exp.description || '',
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : '',
          endDate: exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : ''),
        })) || [],
        skills: skills?.map((s: { name: string }) => s.name) || [],
        interests: [],
        languages: languages?.map((lang: { id: string; language?: string; level?: string }) => ({
          id: lang.id,
          name: lang.language || '',
          level: lang.level || '',
        })) || [],
      }

      wizard.loadProfileData(formDataFromApi)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiData.isLoading])

  // Guardar datos al API
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const { formData } = wizard

      await apiData.updateProfile({
        bio: formData.bio,
        headline: formData.fullName,
        website: formData.personalWebsite,
        birthDate: formData.birthDate || undefined,
        city: formData.location.split(',')[0]?.trim(),
        province: formData.location.split(',')[1]?.trim(),
        position: formData.currentJob.split(' a ')[0]?.trim(),
        organization: formData.currentJob.split(' a ')[1]?.trim(),
      })

      await apiData.reloadCompleteness()
      onClose()
    } catch (error) {
      console.error('Error guardant perfil:', error)
    } finally {
      setIsSaving(false)
    }
  }, [wizard.formData, apiData, onClose])

  const handleNext = useCallback(() => {
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Last step - submit
      handleSave()
    }
  }, [currentStep, handleSave])

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Props para Steps 1-3 (usan API directamente)
  const step1Props = {
    data: apiData.data,
    updateProfile: apiData.updateProfile,
    isSaving: apiData.isSaving,
  }

  const step3Props = {
    data: apiData.data,
    addSocialLink: apiData.addSocialLink,
    deleteSocialLink: apiData.deleteSocialLink,
    isSaving: apiData.isSaving,
  }

  // Props para Steps 4-8 (usan wizard local)
  const wizardProps = {
    formData: wizard.formData,
    errors: wizard.errors,
    updateField: wizard.updateField,
    addEducation: wizard.addEducation,
    updateEducation: wizard.updateEducation,
    removeEducation: wizard.removeEducation,
    addExperience: wizard.addExperience,
    updateExperience: wizard.updateExperience,
    removeExperience: wizard.removeExperience,
    addSkill: wizard.addSkill,
    removeSkill: wizard.removeSkill,
    addInterest: wizard.addInterest,
    removeInterest: wizard.removeInterest,
    addLanguage: wizard.addLanguage,
    updateLanguage: wizard.updateLanguage,
    removeLanguage: wizard.removeLanguage,
  }

  // Steps para WizardLayout Enterprise
  const steps = [
    { label: 'Bàsic', description: 'Imatges i informació bàsica', icon: User },
    { label: 'Personal', description: 'Bio i ubicació', icon: Info },
    { label: 'Xarxes', description: 'Xarxes socials', icon: Share2 },
    { label: 'Formació', description: 'Estudis i certificacions', icon: GraduationCap },
    { label: 'Experiència', description: 'Trajectòria professional', icon: Briefcase },
    { label: 'Habilitats', description: 'Competències i interessos', icon: Lightbulb },
    { label: 'Idiomes', description: 'Llengües i nivells', icon: Globe },
    { label: 'Revisió', description: 'Resum i confirmació', icon: CheckCircle },
  ]

  // Renderizar el contenido del paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Basic {...step1Props} />
      case 2:
        return <Step2Personal {...step1Props} />
      case 3:
        return <Step3Social {...step3Props} />
      case 4:
        return <Step4Education {...wizardProps} />
      case 5:
        return <Step5Experience {...wizardProps} />
      case 6:
        return <Step6Skills {...wizardProps} />
      case 7:
        return <Step7Languages {...wizardProps} />
      case 8:
        return <Step8Review formData={wizard.formData} errors={wizard.errors} onSave={handleSave} isSaving={isSaving} />
      default:
        return null
    }
  }

  return (
    <WizardLayout
      title="Configurar Perfil"
      description="Completa la teva informació personal i professional"
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onCancel={onClose}
      canProceed={true}
      isLoading={isSaving || apiData.isSaving}
      finalLabel="Finalitzar"
    >
      {renderStepContent()}
    </WizardLayout>
  )
}

// Componente wrapper que controla el montaje como modal fullscreen
export function ProfileWizardWrapper({ isOpen, onClose }: ProfileWizardWrapperProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
      <ProfileWizardContent onClose={onClose} />
    </div>
  )
}

export default ProfileWizardWrapper
