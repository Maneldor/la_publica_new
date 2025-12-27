'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FileText,
  Search,
  Plus,
  Grid,
  List,
  Users,
  Bookmark,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  X,
  Loader2,
  Pin,
  Star,
  BarChart3,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeDate } from '@/lib/utils/blog'

// Interfaces matching API response
interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  readingTime: number
  views: number
  isPinned: boolean
  isFeatured: boolean
  allowComments: boolean
  allowReactions: boolean
  publishedAt: string | null
  createdAt: string
  category: {
    id: string
    name: string
    color: string | null
  } | null
  tags: { name: string }[]
  author: {
    id: string
    nick: string
    name: string | null
    surname: string | null
    avatar: string | null
  }
  _count: {
    reactions: number
    comments: number
  }
  // Local state for interactions
  isLiked?: boolean
  isSaved?: boolean
  userReaction?: string | null
  isBookmarked?: boolean
  poll?: {
    id: string
    question: string
    type: 'SINGLE' | 'MULTIPLE'
    _count: {
      votes: number
    }
  } | null
}

// Tabs
const TABS = [
  { id: 'all', label: 'Tots' },
  { id: 'featured', label: 'Destacats' },
  { id: 'saved', label: 'Guardats' },
  { id: 'popular', label: 'Populars' },
]

