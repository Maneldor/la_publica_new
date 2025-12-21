'use client'

import { useEffect, useState } from 'react'
import { Bell, MessageCircle, User, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
  sender?: {
    name: string
    image?: string
  }
}

interface ActivityData {
  notifications: Notification[]
  unreadNotifications: number
  unreadMessages: number
}

export function ActivityFeed({ userId }: { userId: string }) {
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('/api/dashboard/avui')
        if (res.ok) {
          const data = await res.json()
          setActivity(data.activity)
        }
      } catch (error) {
        console.error('Error fetching activity:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [userId])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Ara mateix'
    if (diffHours < 24) return `Fa ${diffHours}h`
    if (diffDays === 1) return 'Ahir'
    if (diffDays < 7) return `Fa ${diffDays} dies`
    return date.toLocaleDateString('ca-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageCircle
      case 'connection':
        return User
      default:
        return Bell
    }
  }

  const unreadText = activity && (activity.unreadNotifications > 0 || activity.unreadMessages > 0)
    ? `${activity.unreadNotifications > 0 ? `${activity.unreadNotifications} notificacions` : ''}${activity.unreadNotifications > 0 && activity.unreadMessages > 0 ? ' • ' : ''}${activity.unreadMessages > 0 ? `${activity.unreadMessages} missatges` : ''}`
    : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle
          icon={<Bell className="w-5 h-5 text-amber-500" />}
          subtitle={unreadText}
          action={
            <Link
              href="/dashboard/notificacions"
              className={`${TYPOGRAPHY.link} flex items-center gap-1`}
            >
              Veure tot
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          Activitat recent
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activity?.notifications && activity.notifications.length > 0 ? (
        <div className="space-y-3">
          {activity.notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type)
            return (
              <div 
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                  !notification.isRead 
                    ? 'bg-blue-50 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {notification.sender?.image ? (
                    <img 
                      src={notification.sender.image} 
                      alt={notification.sender.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  {!notification.isRead && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full -mt-1 -mr-1 relative float-right" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {activity.unreadMessages > 0 && (
            <Link 
              href="/dashboard/missatges"
              className="flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {activity.unreadMessages} missatge{activity.unreadMessages !== 1 ? 's' : ''} nou{activity.unreadMessages !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-green-600">Toca per veure les converses</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-green-600" />
            </Link>
          )}
        </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={TYPOGRAPHY.body}>No hi ha activitat recent</p>
            <p className={`${TYPOGRAPHY.small} mt-1`}>Les notificacions apareixeran aquí</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}