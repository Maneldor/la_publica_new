'use client'

import { useState, useEffect } from 'react'
import {
  MessageCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Globe,
  Lock,
  UserCheck,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  Shield,
  Loader2,
  LayoutGrid,
  List,
  CheckCircle,
  XCircle,
  // Icones per fòrums
  MessagesSquare,
  HelpCircle,
  Lightbulb,
  Target,
  BookOpen,
  Wrench,
  Palette,
  Gamepad2,
  Trophy,
  Star,
  Flame,
  Briefcase,
  Building2,
  Scale,
  ClipboardList,
  Heart,
  Megaphone,
  Bell,
  Calendar,
  FileText,
  Settings,
  Zap,
  Coffee,
  GraduationCap,
  Landmark,
  Gavel,
  HandHelping,
  Info,
  type LucideIcon
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import CreateForumModal from './components/CreateForumModal'
import CategoriesModal from './components/CategoriesModal'

// Mapa d'icones Lucide per nom
const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  HelpCircle,
  Lightbulb,
  Target,
  BookOpen,
  Wrench,
  Palette,
  Gamepad2,
  Trophy,
  Star,
  Flame,
  Briefcase,
  Building2,
  Scale,
  Gavel,
  ClipboardList,
  Users,
  Heart,
  Megaphone,
  Bell,
  Calendar,
  FileText,
  FolderOpen,
  Settings,
  Shield,
  Zap,
  Coffee,
  GraduationCap,
  Landmark,
  HandHelping,
  Info
}

// Helper per obtenir icona pel nom
const getForumIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) return MessageCircle
  return ICON_MAP[iconName] || MessageCircle
}

interface Forum {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  visibility: 'PUBLIC' | 'GROUPS' | 'PRIVATE'
  isActive: boolean
  isLocked: boolean
  order: number
  category: { id: string; name: string; color: string | null } | null
  groups: { id: string; name: string }[]
  moderators: { id: string; name: string | null; nick: string | null }[]
  createdBy: { id: string; name: string | null; nick: string | null }
  createdAt: string
  _count: {
    topics: number
    posts: number
  }
}

interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  order: number
  _count: { forums: number }
}

interface Stats {
  totalForums: number
  activeForums: number
  lockedForums: number
  publicForums: number
  groupForums: number
  privateForums: number
  totalTopics: number
  totalPosts: number
}

const VISIBILITY_CONFIG = {
  PUBLIC: { icon: Globe, label: 'Públic', color: 'text-green-600', bg: 'bg-green-100' },
  GROUPS: { icon: UserCheck, label: 'Grups', color: 'text-blue-600', bg: 'bg-blue-100' },
  PRIVATE: { icon: Lock, label: 'Privat', color: 'text-gray-600', bg: 'bg-gray-100' }
}

