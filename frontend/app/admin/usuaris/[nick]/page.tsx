'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit2, MoreHorizontal, MapPin, Building2, Calendar,
  Lock, Mail, Phone, Briefcase, GraduationCap, Globe, Languages,
  Lightbulb, Activity, Users, FileText, ExternalLink,
  AlertCircle, Trash2, Ban, Unlock, Key, Send, CheckCircle, XCircle,
  Loader2, AlertTriangle
} from 'lucide-react'

// Tipos - Los mismos que usa el perfil de dashboard
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
  role: string
  userType: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  lastLogin?: string
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
    yearsInPublicSector?: number
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

// Componente para labels privados
function PrivateLabel() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600 ml-2">
      <Lock className="w-3 h-3" />
      Privat
    </span>
  )
}

// Componente Card reutilizable
function ProfileCard({
  title,
  icon: Icon,
  isPrivate = false,
  children
}: {
  title: string
  icon: React.ElementType
  isPrivate?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {isPrivate && <PrivateLabel />}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export default function AdminVerPerfilUsuariPage() {
  const router = useRouter()
  const params = useParams()
  const userNick = params.nick as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para acciones de admin
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  // Cargar datos del perfil usando la misma API que usa el admin
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/admin/users/by-nick/${userNick}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error carregant usuari')
        }
      } catch (err) {
        console.error('Error carregant perfil:', err)
        setError('Error de connexió')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userNick])

  // Mostrar toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Cambiar estado activo/inactivo
  const handleToggleStatus = async () => {
    if (!profile) return
    setIsTogglingStatus(true)
    try {
      const response = await fetch(`/api/admin/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !profile.isActive })
      })
      const data = await response.json()
      if (data.success) {
        setProfile(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
        showToast(profile.isActive ? 'Usuari desactivat' : 'Usuari activat', 'success')
      } else {
        showToast(data.error || 'Error canviant estat', 'error')
      }
    } catch (err) {
      console.error('Error:', err)
      showToast('Error de connexió', 'error')
    } finally {
      setIsTogglingStatus(false)
    }
  }

  // Eliminar usuario
  const handleDelete = async () => {
    if (!profile) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${profile.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        showToast('Usuari eliminat correctament', 'success')
        setTimeout(() => router.push('/admin/usuaris'), 1000)
      } else {
        showToast(data.error || 'Error eliminant usuari', 'error')
      }
    } catch (err) {
      console.error('Error:', err)
      showToast('Error de connexió', 'error')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
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
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || 'Usuari no trobat'}</p>
            <Link
              href="/admin/usuaris"
              className="inline-flex items-center gap-2 mt-4 text-red-700 hover:text-red-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Tornar al llistat
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/usuaris')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Detall d&apos;Usuari</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={profile.role === 'USER' ? `/admin/usuaris/${profile.nick}/wizard` : `/admin/usuaris/${profile.nick}/editar`}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Editar Perfil
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        // TODO: Implementar reset password
                        showToast('Funcionalitat pendent', 'error')
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Restablir contrasenya
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        // TODO: Implementar enviar mensaje
                        showToast('Funcionalitat pendent', 'error')
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar missatge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alertas de estado */}
        {!profile.isEmailVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Email no verificat</p>
                <p className="text-sm text-amber-700">L&apos;usuari encara no ha verificat el seu email</p>
              </div>
            </div>
          </div>
        )}

        {!profile.isActive && (
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-800">Usuari desactivat</p>
                <p className="text-sm text-slate-600">Aquest usuari no pot accedir al sistema</p>
              </div>
            </div>
            <button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isTogglingStatus ? 'Activant...' : 'Activar usuari'}
            </button>
          </div>
        )}

        {/* Profile Header Card with Cover - Igual que dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="relative h-36">
            {profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            ) : profile.coverColor ? (
              <div className="w-full h-full" style={{ backgroundColor: profile.coverColor }} />
            ) : (
              <div className={`w-full h-full ${getCoverGradient()}`} />
            )}
          </div>

          {/* Profile Info with overlapping avatar */}
          <div className="relative px-6 pb-6">
            {/* Avatar superpuesto */}
            <div className="absolute -top-12 left-6">
              {profile.image ? (
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

            {/* Info - con padding-top para el avatar */}
            <div className="pt-14">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName} {profile.secondLastName}
                </h2>
                {profile.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    Actiu
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    <XCircle className="w-3 h-3" />
                    Inactiu
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-lg">@{profile.nick}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                {profile.profile?.city && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {profile.profile.city}
                    {profile.profile.province && `, ${profile.profile.province}`}
                  </span>
                )}
                <span className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border ${getAdminColor()}`}>
                  <Building2 className="w-4 h-4" />
                  {getAdminName()}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Registrat el {formatDate(profile.createdAt)}
                </span>
              </div>

              {profile.profile?.headline && (
                <p className="mt-3 text-gray-700">{profile.profile.headline}</p>
              )}

              {profile.profile?.bio && (
                <p className="mt-2 text-gray-600 text-sm">{profile.profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Grid de contenido - Igual que dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Información Profesional */}
            <ProfileCard
              title="Informació Professional"
              icon={Briefcase}
              isPrivate={true}
            >
              {profile.profile?.organization || profile.profile?.position ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organització</p>
                    <p className="text-gray-900">{profile.profile?.organization || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Càrrec</p>
                    <p className="text-gray-900">{profile.profile?.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Departament</p>
                    <p className="text-gray-900">{profile.profile?.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Anys al sector públic</p>
                    <p className="text-gray-900">{profile.profile?.yearsInPublicSector || '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Sense informació professional</p>
              )}
            </ProfileCard>

            {/* Formació */}
            <ProfileCard
              title="Formació"
              icon={GraduationCap}
            >
              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                        <p className="text-xs text-gray-500">
                          {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Actual' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Sense formació registrada</p>
              )}
            </ProfileCard>

            {/* Experiència */}
            <ProfileCard
              title="Experiència"
              icon={Briefcase}
            >
              {profile.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-4">
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{exp.position}</p>
                        <p className="text-sm text-gray-600">{exp.organization}</p>
                        {exp.department && <p className="text-sm text-gray-500">{exp.department}</p>}
                        <p className="text-xs text-gray-500">
                          {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Actual' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Sense experiència registrada</p>
              )}
            </ProfileCard>

            {/* Habilitats */}
            <ProfileCard
              title="Habilitats"
              icon={Lightbulb}
            >
              {profile.skills && profile.skills.length > 0 ? (
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
                <p className="text-gray-500 text-sm italic">Sense habilitats registrades</p>
              )}
            </ProfileCard>
          </div>

          {/* Columna derecha (1/3) */}
          <div className="space-y-6">

            {/* Informació del sistema (solo admin) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Informació del Sistema</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID</span>
                  <span className="text-gray-900 font-mono text-xs">{profile.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rol</span>
                  <span className="text-gray-900">{profile.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipus</span>
                  <span className="text-gray-900">{profile.userType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email verificat</span>
                  <span className={profile.isEmailVerified ? 'text-green-600' : 'text-amber-600'}>
                    {profile.isEmailVerified ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Última connexió</span>
                  <span className="text-gray-900">{profile.lastLogin ? formatDate(profile.lastLogin) : 'Mai'}</span>
                </div>
              </div>
            </div>

            {/* Accions d'admin */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Accions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => showToast('Funcionalitat pendent', 'error')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                >
                  <Key className="w-4 h-4 text-gray-400" />
                  Restablir contrasenya
                </button>
                <button
                  onClick={() => showToast('Funcionalitat pendent', 'error')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                >
                  <Send className="w-4 h-4 text-gray-400" />
                  Enviar missatge
                </button>
                {profile.isActive ? (
                  <button
                    onClick={handleToggleStatus}
                    disabled={isTogglingStatus}
                    className="w-full flex items-center gap-3 px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    {isTogglingStatus ? 'Processant...' : 'Desactivar usuari'}
                  </button>
                ) : (
                  <button
                    onClick={handleToggleStatus}
                    disabled={isTogglingStatus}
                    className="w-full flex items-center gap-3 px-3 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <Unlock className="w-4 h-4" />
                    {isTogglingStatus ? 'Processant...' : 'Activar usuari'}
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar usuari
                </button>
              </div>
            </div>

            {/* Xarxes Socials */}
            <ProfileCard
              title="Xarxes Socials"
              icon={Globe}
            >
              {profile.socialLinks && profile.socialLinks.length > 0 ? (
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
                <p className="text-gray-500 text-sm italic">Sense xarxes socials</p>
              )}
            </ProfileCard>

            {/* Idiomes */}
            <ProfileCard
              title="Idiomes"
              icon={Languages}
            >
              {profile.languages && profile.languages.length > 0 ? (
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
                <p className="text-gray-500 text-sm italic">Sense idiomes registrats</p>
              )}
            </ProfileCard>

            {/* Contacte */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-gray-900">Contacte</h3>
                <PrivateLabel />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile.email}</span>
                </div>
                {profile.profile?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile.profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Eliminar usuari</h3>
                  <p className="text-gray-500 text-sm">Aquesta acció no es pot desfer</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Estàs segur que vols eliminar l&apos;usuari <strong>{profile.firstName} {profile.lastName}</strong>?
                <br />
                Es perdran totes les seves dades, publicacions i activitat.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Eliminant...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificación */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}