// Blog Card Component
function BlogCard({ blog, viewMode, onLike, onSave }: {
  blog: BlogPost
  viewMode: 'grid' | 'list'
  onLike: (id: string) => void
  onSave: (id: string) => void
}) {
  const authorName = blog.author.name && blog.author.surname
    ? `${blog.author.name} ${blog.author.surname}`
    : blog.author.nick

  const dateStr = blog.publishedAt || blog.createdAt

  if (viewMode === 'list') {
    return (
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Cover Image */}
            <div className="w-36 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative">
              {blog.coverImage ? (
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                  <FileText className="w-8 h-8" />
                </div>
              )}
              {blog.category && (
                <div
                  className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: blog.category.color || '#6366f1' }}
                >
                  {blog.category.name}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {blog.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                    {blog.isFeatured && <Star className="w-4 h-4 text-indigo-500 fill-current" />}
                    <Link
                      href={`/dashboard/blogs/${blog.slug}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {blog.title}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              {/* Author and stats */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                    {blog.author.avatar ? (
                      <Image
                        src={blog.author.avatar}
                        alt={authorName}
                        width={24}
                        height={24}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{authorName}</span>
                  <span className="text-xs text-gray-400">· {formatRelativeDate(dateStr)} · {blog.readingTime} min</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {blog.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {blog._count.comments}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); onLike(blog.id) }}
                    className={`flex items-center gap-1 transition-colors ${blog.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-current' : ''}`} />
                    {blog._count.reactions}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); onSave(blog.id) }}
                    className={`transition-colors ${blog.isSaved ? 'text-indigo-600' : 'hover:text-indigo-600'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${blog.isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Poll indicator */}
              {blog.poll && (
                <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600">
                  <BarChart3 className="w-3 h-3" />
                  <span>Enquesta: {blog.poll.question.substring(0, 40)}...</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      {/* Cover image */}
      <div className="aspect-video bg-gradient-to-br from-indigo-400 to-purple-500 relative">
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Category badge */}
        {blog.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: blog.category.color || '#6366f1' }}
            >
              {blog.category.name}
            </span>
          </div>
        )}

        {/* Pinned/Featured indicators */}
        {(blog.isPinned || blog.isFeatured) && (
          <div className="absolute top-3 left-3 flex items-center gap-1" style={{ left: blog.category ? 'auto' : '0.75rem', right: blog.category ? '3rem' : 'auto' }}>
            {blog.isPinned && (
              <span className="p-1.5 bg-amber-500 text-white rounded-full">
                <Pin className="w-3 h-3" />
              </span>
            )}
            {blog.isFeatured && (
              <span className="p-1.5 bg-indigo-500 text-white rounded-full">
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(blog.id) }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              blog.isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(blog.id) }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              blog.isSaved ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${blog.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Read time */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {blog.readingTime} min
          </span>
        </div>

        {/* Poll indicator */}
        {blog.poll && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-indigo-600/90 text-white text-xs rounded-full flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Enquesta
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link
          href={`/dashboard/blogs/${blog.slug}`}
          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2"
        >
          {blog.title}
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>

        {/* Author */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
            {blog.author.avatar ? (
              <Image
                src={blog.author.avatar}
                alt={authorName}
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">{authorName}</span>
          <span className="text-xs text-gray-400">· {formatRelativeDate(dateStr)}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {blog.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {blog._count.comments}
          </span>
          <span className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-current text-red-500' : ''}`} />
            {blog._count.reactions}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default function BlogsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'saved' | 'popular'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch blogs on mount
  useEffect(() => {
    loadBlogs()
  }, [])

  const loadBlogs = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/blog/posts')
      const data = await res.json()

      if (res.ok) {
        setBlogs(data.posts || [])
      } else {
        setError(data.error || 'Error carregant articles')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de connexió')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter blogs based on active tab and search
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter(blog => {
        // Filter by tab
        if (activeTab === 'featured') return blog.isFeatured
        if (activeTab === 'saved') return blog.isSaved || blog.isBookmarked
        if (activeTab === 'popular') return blog.views > 100 || blog._count.reactions > 10
        return true
      })
      .filter(blog => {
        // Filter by search
        if (searchTerm) {
          const search = searchTerm.toLowerCase()
          return (
            blog.title.toLowerCase().includes(search) ||
            (blog.excerpt?.toLowerCase().includes(search)) ||
            blog.tags.some(tag => tag.name.toLowerCase().includes(search))
          )
        }
        return true
      })
      .sort((a, b) => {
        // Pinned posts first
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        // Then by date
        const dateA = new Date(a.publishedAt || a.createdAt).getTime()
        const dateB = new Date(b.publishedAt || b.createdAt).getTime()
        return dateB - dateA
      })
  }, [blogs, activeTab, searchTerm])

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: blogs.length,
    featured: blogs.filter(b => b.isFeatured).length,
    saved: blogs.filter(b => b.isSaved || b.isBookmarked).length,
    popular: blogs.filter(b => b.views > 100 || b._count.reactions > 10).length,
  }), [blogs])

  // Stats
  const stats = useMemo(() => ({
    total: blogs.length,
    featured: blogs.filter(b => b.isFeatured).length,
    saved: blogs.filter(b => b.isSaved || b.isBookmarked).length,
    popular: blogs.filter(b => b.views > 100 || b._count.reactions > 10).length,
  }), [blogs])

  // Handlers
  const handleLikeBlog = async (blogId: string) => {
    try {
      const res = await fetch(`/api/blog/posts/${blogId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'LIKE' })
      })

      if (res.ok) {
        setBlogs(prev => prev.map(blog => {
          if (blog.id === blogId) {
            const wasLiked = blog.isLiked
            return {
              ...blog,
              isLiked: !wasLiked,
              _count: {
                ...blog._count,
                reactions: wasLiked ? blog._count.reactions - 1 : blog._count.reactions + 1
              }
            }
          }
          return blog
        }))
      }
    } catch (err) {
      console.error('Error reacting:', err)
    }
  }

  const handleSaveBlog = async (blogId: string) => {
    try {
      const res = await fetch(`/api/blog/posts/${blogId}/bookmark`, {
        method: 'POST'
      })

      if (res.ok) {
        setBlogs(prev => prev.map(blog => {
          if (blog.id === blogId) {
            return {
              ...blog,
              isSaved: !blog.isSaved,
              isBookmarked: !blog.isBookmarked
            }
          }
          return blog
        }))
      }
    } catch (err) {
      console.error('Error bookmarking:', err)
    }
  }

  return (
    <PageLayout
      title="Blogs"
      subtitle="Descobreix articles i reflexions de la comunitat"
      icon={<FileText className="w-6 h-6" />}
      actions={
        <button
          onClick={() => router.push('/dashboard/blogs/crear')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear article
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total articles</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.featured}</p>
              <p className="text-sm text-gray-500">Destacats</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.saved}</p>
              <p className="text-sm text-gray-500">Guardats</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.popular}</p>
              <p className="text-sm text-gray-500">Populars</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and view toggle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar articles per títol, contingut o etiqueta..."
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

          {/* Counter */}
          <span className="text-sm text-gray-500 whitespace-nowrap self-center">
            {filteredBlogs.length} articles
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'featured' | 'saved' | 'popular')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tabCounts[tab.id as keyof typeof tabCounts] > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts[tab.id as keyof typeof tabCounts]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregant articles...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={loadBlogs}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Tornar a carregar
              </button>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-0'
            }>
              {filteredBlogs.map(blog => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  viewMode={viewMode}
                  onLike={handleLikeBlog}
                  onSave={handleSaveBlog}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No s&apos;han trobat articles
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No hi ha articles que coincideixin amb "${searchTerm}"`
                  : activeTab === 'featured'
                    ? 'No hi ha articles destacats'
                    : activeTab === 'saved'
                      ? 'No tens cap article guardat'
                      : activeTab === 'popular'
                        ? 'No hi ha articles populars encara'
                        : 'No hi ha articles disponibles'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/dashboard/blogs/crear')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Crear el primer article
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
