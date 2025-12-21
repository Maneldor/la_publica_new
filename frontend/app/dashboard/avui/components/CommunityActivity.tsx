'use client'

import { useEffect, useState } from 'react'
import { Users, Heart, MessageCircle, Share2, ChevronRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'

interface Post {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    image?: string
  }
  _count: {
    post_comments: number
    interactions: number
  }
}

interface CommunityData {
  recentPosts: Post[]
  connectionsCount: number
}

export function CommunityActivity({ userId }: { userId: string }) {
  const [community, setCommunity] = useState<CommunityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await fetch('/api/dashboard/avui')
        if (res.ok) {
          const data = await res.json()
          setCommunity(data.community)
        }
      } catch (error) {
        console.error('Error fetching community:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCommunity()
  }, [userId])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Ara mateix'
    if (diffHours < 24) return `Fa ${diffHours}h`
    if (diffDays === 1) return 'Ahir'
    if (diffDays < 7) return `Fa ${diffDays} dies`
    return date.toLocaleDateString('ca-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle
          icon={<Users className="w-5 h-5 text-blue-500" />}
          subtitle={community ? `${community.connectionsCount} connexions` : undefined}
          action={
            <Link
              href="/dashboard/comunitat"
              className={`${TYPOGRAPHY.link} flex items-center gap-1`}
            >
              Veure més
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          Comunitat
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-12" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : community?.recentPosts && community.recentPosts.length > 0 ? (
        <div className="space-y-4">
          {community.recentPosts.map((post) => (
            <div 
              key={post.id}
              className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {post.user.image ? (
                    <img 
                      src={post.user.image} 
                      alt={post.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {post.user.name}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {formatTime(post.createdAt)}
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{post._count.interactions}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post._count.post_comments}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Compartir</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Link 
            href="/dashboard/comunitat"
            className="flex items-center justify-center gap-2 p-3 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Veure tots els posts de la comunitat
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={`${TYPOGRAPHY.body} mb-2`}>No hi ha activitat recent</p>
            <p className={`${TYPOGRAPHY.small} mb-4`}>Connecta amb més persones per veure contingut</p>
            <Link
              href="/dashboard/connexions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              Trobar connexions
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}