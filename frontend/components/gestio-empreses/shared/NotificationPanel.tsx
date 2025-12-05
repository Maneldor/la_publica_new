// components/gestio-empreses/shared/NotificationPanel.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Target,
  Building2,
  CheckSquare,
  Calendar,
  MessageSquare,
  AlertCircle,
  Check,
  X,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { markAsRead, markAllAsRead } from '@/lib/gestio-empreses/notification-actions'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: Date
}

interface NotificationPanelProps {
  notifications: Notification[]
  onClose: () => void
  onUpdate: () => void
  userId: string
}

const typeIcons: Record<string, any> = {
  LEAD_ASSIGNED: Target,
  LEAD_STATUS_CHANGE: Target,
  COMPANY_APPROVED: Building2,
  COMPANY_PENDING: Building2,
  TASK_DUE: CheckSquare,
  TASK_ASSIGNED: CheckSquare,
  MESSAGE_RECEIVED: MessageSquare,
  EVENT_REMINDER: Calendar,
  CRM_APPROVAL_NEEDED: AlertCircle,
  SYSTEM: Bell,
}

const typeColors: Record<string, string> = {
  LEAD_ASSIGNED: 'bg-blue-100 text-blue-600',
  LEAD_STATUS_CHANGE: 'bg-purple-100 text-purple-600',
  COMPANY_APPROVED: 'bg-green-100 text-green-600',
  COMPANY_PENDING: 'bg-amber-100 text-amber-600',
  TASK_DUE: 'bg-red-100 text-red-600',
  TASK_ASSIGNED: 'bg-blue-100 text-blue-600',
  MESSAGE_RECEIVED: 'bg-indigo-100 text-indigo-600',
  EVENT_REMINDER: 'bg-amber-100 text-amber-600',
  CRM_APPROVAL_NEEDED: 'bg-red-100 text-red-600',
  SYSTEM: 'bg-slate-100 text-slate-600',
}

export function NotificationPanel({
  notifications,
  onClose,
  onUpdate,
  userId
}: NotificationPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleNotificationClick = (notification: Notification) => {
    startTransition(async () => {
      if (!notification.isRead) {
        await markAsRead(notification.id)
      }
      if (notification.link) {
        router.push(notification.link)
      }
      onUpdate()
      onClose()
    })
  }

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead(userId)
      onUpdate()
    })
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-medium text-slate-900">Notificacions</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
            ) : (
              <Check className="h-3 w-3" strokeWidth={1.5} />
            )}
            Marcar tot com llegit
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-slate-500">Cap notificació</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell
              const colorClass = typeColors[notification.type] || typeColors.SYSTEM

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-slate-50 transition-colors flex gap-3',
                    !notification.isRead && 'bg-blue-50/50'
                  )}
                >
                  <div className={cn('p-2 rounded-lg flex-shrink-0', colorClass)}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm',
                        !notification.isRead ? 'font-medium text-slate-900' : 'text-slate-700'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        locale: ca,
                        addSuffix: true
                      })}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 border-t border-slate-100">
          <button
            onClick={() => {
              router.push('/gestio/notificacions')
              onClose()
            }}
            className="w-full px-3 py-2 text-sm text-center text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Veure totes les notificacions
          </button>
        </div>
      )}
    </div>
  )
}