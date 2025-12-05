// components/gestio-empreses/shared/NotificationBell.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationPanel } from './NotificationPanel'
import { getUnreadCount, getUserNotifications } from '@/lib/gestio-empreses/notification-actions'

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      const [count, notifs] = await Promise.all([
        getUnreadCount(userId),
        getUserNotifications(userId, 10),
      ])
      setUnreadCount(count)
      setNotifications(notifs)
    } catch (error) {
      console.error('Error carregant notificacions:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadNotifications()

    // Polling cada 30 segons
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      loadNotifications()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleUpdate = () => {
    loadNotifications()
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={cn(
          'relative p-2 rounded-md transition-colors',
          isOpen ? 'bg-slate-100' : 'hover:bg-slate-100'
        )}
      >
        <Bell className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center text-[10px] font-medium text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />
          <NotificationPanel
            notifications={notifications}
            onClose={handleClose}
            onUpdate={handleUpdate}
            userId={userId}
          />
        </>
      )}
    </div>
  )
}