'use client'

import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { Check, CheckCheck, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  className?: string
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
  className
}: MessageBubbleProps) {
  return (
    <div className={cn(
      'flex gap-3 max-w-[80%]',
      isOwnMessage ? 'ml-auto flex-row-reverse' : 'mr-auto',
      className
    )}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender.image ? (
            <img
              src={message.sender.image}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">
                {message.sender.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bubble content */}
      <div className={cn(
        'flex flex-col gap-1',
        isOwnMessage ? 'items-end' : 'items-start'
      )}>
        {/* Sender name (només si no és propi) */}
        {!isOwnMessage && showAvatar && (
          <p className="text-xs font-medium text-slate-600 px-1">
            {message.sender.name}
          </p>
        )}

        {/* Message bubble */}
        <div className={cn(
          'relative px-4 py-2 rounded-2xl max-w-full break-words',
          isOwnMessage
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-900'
        )}>
          {/* Indicador de plantilla */}
          {message.template && (
            <div className={cn(
              'flex items-center gap-1 mb-2 pb-2 border-b',
              isOwnMessage ? 'border-blue-500' : 'border-slate-200'
            )}>
              <FileText className="w-3 h-3" strokeWidth={1.5} />
              <span className="text-xs font-medium opacity-80">
                Plantilla aplicada
              </span>
            </div>
          )}

          {/* Content */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>

          {/* Timestamp i estat */}
          <div className={cn(
            'flex items-center gap-1 mt-2 text-xs',
            isOwnMessage ? 'text-blue-200' : 'text-slate-500'
          )}>
            {showTimestamp && (
              <span>
                {format(new Date(message.createdAt), 'HH:mm', { locale: ca })}
              </span>
            )}

            {/* Read status (només missatges propis) */}
            {isOwnMessage && (
              <div className="ml-1">
                {message.isRead ? (
                  <CheckCheck className="w-3 h-3 text-blue-200" strokeWidth={1.5} />
                ) : (
                  <Check className="w-3 h-3 text-blue-200" strokeWidth={1.5} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp detallat (fora del bubble) */}
        {showTimestamp && (
          <p className={cn(
            'text-xs text-slate-400 px-1',
            isOwnMessage ? 'text-right' : 'text-left'
          )}>
            {format(new Date(message.createdAt), "d MMM 'a les' HH:mm", { locale: ca })}
          </p>
        )}
      </div>
    </div>
  )
}

// Component per agrupar missatges del mateix remitent
interface MessageGroupProps {
  messages: Message[]
  currentUserId: string
  className?: string
}

export function MessageGroup({
  messages,
  currentUserId,
  className
}: MessageGroupProps) {
  if (messages.length === 0) return null

  const isOwnMessage = messages[0].senderId === currentUserId
  const sender = messages[0].sender

  // Agrupar missatges consecutius del mateix remitent
  return (
    <div className={cn('space-y-1', className)}>
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={isOwnMessage}
          showAvatar={index === 0} // Només mostrar avatar al primer missatge del grup
          showTimestamp={index === messages.length - 1} // Només mostrar timestamp a l'últim missatge
        />
      ))}
    </div>
  )
}

// Component per separator de data
interface DateSeparatorProps {
  date: Date
  className?: string
}

export function DateSeparator({ date, className }: DateSeparatorProps) {
  return (
    <div className={cn('flex items-center justify-center my-4', className)}>
      <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
        {format(date, 'EEEE, d MMMM yyyy', { locale: ca })}
      </div>
    </div>
  )
}