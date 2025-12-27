'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Plus,
  Search,
  Eye,
  Trash2,
  Pin,
  Star,
  Heart,
  Share2,
  Calendar,
  Filter,
  MoreHorizontal,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Flag,
  Shield,
  Users,
  RefreshCw
} from 'lucide-react'
import CreatePostModal from './components/CreatePostModal'
import PostDetailModal from './components/PostDetailModal'
import ModerationPanel from './components/ModerationPanel'

interface Post {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL' | 'EVENT'
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  visibility: 'PUBLIC' | 'GROUPS' | 'PRIVATE'
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  isOfficial: boolean
  officialBadge: string | null
  isPinned: boolean
  isFeatured: boolean
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  author: {
    id: string
    name: string | null
    nick: string | null
    image: string | null
    role: string
  }
  group: { id: string; name: string } | null
  poll?: {
    id: string
    question: string
    type: 'SINGLE' | 'MULTIPLE'
    totalVotes: number
    options: { id: string; text: string; voteCount: number }[]
  }
  attachments: { id: string; type: string; url: string }[]
  _count: {
    likes: number
    comments: number
    shares: number
    reports: number
  }
}

interface PostStats {
  total: number
  published: number
  scheduled: number
  draft: number
  pendingModeration: number
  reported: number
  pinned: number
  official: number
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Esborrany', color: 'bg-gray-100 text-gray-700', icon: Clock },
  SCHEDULED: { label: 'Programat', color: 'bg-amber-100 text-amber-700', icon: Calendar },
  PUBLISHED: { label: 'Publicat', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  ARCHIVED: { label: 'Arxivat', color: 'bg-red-100 text-red-700', icon: XCircle }
}

const MODERATION_CONFIG = {
  PENDING: { label: 'Pendent', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Aprovat', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rebutjat', color: 'bg-red-100 text-red-700' },
  FLAGGED: { label: 'Marcat', color: 'bg-orange-100 text-orange-700' }
}

const TYPE_CONFIG = {
  TEXT: { label: 'Text', icon: MessageSquare },
  IMAGE: { label: 'Imatge', icon: Eye },
  VIDEO: { label: 'Vídeo', icon: Eye },
  LINK: { label: 'Enllaç', icon: Share2 },
  POLL: { label: 'Enquesta', icon: BarChart3 },
  EVENT: { label: 'Esdeveniment', icon: Calendar }
}

export default function FeedPostsManagementPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<PostStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [moderationFilter, setModerationFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [showOfficialOnly, setShowOfficialOnly] = useState(false)
  const [showReportedOnly, setShowReportedOnly] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showModerationPanel, setShowModerationPanel] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (statusFilter) params.append('status', statusFilter)
      if (moderationFilter) params.append('moderationStatus', moderationFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (showOfficialOnly) params.append('isOfficial', 'true')
      if (showReportedOnly) params.append('hasReports', 'true')
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/gestio/feed-posts?${params}`)
      const data = await res.json()

      if (res.ok) {
        setPosts(data.posts || [])
        setStats(data.stats || null)
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error carregant posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, moderationFilter, typeFilter, showOfficialOnly, showReportedOnly, searchTerm])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleDelete = async (id: string) => {
    if (!confirm('Segur que vols eliminar aquest post?')) return

    try {
      const res = await fetch(`/api/gestio/feed-posts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error eliminant post:', error)
    }
    setOpenMenuId(null)
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      await fetch(`/api/gestio/feed-posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', isPinned: !isPinned })
      })
      loadPosts()
    } catch (error) {
      console.error('Error anclant post:', error)
    }
    setOpenMenuId(null)
  }

  const handleToggleFeature = async (id: string, isFeatured: boolean) => {
    try {
      await fetch(`/api/gestio/feed-posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'feature', isFeatured: !isFeatured })
      })
      loadPosts()
    } catch (error) {
      console.error('Error destacant post:', error)
    }
    setOpenMenuId(null)
  }

  const handleModerate = async (id: string, status: string, note?: string) => {
    try {
      await fetch(`/api/gestio/feed-posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderate', moderationStatus: status, moderationNote: note })
      })
      loadPosts()
    } catch (error) {
      console.error('Error moderant post:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-indigo-600" />
            Gestió del Feed
          </h1>
          <p className="text-gray-600 mt-1">Gestiona els posts del feed social, enquestes i moderació</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModerationPanel(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
          >
            <Shield className="w-4 h-4" />
            Moderació
            {stats && stats.pendingModeration > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {stats.pendingModeration}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post oficial
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                <p className="text-xs text-gray-500">Publicats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.scheduled}</p>
                <p className="text-xs text-gray-500">Programats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                <p className="text-xs text-gray-500">Esborranys</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-orange-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingModeration}</p>
                <p className="text-xs text-gray-500">Moderació</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.reported}</p>
                <p className="text-xs text-gray-500">Reportats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Pin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pinned}</p>
                <p className="text-xs text-gray-500">Fixats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-indigo-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">{stats.official}</p>
                <p className="text-xs text-gray-500">Oficials</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tots els estats</option>
              <option value="DRAFT">Esborranys</option>
              <option value="SCHEDULED">Programats</option>
              <option value="PUBLISHED">Publicats</option>
              <option value="ARCHIVED">Arxivats</option>
            </select>
            <select
              value={moderationFilter}
              onChange={(e) => { setModerationFilter(e.target.value); setPage(1) }}
              className="px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tota moderació</option>
              <option value="PENDING">Pendent</option>
              <option value="APPROVED">Aprovat</option>
              <option value="REJECTED">Rebutjat</option>
              <option value="FLAGGED">Marcat</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
              className="px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tots els tipus</option>
              <option value="TEXT">Text</option>
              <option value="IMAGE">Imatge</option>
              <option value="VIDEO">Vídeo</option>
              <option value="LINK">Enllaç</option>
              <option value="POLL">Enquesta</option>
              <option value="EVENT">Esdeveniment</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showOfficialOnly}
                onChange={(e) => { setShowOfficialOnly(e.target.checked); setPage(1) }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Oficials</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showReportedOnly}
                onChange={(e) => { setShowReportedOnly(e.target.checked); setPage(1) }}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Reportats</span>
            </label>
            <button
              onClick={loadPosts}
              className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualitzar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregant posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hi ha posts</h3>
            <p className="text-gray-500 mb-6">No s'han trobat posts amb els filtres seleccionats</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Crear post oficial
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {posts.map((post) => {
                const StatusIcon = STATUS_CONFIG[post.status]?.icon || Clock
                const TypeIcon = TYPE_CONFIG[post.type]?.icon || MessageSquare

                return (
                  <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Author avatar */}
                      <div className="flex-shrink-0">
                        {post.author.image ? (
                          <img
                            src={post.author.image}
                            alt={post.author.name || ''}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {(post.author.name || post.author.nick || '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {post.isOfficial && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                              <Star className="w-3 h-3" />
                              {post.officialBadge || 'Oficial'}
                            </span>
                          )}
                          {post.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                              <Pin className="w-3 h-3" />
                              Fixat
                            </span>
                          )}
                          {post.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              <Star className="w-3 h-3" />
                              Destacat
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[post.status]?.color || ''}`}>
                            <StatusIcon className="w-3 h-3" />
                            {STATUS_CONFIG[post.status]?.label || post.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${MODERATION_CONFIG[post.moderationStatus]?.color || ''}`}>
                            {MODERATION_CONFIG[post.moderationStatus]?.label || post.moderationStatus}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            <TypeIcon className="w-3 h-3" />
                            {TYPE_CONFIG[post.type]?.label || post.type}
                          </span>
                          {post._count.reports > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                              <Flag className="w-3 h-3" />
                              {post._count.reports} reports
                            </span>
                          )}
                          {post.group && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              <Users className="w-3 h-3" />
                              {post.group.name}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-left text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {truncateContent(post.content)}
                        </button>

                        {post.poll && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-indigo-600" />
                              {post.poll.question}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {post.poll.options.length} opcions - {post.poll.totalVotes} vots
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">
                            {post.author.name || post.author.nick}
                            {post.author.role !== 'MEMBRE' && (
                              <span className="ml-1 text-indigo-600">({post.author.role})</span>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.createdAt)}
                          </span>
                          {post.status === 'SCHEDULED' && post.scheduledAt && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Clock className="w-3 h-3" />
                              Programat: {formatDate(post.scheduledAt)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post._count.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            {post._count.shares}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>

                        {openMenuId === post.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-10 z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <button
                                onClick={() => { setSelectedPost(post); setOpenMenuId(null) }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                                Veure detall
                              </button>
                              <button
                                onClick={() => handleTogglePin(post.id, post.isPinned)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pin className="w-4 h-4" />
                                {post.isPinned ? 'Desfixar' : 'Fixar'}
                              </button>
                              <button
                                onClick={() => handleToggleFeature(post.id, post.isFeatured)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Star className="w-4 h-4" />
                                {post.isFeatured ? 'Treure destacat' : 'Destacar'}
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <div className="px-4 py-2">
                                <span className="text-xs font-medium text-gray-500 uppercase">Moderació</span>
                              </div>
                              <button
                                onClick={() => { handleModerate(post.id, 'APPROVED'); setOpenMenuId(null) }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aprovar
                              </button>
                              <button
                                onClick={() => { handleModerate(post.id, 'FLAGGED'); setOpenMenuId(null) }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                              >
                                <AlertTriangle className="w-4 h-4" />
                                Marcar
                              </button>
                              <button
                                onClick={() => { handleModerate(post.id, 'REJECTED'); setOpenMenuId(null) }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Rebutjar
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Pàgina {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Següent
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            loadPosts()
          }}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdated={() => {
            loadPosts()
          }}
        />
      )}

      {showModerationPanel && (
        <ModerationPanel
          onClose={() => setShowModerationPanel(false)}
          onUpdated={loadPosts}
        />
      )}
    </div>
  )
}
