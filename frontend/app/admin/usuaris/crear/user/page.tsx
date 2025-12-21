'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Briefcase,
  Share2,
  GraduationCap,
  Building2,
  Sparkles,
  Languages,
  ClipboardCheck,
  Upload,
  X
} from 'lucide-react'
import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import { UserBasicInfoForm, type UserBasicInfoFormData } from '@/components/forms/UserBasicInfoForm'
import { generateUserPassword } from '@/lib/utils/generate-password'
import { generateAvatarUrl, getCoverSolidColorByAdministration, type AdministrationType } from '@/lib/utils/generate-avatar'

// Steps
import Step2Personal from './steps/Step2Personal'
import Step3Social from './steps/Step3Social'
import Step4Education from './steps/Step4Education'
import Step5Experience from './steps/Step5Experience'
import Step6Skills from './steps/Step6Skills'
import Step7Languages from './steps/Step7Languages'
import Step8Review from './steps/Step8Review'

// Tipos para los datos del wizard
interface PersonalData {
  bio?: string
  headline?: string
  city?: string
  province?: string
  organization?: string
  department?: string
  position?: string
  professionalGroup?: string
  phone?: string
}

interface SocialData {
  linkedin?: string
  twitter?: string
  github?: string
  website?: string
}

interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  startYear: string
  endYear?: string
  current: boolean
}

interface ExperienceItem {
  id: string
  organization: string
  position: string
  department?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

interface SkillItem {
  id: string
  name: string
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  category: string
}

interface LanguageItem {
  id: string
  language: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native'
}

interface UserData {
  basic: UserBasicInfoFormData | null
  personal: PersonalData
  social: SocialData
  education: EducationItem[]
  experience: ExperienceItem[]
  skills: SkillItem[]
  languages: LanguageItem[]
  profileImageUrl?: string
  coverImageUrl?: string
}

export default function CreateEmployeePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estado para todos los datos del usuario
  const [userData, setUserData] = useState<UserData>({
    basic: null,
    personal: {},
    social: {},
    education: [],
    experience: [],
    skills: [],
    languages: [],
    profileImageUrl: '',
    coverImageUrl: ''
  })

  const [isBasicValid, setIsBasicValid] = useState(false)

  const steps = [
    { label: 'Dades Bàsiques', description: 'Nick, nom, email, administració', icon: User },
    { label: 'Personal', description: 'Bio, ubicació, informació professional', icon: Briefcase },
    { label: 'Xarxes Socials', description: 'Perfils socials', icon: Share2 },
    { label: 'Formació', description: 'Estudis i certificacions', icon: GraduationCap },
    { label: 'Experiència', description: 'Trajectòria professional', icon: Building2 },
    { label: 'Habilitats', description: 'Competències i interessos', icon: Sparkles },
    { label: 'Idiomes', description: 'Llengües i nivells', icon: Languages },
    { label: 'Revisió', description: 'Resum i confirmació', icon: ClipboardCheck }
  ]

  const handleBasicDataChange = (data: UserBasicInfoFormData, isValid: boolean) => {
    setUserData(prev => ({ ...prev, basic: data }))
    setIsBasicValid(isValid)
  }

