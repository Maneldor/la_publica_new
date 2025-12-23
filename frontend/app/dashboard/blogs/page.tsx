'use client'

import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { BlogPost, Author, BlogCategory } from './types/blogTypes'
import { sampleAuthors, sampleBlogs, blogCategories } from './data/blogData'
import { useBlogFilters } from './hooks/useBlogFilters'

// Tabs
const TABS = [
  { id: 'all', label: 'Tots' },
  { id: 'mine', label: 'Els Meus' },
  { id: 'following', label: 'Guardats' },
  { id: 'popular', label: 'Populars' },
]

// Blog Card Component
function BlogCard({ blog, viewMode, onLike, onSave }: {
  blog: BlogPost
  viewMode: 'grid' | 'list'
  onLike: (id: number) => void
  onSave: (id: number) => void
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return 'Fa uns minuts'
    if (hours < 24) return `Fa ${hours}h`
    if (days < 2) return 'Ahir'
    if (days < 7) return `Fa ${days} dies`
    return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
  }

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
              <div
                className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: blog.categoryColor || '#6366f1' }}
              >
                {blog.category}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/dashboard/blogs/${blog.slug}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {blog.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              {/* Author and stats */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                    {blog.author?.avatar ? (
                      <Image
                        src={blog.author.avatar}
                        alt={blog.author.name}
                        width={24}
                        height={24}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                        {blog.author?.name?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{blog.author?.name}</span>
                  <span className="text-xs text-gray-400">· {formatDate(blog.publishedAt)} · {blog.readTime} min</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {blog.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {blog.comments}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); onLike(blog.id) }}
                    className={`flex items-center gap-1 transition-colors ${blog.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-current' : ''}`} />
                    {blog.likes}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); onSave(blog.id) }}
                    className={`transition-colors ${blog.isSaved ? 'text-indigo-600' : 'hover:text-indigo-600'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${blog.isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
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
        <div className="absolute top-3 left-3">
          <span
            className="px-2 py-1 text-xs font-medium rounded-full text-white"
            style={{ backgroundColor: blog.categoryColor || '#6366f1' }}
          >
            {blog.category}
          </span>
        </div>

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
            {blog.readTime} min
          </span>
        </div>
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
            {blog.author?.avatar ? (
              <Image
                src={blog.author.avatar}
                alt={blog.author.name}
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                {blog.author?.name?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">{blog.author?.name}</span>
          <span className="text-xs text-gray-400">· {formatDate(blog.publishedAt)}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {blog.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {blog.comments}
          </span>
          <span className="flex items-center gap-1">
            <Heart className={`w-4 h-4 ${blog.isLiked ? 'fill-current text-red-500' : ''}`} />
            {blog.likes}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default function BlogsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogPost[]>(sampleBlogs)
  const [authors] = useState<Author[]>(sampleAuthors)
  const [categories] = useState<BlogCategory[]>(blogCategories)
  const [isLoading, setIsLoading] = useState(false)

  // UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filters hook
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredBlogs,
    tabCounts,
  } = useBlogFilters(blogs, authors, categories)

  // Handlers
  const handleLikeBlog = (blogId: number) => {
    setBlogs(prev => prev.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          isLiked: !blog.isLiked,
          likes: blog.isLiked ? blog.likes - 1 : blog.likes + 1
        }
      }
      return blog
    }))
  }

  const handleSaveBlog = (blogId: number) => {
    setBlogs(prev => prev.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          isSaved: !blog.isSaved
        }
      }
      return blog
    }))
  }

  // Stats
  const stats = useMemo(() => ({
    total: blogs.length,
    mine: blogs.filter(b => b.author.id === 1).length,
    saved: blogs.filter(b => b.isSaved).length,
    popular: blogs.filter(b => b.featured || b.views > 1000).length,
  }), [blogs])

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
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.mine}</p>
              <p className="text-sm text-gray-500">Els meus</p>
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
              onClick={() => setActiveTab(tab.id as 'all' | 'mine' | 'following' | 'popular')}
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
                No s'han trobat articles
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No hi ha articles que coincideixin amb "${searchTerm}"`
                  : activeTab === 'mine'
                    ? 'Encara no has creat cap article'
                    : activeTab === 'following'
                      ? 'No tens cap article guardat'
                      : activeTab === 'popular'
                        ? 'No hi ha articles populars encara'
                        : 'No hi ha articles disponibles'
                }
              </p>
              {(activeTab === 'mine' || !searchTerm) && (
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
