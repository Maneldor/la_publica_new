'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, Building2, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getConversations, Conversation } from '@/lib/messaging/actions'
import { ChatPanel } from '@/components/messaging/ChatPanel'

export default function MissatgeriaPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    const result = await getConversations()
    if (result.success && result.data) {
      setConversations(result.data)
      // Auto-seleccionar primera conversa si no n'hi ha cap seleccionada
      if (!selectedConversation && result.data.length > 0) {
        setSelectedConversation(result.data[0])
      }
    }
    setLoading(false)
  }

  const getTimeAgo = (date: Date | null) => {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ara'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Missatgeria</h1>
          <p className="text-sm text-slate-500 mt-1">
            Comunica't directament amb les empreses assignades
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Llista de converses */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h2 className="font-medium text-slate-700">Converses actives</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-slate-500 mt-2">Carregant converses...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  No tens converses actives
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Les converses apareixeran quan enviïs el primer missatge a una empresa
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50',
                    selectedConversation?.id === conv.id && 'bg-blue-50 border-blue-100'
                  )}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {conv.companyName ? (
                      <Building2 className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                    ) : (
                      <User className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 truncate text-sm">
                        {conv.otherParticipantName}
                      </p>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        {getTimeAgo(conv.lastMessageAt)}
                      </span>
                    </div>

                    {/* Nom de l'empresa si és diferent */}
                    {conv.companyName && conv.companyName !== conv.otherParticipantName && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.companyName}
                      </p>
                    )}

                    {/* Darrer missatge */}
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {conv.lastMessage || 'Sense missatges'}
                    </p>
                  </div>

                  {/* Badge no llegits */}
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center text-xs font-medium text-white bg-blue-500 rounded-full px-1.5">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de xat */}
        <div className="lg:col-span-2 h-full">
          {selectedConversation ? (
            <ChatPanel
              conversationId={selectedConversation.id}
              otherPartyName={selectedConversation.otherParticipantName || 'Usuari'}
              onNewMessage={loadConversations}
            />
          ) : (
            <div className="h-full bg-white border border-slate-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">
                  Benvingut a la missatgeria
                </p>
                <p className="text-slate-500 max-w-sm">
                  Selecciona una conversa de la llista per començar a enviar missatges a les teves empreses assignades
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}