export default function ForumsGestioPage() {
  const [forums, setForums] = useState<Forum[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filtres
  const [filters, setFilters] = useState({
    category: '',
    visibility: '',
    active: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [editingForum, setEditingForum] = useState<Forum | null>(null)

  // Accions
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchForums()
  }, [filters.category, filters.visibility, filters.active])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchForums()
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchForums = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.visibility) params.set('visibility', filters.visibility)
      if (filters.active) params.set('active', filters.active)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/gestio/forums?${params}`)
      const data = await res.json()

      setForums(data.forums || [])
      setStats(data.stats || null)
      setCategories(data.categories || [])
    } catch (error) {
      toast.error('Error carregant fòrums')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (forumId: string, isActive: boolean) => {
    setActionLoading(forumId)
    try {
      const res = await fetch(`/api/gestio/forums/${forumId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (!res.ok) throw new Error()

      toast.success(isActive ? 'Fòrum activat' : 'Fòrum desactivat')
      fetchForums()
    } catch {
      toast.error('Error actualitzant el fòrum')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (forumId: string) => {
    if (!confirm('Segur que vols eliminar aquest fòrum? S\'eliminaran tots els temes i respostes.')) return

    setActionLoading(forumId)
    try {
      const res = await fetch(`/api/gestio/forums/${forumId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error()

      toast.success('Fòrum eliminat')
      fetchForums()
    } catch {
      toast.error('Error eliminant el fòrum')
    } finally {
      setActionLoading(null)
    }
  }

  const openEditModal = (forum: Forum) => {
    setEditingForum(forum)
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setEditingForum(null)
  }

  const activeFiltersCount = Object.values(filters).filter(v => v).length

  return (
    <div className="space-y-6">
      {/* Header - Consistent amb Feed/Posts i Blog */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fòrums</h1>
            <p className="text-gray-500">Gestiona els fòrums de discussió de la comunitat</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            Categories
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nou Fòrum
          </button>
        </div>
      </div>

      {/* Stats - Consistent amb altres pàgines */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <StatCard icon={MessageCircle} label="Total" value={stats.totalForums} />
          <StatCard icon={CheckCircle} label="Actius" value={stats.activeForums} color="text-green-600" />
          <StatCard icon={XCircle} label="Bloquejats" value={stats.lockedForums} color="text-red-600" />
          <StatCard icon={Globe} label="Públics" value={stats.publicForums} color="text-blue-600" />
          <StatCard icon={UserCheck} label="Grups" value={stats.groupForums} color="text-purple-600" />
          <StatCard icon={Lock} label="Privats" value={stats.privateForums} color="text-gray-600" />
          <StatCard icon={MessageSquare} label="Temes" value={stats.totalTopics} color="text-amber-600" />
          <StatCard icon={TrendingUp} label="Respostes" value={stats.totalPosts} color="text-teal-600" />
        </div>
      )}

      {/* Filtres - Consistent amb Feed/Posts */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Cerca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Cercar fòrums..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
            />
          </div>

          {/* Vista grid/list */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeFiltersCount > 0
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={fetchForums}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filtres expandits - Inline com Feed/Posts */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white"
            >
              <option value="">Totes les categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={filters.visibility}
              onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white"
            >
              <option value="">Totes les visibilitats</option>
              <option value="PUBLIC">Públics</option>
              <option value="GROUPS">Grups</option>
              <option value="PRIVATE">Privats</option>
            </select>

            <select
              value={filters.active}
              onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white"
            >
              <option value="">Tots els estats</option>
              <option value="true">Actius</option>
              <option value="false">Inactius</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => setFilters({ category: '', visibility: '', active: '', search: '' })}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                Netejar filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contingut - Grid o List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : forums.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hi ha fòrums</h3>
          <p className="text-gray-500 mb-6">Comença creant el primer fòrum de discussió</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Crear Fòrum
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forums.map(forum => (
            <ForumCard
              key={forum.id}
              forum={forum}
              onEdit={() => openEditModal(forum)}
              onToggleActive={() => handleToggleActive(forum.id, !forum.isActive)}
              onDelete={() => handleDelete(forum.id)}
              isLoading={actionLoading === forum.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {forums.map(forum => (
              <ForumRow
                key={forum.id}
                forum={forum}
                onEdit={() => openEditModal(forum)}
                onToggleActive={() => handleToggleActive(forum.id, !forum.isActive)}
                onDelete={() => handleDelete(forum.id)}
                isLoading={actionLoading === forum.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateForumModal
          forum={editingForum}
          categories={categories}
          onClose={closeCreateModal}
          onSuccess={() => { closeCreateModal(); fetchForums() }}
        />
      )}

      {showCategoriesModal && (
        <CategoriesModal
          categories={categories}
          onClose={() => setShowCategoriesModal(false)}
          onSuccess={fetchForums}
        />
      )}
    </div>
  )
}

// ============================================
// COMPONENTS AUXILIARS
// ============================================

function StatCard({ icon: Icon, label, value, color = 'text-gray-900' }: {
  icon: LucideIcon
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ForumCard({ forum, onEdit, onToggleActive, onDelete, isLoading }: {
  forum: Forum
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
  isLoading: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const visConfig = VISIBILITY_CONFIG[forum.visibility]
  const VisIcon = visConfig.icon
  const ForumIcon = getForumIcon(forum.icon)
  const forumColor = forum.color || '#6366f1'

  return (
    <div className={`bg-white rounded-xl border ${forum.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50/30'} p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icona amb color */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: forumColor + '20' }}
          >
            <ForumIcon
              className="w-6 h-6"
              style={{ color: forumColor }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{forum.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${visConfig.bg} ${visConfig.color}`}>
                <VisIcon className="w-3 h-3" />
                {visConfig.label}
              </span>
              {forum.category && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: forum.category.color ? `${forum.category.color}20` : '#f3f4f6',
                    color: forum.category.color || '#6b7280'
                  }}
                >
                  {forum.category.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menú */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={isLoading}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => { onEdit(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => { onToggleActive(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700"
                >
                  {forum.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {forum.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => { onDelete(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {forum.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{forum.description}</p>
      )}

      {/* Grups si visibilitat és GROUPS */}
      {forum.visibility === 'GROUPS' && forum.groups.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {forum.groups.slice(0, 3).map(g => (
            <span key={g.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              {g.name}
            </span>
          ))}
          {forum.groups.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{forum.groups.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MessageSquare className="w-4 h-4" />
          <span>{forum._count.topics} temes</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>{forum._count.posts} respostes</span>
        </div>
      </div>

      {/* Estat inactiu */}
      {!forum.isActive && (
        <div className="mt-3 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg text-center font-medium">
          Fòrum desactivat
        </div>
      )}

      {/* Bloquejar */}
      {forum.isLocked && forum.isActive && (
        <div className="mt-3 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs rounded-lg text-center font-medium flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Bloquejat
        </div>
      )}
    </div>
  )
}

function ForumRow({ forum, onEdit, onToggleActive, onDelete, isLoading }: {
  forum: Forum
  onEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
  isLoading: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const visConfig = VISIBILITY_CONFIG[forum.visibility]
  const VisIcon = visConfig.icon
  const ForumIcon = getForumIcon(forum.icon)
  const forumColor = forum.color || '#6366f1'

  return (
    <div className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${!forum.isActive ? 'bg-red-50/30' : ''}`}>
      {/* Icona */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: forumColor + '20' }}
      >
        <ForumIcon
          className="w-5 h-5"
          style={{ color: forumColor }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{forum.name}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${visConfig.bg} ${visConfig.color}`}>
            <VisIcon className="w-3 h-3" />
            {visConfig.label}
          </span>
          {forum.category && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: forum.category.color ? `${forum.category.color}20` : '#f3f4f6',
                color: forum.category.color || '#6b7280'
              }}
            >
              {forum.category.name}
            </span>
          )}
          {!forum.isActive && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              Inactiu
            </span>
          )}
          {forum.isLocked && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Bloquejat
            </span>
          )}
        </div>
        {forum.description && (
          <p className="text-sm text-gray-500 truncate">{forum.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <div className="text-center">
          <p className="font-semibold text-gray-900">{forum._count.topics}</p>
          <p className="text-xs">temes</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{forum._count.posts}</p>
          <p className="text-xs">respostes</p>
        </div>
      </div>

      {/* Menú */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
              <button
                onClick={() => { onEdit(); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => { onToggleActive(); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700"
              >
                {forum.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {forum.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <hr className="my-1" />
              <button
                onClick={() => { onDelete(); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
