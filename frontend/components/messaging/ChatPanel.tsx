'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMessages, sendMessage, Message } from '@/lib/messaging/actions'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface ChatPanelProps {
  conversationId: string
  otherPartyName: string
  onNewMessage?: () => void
}

export function ChatPanel({
  conversationId,
  otherPartyName,
  onNewMessage
}: ChatPanelProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentUserId = session?.user?.id

  useEffect(() => {
    loadMessages()

    // Polling cada 10 segons
    const interval = setInterval(loadMessages, 10000)
    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    if (!conversationId) return

    const result = await getMessages(conversationId)
    if (result.success && result.data) {
      setMessages(result.data)
    } else if (result.error) {
      console.error('Error carregant missatges:', result.error)
    }
    setLoading(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !conversationId) return

    setSending(true)
    const result = await sendMessage(conversationId, newMessage)

    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message!])
      setNewMessage('')
      onNewMessage?.()
    } else {
      toast.error(result.error || 'Error enviant missatge')
    }

    setSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Avui'
    if (d.toDateString() === yesterday.toDateString()) return 'Ahir'
    return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
  }

  // Agrupar missatges per dia
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{otherPartyName}</p>
          <p className="text-xs text-slate-500">Conversa activa</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              Encara no hi ha missatges. Comença la conversa!
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Separador de dia */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-xs text-slate-500 bg-slate-100 rounded-full">
                  {formatDate(new Date(date))}
                </span>
              </div>

              {/* Missatges del dia */}
              {dayMessages.map((message) => {
                const isOwn = message.senderId === currentUserId

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex mb-3',
                      isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg px-4 py-2',
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      )}
                    >
                      {/* Nom del remitent si no és propi */}
                      {!isOwn && (
                        <p className={cn(
                          'text-xs font-medium mb-1',
                          isOwn ? 'text-blue-200' : 'text-slate-500'
                        )}>
                          {message.senderName || 'Usuari'}
                        </p>
                      )}

                      {/* Contingut */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Hora */}
                      <p className={cn(
                        'text-xs mt-1',
                        isOwn ? 'text-blue-200' : 'text-slate-400'
                      )}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escriu un missatge..."
            rows={1}
            className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}