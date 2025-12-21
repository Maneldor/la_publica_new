'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JoinRequestButton } from '../components/JoinRequestButton'
import {
  Users,
  Lock,
  Globe,
  EyeOff,
  Briefcase,
  Settings,
  UserPlus,
  MessageCircle,
  Calendar,
  Shield,
  Crown,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  Info,
  ChevronLeft,
  Bell,
  BellOff,
  Flag,
  LogOut,
  ExternalLink,
  Clock,
  Tag,
  CheckCircle,
  XCircle,
  Loader2,
  ClipboardList,
} from 'lucide-react'

// Types
interface GroupMember {
  id: string
  nick: string
  name: string
  image: string | null
  isOnline: boolean
  lastSeenAt: string | null
  position: string | null
  department: string | null
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER'
  joinedAt: string
}

interface GroupOffer {
  id: string
  title: string
  description: string | null
  discount: string | null
  image: string | null
  validFrom: string | null
  validUntil: string | null
  company: {
    id: string
    name: string
    logo: string | null
  } | null
}

interface SensitiveCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
}

interface Group {
  id: string
  name: string
  slug: string
  description: string | null
  type: 'PUBLIC' | 'PRIVATE' | 'SECRET' | 'PROFESSIONAL'
  image: string | null
  coverImage: string | null
  membersCount: number
  createdAt: string
  joinPolicy: 'OPEN' | 'REQUEST' | 'INVITE_ONLY'
  contentVisibility: 'PUBLIC' | 'MEMBERS_ONLY'
  memberListVisibility: 'PUBLIC' | 'MEMBERS_ONLY'
  postPermission: 'ALL_MEMBERS' | 'MODS_AND_ADMINS' | 'ADMINS_ONLY'
  enableForum: boolean
  enableGallery: boolean
  enableDocuments: boolean
  enableGroupChat: boolean
  sensitiveJobCategory: SensitiveCategory | null
  hasSensitiveCategory: boolean
  createdBy: {
    id: string
    nick: string
    name: string
    image: string | null
  } | null
  isMember: boolean
  isAdmin: boolean
  isModerator: boolean
  userRole: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null
  admins: GroupMember[]
  moderators: GroupMember[]
  members: GroupMember[]
  recentMembers: GroupMember[]
  offers: GroupOffer[]
  offersCount: number
}

// Tab definitions
const TABS = [
  { id: 'about', label: 'Sobre', icon: Info },
  { id: 'members', label: 'Membres', icon: Users },
  { id: 'offers', label: 'Ofertes', icon: Tag },
  { id: 'files', label: 'Fitxers', icon: FileText, requiresEnabled: 'enableDocuments' },
  { id: 'gallery', label: 'Galeria', icon: ImageIcon, requiresEnabled: 'enableGallery' },
]

