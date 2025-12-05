'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'
import {
  MessageCircle,
  ArrowRight,
  Loader2,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRecentConversations, type RecentConversation } from '@/lib/gestio-empreses/dashboard-actions'

interface RecentMessagesProps {
  userId: string
}

export function RecentMessages({ userId }: RecentMessagesProps) {
  const [conversations, setConversations] = useState<RecentConversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const result = await getRecentConversations(userId)
        setConversations(result)
      } catch (error) {
        console.error('Error carregant converses:', error)
      }
      setIsLoading(false)
    }

    loadConversations()
  }, [userId])

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-900">Missatges recents</h3>
          {totalUnread > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <Link
          href="/gestio/missatges"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Veure tot
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Conversations list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" strokeWidth={1.5} />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-slate-500">No tens converses recents</p>
          <Link
            href="/gestio/missatges"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            Iniciar una conversa
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/gestio/missatges?conv=${conv.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(
                    'font-medium truncate',
                    conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'
                  )}>
                    {conv.participantName}
                  </p>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), {
                        addSuffix: true,
                        locale: ca
                      })}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className={cn(
                    'text-sm truncate',
                    conv.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'
                  )}>
                    {conv.lastMessage}
                  </p>
                )}
              </div>

              {conv.unreadCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}