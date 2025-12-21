'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useProfileData } from '../hooks/useProfileData'
import { useProfileWizard, ProfileFormData } from '../hooks/useProfileWizard'

// Importar los steps existentes
import { Step1Basic } from '../components/wizard/Step1Basic'
import { Step2Personal } from '../components/wizard/Step2Personal'
import { Step3Social } from '../components/wizard/Step3Social'
import { Step4Education } from '../components/wizard/Step4Education'
import { Step5Experience } from '../components/wizard/Step5Experience'
import { Step6Skills } from '../components/wizard/Step6Skills'
import { Step7Languages } from '../components/wizard/Step7Languages'
import { Step8Review } from '../components/wizard/Step8Review'

export default function EditarPerfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStep = parseInt(searchParams.get('step') || '1', 10)
  const [currentStep, setCurrentStep] = useState(initialStep >= 1 && initialStep <= 8 ? initialStep : 1)
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

  // Navegacion de regreso
  const handleCancel = useCallback(() => {
    router.push('/dashboard/perfil')
  }, [router])

  // Guardar datos al API (disponible en cualquier paso)
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
      alert('Canvis guardats correctament')
    } catch (error) {
      console.error('Error guardant perfil:', error)
      alert('Error guardant els canvis')
    } finally {
      setIsSaving(false)
    }
  }, [wizard.formData, apiData])

  // Finalizar y volver al perfil
  const handleFinish = useCallback(async () => {
    await handleSave()
    router.push('/dashboard/perfil')
  }, [handleSave, router])

  const handleNext = useCallback(() => {
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Last step - submit and redirect
      handleFinish()
    }
  }, [currentStep, handleFinish])

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
    userData: {
      nick: apiData.data.user?.nick,
      firstName: apiData.data.user?.firstName,
      lastName: apiData.data.user?.lastName,
      secondLastName: apiData.data.user?.secondLastName,
      email: apiData.data.user?.email,
      administration: apiData.data.user?.administration as 'LOCAL' | 'AUTONOMICA' | 'CENTRAL' | undefined,
      displayPreference: apiData.data.user?.displayPreference as 'NICK' | 'NOM' | 'NOM_COGNOM' | undefined,
      image: apiData.data.user?.image,
      coverColor: apiData.data.user?.coverColor,
    },
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
      onCancel={handleCancel}
      canProceed={true}
      isLoading={isSaving || apiData.isSaving}
      finalLabel="Finalitzar"
      onSave={handleSave}
      isSaving={isSaving}
      saveLabel="Guardar"
      showSaveButton={true}
    >
      {renderStepContent()}
    </WizardLayout>
  )
}
