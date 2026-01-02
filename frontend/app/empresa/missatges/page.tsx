'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Send,
  User,
  Loader2,
  AlertCircle,
  Search,
  ArrowLeft
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'

interface Participant {
  id: string
  name: string
  image: string | null
  role: string
  companyName: string | null
}

interface Conversation {
  id: string
  title: string
  participant: Participant
  lastMessage: string | null
  lastMessageAt: string
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string | null
  senderImage: string | null
  createdAt: string
  isOwn: boolean
}

export default function MissatgesPage() {
  // Estats principals
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Estats de UI
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Carregar converses
  useEffect(() => {
    loadConversations()
  }, [])

  // Scroll automàtic quan arriben missatges
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/empresa/messages')
      const data = await response.json()

      if (data.success) {
        setConversations(data.conversations || [])
      } else {
        setError(data.error || 'Error carregant converses')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de connexió')
    } finally {
      setLoading(false)
    }
  }

  const openConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation)
    setMessagesLoading(true)

    try {
      const response = await fetch(`/api/empresa/messages?conversationId=${conversation.id}`)
      const data = await response.json()

      if (data.success) {
        setMessages(data.messages || [])

        // Actualitzar comptador local
        if (conversation.unreadCount > 0) {
          setConversations(prev =>
            prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
          )
        }
      }
    } catch (err) {
      console.error('Error carregant missatges:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return

    setSending(true)
    const messageContent = newMessage
    setNewMessage('')

    try {
      const response = await fetch('/api/empresa/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: messageContent
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, data.message])

        // Actualitzar últim missatge a la llista
        setConversations(prev =>
          prev.map(c => c.id === activeConversation.id
            ? { ...c, lastMessage: messageContent, lastMessageAt: new Date().toISOString() }
            : c
          )
        )
      }
    } catch (err) {
      console.error('Error enviant missatge:', err)
      setNewMessage(messageContent) // Restaurar el missatge si falla
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Filtrar converses
  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Estadístiques
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-slate-500">Carregant missatges...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-slate-900 font-medium">Error carregant missatges</p>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={loadConversations}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Missatges</h1>
            <p className="text-slate-500">Converses amb el teu gestor i equip de suport</p>
          </div>
        </div>
      </div>

      {/* Estadístiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Converses actives"
          value={conversations.length.toString()}
        />
        <StatCard
          label="Missatges sense llegir"
          value={totalUnread.toString()}
          highlight={totalUnread > 0}
        />
        <StatCard
          label="Última activitat"
          value={conversations[0]?.lastMessageAt
            ? formatDistanceToNow(new Date(conversations[0].lastMessageAt), { addSuffix: true, locale: ca })
            : '--'
          }
        />
      </div>

      {/* Contingut principal */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 340px)', minHeight: '500px' }}>
        <div className="flex h-full">

          {/* Llista de converses */}
          <div className={`w-80 border-r border-slate-200 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
            {/* Cerca */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cercar converses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Llista */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No tens converses</p>
                  <p className="text-sm text-slate-400 mt-1">
                    El teu gestor et contactarà aviat
                  </p>
                </div>
              ) : (
                filteredConversations.map(conversation => (
                  <button
                    key={conversation.id}
                    onClick={() => openConversation(conversation)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                      activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    } ${conversation.unreadCount > 0 ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {conversation.participant.image ? (
                          <img
                            src={conversation.participant.image}
                            alt={conversation.participant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-900 truncate">
                            {conversation.participant.name}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="h-5 min-w-[20px] px-1.5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {conversation.participant.companyName && (
                          <p className="text-xs text-slate-500 truncate">
                            {conversation.participant.companyName}
                          </p>
                        )}
                        {conversation.lastMessage && (
                          <p className="text-sm text-slate-500 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                            locale: ca
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Àrea de xat */}
          <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
            {activeConversation ? (
              <>
                {/* Header del xat */}
                <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                    {activeConversation.participant.image ? (
                      <img
                        src={activeConversation.participant.image}
                        alt={activeConversation.participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {activeConversation.participant.name}
                    </p>
                    {activeConversation.participant.companyName && (
                      <p className="text-sm text-slate-500">
                        {activeConversation.participant.companyName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Missatges */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No hi ha missatges encara</p>
                      <p className="text-sm text-slate-400 mt-1">Envia el primer missatge!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              message.isOwn
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.isOwn ? 'text-blue-200' : 'text-slate-400'
                              }`}
                            >
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                                locale: ca
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Escriu un missatge..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={sending}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Estat buit
              <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="text-center p-8">
                  <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-700 mb-2">
                    Benvingut als Missatges
                  </h2>
                  <p className="text-slate-500">
                    Selecciona una conversa per començar a xatejar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Component auxiliar
function StatCard({
  label,
  value,
  highlight = false
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}
