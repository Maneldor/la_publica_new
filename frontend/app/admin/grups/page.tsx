'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { StatsGrid } from '@/components/ui/StatsGrid'
import { TYPOGRAPHY, INPUTS, BUTTONS } from '@/lib/design-system'
import {
  UsersRound,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  Globe,
  Clock,
  UserCog
} from 'lucide-react'
import { GroupModal } from './components/GroupModal'
import { DeleteGroupModal } from './components/DeleteGroupModal'

interface User {
  id: string
  name: string | null
  nick: string | null
  email: string
  image?: string | null
}

interface Offer {
  id: string
  title: string
  company?: string | null
  category?: string | null
  image?: string | null
}

interface GroupMember {
  id?: string
  userId: string
  user?: User
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN'
}

interface Group {
  id?: string
  name: string
  slug: string
  description?: string | null
  type: 'PUBLIC' | 'PRIVATE' | 'SECRET' | 'PROFESSIONAL'
  image?: string | null
  coverImage?: string | null
  joinPolicy?: 'OPEN' | 'REQUEST' | 'INVITE_ONLY'
  contentVisibility?: 'PUBLIC' | 'MEMBERS_ONLY'
  memberListVisibility?: 'PUBLIC' | 'MEMBERS_ONLY'
  postPermission?: 'ALL_MEMBERS' | 'MODS_AND_ADMINS' | 'ADMINS_ONLY'
  enableForum?: boolean
  enableGallery?: boolean
  enableDocuments?: boolean
  enableGroupChat?: boolean
  membersCount?: number
  isActive?: boolean
  createdAt?: string
  members?: GroupMember[]
  sectorOffers?: { offerId: string; offer?: Offer }[]
  hasAdmin?: boolean
  pendingRequestsCount?: number
  admin?: User | null
  sensitiveJobCategoryId?: string | null
  sensitiveJobCategory?: { id: string; name: string; slug?: string; description?: string | null; icon?: string | null; color?: string | null } | null
  _count?: {
    members: number
  }
}

