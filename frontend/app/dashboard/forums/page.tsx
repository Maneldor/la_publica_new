'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare,
  Search,
  Plus,
  Grid,
  List,
  Users,
  TrendingUp,
  Clock,
  Star,
  Pin,
  Paperclip,
  ThumbsUp,
  X,
  Loader2,
  MessageCircle,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Post, ForumFilters, TabCounts } from './types/forumTypes'
import { samplePosts } from './data/forumData'

// Tabs
const TABS = [
  { id: 'tots', label: 'Tots' },
  { id: 'meus', label: 'Els Meus' },
  { id: 'seguits', label: 'Seguits' },
  { id: 'populars', label: 'Populars' },
]

// Forum Card Component
function ForumCard({ post, viewMode }: { post: Post; viewMode: 'grid' | 'list' }) {
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
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {post.authorAvatar ? (
                <Image
                  src={post.authorAvatar}
                  alt={post.author}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                  {post.author.charAt(0)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/dashboard/forums/${post.id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {post.isPinned && <Pin className="w-4 h-4 inline mr-1 text-amber-500" />}
                    {post.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {post.author} · {formatDate(post.createdAt)}
                  </p>
                </div>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full whitespace-nowrap">
                  {post.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.commentsCount}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {post.votesUp}
                </span>
                {post.hasAttachments && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="w-4 h-4" />
                    {post.attachments.length}
                  </span>
                )}
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
      <div className="h-32 bg-gradient-to-br from-indigo-400 to-purple-500 relative">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt=""
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full text-gray-700">
            {post.category}
          </span>
          {post.isPinned && (
            <span className="p-1 bg-amber-400 rounded-full">
              <Pin className="w-3 h-3 text-white" />
            </span>
          )}
        </div>

        {post.hasAttachments && (
          <div className="absolute top-3 right-3">
            <span className="p-1.5 bg-white/90 rounded-full flex items-center justify-center">
              <Paperclip className="w-3.5 h-3.5 text-gray-600" />
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link
          href={`/dashboard/forums/${post.id}`}
          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2"
        >
          {post.title}
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>

        {/* Author */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
            {post.authorAvatar ? (
              <Image
                src={post.authorAvatar}
                alt={post.author}
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                {post.author.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">{post.author}</span>
          <span className="text-xs text-gray-400">· {formatDate(post.createdAt)}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {post.commentsCount}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {post.votesUp}
          </span>
          {post.isFollowing && (
            <span className="flex items-center gap-1 text-indigo-600">
              <Star className="w-4 h-4 fill-current" />
              Seguit
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function ForumsPage() {
  const router = useRouter()
  const [allPosts, setAllPosts] = useState<Post[]>(samplePosts)
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [activeTab, setActiveTab] = useState('tots')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Load forums from localStorage
  useEffect(() => {
    const createdForums = JSON.parse(localStorage.getItem('createdForums') || '[]')

    const convertedForums: Post[] = createdForums
      .filter((forum: any) => forum.status === 'published')
      .map((forum: any) => ({
        id: forum.id,
        title: forum.title,
        content: forum.description,
        author: forum.author,
        authorAvatar: forum.authorAvatar,
        category: forum.category,
        tags: forum.tags || [forum.category],
        coverImage: forum.coverImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop',
        createdAt: forum.createdAt,
        lastActivity: 'fa pocs minuts',
        commentsCount: forum.commentsCount || 0,
        votesUp: forum.votesUp || 0,
        votesDown: forum.votesDown || 0,
        isFollowing: forum.isFollowing || false,
        isPinned: forum.isPinned || false,
        hasAttachments: forum.hasAttachments || false,
        attachments: forum.attachments || []
      }))

    const combinedPosts = [...convertedForums, ...samplePosts]
    setAllPosts(combinedPosts)
  }, [])

  // Filter posts
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search) ||
        post.category.toLowerCase().includes(search) ||
        post.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    // Tab filter
    switch (activeTab) {
      case 'meus':
        filtered = filtered.filter(post => post.author === 'Maria González')
        break
      case 'seguits':
        filtered = filtered.filter(post => post.isFollowing)
        break
      case 'populars':
        filtered = filtered.sort((a, b) => (b.votesUp - b.votesDown) - (a.votesUp - a.votesDown)).slice(0, 6)
        break
      default:
        filtered = filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        break
    }

    return filtered
  }, [allPosts, searchTerm, activeTab])

  // Stats
  const stats = useMemo(() => ({
    total: allPosts.length,
    myForums: allPosts.filter(p => p.author === 'Maria González').length,
    following: allPosts.filter(p => p.isFollowing).length,
    comments: allPosts.reduce((sum, p) => sum + p.commentsCount, 0),
  }), [allPosts])

  // Tab counts
  const tabCounts = useMemo(() => ({
    tots: allPosts.length,
    meus: allPosts.filter(p => p.author === 'Maria González').length,
    seguits: allPosts.filter(p => p.isFollowing).length,
    populars: Math.min(6, allPosts.length),
  }), [allPosts])

  return (
    <PageLayout
      title="Fòrums"
      subtitle="Espai de debat i col·laboració professional"
      icon={<MessageSquare className="w-6 h-6" />}
      actions={
        <button
          onClick={() => router.push('/dashboard/forums/crear')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear fòrum
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total fòrums</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.myForums}</p>
              <p className="text-sm text-gray-500">Els meus</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.following}</p>
              <p className="text-sm text-gray-500">Seguits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.comments}</p>
              <p className="text-sm text-gray-500">Comentaris</p>
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
              placeholder="Cercar fòrums per títol, contingut o categoria..."
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
            {filteredPosts.length} fòrums
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
              <p className="text-gray-600">Carregant fòrums...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-0'
            }>
              {filteredPosts.map(post => (
                <ForumCard key={post.id} post={post} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No s'han trobat fòrums
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `No hi ha fòrums que coincideixin amb "${searchTerm}"`
                  : activeTab === 'meus'
                    ? 'Encara no has creat cap fòrum'
                    : activeTab === 'seguits'
                      ? 'No segueixes cap fòrum'
                      : 'No hi ha fòrums disponibles'
                }
              </p>
              {(activeTab === 'meus' || !searchTerm) && (
                <button
                  onClick={() => router.push('/dashboard/forums/crear')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Crear el primer fòrum
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
