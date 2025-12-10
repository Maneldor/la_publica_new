'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '@/lib/notifications/notification-actions'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  actionUrl: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userId = session?.user?.id

  // Carregar notificacions
  const loadNotifications = async () => {
    if (!userId) return

    try {
      const [notifResult, countResult] = await Promise.all([
        getUserNotifications(userId, 15),
        getUnreadCount(userId)
      ])

      if (notifResult.success) {
        setNotifications(notifResult.notifications as Notification[])
      }
      if (countResult.success) {
        setUnreadCount(countResult.count)
      }
    } catch (error) {
      console.error('Error carregant notificacions:', error)
    }
  }

  // Polling cada 30 segons
  useEffect(() => {
    if (!userId) return

    loadNotifications()

    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  // Tancar dropdown en clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Marcar una notificació com a llegida i navegar
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    if (notification.actionUrl) {
      setIsOpen(false)
      router.push(notification.actionUrl)
    }
  }

  // Marcar totes com a llegides
  const handleMarkAllAsRead = async () => {
    if (!userId) return

    setMarkingAll(true)
    try {
      await markAllAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marcant totes com a llegides:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  // Obtenir icona segons tipus
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMPANY_ASSIGNED':
        return '👤'
      case 'COMPANY_PENDING':
        return '📋'
      case 'LEAD_VERIFIED':
        return '✅'
      case 'COMPANY_APPROVED':
        return '🏢'
      case 'GENERAL':
        return '🔔'
      default:
        return '🔔'
    }
  }

  // Format temps relatiu
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ara mateix'
    if (diffMins < 60) return `Fa ${diffMins} min`
    if (diffHours < 24) return `Fa ${diffHours}h`
    if (diffDays < 7) return `Fa ${diffDays}d`
    return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
  }

  if (!userId) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botó campaneta */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          'hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200',
          isOpen && 'bg-slate-100'
        )}
        aria-label="Notificacions"
      >
        <Bell className="h-5 w-5 text-slate-600" strokeWidth={1.5} />

        {/* Badge comptador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Notificacions</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Marcar totes llegides
              </button>
            )}
          </div>

          {/* Llista de notificacions */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-slate-500">No tens notificacions</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-colors hover:bg-slate-50',
                      !notification.isRead && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Icona */}
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>

                      {/* Contingut */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm',
                            !notification.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-0.5 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-400">
                            {getRelativeTime(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <span className="flex items-center gap-0.5 text-xs text-blue-500">
                              <ExternalLink className="h-3 w-3" />
                              Veure
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}