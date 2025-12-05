// components/gestio-empreses/missatges/ConversationList.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Search, Users, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'

interface Participant {
  id: string
  name: string
  email: string
  role: string
}

interface LastMessage {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
  }
}

interface Conversation {
  id: string
  title: string
  participants: Participant[]
  lastMessage: LastMessage | null
  unreadCount: number
  updatedAt: string
}

interface ConversationListProps {
  conversations: Conversation[]
  currentConversationId?: string
}

export function ConversationList({ conversations, currentConversationId }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.participants.some(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ca,
    })
  }

  const getParticipantNames = (participants: Participant[]) => {
    if (participants.length === 0) return 'Sense participants'
    if (participants.length === 1) return participants[0].name
    if (participants.length === 2) return `${participants[0].name} i ${participants[1].name}`
    return `${participants[0].name} i ${participants.length - 1} més`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra de cerca */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar converses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Llista de converses */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <MessageCircle className="h-12 w-12 mb-3 text-slate-300" />
            <h3 className="font-medium text-slate-900 mb-1">
              {searchQuery ? 'No s\'han trobat converses' : 'Encara no tens converses'}
            </h3>
            <p className="text-sm text-center">
              {searchQuery
                ? 'Prova amb uns altres termes de cerca'
                : 'Crea una nova conversa per començar'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/gestio/missatges/${conversation.id}`}
                className={`block p-4 hover:bg-slate-50 transition-colors ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-50 border-r-2 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar del grup */}
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    {conversation.participants.length <= 2 ? (
                      <MessageCircle className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Users className="h-5 w-5 text-slate-600" />
                    )}
                  </div>

                  {/* Contingut de la conversa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-slate-900 truncate">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-blue-600 rounded-full">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                        <time className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(conversation.updatedAt)}
                        </time>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 truncate mb-1">
                      {getParticipantNames(conversation.participants)}
                    </p>

                    {conversation.lastMessage && (
                      <div className="flex items-start gap-1">
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {conversation.lastMessage.sender.name}:
                        </span>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    )}

                    {!conversation.lastMessage && (
                      <p className="text-xs text-slate-400 italic">
                        Conversa sense missatges
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}