// Type badge component
function TypeBadge({ type }: { type: Group['type'] }) {
  const config = {
    PUBLIC: { icon: Globe, label: 'Públic', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PRIVATE: { icon: Lock, label: 'Privat', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    SECRET: { icon: EyeOff, label: 'Secret', color: 'bg-red-100 text-red-700 border-red-200' },
    PROFESSIONAL: { icon: Briefcase, label: 'Professional', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  }

  const { icon: Icon, label, color } = config[type]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

// Member avatar component
function MemberAvatar({ member, size = 'md' }: { member: GroupMember; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
      {member.image ? (
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
      )}
      {member.isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
      )}
    </div>
  )
}

// Role badge
function RoleBadge({ role }: { role: GroupMember['role'] }) {
  const config = {
    ADMIN: { icon: Crown, label: 'Admin', color: 'bg-amber-100 text-amber-700' },
    MODERATOR: { icon: Shield, label: 'Mod', color: 'bg-blue-100 text-blue-700' },
    MEMBER: { icon: Users, label: 'Membre', color: 'bg-gray-100 text-gray-600' },
  }

  const { icon: Icon, label, color } = config[role]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const slug = params.slug as string

  const [group, setGroup] = useState<Group | null>(null)
  const [activeTab, setActiveTab] = useState('about')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<'not_found' | 'forbidden' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [memberFilter, setMemberFilter] = useState<'all' | 'admins' | 'moderators'>('all')
  const [memberSearch, setMemberSearch] = useState('')

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setErrorMessage(null)

        const response = await fetch(`/api/groups/by-slug/${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('not_found')
            return
          }

          if (response.status === 403) {
            const data = await response.json()
            setError('forbidden')
            setErrorMessage(data.error || 'No tens accés a aquest grup')
            return
          }

          setError('error')
          return
        }

        const data = await response.json()
        setGroup(data)
      } catch (err) {
        console.error('Error fetching group:', err)
        setError('error')
        setErrorMessage('Error de connexió')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchGroup()
    }
  }, [slug])

  // Handle join group
  const handleJoinGroup = async () => {
    if (!group || !session) {
      router.push('/login')
      return
    }

    setIsJoining(true)
    try {
      const response = await fetch(`/api/groups/${group.id}/join`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsAdminApproval) {
          alert(`Ja ets membre del grup "${data.currentGroup}". Només pots pertànyer a un grup professional. Contacta amb un administrador per canviar de grup.`)
        } else {
          alert(data.error || 'Error al unir-se al grup')
        }
        return
      }

      // Refresh group data
      const refreshResponse = await fetch(`/api/groups/by-slug/${slug}`)
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        setGroup(refreshData)
      }
    } catch (err) {
      console.error('Error joining group:', err)
      alert('Error de connexió')
    } finally {
      setIsJoining(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Mai'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ara mateix'
    if (minutes < 60) return `Fa ${minutes} min`
    if (hours < 24) return `Fa ${hours}h`
    if (days < 7) return `Fa ${days} dies`
    return formatDate(dateString)
  }

  // Filter members
  const filteredMembers = group?.members.filter(member => {
    if (memberFilter === 'admins' && member.role !== 'ADMIN') return false
    if (memberFilter === 'moderators' && member.role !== 'MODERATOR') return false
    if (memberSearch) {
      const search = memberSearch.toLowerCase()
      return (
        member.name.toLowerCase().includes(search) ||
        member.nick.toLowerCase().includes(search)
      )
    }
    return true
  }) || []

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant grup...</p>
        </div>
      </div>
    )
  }

  // Error state - 404 Not Found
  if (error === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Grup no trobat
          </h2>
          <p className="text-gray-600 mb-6">
            El grup que busques no existeix o ha estat eliminat.
          </p>
          <button
            onClick={() => router.push('/dashboard/grups')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Tornar als grups
          </button>
        </div>
      </div>
    )
  }

  // Error state - 403 Forbidden (professional group when user already has one)
  if (error === 'forbidden') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Grup no disponible
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'No tens accés a aquest grup.'}
          </p>
          <button
            onClick={() => router.push('/dashboard/grups')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Tornar als grups
          </button>
        </div>
      </div>
    )
  }

  // Error state - General error
  if (error === 'error' || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al carregar el grup
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'Hi ha hagut un problema al carregar el grup. Torna-ho a intentar.'}
          </p>
          <button
            onClick={() => router.push('/dashboard/grups')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Tornar als grups
          </button>
        </div>
      </div>
    )
  }

  // Available tabs based on group settings
  const availableTabs = TABS.filter(tab => {
    if (tab.requiresEnabled) {
      return group[tab.requiresEnabled as keyof Group]
    }
    return true
  })

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Back button */}
      <div className="px-4 sm:px-6 py-4">
        <button
          onClick={() => router.push('/dashboard/grups')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Tornar als grups</span>
        </button>
      </div>

      {/* Header with cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 sm:h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-2xl overflow-hidden">
          {group.coverImage && (
            <Image
              src={group.coverImage}
              alt={group.name}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Avatar and info */}
        <div className="relative px-4 sm:px-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
              {group.image ? (
                <Image
                  src={group.image}
                  alt={group.name}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pb-2 sm:pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {group.name}
                </h1>
                <TypeBadge type={group.type} />
                {group.hasSensitiveCategory && group.sensitiveJobCategory && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: `${group.sensitiveJobCategory.color}15`,
                      borderColor: `${group.sensitiveJobCategory.color}30`,
                      color: group.sensitiveJobCategory.color || '#6366f1',
                    }}
                  >
                    <Shield className="w-3 h-3" />
                    {group.sensitiveJobCategory.name}
                  </span>
                )}
              </div>

              {group.description && (
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group.membersCount} membres
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Creat el {formatDate(group.createdAt)}
                </span>
                {group.offersCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {group.offersCount} ofertes
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-4">
              {!group.isMember ? (
                <JoinRequestButton
                  groupId={group.id}
                  groupName={group.name}
                  groupType={group.type}
                  isMember={group.isMember}
                  onJoined={() => {
                    // Refresh group data
                    fetch(`/api/groups/by-slug/${slug}`)
                      .then(res => res.json())
                      .then(data => setGroup(data))
                      .catch(console.error)
                  }}
                  className="px-5 py-2.5"
                />
              ) : (
                <>
                  {group.enableGroupChat && (
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      <MessageCircle className="w-4 h-4" />
                      Xat
                    </button>
                  )}
                  {(group.isAdmin || group.isModerator) && group.type !== 'SECRET' && (
                    <Link
                      href={`/dashboard/grups/${group.slug}/gestio/solicituds`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Sol·licituds
                    </Link>
                  )}
                  {(group.isAdmin || group.isModerator) && group.type === 'SECRET' && (
                    <Link
                      href={`/dashboard/grups/${group.slug}/gestio/invitacions`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invitacions
                    </Link>
                  )}
                  {group.isAdmin && (
                    <Link
                      href={`/admin/grups/${group.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      Gestionar
                    </Link>
                  )}
                </>
              )}

              {/* More menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notificacions
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <BellOff className="w-4 h-4" />
                        Silenciar
                      </button>
                      {group.isMember && (
                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Sortir del grup
                        </button>
                      )}
                      <hr className="my-1" />
                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <Flag className="w-4 h-4" />
                        Reportar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mt-6 px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto">
          {availableTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-4 sm:px-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Tab */}
          {activeTab === 'about' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle icon={<Info className="w-5 h-5 text-gray-500" />}>
                    Sobre el grup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {group.description || 'Aquest grup no té descripció.'}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{group.membersCount}</div>
                      <div className="text-sm text-gray-500">Membres</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{group.offersCount}</div>
                      <div className="text-sm text-gray-500">Ofertes</div>
                    </div>
                  </div>

                  {group.hasSensitiveCategory && group.sensitiveJobCategory && (
                    <div className="mt-6 p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800">Grup amb protecció especial</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Aquest grup està vinculat a la categoria "{group.sensitiveJobCategory.name}".
                            En unir-te, s'aplicaran automàticament restriccions de privacitat per protegir la teva identitat.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent members preview */}
              <Card>
                <CardHeader>
                  <CardTitle
                    icon={<Users className="w-5 h-5 text-gray-500" />}
                    action={
                      <button
                        onClick={() => setActiveTab('members')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Veure tots
                      </button>
                    }
                  >
                    Membres recents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {group.recentMembers.map(member => (
                      <Link
                        key={member.id}
                        href={`/dashboard/membres/${member.nick}`}
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MemberAvatar member={member} size="lg" />
                        <span className="mt-2 text-sm font-medium text-gray-900 text-center line-clamp-1">
                          {member.name}
                        </span>
                        <RoleBadge role={member.role} />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader>
                <CardTitle icon={<Users className="w-5 h-5 text-gray-500" />}>
                  Membres ({group.membersCount})
                </CardTitle>
              </CardHeader>
              <CardContent padding="none">
                {/* Filters */}
                <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-3">
                  <div className="flex gap-2">
                    {(['all', 'admins', 'moderators'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setMemberFilter(filter)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          memberFilter === filter
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {filter === 'all' ? 'Tots' : filter === 'admins' ? 'Admins' : 'Moderadors'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Cercar membre..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Members list */}
                <div className="divide-y divide-gray-100">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                      <Link
                        key={member.id}
                        href={`/dashboard/membres/${member.nick}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <MemberAvatar member={member} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{member.name}</span>
                            <RoleBadge role={member.role} />
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {member.position || member.department || `@${member.nick}`}
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          <div>Unit el {formatDate(member.joinedAt)}</div>
                          {member.isOnline ? (
                            <span className="text-emerald-500">En línia</span>
                          ) : (
                            <span>{formatRelativeTime(member.lastSeenAt)}</span>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-5 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No s'han trobat membres</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <Card>
              <CardHeader>
                <CardTitle icon={<Tag className="w-5 h-5 text-gray-500" />}>
                  Ofertes exclusives ({group.offersCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.offers.length > 0 ? (
                  <div className="grid gap-4">
                    {group.offers.map(offer => (
                      <div
                        key={offer.id}
                        className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        {offer.image && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={offer.image}
                              alt={offer.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                            {offer.discount && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                {offer.discount}
                              </span>
                            )}
                          </div>
                          {offer.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {offer.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {offer.company && (
                              <span className="flex items-center gap-1">
                                {offer.company.logo && (
                                  <Image
                                    src={offer.company.logo}
                                    alt={offer.company.name}
                                    width={16}
                                    height={16}
                                    className="rounded"
                                  />
                                )}
                                {offer.company.name}
                              </span>
                            )}
                            {offer.validUntil && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Vàlida fins {formatDate(offer.validUntil)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="self-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                          Veure
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hi ha ofertes disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <Card>
              <CardHeader>
                <CardTitle icon={<FileText className="w-5 h-5 text-gray-500" />}>
                  Fitxers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hi ha fitxers encara</p>
                  {group.isMember && (
                    <button className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      Pujar fitxer
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <Card>
              <CardHeader>
                <CardTitle icon={<ImageIcon className="w-5 h-5 text-gray-500" />}>
                  Galeria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hi ha imatges encara</p>
                  {group.isMember && (
                    <button className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      Pujar imatge
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informació</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tipus</span>
                <TypeBadge type={group.type} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Política d'accés</span>
                <span className="font-medium text-gray-900">
                  {group.joinPolicy === 'OPEN' ? 'Obert' : group.joinPolicy === 'REQUEST' ? 'Amb sol·licitud' : 'Per invitació'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Contingut</span>
                <span className="font-medium text-gray-900">
                  {group.contentVisibility === 'PUBLIC' ? 'Públic' : 'Només membres'}
                </span>
              </div>
              {group.createdBy && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Creat per</span>
                  <Link
                    href={`/dashboard/membres/${group.createdBy.nick}`}
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {group.createdBy.name}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admins card */}
          {group.admins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Administradors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.admins.map(admin => (
                  <Link
                    key={admin.id}
                    href={`/dashboard/membres/${admin.nick}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MemberAvatar member={admin} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{admin.name}</div>
                      <div className="text-xs text-gray-500">{admin.position || `@${admin.nick}`}</div>
                    </div>
                    <Crown className="w-4 h-4 text-amber-500" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Moderators card */}
          {group.moderators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Moderadors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.moderators.map(mod => (
                  <Link
                    key={mod.id}
                    href={`/dashboard/membres/${mod.nick}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MemberAvatar member={mod} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{mod.name}</div>
                      <div className="text-xs text-gray-500">{mod.position || `@${mod.nick}`}</div>
                    </div>
                    <Shield className="w-4 h-4 text-blue-500" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* User membership status */}
          {group.isMember && group.userRole && (
            <Card variant="highlighted">
              <CardContent className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-900 mb-1">Ets membre!</div>
                <RoleBadge role={group.userRole} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
