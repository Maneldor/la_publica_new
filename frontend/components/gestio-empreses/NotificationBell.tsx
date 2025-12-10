// components/gestio-empreses/NotificationBell.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Cargar notificaciones
  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/gestio/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  // Marcar como leída
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/gestio/notifications/${notificationId}`, {
        method: 'PUT',
      })
      loadNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/gestio/notifications', {
        method: 'PUT',
      })
      loadNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar clic en notificación
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }

    setIsOpen(false)
  }

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications()

    // Polling cada 30 segundos para actualizar notificaciones
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAD_ASSIGNED':
        return '👤'
      case 'CRM_APPROVAL_NEEDED':
        return '📋'
      case 'TASK_DUE':
        return '⏰'
      default:
        return '📢'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Ara mateix'
    if (diffInMinutes < 60) return `Fa ${diffInMinutes}m`
    if (diffInMinutes < 1440) return `Fa ${Math.floor(diffInMinutes / 60)}h`
    return `Fa ${Math.floor(diffInMinutes / 1440)}d`
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Bell className="h-6 w-6" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-medium text-slate-900">Notificacions</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Marcar totes com llegides
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" strokeWidth={1} />
                <p className="text-sm">No tens notificacions noves</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 cursor-pointer hover:bg-slate-50 transition-colors',
                      !notification.isRead && 'bg-blue-50 border-l-4 border-blue-500'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            notification.isRead ? 'text-slate-700' : 'text-slate-900'
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-slate-500 ml-2">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className={cn(
                          'text-sm mt-1',
                          notification.isRead ? 'text-slate-500' : 'text-slate-700'
                        )}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/gestio/notifications')
              }}
              className="w-full text-center text-sm text-slate-600 hover:text-slate-900 py-2"
            >
              Veure totes les notificacions
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}