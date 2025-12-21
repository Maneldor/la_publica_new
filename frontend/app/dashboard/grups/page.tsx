'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  Search,
  Grid,
  List,
  Plus,
  Lock,
  Globe,
  EyeOff,
  Briefcase,
  Shield,
  Loader2,
  ChevronRight,
  Calendar,
  Tag,
  Filter,
  X,
} from 'lucide-react'

// Types
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
  hasSensitiveCategory: boolean
  sensitiveJobCategory: SensitiveCategory | null
  isMember: boolean
  userRole: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null
}

interface ProfessionalGroup {
  id: string
  name: string
  slug: string
  image: string | null
}

// Type badge component
function TypeBadge({ type, size = 'sm' }: { type: Group['type']; size?: 'sm' | 'md' }) {
  const config = {
    PUBLIC: { icon: Globe, label: 'Públic', color: 'bg-emerald-100 text-emerald-700' },
    PRIVATE: { icon: Lock, label: 'Privat', color: 'bg-amber-100 text-amber-700' },
    SECRET: { icon: EyeOff, label: 'Secret', color: 'bg-red-100 text-red-700' },
    PROFESSIONAL: { icon: Briefcase, label: 'Professional', color: 'bg-indigo-100 text-indigo-700' },
  }

  const { icon: Icon, label, color } = config[type]
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${color} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </span>
  )
}

// Group card component
function GroupCard({ group }: { group: Group }) {
  const initials = group.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <Link href={`/dashboard/grups/${group.slug}`}>
      <Card variant="interactive" className="h-full overflow-hidden">
        {/* Cover */}
        <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          {group.coverImage && (
            <Image
              src={group.coverImage}
              alt={group.name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <TypeBadge type={group.type} />
          </div>

          {/* Member badge */}
          {group.isMember && (
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 rounded-full text-xs font-medium text-gray-700">
              {group.userRole === 'ADMIN' ? 'Admin' : group.userRole === 'MODERATOR' ? 'Mod' : 'Membre'}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 -mt-8 border-2 border-white shadow-lg">
              {group.image ? (
                <Image
                  src={group.image}
                  alt={group.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.membersCount}
                </span>
                {group.hasSensitiveCategory && group.sensitiveJobCategory && (
                  <span
                    className="flex items-center gap-1"
                    style={{ color: group.sensitiveJobCategory.color || '#6366f1' }}
                  >
                    <Shield className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>

          {group.description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
              {group.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Tabs
const TABS = [
  { id: 'all', label: 'Tots' },
  { id: 'myGroups', label: 'Els Meus' },
  { id: 'PUBLIC', label: 'Públics' },
  { id: 'PRIVATE', label: 'Privats' },
  { id: 'PROFESSIONAL', label: 'Professionals' },
]

export default function GrupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Info de l'usuari
  const [userHasProfessionalGroup, setUserHasProfessionalGroup] = useState(false)
  const [userProfessionalGroup, setUserProfessionalGroup] = useState<ProfessionalGroup | null>(null)

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/groups')
        if (!res.ok) {
          throw new Error('Error al carregar els grups')
        }

        const data = await res.json()
        setGroups(data.groups || [])
        setUserHasProfessionalGroup(data.userHasProfessionalGroup || false)
        setUserProfessionalGroup(data.userProfessionalGroup || null)
      } catch (err) {
        console.error('Error fetching groups:', err)
        setError('Error al carregar els grups')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])

  // Filter groups
  const filteredGroups = useMemo(() => {
    let result = groups

    // Tab filter
    if (activeTab === 'myGroups') {
      result = result.filter(g => g.isMember)
    } else if (['PUBLIC', 'PRIVATE', 'PROFESSIONAL'].includes(activeTab)) {
      result = result.filter(g => g.type === activeTab)
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(g =>
        g.name.toLowerCase().includes(search) ||
        g.description?.toLowerCase().includes(search)
      )
    }

    return result
  }, [groups, activeTab, searchTerm])

  // Stats
  const stats = useMemo(() => ({
    total: groups.length,
    myGroups: groups.filter(g => g.isMember).length,
    public: groups.filter(g => g.type === 'PUBLIC').length,
    professional: groups.filter(g => g.type === 'PROFESSIONAL').length,
  }), [groups])

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grups</h1>
          <p className="text-gray-500 mt-1">
            Descobreix i uneix-te a grups de la comunitat
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard/grups/crear')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear grup
        </button>
      </div>

      {/* Professional group warning */}
      {userHasProfessionalGroup && userProfessionalGroup && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-indigo-900">
                Ja pertanys a un grup professional
              </p>
              <p className="text-sm text-indigo-700 mt-1">
                Com a membre de <strong>{userProfessionalGroup.name}</strong>,
                no pots veure ni unir-te a altres grups professionals.
                Només es permet pertànyer a un grup professional.
              </p>
            </div>
            <Link
              href={`/dashboard/grups/${userProfessionalGroup.slug}`}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              Veure grup
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total grups</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="text-2xl font-bold text-indigo-600">{stats.myGroups}</div>
          <div className="text-sm text-gray-500">Els meus grups</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">{stats.public}</div>
          <div className="text-sm text-gray-500">Públics</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.professional}</div>
          <div className="text-sm text-gray-500">Professionals</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cercar grups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* View mode */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'myGroups' && stats.myGroups > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                  {stats.myGroups}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant grups...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Groups grid/list */}
      {!isLoading && !error && (
        <>
          {filteredGroups.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              {filteredGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No s'han trobat grups
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No hi ha grups que coincideixin amb "${searchTerm}"`
                  : activeTab === 'myGroups'
                    ? "Encara no ets membre de cap grup"
                    : "No hi ha grups disponibles en aquesta categoria"
                }
              </p>
              {activeTab === 'myGroups' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Explorar grups
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
