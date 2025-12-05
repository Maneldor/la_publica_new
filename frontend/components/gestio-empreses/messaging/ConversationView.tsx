'use client'

import { useState, useEffect, useRef } from 'react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { ca } from 'date-fns/locale'
import { Send, FileText, Paperclip, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MessageBubble, MessageGroup, DateSeparator } from './MessageBubble'
import { MessageTemplates } from './MessageTemplates'
import { sendMessage, markMessagesAsRead } from '@/lib/gestio-empreses/message-actions'
import type { MessageTemplate } from '@/lib/gestio-empreses/message-actions'

interface Message {
  id: string
  content: string
  senderId: string
  isRead: boolean
  createdAt: Date
  template?: string
  sender: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface Conversation {
  id: string
  title: string
  participants: Array<{
    id: string
    name: string
    email: string
    image?: string
    role?: string
  }>
  messages: Message[]
}

interface ConversationViewProps {
  conversation: Conversation
  currentUserId: string
  onMessageSent?: () => void
  className?: string
}

export function ConversationView({
  conversation,
  currentUserId,
  onMessageSent,
  className
}: ConversationViewProps) {
  const [messageText, setMessageText] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto scroll fins al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages])

  // Marcar missatges com llegits
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = conversation.messages.filter(
        msg => !msg.isRead && msg.senderId !== currentUserId
      )

      if (unreadMessages.length > 0) {
        try {
          await markMessagesAsRead(conversation.id)
        } catch (error) {
          console.error('Error marcant missatges com llegits:', error)
        }
      }
    }

    markAsRead()
  }, [conversation.id, conversation.messages, currentUserId])

  // Agrupar missatges per remitent i data
  const groupedMessages = () => {
    const groups: Array<{
      date: Date
      messageGroups: Array<{
        sender: string
        messages: Message[]
      }>
    }> = []

    let currentDate: Date | null = null
    let currentSender: string | null = null
    let currentGroup: Message[] = []

    conversation.messages.forEach((message) => {
      const messageDate = new Date(message.createdAt)

      // Nova data
      if (!currentDate || !isSameDay(currentDate, messageDate)) {
        // Afegir grup anterior si existeix
        if (currentGroup.length > 0 && currentSender) {
          const lastGroup = groups[groups.length - 1]
          if (lastGroup) {
            lastGroup.messageGroups.push({
              sender: currentSender,
              messages: [...currentGroup]
            })
          }
        }

        // Nova secció de data
        groups.push({
          date: messageDate,
          messageGroups: []
        })

        currentDate = messageDate
        currentSender = message.senderId
        currentGroup = [message]
        return
      }

      // Mateix remitent
      if (currentSender === message.senderId) {
        currentGroup.push(message)
      } else {
        // Nou remitent - afegir grup anterior
        if (currentGroup.length > 0 && currentSender) {
          const currentDateGroup = groups[groups.length - 1]
          currentDateGroup.messageGroups.push({
            sender: currentSender,
            messages: [...currentGroup]
          })
        }

        // Començar nou grup
        currentSender = message.senderId
        currentGroup = [message]
      }
    })

    // Afegir últim grup
    if (currentGroup.length > 0 && currentSender) {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup) {
        lastGroup.messageGroups.push({
          sender: currentSender,
          messages: currentGroup
        })
      }
    }

    return groups
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(conversation.id, messageText)
      setMessageText('')
      setSelectedTemplate(null)
      onMessageSent?.()
    } catch (error) {
      console.error('Error enviant missatge:', error)
    }
    setIsSending(false)

    // Focus al textarea
    textareaRef.current?.focus()
  }

  const handleApplyTemplate = (subject: string, content: string) => {
    setMessageText(content)
    setShowTemplates(false)
    textareaRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Avui'
    if (isYesterday(date)) return 'Ahir'
    return format(date, 'EEEE, d MMMM yyyy', { locale: ca })
  }

  const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId)

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {otherParticipants.slice(0, 3).map((participant) => (
              <div key={participant.id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                {participant.image ? (
                  <img
                    src={participant.image}
                    alt={participant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-600">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{conversation.title}</h3>
            <p className="text-sm text-slate-500">
              {otherParticipants.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
          <MoreVertical className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
        </button>
      </div>

      {/* Missatges */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {groupedMessages().map((dateGroup, dateIndex) => (
          <div key={dateIndex}>
            {/* Separator de data */}
            <DateSeparator date={dateGroup.date} />

            {/* Grups de missatges */}
            <div className="space-y-4">
              {dateGroup.messageGroups.map((messageGroup, groupIndex) => (
                <MessageGroup
                  key={groupIndex}
                  messages={messageGroup.messages}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Plantilles (si està obert) */}
      {showTemplates && (
        <div className="border-t border-slate-200">
          <MessageTemplates
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
            onApplyTemplate={handleApplyTemplate}
            variables={{
              senderName: 'Nom del Remitent',
              firstName: 'Nom',
              companyName: 'Empresa'
            }}
            className="border-0 rounded-none"
          />
        </div>
      )}

      {/* Input de missatge */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-end gap-3">
          {/* Botons d'acció */}
          <div className="flex gap-1">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn(
                'p-2 rounded-md transition-colors',
                showTemplates
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-slate-100 text-slate-500'
              )}
              title="Plantilles"
            >
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 text-slate-500 rounded-md transition-colors"
              title="Adjuntar arxiu"
            >
              <Paperclip className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escriu un missatge..."
              className="w-full resize-none border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '38px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
            />
          </div>

          {/* Botó d'enviar */}
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className={cn(
              'p-2 rounded-lg transition-colors',
              messageText.trim() && !isSending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Indicador de plantilla seleccionada */}
        {selectedTemplate && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <FileText className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
            <span className="text-sm font-medium text-blue-900">
              Plantilla: {selectedTemplate.name}
            </span>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  )
}