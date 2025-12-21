'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Edit2, MoreHorizontal, MapPin, Building2, Calendar,
  Mail, Phone, Users, FileText, ExternalLink,
  AlertCircle, Camera, Image as ImageIcon
} from 'lucide-react'
import { ImageCropModal } from '@/components/ui/image/ImageCropModal'
import {
  ProfileInfoIcon,
  EducationIcon,
  ExperienceIcon,
  SkillsIcon,
  LanguagesIcon,
  SocialIcon,
  ActivityIcon,
  ContactIcon,
  PrivateIcon,
  UserIcon,
} from '@/components/icons'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'
import { ProfileCompletionCard } from './components/ProfileCompletionCard'

// Tipos
interface UserProfile {
  id: string
  nick: string
  firstName: string
  lastName: string
  secondLastName?: string
  email: string
  image?: string
  coverImage?: string
  coverColor?: string
  administration?: 'LOCAL' | 'AUTONOMICA' | 'CENTRAL'
  displayPreference?: 'NICK' | 'NOM' | 'NOM_COGNOM'
  createdAt: string
  profile?: {
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
  education?: Array<{
    id: string
    institution: string
    degree: string
    field?: string
    startDate: string
    endDate?: string
    isCurrent: boolean
  }>
  experiences?: Array<{
    id: string
    organization: string
    position: string
    department?: string
    startDate: string
    endDate?: string
    isCurrent: boolean
  }>
  skills?: Array<{
    id: string
    name: string
    category?: string
    level?: number
  }>
  languages?: Array<{
    id: string
    language: string
    level: string
  }>
  socialLinks?: Array<{
    id: string
    platform: string
    url: string
    username?: string
  }>
}

interface ProfileCompleteness {
  percentage: number
  level: 'low' | 'medium' | 'high'
  pendingSections: string[]
}

// Componente para labels privados
function PrivateLabel() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 ml-2">
      <PrivateIcon size="xs" variant="ghost" />
      Privat
    </span>
  )
}

