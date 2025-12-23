'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Search,
  Grid,
  List,
  Plus,
  Briefcase,
  Loader2,
  X,
  Globe,
  Lock,
  UserPlus,
  Activity,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { GroupCard } from './components/GroupCard'
import { useToast } from '@/components/ui/use-toast'

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
  requestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null
}

interface ProfessionalGroup {
  id: string
  name: string
  slug: string
  image: string | null
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
  const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingGroupId, setProcessingGroupId] = useState<string | null>(null)

  // Filtres
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Info de l'usuari
  const [userHasProfessionalGroup, setUserHasProfessionalGroup] = useState(false)
  const [userProfessionalGroup, setUserProfessionalGroup] = useState<ProfessionalGroup | null>(null)

  // Fetch groups
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

  useEffect(() => {
    fetchGroups()
  }, [])

  // Handler per unir-se directament a un grup públic
  const handleDirectJoin = async (groupId: string) => {
    try {
      setProcessingGroupId(groupId)
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al unir-se al grup')
      }

      toast({
        title: 'Unit al grup!',
        description: data.message || "T'has unit al grup correctament",
      })

      // Recarregar grups
      await fetchGroups()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al unir-se al grup',
        variant: 'destructive',
      })
    } finally {
      setProcessingGroupId(null)
    }
  }

  // Handler per sol·licitar accés a un grup privat/professional
  const handleRequestJoin = async (groupId: string) => {
    try {
      setProcessingGroupId(groupId)
      const res = await fetch(`/api/groups/${groupId}/request-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar la sol·licitud')
      }

      toast({
        title: 'Sol·licitud enviada',
        description: data.message || "S'ha enviat la sol·licitud d'accés",
      })

      // Actualitzar l'estat del grup localment
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId ? { ...g, requestStatus: 'PENDING' as const } : g
        )
      )
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al enviar la sol·licitud',
        variant: 'destructive',
      })
    } finally {
      setProcessingGroupId(null)
    }
  }

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
    <PageLayout
      title="Grups"
      subtitle="Descobreix i uneix-te a grups de la comunitat"
      icon={<Users className="w-6 h-6" />}
      actions={
        <button
          onClick={() => router.push('/dashboard/grups/crear')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear grup
        </button>
      }
    >
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total grups</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.myGroups}</p>
              <p className="text-sm text-gray-500">Els meus grups</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.public}</p>
              <p className="text-sm text-gray-500">Públics</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.professional}</p>
              <p className="text-sm text-gray-500">Professionals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de cerca i filtres */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar grups per nom o descripció..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
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
              title="Vista graella"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista llista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Comptador */}
          <span className="text-sm text-gray-500 whitespace-nowrap self-center">
            {filteredGroups.length} grups
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.id === 'myGroups' && stats.myGroups > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                  {stats.myGroups}
                </span>
              )}
            </button>
          ))}
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
          <div className="p-4">
            {filteredGroups.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleDirectJoin}
                    onRequestJoin={handleRequestJoin}
                    isProcessing={processingGroupId === group.id}
                  />
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
          </div>
        )}
      </div>
    </PageLayout>
  )
}
