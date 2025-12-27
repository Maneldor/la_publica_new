'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Pin,
  Star,
  MessageCircle,
  Calendar,
  Filter,
  MoreHorizontal,
  Loader2,
  Clock,
  Users,
  BarChart3,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils/blog'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  visibility: 'PUBLIC' | 'GROUPS' | 'PRIVATE'
  isPinned: boolean
  isFeatured: boolean
  viewCount: number
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
    nick: string | null
  }
  category: {
    id: string
    name: string
    color: string | null
  } | null
  _count: {
    comments: number
    reactions: number
    bookmarks: number
  }
}

interface Stats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  scheduledPosts: number
  totalViews: number
  totalComments: number
  pendingComments: number
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Esborrany', color: 'bg-gray-100 text-gray-700' },
  SCHEDULED: { label: 'Programat', color: 'bg-amber-100 text-amber-700' },
  PUBLISHED: { label: 'Publicat', color: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: 'Arxivat', color: 'bg-red-100 text-red-700' }
}

export default function BlogManagementPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [statusFilter])

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ admin: 'true' })
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/blog/posts?${params}`)
      const data = await res.json()

      if (res.ok) {
        setPosts(data.posts || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error carregant posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Segur que vols eliminar aquest article?')) return

    try {
      const res = await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' })
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
      await fetch(`/api/blog/posts/${id}`, {
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
      await fetch(`/api/blog/posts/${id}`, {
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" />
            Gestió del Blog
          </h1>
          <p className="text-gray-600 mt-1">Crea i gestiona els articles del blog</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/gestio/contingut/blog/programacio"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Programació IA
          </Link>
          <Link
            href="/gestio/contingut/blog/crear"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nou article
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
                <p className="text-xs text-gray-500">Publicats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Edit className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.draftPosts}</p>
                <p className="text-xs text-gray-500">Esborranys</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.scheduledPosts}</p>
                <p className="text-xs text-gray-500">Programats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalViews}</p>
                <p className="text-xs text-gray-500">Visites</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalComments}</p>
                <p className="text-xs text-gray-500">Comentaris</p>
              </div>
            </div>
          </div>
          {stats.pendingComments > 0 && (
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingComments}</p>
                  <p className="text-xs text-gray-500">Pendents</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tots els estats</option>
              <option value="DRAFT">Esborranys</option>
              <option value="SCHEDULED">Programats</option>
              <option value="PUBLISHED">Publicats</option>
              <option value="ARCHIVED">Arxivats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregant articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hi ha articles</h3>
            <p className="text-gray-500 mb-6">Crea el teu primer article per començar</p>
            <Link
              href="/gestio/contingut/blog/crear"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Crear article
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          <Pin className="w-3 h-3" />
                          Anclat
                        </span>
                      )}
                      {post.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          <Star className="w-3 h-3" />
                          Destacat
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[post.status].color}`}>
                        {STATUS_CONFIG[post.status].label}
                      </span>
                      {post.category && (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: post.category.color || '#6366f1' }}
                        >
                          {post.category.name}
                        </span>
                      )}
                      {post.visibility === 'GROUPS' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          <Users className="w-3 h-3" />
                          Grups
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/gestio/contingut/blog/${post.id}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {post.title}
                    </Link>

                    {post.excerpt && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{post.excerpt}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Per {post.author.name || post.author.nick}</span>
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatRelativeDate(post.publishedAt)}
                        </span>
                      )}
                      {post.status === 'SCHEDULED' && post.scheduledAt && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock className="w-3 h-3" />
                          Programat: {new Date(post.scheduledAt).toLocaleDateString('ca-ES')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post._count.comments}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>

                    {openMenuId === post.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                          <Link
                            href={`/gestio/contingut/blog/${post.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          <Link
                            href={`/dashboard/blogs/${post.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            Veure
                          </Link>
                          <button
                            onClick={() => handleTogglePin(post.id, post.isPinned)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Pin className="w-4 h-4" />
                            {post.isPinned ? 'Desanclar' : 'Anclar'}
                          </button>
                          <button
                            onClick={() => handleToggleFeature(post.id, post.isFeatured)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Star className="w-4 h-4" />
                            {post.isFeatured ? 'Treure destacat' : 'Destacar'}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
