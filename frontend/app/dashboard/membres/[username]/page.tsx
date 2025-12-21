'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Camera,
  User,
  UserPlus,
  MessageSquare,
  Heart,
  Activity,
  Info,
  Users,
  FileText,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  Globe,
  GraduationCap,
  ArrowLeft,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Lock,
  Shield,
  EyeOff,
  Check,
  X,
  Linkedin,
  Twitter
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL'

interface PrivacySettings {
  showRealName: boolean
  showPosition: boolean
  showDepartment: boolean
  showBio: boolean
  showLocation: boolean
  showPhone: boolean
  showEmail: boolean
  showSocialLinks: boolean
  showJoinedDate: boolean
  showLastActive: boolean
  showConnections: boolean
  showGroups: boolean
}

interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate?: string | null
  current?: boolean
  description?: string | null
}

interface Education {
  id: string
  degree: string
  field?: string | null
  institution: string
  startDate?: string | null
  endDate?: string | null
}

interface Skill {
  id: string
  name: string
}

interface Language {
  id: string
  name: string
  level?: string | null
}

interface Group {
  id: string
  name: string
  slug: string
  image?: string | null
  membersCount: number
  role: string
}

interface UserProfile {
  id: string
  nick: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  image?: string | null
  coverImage?: string | null
  coverColor?: string | null
  position?: string | null
  department?: string | null
  headline?: string | null
  bio?: string | null
  location?: string | null
  organization?: string | null
  phone?: string | null
  socialLinks?: {
    linkedin?: string | null
    twitter?: string | null
    website?: string | null
  } | null
  administration?: AdministrationType | null
  isOnline?: boolean
  lastActive?: string | null
  createdAt?: string | null
  connectionsCount?: number | null
  groups?: Group[] | null
  experiences?: Experience[]
  educations?: Education[]
  skills?: Skill[]
  languages?: Language[]
  isOwnProfile: boolean
  privacyApplied: boolean
  privacySettings?: PrivacySettings
  hasSystemRestrictions?: boolean
  connectionStatus?: string
  connectionId?: string | null
  isIncoming?: boolean
}

type TabType = 'about' | 'experience' | 'connections' | 'groups'