// Componente Card reutilizable - Usa el sistema de disseny
function ProfileCard({
  title,
  iconComponent,
  onEdit,
  isPrivate = false,
  children
}: {
  title: string
  iconComponent: React.ReactNode
  onEdit?: () => void
  isPrivate?: boolean
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle
          icon={iconComponent}
          action={
            onEdit ? (
              <button
                onClick={onEdit}
                className={TYPOGRAPHY.link}
              >
                Editar
              </button>
            ) : undefined
          }
        >
          <span className="flex items-center gap-2">
            {title}
            {isPrivate && <PrivateLabel />}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

// Componente principal
export default function PerfilPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    posts: 0,
    groups: 0,
    friends: 0,
    saved: 0,
  })

  // Estados para modales de crop de imagen
  const [showAvatarCropModal, setShowAvatarCropModal] = useState(false)
  const [showCoverCropModal, setShowCoverCropModal] = useState(false)
  const [avatarToCrop, setAvatarToCrop] = useState<string | null>(null)
  const [coverToCrop, setCoverToCrop] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, completenessRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/profile/completeness'),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data)
        }

        if (completenessRes.ok) {
          const data = await completenessRes.json()
          setCompleteness(data)
        }
      } catch (error) {
        console.error('Error carregant perfil:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Navegar al wizard con step específico
  const navigateToWizardStep = (step: number) => {
    router.push(`/dashboard/perfil/editar?step=${step}`)
  }

  // Manejar selección de imagen de avatar
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setAvatarToCrop(url)
      setShowAvatarCropModal(true)
    }
    e.target.value = '' // Reset input
  }

  // Manejar selección de imagen de cover
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setCoverToCrop(url)
      setShowCoverCropModal(true)
    }
    e.target.value = '' // Reset input
  }

  // Guardar avatar después del crop
  const handleSaveAvatar = async (croppedFile: File) => {
    setIsUploadingImage(true)
    try {
      console.log('🖼️ [Avatar] Starting upload...', croppedFile.name, croppedFile.size)

      // 1. Subir imagen
      const formData = new FormData()
      formData.append('file', croppedFile)
      formData.append('type', 'profile')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()
      console.log('🖼️ [Avatar] Upload response:', uploadRes.status, uploadData)

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || uploadData.details || 'Error pujant imatge')
      }

      const { url } = uploadData
      console.log('🖼️ [Avatar] Uploaded URL:', url)

      // 2. Actualizar perfil
      console.log('🖼️ [Avatar] Updating profile with image:', url)
      const updateRes = await fetch('/api/user/profile/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url }),
      })

      const updateData = await updateRes.json()
      console.log('🖼️ [Avatar] Update response:', updateRes.status, updateData)

      if (!updateRes.ok) {
        throw new Error(updateData.error || updateData.details || 'Error actualitzant perfil')
      }

      // 3. Actualizar estado local
      setProfile(prev => prev ? { ...prev, image: url } : null)
      setShowAvatarCropModal(false)
      setAvatarToCrop(null)
    } catch (error: any) {
      console.error('🖼️ [Avatar] Error:', error)
      alert(`Error: ${error.message || 'Hi ha hagut un error guardant la imatge'}`)
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Guardar cover después del crop
  const handleSaveCover = async (croppedFile: File) => {
    setIsUploadingImage(true)
    try {
      console.log('🖼️ [Cover] Starting upload...', croppedFile.name, croppedFile.size)

      // 1. Subir imagen
      const formData = new FormData()
      formData.append('file', croppedFile)
      formData.append('type', 'cover')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()
      console.log('🖼️ [Cover] Upload response:', uploadRes.status, uploadData)

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || uploadData.details || 'Error pujant imatge')
      }

      const { url } = uploadData
      console.log('🖼️ [Cover] Uploaded URL:', url)

      // 2. Actualizar perfil
      console.log('🖼️ [Cover] Updating profile with coverImage:', url)
      const updateRes = await fetch('/api/user/profile/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: url }),
      })

      const updateData = await updateRes.json()
      console.log('🖼️ [Cover] Update response:', updateRes.status, updateData)

      if (!updateRes.ok) {
        throw new Error(updateData.error || updateData.details || 'Error actualitzant perfil')
      }

      // 3. Actualizar estado local
      setProfile(prev => prev ? { ...prev, coverImage: url } : null)
      setShowCoverCropModal(false)
      setCoverToCrop(null)
    } catch (error: any) {
      console.error('🖼️ [Cover] Error:', error)
      alert(`Error: ${error.message || 'Hi ha hagut un error guardant la imatge'}`)
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Obtener iniciales
  const getInitials = () => {
    if (!profile) return '??'
    return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase()
  }

  // Obtener gradiente de portada según administración
  const getCoverGradient = () => {
    switch (profile?.administration) {
      case 'LOCAL':
        return 'bg-gradient-to-r from-green-200 via-green-100 to-emerald-200'
      case 'AUTONOMICA':
        return 'bg-gradient-to-r from-blue-200 via-blue-100 to-indigo-200'
      case 'CENTRAL':
        return 'bg-gradient-to-r from-violet-200 via-purple-100 to-violet-200'
      default:
        return 'bg-gradient-to-r from-gray-200 via-gray-100 to-slate-200'
    }
  }

  // Obtener color de administración
  const getAdminColor = () => {
    switch (profile?.administration) {
      case 'LOCAL': return 'bg-green-100 text-green-700 border-green-200'
      case 'AUTONOMICA': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CENTRAL': return 'bg-violet-100 text-violet-700 border-violet-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Obtener nombre de administración
  const getAdminName = () => {
    switch (profile?.administration) {
      case 'LOCAL': return 'Administració Local'
      case 'AUTONOMICA': return 'Administració Autonòmica'
      case 'CENTRAL': return 'Administració Central'
      default: return 'No especificada'
    }
  }

  // Obtener nivel de idioma visual
  const getLanguageLevelDots = (level: string) => {
    const levels: Record<string, number> = {
      'native': 5, 'fluent': 5, 'C2': 5, 'C1': 4, 'professional': 4, 'B2': 3, 'intermediate': 3, 'B1': 3, 'A2': 2, 'basic': 2, 'A1': 1
    }
    const filled = levels[level] || levels[level.toLowerCase()] || 3
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i <= filled ? 'bg-indigo-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    )
  }

  // Formatear fecha
  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <PageLayout
        title="El Meu Perfil"
        subtitle="Gestiona la teva informació personal i professional"
        icon={<UserIcon size="md" />}
      >
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <>
    <PageLayout
      title="El Meu Perfil"
      subtitle="Gestiona la teva informació personal i professional"
      icon={<UserIcon size="md" />}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/perfil/editar')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Editar Perfil
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      }
    >
        {/* Profile Header Card with Cover */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Cover Image - MÉS GRAN */}
          <div className="relative h-40 group">
            {profile?.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            ) : profile?.coverColor ? (
              <div className="w-full h-full" style={{ backgroundColor: profile.coverColor }} />
            ) : (
              <div className={`w-full h-full ${getCoverGradient()}`} />
            )}

            {/* Botó Canviar foto - ESQUERRA (al costat de l'avatar, sense tapar-lo) */}
            <label className="absolute bottom-3 left-36 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm cursor-pointer">
              <Camera className="w-4 h-4" />
              Canviar foto
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </label>

            {/* Botó Canviar portada - DRETA */}
            <label className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm cursor-pointer">
              <ImageIcon className="w-4 h-4" />
              Canviar portada
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Profile Info with overlapping avatar - COMPACTE */}
          <div className="relative px-6 pb-3">
            {/* Avatar superpuesto */}
            <div className="absolute -top-12 left-6">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={profile.firstName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                  {getInitials()}
                </div>
              )}
            </div>

            {/* Nick + Tags en la MATEIXA LÍNIA */}
            <div className="pt-14 flex flex-wrap items-center gap-4">
              {/* Nick */}
              <p className="text-xl font-semibold text-gray-900">@{profile?.nick}</p>

              {/* Badge Administració - NOMÉS si té valor */}
              {profile?.administration && (
                <span className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border ${getAdminColor()}`}>
                  <Building2 className="w-4 h-4" />
                  {getAdminName()}
                </span>
              )}

              {/* Data de registre */}
              {profile?.createdAt && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Registrat el {formatDate(profile.createdAt)}
                </span>
              )}

              {/* Ubicació - NOMÉS si té valor */}
              {profile?.profile?.city && (
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {profile.profile.city}
                  {profile.profile.province && `, ${profile.profile.province}`}
                </span>
              )}
            </div>

            {/* Headline i bio - sota */}
            {(profile?.profile?.headline || profile?.profile?.bio) && (
              <div className="mt-2">
                {profile?.profile?.headline && (
                  <p className="text-gray-700 text-sm">{profile.profile.headline}</p>
                )}
                {profile?.profile?.bio && (
                  <p className="mt-1 text-gray-600 text-sm">{profile.profile.bio}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Grid de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Información Profesional */}
            <ProfileCard
              title="Informació Professional"
              iconComponent={<ProfileInfoIcon />}
              onEdit={() => navigateToWizardStep(2)}
              isPrivate={true}
            >
              {profile?.profile?.organization || profile?.profile?.position ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organització</p>
                    <p className="text-gray-900">{profile?.profile?.organization || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Càrrec</p>
                    <p className="text-gray-900">{profile?.profile?.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Departament</p>
                    <p className="text-gray-900">{profile?.profile?.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Grup Professional</p>
                    <p className="text-gray-900">{profile?.profile?.professionalGroup || '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No has afegit informació professional encara</p>
              )}
            </ProfileCard>

            {/* Formació */}
            <ProfileCard
              title="Formació"
              iconComponent={<EducationIcon />}
              onEdit={() => navigateToWizardStep(4)}
            >
              {profile?.education && profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="flex gap-3">
                      <EducationIcon size="md" />
                      <div>
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Actual' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No has afegit formació encara</p>
              )}
            </ProfileCard>

            {/* Experiència */}
            <ProfileCard
              title="Experiència"
              iconComponent={<ExperienceIcon />}
              onEdit={() => navigateToWizardStep(5)}
            >
              {profile?.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-4">
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} className="flex gap-3">
                      <ExperienceIcon size="md" />
                      <div>
                        <p className="font-medium text-gray-900">{exp.position}</p>
                        <p className="text-sm text-gray-600">{exp.organization}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Actual' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No has afegit experiència encara</p>
              )}
            </ProfileCard>

            {/* Habilitats */}
            <ProfileCard
              title="Habilitats"
              iconComponent={<SkillsIcon />}
              onEdit={() => navigateToWizardStep(6)}
            >
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No has afegit habilitats encara</p>
              )}
            </ProfileCard>

            {/* Activitat Recent */}
            <ProfileCard
              title="Activitat Recent"
              iconComponent={<ActivityIcon />}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Ha publicat: &quot;Nou sistema de cita prèvia digital implementat amb èxit&quot;</p>
                    <p className="text-xs text-gray-500 mt-1">fa 2 hores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">S&apos;ha unit al grup &quot;Innovació en Administració Pública&quot;</p>
                    <p className="text-xs text-gray-500 mt-1">fa 1 dia</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Veure tota l&apos;activitat →
              </button>
            </ProfileCard>
          </div>

          {/* Columna derecha (1/3) */}
          <div className="space-y-6">

            {/* Completat del Perfil - Nou component amb cercle */}
            <ProfileCompletionCard user={profile} />

            {/* Estadístiques */}
            <Card>
              <CardHeader>
                <CardTitle>Estadístiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={TYPOGRAPHY.small}>Publicacions</span>
                    <span className="font-semibold text-gray-900">{stats.posts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={TYPOGRAPHY.small}>Grups</span>
                    <span className="font-semibold text-gray-900">{stats.groups}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={TYPOGRAPHY.small}>Amistats</span>
                    <span className="font-semibold text-gray-900">{stats.friends}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={TYPOGRAPHY.small}>Guardats</span>
                    <span className="font-semibold text-gray-900">{stats.saved}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Xarxes Socials */}
            <ProfileCard
              title="Xarxes Socials"
              iconComponent={<SocialIcon />}
              onEdit={() => navigateToWizardStep(3)}
            >
              {profile?.socialLinks && profile.socialLinks.length > 0 ? (
                <div className="space-y-2">
                  {profile.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium text-sm">{link.platform}</span>
                        {link.username && (
                          <span className="text-gray-500 text-sm">@{link.username}</span>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No has afegit xarxes socials</p>
              )}
            </ProfileCard>

            {/* Idiomes */}
            <ProfileCard
              title="Idiomes"
              iconComponent={<LanguagesIcon />}
              onEdit={() => navigateToWizardStep(7)}
            >
              {profile?.languages && profile.languages.length > 0 ? (
                <div className="space-y-3">
                  {profile.languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium text-sm">{lang.language}</span>
                      <div className="flex items-center gap-2">
                        {getLanguageLevelDots(lang.level)}
                        <span className="text-xs text-gray-500 capitalize w-16 text-right">
                          {lang.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No has afegit idiomes</p>
              )}
            </ProfileCard>

            {/* Contacte Privat */}
            <ProfileCard
              title="Contacte"
              iconComponent={<ContactIcon size="sm" />}
              isPrivate={true}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className={TYPOGRAPHY.small}>{profile?.email}</span>
                </div>
                {profile?.profile?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className={TYPOGRAPHY.small}>{profile.profile.phone}</span>
                  </div>
                )}
              </div>
            </ProfileCard>
          </div>
        </div>
    </PageLayout>

      {/* Modal per canviar foto de perfil */}
      {avatarToCrop && (
        <ImageCropModal
          imageUrl={avatarToCrop}
          onClose={() => {
            URL.revokeObjectURL(avatarToCrop)
            setAvatarToCrop(null)
            setShowAvatarCropModal(false)
          }}
          onCropComplete={handleSaveAvatar}
          aspectRatio={1}
          cropShape="round"
          title="Retallar foto de perfil"
        />
      )}

      {/* Modal per canviar imatge de portada */}
      {coverToCrop && (
        <ImageCropModal
          imageUrl={coverToCrop}
          onClose={() => {
            URL.revokeObjectURL(coverToCrop)
            setCoverToCrop(null)
            setShowCoverCropModal(false)
          }}
          onCropComplete={handleSaveCover}
          aspectRatio={4}
          cropShape="rect"
          title="Retallar imatge de portada"
        />
      )}
    </>
  )
}