export default function GrupsAdminPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filtres
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showWithoutAdmin, setShowWithoutAdmin] = useState(false)

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null)

  // Stats
  const [stats, setStats] = useState({
    public: 0,
    professional: 0,
    private: 0,
    secret: 0,
    total: 0,
    withoutAdmin: 0,
    pendingRequests: 0
  })

  useEffect(() => {
    loadGroups()
  }, [page, filterType, showWithoutAdmin])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/groups?stats=true')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || { public: 0, professional: 0, private: 0, secret: 0, total: 0, withoutAdmin: 0, pendingRequests: 0 })
      }
    } catch {
      // Silently fail for stats
    }
  }

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        type: filterType,
        search: searchQuery,
      })

      if (showWithoutAdmin) {
        params.append('withoutAdmin', 'true')
      }

      const res = await fetch(`/api/admin/groups?${params}`)
      if (!res.ok) throw new Error('Error carregant grups')

      const data = await res.json()
      setGroups(data.groups || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
      if (data.stats) setStats(data.stats)
    } catch {
      setError("No s'han pogut carregar els grups")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadGroups()
  }

  const handleCreateGroup = async (groupData: Partial<Group>) => {
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error creant grup')
      }

      loadGroups()
      loadStats()
      setIsCreateModalOpen(false)
    } catch (err) {
      throw err
    }
  }

  const handleUpdateGroup = async (groupData: Partial<Group>) => {
    if (!editingGroup) return

    try {
      const res = await fetch(`/api/admin/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error actualitzant grup')
      }

      loadGroups()
      loadStats()
      setEditingGroup(null)
    } catch (err) {
      throw err
    }
  }

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return

    try {
      const res = await fetch(`/api/admin/groups/${deletingGroup.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error eliminant grup')
      }

      loadGroups()
      loadStats()
      setDeletingGroup(null)
    } catch {
      alert("Hi ha hagut un error eliminant el grup")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PUBLIC': return <Globe className="w-5 h-5 text-green-600" />
      case 'PROFESSIONAL': return <Briefcase className="w-5 h-5 text-indigo-600" />
      case 'PRIVATE': return <Lock className="w-5 h-5 text-amber-600" />
      case 'SECRET': return <EyeOff className="w-5 h-5 text-red-600" />
      default: return <Users className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PUBLIC': return 'bg-green-100 text-green-700 border-green-200'
      case 'PROFESSIONAL': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'PRIVATE': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'SECRET': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PUBLIC': return 'Públic'
      case 'PROFESSIONAL': return 'Professional'
      case 'PRIVATE': return 'Privat'
      case 'SECRET': return 'Secret'
      default: return type
    }
  }

  const statsData = [
    {
      label: 'Total',
      value: stats.total,
      icon: <UsersRound className="w-5 h-5" />,
      color: 'default' as const,
    },
    {
      label: 'Públics',
      value: stats.public,
      icon: <Globe className="w-5 h-5" />,
      color: 'green' as const,
    },
    {
      label: 'Privats',
      value: stats.private,
      icon: <Lock className="w-5 h-5" />,
      color: 'amber' as const,
    },
    {
      label: 'Professionals',
      value: stats.professional,
      icon: <Briefcase className="w-5 h-5" />,
      color: 'indigo' as const,
    },
    {
      label: 'Secrets',
      value: stats.secret,
      icon: <EyeOff className="w-5 h-5" />,
      color: 'red' as const,
    },
    {
      label: 'Sense admin',
      value: stats.withoutAdmin,
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'amber' as const,
      onClick: () => setShowWithoutAdmin(!showWithoutAdmin),
      highlighted: showWithoutAdmin,
    },
    {
      label: 'Sol·licituds',
      value: stats.pendingRequests,
      icon: <Clock className="w-5 h-5" />,
      color: 'red' as const,
      href: '/admin/grups/solicituds',
    },
  ]

  return (
    <PageLayout
      title="Gestió de Grups"
      subtitle="Administra tots els grups de la plataforma"
      icon={<UsersRound className="w-6 h-6" />}
      actions={
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={`${BUTTONS.primary} flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Nou Grup
        </button>
      }
    >
      {/* Stats */}
      <StatsGrid stats={statsData} columns={4} />

      {/* Avís de grups sense admin */}
      {stats.withoutAdmin > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Hi ha {stats.withoutAdmin} grup{stats.withoutAdmin > 1 ? 's' : ''} sense administrador assignat
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Les sol·licituds d&apos;accés a aquests grups es gestionen des del{' '}
                  <Link href="/admin/grups/solicituds" className="underline font-medium">
                    panell centralitzat de sol·licituds
                  </Link>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info box sobre tipus de grups */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">Tipus de grups:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Públic:</strong> Qualsevol pot veure i unir-se lliurement.</li>
                <li><strong>Privat:</strong> Visible, però requereix sol·licitud per unir-se.</li>
                <li><strong>Professional:</strong> Cada usuari només pot pertànyer a UN grup professional. Pot tenir categoria sensible.</li>
                <li><strong>Secret:</strong> No visible per a no-membres, només per invitació.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar grups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className={`${INPUTS.base} pl-10`}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
              className={INPUTS.select}
            >
              <option value="all">Tots els tipus</option>
              <option value="PUBLIC">Públics</option>
              <option value="PRIVATE">Privats</option>
              <option value="PROFESSIONAL">Professionals</option>
              <option value="SECRET">Secrets</option>
            </select>

            <button
              onClick={() => setShowWithoutAdmin(!showWithoutAdmin)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                showWithoutAdmin
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Sense admin
              </span>
            </button>

            <button
              onClick={() => loadGroups()}
              disabled={isLoading}
              className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Refrescar"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className={TYPOGRAPHY.small}>Carregant grups...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !error && groups.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <UsersRound className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2`}>
              No hi ha grups
            </h3>
            <p className={TYPOGRAPHY.body}>
              Crea el primer grup per començar
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={`${BUTTONS.primary} mt-4`}
            >
              Crear Grup
            </button>
          </CardContent>
        </Card>
      )}

      {/* Llista de grups */}
      {!isLoading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={`transition-all hover:shadow-md ${!group.isActive ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      group.type === 'PUBLIC' ? 'bg-green-100' :
                      group.type === 'PROFESSIONAL' ? 'bg-indigo-100' :
                      group.type === 'PRIVATE' ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      {getTypeIcon(group.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-xs text-gray-500">@{group.slug}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeBadge(group.type)}`}>
                      {getTypeLabel(group.type)}
                    </span>
                    {!group.isActive && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                        Inactiu
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges d'alerta */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {group.hasAdmin === false && group.type !== 'PUBLIC' && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                      Sense admin
                    </span>
                  )}
                  {(group.pendingRequestsCount || 0) > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      {group.pendingRequestsCount} sol·licituds
                    </span>
                  )}
                  {group.sensitiveJobCategory && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {group.sensitiveJobCategory.name}
                    </span>
                  )}
                </div>

                {group.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {group._count?.members || group.membersCount}
                  </span>
                  {group.admin && (
                    <span className="flex items-center gap-1">
                      <UserCog className="w-4 h-4" />
                      {group.admin.name || group.admin.nick}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/grups/${group.slug}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                      title="Veure"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {group.type !== 'PUBLIC' && group.type !== 'SECRET' && (
                      <Link
                        href={`/dashboard/grups/${group.slug}/gestio/solicituds`}
                        className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-gray-600 relative"
                        title="Sol·licituds"
                      >
                        <Clock className="w-4 h-4" />
                        {(group.pendingRequestsCount || 0) > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {group.pendingRequestsCount}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingGroup(group)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingGroup(group)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginacio */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={TYPOGRAPHY.small}>
            Pagina {page} de {totalPages} ({total} grups)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <GroupModal
        isOpen={isCreateModalOpen || !!editingGroup}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingGroup(null)
        }}
        group={editingGroup as Parameters<typeof GroupModal>[0]['group']}
        onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
      />

      {/* Modal Eliminar */}
      <DeleteGroupModal
        isOpen={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        group={deletingGroup as Parameters<typeof DeleteGroupModal>[0]['group']}
        onConfirm={handleDeleteGroup}
      />
    </PageLayout>
  )
}
