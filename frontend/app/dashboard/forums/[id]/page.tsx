'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare,
  Users,
  Calendar,
  Tag,
  Info,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Paperclip,
  Pin,
  Star,
  Bell,
  Share2,
  Bookmark,
  MoreHorizontal,
  ArrowLeft,
  Loader2,
  Check,
  Plus,
  Eye,
  Clock,
  UserMinus,
  Flag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { samplePosts } from '../data/forumData'
import { Post, Attachment } from '../types/forumTypes'

// Tabs
const TABS = [
  { id: 'content', label: 'Contingut', icon: MessageSquare },
  { id: 'comments', label: 'Comentaris', icon: MessageCircle },
  { id: 'about', label: 'Informació', icon: Info },
]

// Sample comments
const sampleComments = [
  {
    id: 1,
    author: 'Pere López',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'Molt interessant! Crec que és una bona iniciativa per millorar els processos.',
    createdAt: '2025-01-07T11:30:00Z',
    votesUp: 5,
    votesDown: 0,
  },
  {
    id: 2,
    author: 'Anna García',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'Estic d\'acord amb la proposta. Caldria afegir més detalls sobre la implementació.',
    createdAt: '2025-01-07T12:15:00Z',
    votesUp: 3,
    votesDown: 1,
  },
]

