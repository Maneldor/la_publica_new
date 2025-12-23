'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Loader2,
  Trash2,
  Flag,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PostAttachment {
  id: string
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LINK'
  url: string
  filename?: string
  width?: number
  height?: number
}

interface Post {
  id: string
  content: string
  type: string
  createdAt: string
  author: {
    id: string
    nick: string
    name: string
    image?: string
    position?: string
    department?: string
  }
  attachments: PostAttachment[]
  stats: {
    likes: number
    comments: number
  }
  isLiked: boolean
  isOwn: boolean
}

interface GroupFeedProps {
  groupId: string
  canPost: boolean
  userRole?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null
}

export function GroupFeed({ groupId, canPost, userRole }: GroupFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const loadPosts = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const url = cursor
        ? `/api/groups/${groupId}/posts?cursor=${cursor}`
        : `/api/groups/${groupId}/posts`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (cursor) {
          setPosts(prev => [...prev, ...(data.posts || [])])
        } else {
          setPosts(data.posts || [])
        }
        setHasMore(data.hasMore || false)
        setNextCursor(data.nextCursor || null)
      }
    } catch (err) {
      console.error('Error loading posts:', err)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [groupId])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/groups/${groupId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPostContent })
      })

      if (res.ok) {
        const newPost = await res.json()
        setPosts(prev => [newPost, ...prev])
        setNewPostContent('')
      } else {
        const error = await res.json()
        alert(error.error || 'Error al publicar')
      }
    } catch (err) {
      console.error('Error creating post:', err)
      alert('Error de connexió')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: data.liked,
                stats: {
                  ...post.stats,
                  likes: data.liked ? post.stats.likes + 1 : post.stats.likes - 1
                }
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Segur que vols eliminar aquesta publicació?')) return

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId))
      }
    } catch (err) {
      console.error('Error deleting post:', err)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Ara mateix'
    if (minutes < 60) return `Fa ${minutes} min`
    if (hours < 24) return `Fa ${hours}h`
    if (days < 2) return 'Ahir'
    if (days < 7) return `Fa ${days} dies`
    return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
  }

  const canDeletePost = (post: Post) => {
    return post.isOwn || userRole === 'ADMIN' || userRole === 'MODERATOR'
  }

  return (
    <div className="space-y-6">
      {/* Formulari per crear post */}
      {canPost && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold">
                U
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Comparteix alguna cosa amb el grup..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Afegir imatge"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Afegir fitxer"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!newPostContent.trim() || isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Llista de posts */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-2">Carregant publicacions...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Encara no hi ha publicacions</h3>
            {canPost ? (
              <p className="text-gray-500">
                Sigues el primer en compartir alguna cosa amb el grup!
              </p>
            ) : (
              <p className="text-gray-500">
                Les publicacions del grup apareixeran aquí.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                {/* Header del post */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/membres/${post.author.nick}`}>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {post.author.image ? (
                          <Image
                            src={post.author.image}
                            alt=""
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                            {post.author.name?.charAt(0) || post.author.nick?.charAt(0)}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link
                        href={`/dashboard/membres/${post.author.nick}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {post.author.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {post.author.position && (
                          <span>{post.author.position} · </span>
                        )}
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Menu d'opcions */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {openMenuId === post.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          {canDeletePost(post) && (
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                handleDeletePost(post.id)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          )}
                          {!post.isOwn && (
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Flag className="w-4 h-4" />
                              Reportar
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contingut */}
                <div className="mt-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Imatges */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className={`mt-3 grid gap-2 ${
                    post.attachments.length === 1 ? 'grid-cols-1' :
                    post.attachments.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {post.attachments.filter(att => att.type === 'IMAGE').map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="relative rounded-lg overflow-hidden bg-gray-100"
                      >
                        <Image
                          src={att.url}
                          alt=""
                          width={att.width || 500}
                          height={att.height || 300}
                          className="object-cover w-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Accions */}
                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      post.isLiked
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.stats.likes > 0 ? post.stats.likes : 'M\'agrada'}</span>
                  </button>
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.stats.comments > 0 ? post.stats.comments : 'Comentar'}</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Botó cargar més */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => nextCursor && loadPosts(nextCursor)}
                disabled={isLoadingMore}
                className="px-6 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregant...
                  </span>
                ) : (
                  'Carregar més publicacions'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
