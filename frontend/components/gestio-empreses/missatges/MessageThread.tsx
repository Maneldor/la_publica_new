// components/gestio-empreses/missatges/MessageThread.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, MoreVertical, Clock } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { ca } from 'date-fns/locale'
import { sendMessage, markMessagesAsRead } from '@/lib/gestio-empreses/message-actions'

interface MessageSender {
  id: string
  name: string
  email: string
}

interface MessageAttachment {
  id: string
  filename: string
  url: string
  mimeType: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  sender: MessageSender
  attachments: MessageAttachment[]
}

interface Participant {
  id: string
  name: string
  email: string
  role: string
}

interface ConversationData {
  id: string
  title: string
  participants: Participant[]
}

interface MessageThreadProps {
  conversation: ConversationData
  messages: Message[]
  currentUserId: string
}

export function MessageThread({ conversation, messages, currentUserId }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollToBottom()
    markAsRead()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(conversation.id)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      await sendMessage(conversation.id, newMessage.trim())
      setNewMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date)

    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: ca })
    } else if (isYesterday(messageDate)) {
      return `Ahir ${format(messageDate, 'HH:mm', { locale: ca })}`
    } else {
      return format(messageDate, 'dd/MM/yyyy HH:mm', { locale: ca })
    }
  }

  const getParticipantNames = (participants: Participant[]) => {
    return participants.map(p => p.name).join(', ')
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach(message => {
      const date = format(new Date(message.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString)

    if (isToday(date)) {
      return 'Avui'
    } else if (isYesterday(date)) {
      return 'Ahir'
    } else {
      return format(date, 'dd MMMM yyyy', { locale: ca })
    }
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full">
      {/* Header de la conversa */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h1 className="font-semibold text-slate-900">{conversation.title}</h1>
          <p className="text-sm text-slate-500">
            {getParticipantNames(conversation.participants)}
          </p>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      {/* Missatges */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            <div className="text-center">
              <h3 className="font-medium text-slate-900 mb-1">Conversa buida</h3>
              <p className="text-sm">Envia el primer missatge per començar</p>
            </div>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Divisor de data */}
              <div className="flex items-center justify-center py-2">
                <span className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-full">
                  {formatDateGroup(date)}
                </span>
              </div>

              {/* Missatges del dia */}
              <div className="space-y-4">
                {dateMessages.map((message, index) => {
                  const isOwnMessage = message.sender.id === currentUserId
                  const showSender = index === 0 || dateMessages[index - 1].sender.id !== message.sender.id

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {showSender && !isOwnMessage && (
                          <p className="text-xs font-medium text-slate-600 mb-1 px-3">
                            {message.sender.name}
                          </p>
                        )}

                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                          {message.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-opacity-20">
                              {message.attachments.map(attachment => (
                                <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                  <Paperclip className="h-3 w-3" />
                                  <span className="truncate">{attachment.filename}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <Clock className="h-3 w-3 text-slate-400" />
                          <time className="text-xs text-slate-400">
                            {formatMessageDate(message.createdAt)}
                          </time>
                          {isOwnMessage && (
                            <span className={`text-xs ml-1 ${
                              message.isRead ? 'text-blue-500' : 'text-slate-400'
                            }`}>
                              {message.isRead ? 'Llegit' : 'Enviat'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input per nou missatge */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-end gap-3">
          <button className="p-2 hover:bg-slate-100 rounded-lg flex-shrink-0">
            <Paperclip className="h-4 w-4 text-slate-500" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Escriu un missatge..."
              className="w-full resize-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}