  // Handle file upload
  const handleImageUpload = (file: File, type: 'profile' | 'cover') => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      if (type === 'cover') {
        setUserData(prev => ({ ...prev, coverImageUrl: url }))
      } else {
        setUserData(prev => ({ ...prev, profileImageUrl: url }))
      }
    }
  }

  // Remove image
  const removeImage = (type: 'profile' | 'cover') => {
    if (type === 'cover') {
      setUserData(prev => ({ ...prev, coverImageUrl: '' }))
    } else {
      setUserData(prev => ({ ...prev, profileImageUrl: '' }))
    }
  }

  // Get initials for avatar
  const getInitials = () => {
    const first = userData.basic?.firstName?.charAt(0) || '?'
    const last = userData.basic?.lastName?.charAt(0) || '?'
    return `${first}${last}`.toUpperCase()
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return isBasicValid
      default:
        return true // Los otros pasos son opcionales
    }
  }

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Guardar borrador en sessionStorage
  const handleSaveDraft = () => {
    setIsSaving(true)
    try {
      sessionStorage.setItem('newEmployeeDraft', JSON.stringify(userData))
      alert('Esborrany guardat correctament')
    } catch (error) {
      console.error('Error guardant esborrany:', error)
      alert('Error guardant esborrany')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!userData.basic) return

    setIsLoading(true)

    try {
      // Generar contraseña automática
      const password = generateUserPassword(userData.basic.nick, userData.basic.firstName)

      // Generar avatar e imagen de portada
      const avatarUrl = generateAvatarUrl(userData.basic.firstName, userData.basic.lastName)
      const coverColor = userData.basic.administration
        ? getCoverSolidColorByAdministration(userData.basic.administration as AdministrationType)
        : '#e5e7eb'

      // Crear payload completo
      const payload = {
        // Datos básicos
        nick: userData.basic.nick,
        email: userData.basic.email,
        password: password,
        firstName: userData.basic.firstName,
        lastName: userData.basic.lastName,
        secondLastName: userData.basic.secondLastName || null,
        name: `${userData.basic.firstName} ${userData.basic.lastName} ${userData.basic.secondLastName || ''}`.trim(),
        administration: userData.basic.administration,
        displayPreference: userData.basic.displayPreference,
        image: avatarUrl,
        coverColor: coverColor,
        role: 'USER',

        // Datos de perfil
        profile: {
          ...userData.personal,
          socialLinks: userData.social
        },

        // Datos adicionales
        education: userData.education,
        experiences: userData.experience,
        skills: userData.skills,
        languages: userData.languages
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        // Mostrar modal de éxito con la contraseña generada
        alert(
          `Usuari creat correctament!\n\n` +
          `Nick: @${userData.basic.nick}\n` +
          `Email: ${userData.basic.email}\n` +
          `Contrasenya: ${password}\n\n` +
          `Guarda aquesta informació per enviar-la a l'usuari.`
        )
        router.push('/admin/usuaris')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message || "No s'ha pogut crear l'usuari"}`)
      }
    } catch (error) {
      console.error('Error creant usuari:', error)
      alert('Error de connexió')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Dades Bàsiques</h3>
              <p className="text-sm text-gray-500">Informació principal del nou usuari empleat públic</p>
            </div>
            <UserBasicInfoForm
              mode="admin"
              onChange={handleBasicDataChange}
              showButtons={false}
              showTerms={false}
            />

            {/* Sección de Imágenes */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Imatges</h4>

              {/* Imagen de Portada */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imatge de Portada
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Imatge gran que apareixerà a la part superior del perfil (recomanat: 1200x300px)
                </p>

                {userData.coverImageUrl ? (
                  <div className="relative">
                    <img
                      src={userData.coverImageUrl}
                      alt="Vista prèvia portada"
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('cover')}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Arrossega la imatge aquí o fes clic per seleccionar</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF fins a 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                        className="hidden"
                        id="admin-cover-upload"
                      />
                      <label
                        htmlFor="admin-cover-upload"
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer"
                      >
                        Seleccionar Arxiu
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Foto de Perfil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto de Perfil
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Imatge que apareixerà al seu avatar (recomanat: 400x400px, format quadrat)
                </p>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {userData.profileImageUrl ? (
                      <>
                        <img
                          src={userData.profileImageUrl}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('profile')}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-indigo-200">
                        {getInitials()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                      className="hidden"
                      id="admin-profile-upload"
                    />
                    <label
                      htmlFor="admin-profile-upload"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer text-center"
                    >
                      Canviar foto
                    </label>
                    {userData.profileImageUrl && (
                      <button
                        type="button"
                        onClick={() => removeImage('profile')}
                        className="px-4 py-2 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <Step2Personal
            data={userData.personal}
            onChange={(d) => setUserData(prev => ({ ...prev, personal: d }))}
          />
        )
      case 3:
        return (
          <Step3Social
            data={userData.social}
            onChange={(d) => setUserData(prev => ({ ...prev, social: d }))}
          />
        )
      case 4:
        return (
          <Step4Education
            data={userData.education}
            onChange={(d) => setUserData(prev => ({ ...prev, education: d }))}
          />
        )
      case 5:
        return (
          <Step5Experience
            data={userData.experience}
            onChange={(d) => setUserData(prev => ({ ...prev, experience: d }))}
          />
        )
      case 6:
        return (
          <Step6Skills
            data={userData.skills}
            onChange={(d) => setUserData(prev => ({ ...prev, skills: d }))}
          />
        )
      case 7:
        return (
          <Step7Languages
            data={userData.languages}
            onChange={(d) => setUserData(prev => ({ ...prev, languages: d }))}
          />
        )
      case 8:
        return <Step8Review userData={userData} />
      default:
        return null
    }
  }

  return (
    <WizardLayout
      title="Crear Empleat Públic"
      description="Crea un nou usuari de tipus empleat públic"
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onCancel={() => router.push('/admin/usuaris/crear')}
      canProceed={canProceed()}
      isLoading={isLoading}
      finalLabel="Crear Usuari"
      onSave={handleSaveDraft}
      isSaving={isSaving}
      saveLabel="Guardar Esborrany"
      showSaveButton={true}
    >
      {renderStepContent()}
    </WizardLayout>
  )
}
