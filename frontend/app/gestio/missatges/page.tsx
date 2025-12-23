'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  Users,
  Mail,
  Star
} from 'lucide-react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { ConversationView } from '@/components/gestio-empreses/messaging/ConversationView'
import { NewConversationWizard } from '@/components/gestio-empreses/messaging/NewConversationWizard'
import {
  getUserConversations,
  getMessageStats,
  getConversationMessages,
  searchConversations
} from '@/lib/gestio-empreses/message-actions'

interface Conversation {
  id: string
  title: string
  participants: Array<{
    id: string
    name: string
    email: string
    image?: string
    type: 'admin' | 'manager' | 'lead' | 'company'
  }>
  lastMessage?: {
    id: string
    content: string
    sender: { id: string; name: string }
    createdAt: Date
  }
  unreadCount: number
  updatedAt: Date
}

interface Stats {
  totalConversations: number
  unreadMessages: number
  sentMessages: number
}

export default function MissatgesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    unreadMessages: 0,
    sentMessages: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversationWizard, setShowNewConversationWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const currentUserId = session?.user?.id || ''

  // Carregar dades inicials
  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId) return

      setIsLoading(true)
      try {
        const [conversationsResult, statsData] = await Promise.all([
          // @ts-expect-error - Types mismatch with legacy API
          getUserConversations(1, 20),
          getMessageStats()
        ])

        // @ts-expect-error - Types mismatch with legacy API
        setConversations(conversationsResult.conversations || [])
        setStats(statsData)
      } catch (error) {
        console.error('Error carregant dades:', error)
      }
      setIsLoading(false)
    }

    loadData()
  }, [currentUserId])

  // Carregar conversa seleccionada
  useEffect(() => {
    const loadConversation = async () => {
      if (!selectedConversationId) {
        setSelectedConversation(null)
        return
      }

      try {
        const { conversation, messages } = await getConversationMessages(selectedConversationId)
        setSelectedConversation({
          ...conversation,
          messages
        })
      } catch (error) {
        console.error('Error carregant conversa:', error)
      }
    }

    loadConversation()
  }, [selectedConversationId])

  // Buscar converses
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      // @ts-expect-error - Types mismatch with legacy API
      const result = await getUserConversations(1, 20)
      // @ts-expect-error - Types mismatch with legacy API
      setConversations(result.conversations || [])
      return
    }

    try {
      const results = await searchConversations(query)
      setConversations(results)
    } catch (error) {
      console.error('Error buscant converses:', error)
    }
  }

  const handleRefreshConversations = async () => {
    try {
      const [conversationsResult, statsData] = await Promise.all([
        // @ts-expect-error - Types mismatch with legacy API
        getUserConversations(1, 20),
        getMessageStats()
      ])
      // @ts-expect-error - Types mismatch with legacy API
      setConversations(conversationsResult.conversations || [])
      setStats(statsData)
    } catch (error) {
      console.error('Error actualitzant converses:', error)
    }
  }

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    handleRefreshConversations()
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'Sense missatges'

    const preview = conversation.lastMessage.content.substring(0, 60)
    return preview.length < conversation.lastMessage.content.length
      ? `${preview}...`
      : preview
  }

  if (!session) {
    return <div className="flex items-center justify-center h-full">Carregant...</div>
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
            <h1 className="text-xl font-semibold text-slate-900">Missatgeria Avançada</h1>
          </div>

          <button
            onClick={() => setShowNewConversationWizard(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nova Conversa
          </button>
        </div>

        {/* Estadístiques ràpides */}
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{stats.totalConversations}</p>
              <p className="text-xs text-slate-500">Converses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Mail className="h-4 w-4 text-red-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{stats.unreadMessages}</p>
              <p className="text-xs text-slate-500">Per llegir</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-4 w-4 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{stats.sentMessages}</p>
              <p className="text-xs text-slate-500">Aquest mes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar amb llista de converses */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          {/* Buscador */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar converses..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Llista de converses */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500">Carregant...</div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Sense converses
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Crea la teva primera conversa amb destinataris específics
                </p>
                <button
                  onClick={() => setShowNewConversationWizard(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Començar
                </button>
              </div>
            ) : (
              <div className="py-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      'w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 transition-colors',
                      selectedConversationId === conversation.id && 'bg-blue-50 border-blue-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex -space-x-1">
                        {conversation.participants.slice(0, 2).map((participant, index) => (
                          <div
                            key={participant.id}
                            className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center"
                          >
                            {participant.image ? (
                              <img
                                src={participant.image}
                                alt={participant.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-slate-600">
                                {participant.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-slate-900 truncate">
                            {conversation.title}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 truncate mb-1">
                          {getLastMessagePreview(conversation)}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          <span>
                            {format(new Date(conversation.updatedAt), 'HH:mm', { locale: ca })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Área principal - Conversa o vista buida */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              currentUserId={currentUserId}
              onMessageSent={handleRefreshConversations}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Selecciona una conversa
                </h2>
                <p className="text-slate-600 mb-6">
                  Tria una conversa de la llista per començar a xatejar o crea'n una de nova.
                </p>
                <button
                  onClick={() => setShowNewConversationWizard(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                  Nova Conversa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wizard de nova conversa */}
      <NewConversationWizard
        userId={currentUserId}
        isOpen={showNewConversationWizard}
        onClose={() => setShowNewConversationWizard(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}