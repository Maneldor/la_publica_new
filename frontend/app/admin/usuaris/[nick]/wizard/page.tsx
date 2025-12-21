'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  X,
  Crop
} from 'lucide-react'
import { ImageCropModal } from '@/components/ui/image/ImageCropModal'
import { WizardLayout } from '@/components/ui/enterprise/WizardLayout'
import { UserBasicInfoForm, type UserBasicInfoFormData } from '@/components/forms/UserBasicInfoForm'

// Steps (reutilitzar dels de crear employee)
import Step2Personal from '../../crear/user/steps/Step2Personal'
import Step3Social from '../../crear/user/steps/Step3Social'
import Step4Education from '../../crear/user/steps/Step4Education'
import Step5Experience from '../../crear/user/steps/Step5Experience'
import Step6Skills from '../../crear/user/steps/Step6Skills'
import Step7Languages from '../../crear/user/steps/Step7Languages'
import Step8Review from '../../crear/user/steps/Step8Review'

// Tipus per als dades del wizard
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

export default function EditarUsuariWizardPage() {
  const router = useRouter()
  const params = useParams()
  const userNick = params.nick as string

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isBasicValid, setIsBasicValid] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

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

  // Carregar dades de l'usuari per nick
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/by-nick/${userNick}`)
        if (res.ok) {
          const user = await res.json()

          setUserId(user.id)
          setUserData({
            basic: {
              nick: user.nick || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              secondLastName: user.secondLastName || '',
              email: user.email || '',
              password: '',
              confirmPassword: '',
              administration: user.administration || '',
              displayPreference: user.displayPreference || 'NICK',
              acceptTerms: true,
              acceptPrivacy: true,
            },
            personal: {
              bio: user.profile?.bio || '',
              headline: user.profile?.headline || '',
              city: user.profile?.city || '',
              province: user.profile?.province || '',
              organization: user.profile?.organization || '',
              department: user.profile?.department || '',
              position: user.profile?.position || user.cargo || '',
              professionalGroup: user.profile?.professionalGroup || '',
              phone: user.profile?.phone || '',
            },
            social: user.socialLinks || user.profile?.socialLinks || {},
            education: user.education || [],
            experience: user.experiences || [],
            skills: user.skills || [],
            languages: user.languages || [],
            profileImageUrl: user.image || '',
            coverImageUrl: user.coverImage || '',
          })
        } else {
          console.error('Error carregant usuari')
          router.push('/admin/usuaris')
        }
      } catch (error) {
        console.error('Error carregant usuari:', error)
        router.push('/admin/usuaris')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [userNick, router])

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

  // Estado para archivos pendientes de subir
  const [pendingFiles, setPendingFiles] = useState<{ profile?: File; cover?: File }>({})

  // Estado para el modal de crop
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean
    imageUrl: string
    type: 'profile' | 'cover'
  } | null>(null)

  // Handle file selection - abre el modal de crop
  const handleImageSelect = (file: File, type: 'profile' | 'cover') => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setCropModal({
        isOpen: true,
        imageUrl: url,
        type
      })
    }
  }

  // Cuando se completa el crop
  const handleCropComplete = (croppedFile: File) => {
    if (!cropModal) return

    const url = URL.createObjectURL(croppedFile)
    if (cropModal.type === 'cover') {
      setUserData(prev => ({ ...prev, coverImageUrl: url }))
      setPendingFiles(prev => ({ ...prev, cover: croppedFile }))
    } else {
      setUserData(prev => ({ ...prev, profileImageUrl: url }))
      setPendingFiles(prev => ({ ...prev, profile: croppedFile }))
    }

    // Limpiar URL anterior y cerrar modal
    URL.revokeObjectURL(cropModal.imageUrl)
    setCropModal(null)
  }

  // Handle file upload directo (sin crop) - para compatibilidad
  const handleImageUpload = (file: File, type: 'profile' | 'cover') => {
    handleImageSelect(file, type)
  }

  // Subir imagen al servidor
  const uploadImage = async (file: File, type: 'profile' | 'cover'): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        return data.url
      }
      return null
    } catch (error) {
      console.error('Error pujant imatge:', error)
      return null
    }
  }

  // Remove image
  const removeImage = (type: 'profile' | 'cover') => {
    if (type === 'cover') {
      setUserData(prev => ({ ...prev, coverImageUrl: '' }))
      setPendingFiles(prev => ({ ...prev, cover: undefined }))
    } else {
      setUserData(prev => ({ ...prev, profileImageUrl: '' }))
      setPendingFiles(prev => ({ ...prev, profile: undefined }))
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
        return true
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

  // Guardar canvis (disponible en qualsevol pas)
  const handleSave = async () => {
    if (!userData.basic || !userId) return

    setIsSaving(true)

    try {
      // Subir imágenes pendientes
      let profileImageUrl = userData.profileImageUrl
      let coverImageUrl = userData.coverImageUrl

      // Solo subir si hay archivos nuevos (blob URLs)
      if (pendingFiles.profile) {
        const uploadedUrl = await uploadImage(pendingFiles.profile, 'profile')
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl
          setUserData(prev => ({ ...prev, profileImageUrl: uploadedUrl }))
          setPendingFiles(prev => ({ ...prev, profile: undefined }))
        }
      }

      if (pendingFiles.cover) {
        const uploadedUrl = await uploadImage(pendingFiles.cover, 'cover')
        if (uploadedUrl) {
          coverImageUrl = uploadedUrl
          setUserData(prev => ({ ...prev, coverImageUrl: uploadedUrl }))
          setPendingFiles(prev => ({ ...prev, cover: undefined }))
        }
      }

      const payload = {
        nick: userData.basic.nick,
        email: userData.basic.email,
        firstName: userData.basic.firstName,
        lastName: userData.basic.lastName,
        secondLastName: userData.basic.secondLastName || null,
        name: `${userData.basic.firstName} ${userData.basic.lastName} ${userData.basic.secondLastName || ''}`.trim(),
        administration: userData.basic.administration,
        displayPreference: userData.basic.displayPreference,

        // Imágenes
        image: profileImageUrl || null,
        coverImage: coverImageUrl || null,

        profile: {
          ...userData.personal,
          socialLinks: userData.social
        },

        education: userData.education,
        experiences: userData.experience,
        skills: userData.skills,
        languages: userData.languages
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('Canvis guardats correctament')
      } else {
        const error = await res.json()
        alert(`Error: ${error.message || "No s'han pogut guardar els canvis"}`)
      }
    } catch (error) {
      console.error('Error guardant canvis:', error)
      alert('Error de connexió')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    await handleSave()
    router.push('/admin/usuaris')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Dades Bàsiques</h3>
              <p className="text-sm text-gray-500">Edita la informació principal de l&apos;usuari</p>
            </div>
            <UserBasicInfoForm
              mode="admin"
              initialData={userData.basic || undefined}
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
                        id="admin-edit-cover-upload"
                      />
                      <label
                        htmlFor="admin-edit-cover-upload"
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
                      id="admin-edit-profile-upload"
                    />
                    <label
                      htmlFor="admin-edit-profile-upload"
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregant dades de l&apos;usuari...</p>
        </div>
      </div>
    )
  }

  const userName = userData.basic
    ? `${userData.basic.firstName} ${userData.basic.lastName}`.trim()
    : 'Usuari'

  return (
    <>
      <WizardLayout
        title="Editar Empleat Públic"
        description={`Editant: ${userName} (@${userNick})`}
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onCancel={() => router.push('/admin/usuaris')}
        canProceed={canProceed()}
        isLoading={isSaving}
        finalLabel="Finalitzar"
        onSave={handleSave}
        isSaving={isSaving}
        saveLabel="Guardar"
        showSaveButton={true}
      >
        {renderStepContent()}
      </WizardLayout>

      {/* Modal de Crop */}
      {cropModal && (
        <ImageCropModal
          imageUrl={cropModal.imageUrl}
          onClose={() => {
            URL.revokeObjectURL(cropModal.imageUrl)
            setCropModal(null)
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={cropModal.type === 'cover' ? 4 / 1 : 1}
          cropShape={cropModal.type === 'profile' ? 'round' : 'rect'}
          title={cropModal.type === 'cover' ? 'Retallar imatge de portada' : 'Retallar foto de perfil'}
        />
      )}
    </>
  )
}
