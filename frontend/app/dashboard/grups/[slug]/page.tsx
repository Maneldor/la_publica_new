'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JoinRequestButton } from '../components/JoinRequestButton'
import { GroupFeed } from './components/GroupFeed'
import {
  Users,
  Newspaper,
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
  slug: string
  shortDescription: string | null
  description: string | null
  images: string[]
  price: number | null
  originalPrice: number | null
  expiresAt: string | null
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
  enableFeed: boolean
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
  { id: 'feed', label: 'Feed', icon: Newspaper, requiresEnabled: 'enableFeed', requiresMember: true },
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
  const [isLeaving, setIsLeaving] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

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
        // Set default tab based on membership and feed availability
        if (data.isMember && data.enableFeed) {
          setActiveTab('feed')
        }
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

  // Handle leave group
  const handleLeaveGroup = async () => {
    if (!group) return

    setIsLeaving(true)
    try {
      const response = await fetch(`/api/groups/${group.id}/leave`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Error sortint del grup')
        return
      }

      // Redirigir a la llista de grups
      router.push('/dashboard/grups')
    } catch (err) {
      console.error('Error leaving group:', err)
      alert('Error de connexió')
    } finally {
      setIsLeaving(false)
      setShowLeaveModal(false)
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

  // Available tabs based on group settings and membership
  const availableTabs = TABS.filter(tab => {
    // Check if tab requires membership
    if ('requiresMember' in tab && tab.requiresMember && !group.isMember) {
      return false
    }
    // Check if tab requires a feature to be enabled
    if (tab.requiresEnabled) {
      return group[tab.requiresEnabled as keyof Group]
    }
    return true
  })

  // Determine default active tab (feed if member and enabled, otherwise about)
  const defaultTab = group.isMember && group.enableFeed ? 'feed' : 'about'

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header with cover */}
      <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden">
        {/* Imatge de fons */}
        {group.coverImage ? (
          <Image
            src={group.coverImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${
            group.type === 'PUBLIC' ? 'from-emerald-400 to-teal-600' :
            group.type === 'PRIVATE' ? 'from-amber-400 to-orange-600' :
            group.type === 'PROFESSIONAL' ? 'from-indigo-400 to-purple-600' :
            'from-red-400 to-rose-600'
          }`} />
        )}

        {/* Overlay gradient per llegibilitat */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Badge tipus - a dalt esquerra */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm ${
            group.type === 'PUBLIC' ? 'bg-emerald-500/90 text-white' :
            group.type === 'PRIVATE' ? 'bg-amber-500/90 text-white' :
            group.type === 'PROFESSIONAL' ? 'bg-indigo-500/90 text-white' :
            'bg-red-500/90 text-white'
          }`}>
            {group.type === 'PUBLIC' && <Globe className="w-4 h-4" />}
            {group.type === 'PRIVATE' && <Lock className="w-4 h-4" />}
            {group.type === 'PROFESSIONAL' && <Briefcase className="w-4 h-4" />}
            {group.type === 'SECRET' && <EyeOff className="w-4 h-4" />}
            {group.type === 'PUBLIC' ? 'Públic' :
             group.type === 'PRIVATE' ? 'Privat' :
             group.type === 'PROFESSIONAL' ? 'Professional' : 'Secret'}
          </span>
          {group.hasSensitiveCategory && group.sensitiveJobCategory && (
            <span
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
              style={{
                backgroundColor: `${group.sensitiveJobCategory.color}dd`,
                color: 'white',
              }}
            >
              <Shield className="w-3.5 h-3.5" />
              Protegit
            </span>
          )}
        </div>

        {/* Contingut - a baix */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
              {group.image ? (
                <Image
                  src={group.image}
                  alt={group.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${
                  group.type === 'PUBLIC' ? 'from-emerald-400 to-teal-600' :
                  group.type === 'PRIVATE' ? 'from-amber-400 to-orange-600' :
                  group.type === 'PROFESSIONAL' ? 'from-indigo-400 to-purple-600' :
                  'from-red-400 to-rose-600'
                } flex items-center justify-center text-white`}>
                  {group.type === 'PUBLIC' && <Globe className="w-10 h-10" />}
                  {group.type === 'PRIVATE' && <Lock className="w-10 h-10" />}
                  {group.type === 'PROFESSIONAL' && <Briefcase className="w-10 h-10" />}
                  {group.type === 'SECRET' && <EyeOff className="w-10 h-10" />}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-white/90 mt-1 line-clamp-2 drop-shadow text-sm md:text-base">
                  {group.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {group.membersCount} membres
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Creat el {formatDate(group.createdAt)}
                </span>
                {group.offersCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {group.offersCount} ofertes
                  </span>
                )}
              </div>
            </div>

            {/* Botons - a la dreta (només desktop) */}
            <div className="hidden sm:flex items-center gap-2 pb-1 relative">
              {group.isMember && group.enableGroupChat && (
                <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Xat
                </button>
              )}
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showMoreMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notificacions
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <BellOff className="w-4 h-4" />
                      Silenciar
                    </button>
                    {group.isMember && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false)
                          setShowLeaveModal(true)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
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

      {/* Actions bar sota el header */}
      <div className="flex items-center gap-2 flex-wrap">
        {!group.isMember ? (
          <JoinRequestButton
            groupId={group.id}
            groupName={group.name}
            groupType={group.type}
            isMember={group.isMember}
            onJoined={() => {
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
              <button className="sm:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
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

        {/* More menu per mobile */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="sm:hidden p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ml-auto"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto -mb-px">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feed Tab */}
          {activeTab === 'feed' && group.enableFeed && group.isMember && (
            <GroupFeed
              groupId={group.id}
              canPost={
                group.postPermission === 'ALL_MEMBERS' ||
                (group.postPermission === 'MODS_AND_ADMINS' && (group.isAdmin || group.isModerator)) ||
                (group.postPermission === 'ADMINS_ONLY' && group.isAdmin)
              }
              userRole={group.userRole}
            />
          )}

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
                        {offer.images && offer.images.length > 0 && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={offer.images[0]}
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
                            {offer.originalPrice && offer.price && offer.originalPrice > offer.price && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                -{Math.round((1 - offer.price / offer.originalPrice) * 100)}%
                              </span>
                            )}
                          </div>
                          {(offer.shortDescription || offer.description) && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {offer.shortDescription || offer.description}
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
                            {offer.expiresAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Vàlida fins {formatDate(offer.expiresAt)}
                              </span>
                            )}
                            {offer.price && (
                              <span className="font-semibold text-gray-900">
                                {offer.price.toFixed(2)}€
                                {offer.originalPrice && offer.originalPrice > offer.price && (
                                  <span className="ml-1 line-through text-gray-400 font-normal">
                                    {offer.originalPrice.toFixed(2)}€
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/ofertes/${offer.slug}`}
                          className="self-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Veure
                        </Link>
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
          {/* Card d'estat de membre */}
          {group.isMember && group.userRole ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-semibold text-gray-900">Ets membre!</p>
                <p className="text-sm text-gray-500 mt-1">
                  {group.userRole === 'ADMIN' ? 'Administrador' :
                   group.userRole === 'MODERATOR' ? 'Moderador' : 'Membre'}
                </p>

                {/* Accions de membre */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <button className="w-full py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    Configurar notificacions
                  </button>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="w-full py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sortir del grup
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Card per sol·licitar accés */
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="font-semibold text-gray-900">Uneix-te al grup</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  {group.joinPolicy === 'OPEN'
                    ? 'Pots unir-te directament'
                    : group.joinPolicy === 'REQUEST'
                    ? 'Cal sol·licitar accés'
                    : 'Només per invitació'}
                </p>
                <JoinRequestButton
                  groupId={group.id}
                  groupName={group.name}
                  groupType={group.type}
                  isMember={group.isMember}
                  onJoined={() => {
                    fetch(`/api/groups/by-slug/${slug}`)
                      .then(res => res.json())
                      .then(data => setGroup(data))
                      .catch(console.error)
                  }}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}

          {/* Card d'informació */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informació</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tipus</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  group.type === 'PUBLIC' ? 'bg-emerald-100 text-emerald-700' :
                  group.type === 'PRIVATE' ? 'bg-amber-100 text-amber-700' :
                  group.type === 'PROFESSIONAL' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {group.type === 'PUBLIC' && <Globe className="w-3 h-3" />}
                  {group.type === 'PRIVATE' && <Lock className="w-3 h-3" />}
                  {group.type === 'PROFESSIONAL' && <Briefcase className="w-3 h-3" />}
                  {group.type === 'SECRET' && <EyeOff className="w-3 h-3" />}
                  {group.type === 'PUBLIC' ? 'Públic' :
                   group.type === 'PRIVATE' ? 'Privat' :
                   group.type === 'PROFESSIONAL' ? 'Professional' : 'Secret'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Política d'accés</span>
                <span className="text-gray-900">
                  {group.joinPolicy === 'OPEN' ? 'Obert' : group.joinPolicy === 'REQUEST' ? 'Amb sol·licitud' : 'Per invitació'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Contingut</span>
                <span className="text-gray-900">
                  {group.contentVisibility === 'PUBLIC' ? 'Públic' : 'Només membres'}
                </span>
              </div>
              {group.createdBy && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Creat per</span>
                  <Link
                    href={`/dashboard/membres/${group.createdBy.nick}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {group.createdBy.name}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card d'administradors */}
          {group.admins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Administradors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.admins.map(admin => (
                    <Link
                      key={admin.id}
                      href={`/dashboard/membres/${admin.nick}`}
                      className="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {admin.image ? (
                          <Image src={admin.image} alt="" width={32} height={32} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                            {admin.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
                        <p className="text-xs text-gray-500">@{admin.nick}</p>
                      </div>
                      <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card de moderadors */}
          {group.moderators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Moderadors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.moderators.map(mod => (
                    <Link
                      key={mod.id}
                      href={`/dashboard/membres/${mod.nick}`}
                      className="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {mod.image ? (
                          <Image src={mod.image} alt="" width={32} height={32} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-bold">
                            {mod.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{mod.name}</p>
                        <p className="text-xs text-gray-500">@{mod.nick}</p>
                      </div>
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de confirmació per sortir del grup */}
      {showLeaveModal && group && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLeaveModal(false)}
          />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sortir del grup
            </h3>
            <p className="text-gray-600 mb-4">
              Estàs segur que vols sortir del grup <strong>{group.name}</strong>?
            </p>

            {group.type === 'PROFESSIONAL' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <p className="text-amber-700 text-sm flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    Si surts d&apos;aquest grup professional, podràs unir-te a un altre grup professional.
                    {group.sensitiveJobCategory && (
                      <span className="block mt-1">
                        La teva categoria sensible (<strong>{group.sensitiveJobCategory.name}</strong>) serà eliminada.
                      </span>
                    )}
                  </span>
                </p>
              </div>
            )}

            {group.isAdmin && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-700 text-sm flex items-start gap-2">
                  <span className="text-lg">🛑</span>
                  <span>
                    Ets administrador d&apos;aquest grup. Assegura&apos;t que hi ha un altre administrador abans de sortir.
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isLeaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Sí, sortir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