const adminLabels = {
  LOCAL: { label: 'Administracio Local', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  AUTONOMICA: { label: 'Administracio Autonomica', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  CENTRAL: { label: 'Administracio Central', color: 'bg-amber-100 text-amber-700 border-amber-200' },
}

const coverGradients = [
  'from-rose-400 via-fuchsia-500 to-indigo-500',
  'from-blue-400 via-cyan-500 to-teal-500',
  'from-amber-400 via-orange-500 to-red-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-violet-400 via-purple-500 to-fuchsia-500',
  'from-pink-400 via-rose-500 to-red-500',
  'from-indigo-400 via-blue-500 to-cyan-500',
  'from-green-400 via-emerald-500 to-teal-500',
]

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('about')
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/users/${username}`)

      if (!res.ok) {
        if (res.status === 404) {
          setError('Usuari no trobat')
        } else {
          throw new Error('Error carregant perfil')
        }
        return
      }

      const data = await res.json()

      // Si és el propi perfil, redirigir a la pàgina d'edició
      if (data.isOwnProfile) {
        router.push('/dashboard/perfil')
        return
      }

      setProfile(data)
    } catch (err) {
      setError('Error carregant el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!profile || isConnecting) return

    setIsConnecting(true)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: profile.id })
      })

      if (res.ok) {
        loadProfile()
      }
    } catch (err) {
      console.error('Error connecting:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleAccept = async () => {
    if (!profile?.connectionId || isConnecting) return

    setIsConnecting(true)
    try {
      const res = await fetch(`/api/connections/${profile.connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      })

      if (res.ok) {
        loadProfile()
      }
    } catch (err) {
      console.error('Error accepting:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleReject = async () => {
    if (!profile?.connectionId || isConnecting) return

    setIsConnecting(true)
    try {
      const res = await fetch(`/api/connections/${profile.connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      })

      if (res.ok) {
        loadProfile()
      }
    } catch (err) {
      console.error('Error rejecting:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleMessage = () => {
    router.push(`/dashboard/missatges?user=${username}`)
  }

  const formatDate = (date?: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('ca-ES', {
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateRange = (start?: string | null, end?: string | null, current?: boolean) => {
    const startDate = start ? new Date(start).getFullYear() : null
    const endDate = current ? 'Actualitat' : (end ? new Date(end).getFullYear() : null)
    if (!startDate) return null
    return endDate ? `${startDate} - ${endDate}` : `${startDate}`
  }

  const formatLastActive = (date?: string | null) => {
    if (!date) return null
    const now = new Date()
    const lastActive = new Date(date)
    const diffMs = now.getTime() - lastActive.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 5) return 'Ara mateix'
    if (diffMins < 60) return `Fa ${diffMins} minuts`
    if (diffHours < 24) return `Fa ${diffHours} hores`
    if (diffDays < 7) return `Fa ${diffDays} dies`
    return formatDate(date)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregant perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Perfil no trobat'}</h2>
        <p className="text-gray-500 mb-6">L'usuari @{username} no existeix o no esta disponible.</p>
        <Link
          href="/dashboard/membres"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tornar a Membres
        </Link>
      </div>
    )
  }

  const displayName = profile.name || `@${profile.nick}`
  const gradientIndex = profile.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % coverGradients.length
  const gradient = coverGradients[gradientIndex]
  const adminInfo = profile.administration ? adminLabels[profile.administration] : null
  const privacy = profile.privacySettings

  const initials = displayName
    .replace('@', '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const tabs = [
    { id: 'about', label: 'Sobre', icon: Info },
    { id: 'experience', label: 'Experiencia', icon: Briefcase },
    { id: 'connections', label: 'Connexions', icon: Users, hidden: privacy?.showConnections === false },
    { id: 'groups', label: 'Grups', icon: Users, hidden: privacy?.showGroups === false },
  ].filter(tab => !tab.hidden)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 px-1">
        <Link href="/dashboard/membres" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="w-4 h-4" />
          Membres
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span>Perfil de {profile.name ? profile.firstName || profile.name.split(' ')[0] : profile.nick}</span>
      </nav>

      {/* Header Card */}
      <Card className="overflow-hidden">
        {/* Cover */}
        <div className={`h-48 md:h-56 relative bg-gradient-to-br ${gradient}`}>
          {profile.coverImage && (
            <Image
              src={profile.coverImage}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}

          {/* Badge de restriccions */}
          {profile.hasSystemRestrictions && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full text-white text-sm">
              <Shield className="w-4 h-4" />
              Perfil amb privacitat restringida
            </div>
          )}
        </div>

        <CardContent className="relative pt-0">
          {/* Avatar i info basica */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={displayName}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-4xl`}>
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{displayName}</h1>
                {profile.name && (
                  <span className="text-gray-500 text-lg">@{profile.nick}</span>
                )}
                {profile.isOnline && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    En linia
                  </span>
                )}
                {profile.hasSystemRestrictions && (
                  <span title="Perfil amb restriccions de privacitat">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </span>
                )}
              </div>

              {/* Headline */}
              {profile.headline && (
                <p className="text-gray-600 mt-1">{profile.headline}</p>
              )}

              {/* Posicio i departament - amb privacitat */}
              <div className="flex items-center gap-4 mt-2 text-gray-600 flex-wrap">
                {profile.position && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {profile.position}
                  </span>
                )}
                {profile.department && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {profile.department}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {profile.location}
                  </span>
                )}
                {/* Indicador de camps ocults */}
                {profile.privacyApplied && !profile.position && !profile.department && (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <EyeOff className="w-3.5 h-3.5" />
                    Alguna informacio es privada
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {adminInfo && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${adminInfo.color}`}>
                    <Building2 className="w-3.5 h-3.5" />
                    {adminInfo.label}
                  </span>
                )}
                {profile.organization && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {profile.organization}
                  </span>
                )}
              </div>
            </div>

            {/* Accions */}
            <div className="flex items-center gap-2 pb-4">
              {profile.connectionStatus === 'accepted' ? (
                <>
                  <button
                    onClick={handleMessage}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Missatge
                  </button>
                  <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Connectats
                  </span>
                </>
              ) : profile.connectionStatus === 'pending' && profile.isIncoming ? (
                <>
                  <button
                    onClick={handleAccept}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Acceptar
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rebutjar
                  </button>
                </>
              ) : profile.connectionStatus === 'pending' ? (
                <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Sol-licitud enviada
                </span>
              ) : (
                <>
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isConnecting ? 'Enviant...' : 'Connectar'}
                  </button>
                  <button
                    onClick={handleMessage}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Missatge
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="flex overflow-x-auto border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar esquerra */}
        <div className="space-y-6">
          {/* Informacio de contacte */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Informacio</h3>
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {profile.email}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {profile.phone}
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {profile.location}
                  </div>
                )}
                {profile.createdAt && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Membre des de {formatDate(profile.createdAt)}
                  </div>
                )}
                {profile.lastActive && !profile.isOnline && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Actiu {formatLastActive(profile.lastActive)}
                  </div>
                )}
                {profile.connectionsCount !== null && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    {profile.connectionsCount} connexions
                  </div>
                )}

                {/* Indicador si tot esta ocult */}
                {profile.privacyApplied &&
                 !profile.email &&
                 !profile.phone &&
                 !profile.location &&
                 !profile.createdAt &&
                 profile.connectionsCount === null && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                    <Lock className="w-4 h-4" />
                    Informacio de contacte privada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Xarxes socials */}
          {profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.twitter || profile.socialLinks.website) && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Xarxes socials</h3>
                <div className="space-y-3">
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin.startsWith('http') ? profile.socialLinks.linkedin : `https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a
                      href={profile.socialLinks.twitter.startsWith('http') ? profile.socialLinks.twitter : `https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                  {profile.socialLinks.website && (
                    <a
                      href={profile.socialLinks.website.startsWith('http') ? profile.socialLinks.website : `https://${profile.socialLinks.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Web personal
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Habilitats */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Habilitats</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Idiomes */}
          {profile.languages && profile.languages.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Idiomes</h3>
                <div className="space-y-2">
                  {profile.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{lang.name}</span>
                      {lang.level && (
                        <span className="text-gray-500">{lang.level}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contingut principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Tab: Sobre */}
          {activeTab === 'about' && (
            <>
              {/* Bio */}
              {profile.bio ? (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Sobre mi</h3>
                    <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
                  </CardContent>
                </Card>
              ) : profile.privacyApplied && privacy?.showBio === false ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">La biografia d'aquest usuari es privada</p>
                  </CardContent>
                </Card>
              ) : null}

              {/* Experiencia recent */}
              {profile.experiences && profile.experiences.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Experiencia recent</h3>
                    <div className="space-y-4">
                      {profile.experiences.slice(0, 3).map((exp) => (
                        <div key={exp.id} className="flex gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{exp.title}</h4>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-400">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Educacio recent */}
              {profile.educations && profile.educations.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Formacio</h3>
                    <div className="space-y-4">
                      {profile.educations.slice(0, 3).map((edu) => (
                        <div key={edu.id} className="flex gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                            <p className="text-xs text-gray-400">{formatDateRange(edu.startDate, edu.endDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Tab: Experiencia */}
          {activeTab === 'experience' && (
            <>
              {profile.experiences && profile.experiences.length > 0 ? (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Experiencia professional</h3>
                    <div className="space-y-6">
                      {profile.experiences.map((exp) => (
                        <div key={exp.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{exp.title}</h4>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-400 mb-2">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                            {exp.description && (
                              <p className="text-sm text-gray-600">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Encara no ha afegit experiencia professional</p>
                  </CardContent>
                </Card>
              )}

              {profile.educations && profile.educations.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Formacio academica</h3>
                    <div className="space-y-6">
                      {profile.educations.map((edu) => (
                        <div key={edu.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                            <p className="text-xs text-gray-400">{formatDateRange(edu.startDate, edu.endDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Tab: Connexions */}
          {activeTab === 'connections' && (
            profile.connectionsCount !== null ? (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Connexions ({profile.connectionsCount})
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Properament podras veure les connexions d'aquest usuari.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Les connexions d'aquest usuari son privades</p>
                </CardContent>
              </Card>
            )
          )}

          {/* Tab: Grups */}
          {activeTab === 'groups' && (
            profile.groups && profile.groups.length > 0 ? (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Grups ({profile.groups.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.groups.map((group) => (
                      <Link
                        key={group.id}
                        href={`/dashboard/grups/${group.slug}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {group.image ? (
                            <Image
                              src={group.image}
                              alt={group.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{group.name}</h4>
                          <p className="text-xs text-gray-500">{group.membersCount} membres</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : profile.groups === null ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Els grups d'aquest usuari son privats</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pertany a cap grup public</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  )
}