export default function ForumDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [votes, setVotes] = useState({ up: 0, down: 0 })
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [activeTab, setActiveTab] = useState('content')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const loadPost = () => {
      setIsLoading(true)
      const postId = parseInt(params.id as string)

      // Buscar en foros de ejemplo
      let foundPost = samplePosts.find(p => p.id === postId)

      // Si no se encuentra, buscar en foros creados
      if (!foundPost) {
        const createdForums = JSON.parse(localStorage.getItem('createdForums') || '[]')
        const createdPost = createdForums.find((forum: any) => forum.id === postId)

        if (createdPost) {
          foundPost = {
            id: createdPost.id,
            title: createdPost.title,
            content: createdPost.description,
            author: createdPost.author,
            authorAvatar: createdPost.authorAvatar,
            category: createdPost.category,
            tags: createdPost.tags || [createdPost.category],
            coverImage: createdPost.coverImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
            createdAt: createdPost.createdAt,
            lastActivity: 'fa pocs minuts',
            commentsCount: createdPost.commentsCount || 0,
            votesUp: createdPost.votesUp || 0,
            votesDown: createdPost.votesDown || 0,
            isFollowing: createdPost.isFollowing || false,
            isPinned: createdPost.isPinned || false,
            hasAttachments: createdPost.hasAttachments || false,
            attachments: createdPost.attachments || []
          }
        }
      }

      if (foundPost) {
        setPost(foundPost)
        setIsFollowing(foundPost.isFollowing)
        setVotes({ up: foundPost.votesUp, down: foundPost.votesDown })
      }
      setIsLoading(false)
    }

    loadPost()
  }, [params.id])

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setVotes(prev => ({ ...prev, [type]: prev[type] - 1 }))
      setUserVote(null)
    } else {
      setVotes(prev => {
        const newVotes = { ...prev }
        if (userVote) newVotes[userVote] -= 1
        newVotes[type] += 1
        return newVotes
      })
      setUserVote(type)
    }
  }

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant fòrum...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fòrum no trobat</h2>
          <p className="text-gray-600 mb-6">El fòrum que busques no existeix o ha estat eliminat.</p>
          <button
            onClick={() => router.push('/dashboard/forums')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tornar als fòrums
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header with cover */}
      <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden">
        {/* Cover image */}
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Category badge - top left */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-white/90 text-gray-700 backdrop-blur-sm">
            <Tag className="w-4 h-4" />
            {post.category}
          </span>
          {post.isPinned && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-amber-400 text-white">
              <Pin className="w-4 h-4" />
              Fixat
            </span>
          )}
        </div>

        {/* Content - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-5">
            {/* Icon/Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white">
                <MessageSquare className="w-10 h-10" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-white/80 text-sm flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  {post.commentsCount} comentaris
                </span>
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4" />
                  {votes.up} vots
                </span>
                <span className="flex items-center gap-1.5 hidden sm:flex">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg text-sm ${
                  isFollowing
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Seguint</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    <span className="hidden sm:inline">Seguir</span>
                  </>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMoreMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Compartir
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Bookmark className="w-4 h-4" />
                        Desar
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notificacions
                      </button>
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
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'comments' && post.commentsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {post.commentsCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <>
              {/* Post content */}
              <Card>
                <CardContent className="p-6">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {post.authorAvatar ? (
                        <Image
                          src={post.authorAvatar}
                          alt={post.author}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                          {post.author.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.author}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(post.createdAt)}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attachments */}
              {post.hasAttachments && post.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Paperclip className="w-5 h-5" />
                      Fitxers adjunts ({post.attachments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {post.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-xs">
                            {attachment.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{attachment.name}</p>
                          <p className="text-sm text-gray-500">{attachment.size}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Voting actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVote('up')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          userVote === 'up'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${userVote === 'up' ? 'fill-current' : ''}`} />
                        {votes.up}
                      </button>
                      <button
                        onClick={() => handleVote('down')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          userVote === 'down'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-current' : ''}`} />
                        {votes.down}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <>
              {/* New comment form */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Afegir comentari</h3>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escriu el teu comentari..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Publicar
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments list */}
              {sampleComments.length > 0 ? (
                <div className="space-y-4">
                  {sampleComments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {comment.authorAvatar ? (
                              <Image
                                src={comment.authorAvatar}
                                alt={comment.author}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                {comment.author.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{comment.author}</p>
                              <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 mt-1">{comment.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600">
                                <ThumbsUp className="w-4 h-4" />
                                {comment.votesUp}
                              </button>
                              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
                                <ThumbsDown className="w-4 h-4" />
                                {comment.votesDown}
                              </button>
                              <button className="text-sm text-gray-500 hover:text-indigo-600">
                                Respondre
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Encara no hi ha comentaris</h3>
                    <p className="text-gray-500">Sigues el primer en participar!</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Descripció</h3>
                  <p className="text-gray-600">{post.content}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3">Etiquetes</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status card */}
          <Card>
            <CardContent className="p-6 text-center">
              {isFollowing ? (
                <>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Estàs seguint aquest fòrum</p>
                  <p className="text-sm text-gray-500 mt-1">Rebràs notificacions dels nous comentaris</p>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <button className="w-full py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Bell className="w-4 h-4" />
                      Configurar notificacions
                    </button>
                    <button
                      onClick={handleToggleFollow}
                      className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      Deixar de seguir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No estàs seguint aquest fòrum</p>
                  <button
                    onClick={handleToggleFollow}
                    className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Seguir fòrum
                  </button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informació</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Categoria</span>
                <span className="text-gray-900 font-medium">{post.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Comentaris</span>
                <span className="text-gray-900 font-medium">{post.commentsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Vots positius</span>
                <span className="text-gray-900 font-medium">{votes.up}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Creat per</span>
                <span className="text-indigo-600 font-medium">{post.author}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Data creació</span>
                <span className="text-gray-900">{formatDate(post.createdAt)}</span>
              </div>
              {post.hasAttachments && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Adjunts</span>
                  <span className="text-gray-900 font-medium">{post.attachments.length} fitxers</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Author card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Autor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {post.authorAvatar ? (
                    <Image
                      src={post.authorAvatar}
                      alt={post.author}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">
                      {post.author.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-500">Membre actiu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related forums (placeholder) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fòrums relacionats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 text-center py-4">
                Descobreix més fòrums sobre {post.category}
              </p>
              <button
                onClick={() => router.push('/dashboard/forums')}
                className="w-full py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Explorar fòrums
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
