'use client'

import { useEffect, useState } from 'react'
import { Megaphone, Calendar as CalendarIcon, Clock, ChevronRight, ExternalLink, MapPin, Monitor } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  location?: string
  isOnline: boolean
}

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  priority: string
  expiryDate?: string
}

interface PlatformData {
  upcomingEvents: Event[]
  announcements: Announcement[]
}

export function PlatformNews() {
  const [platform, setPlatform] = useState<PlatformData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatform = async () => {
      try {
        const res = await fetch('/api/dashboard/avui')
        if (res.ok) {
          const data = await res.json()
          setPlatform(data.platform)
        }
      } catch (error) {
        console.error('Error fetching platform:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlatform()
  }, [])

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Avui'
    if (diffDays === 1) return 'Demà'
    if (diffDays < 7) return `En ${diffDays} dies`
    
    return date.toLocaleDateString('ca-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatAnnouncementTime = (dateString: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'Urgent'
      case 'medium':
        return 'Important'
      default:
        return 'Informatiu'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle
          icon={<Megaphone className="w-5 h-5 text-indigo-500" />}
          action={
            <Link
              href="/dashboard/novetats"
              className={`${TYPOGRAPHY.link} flex items-center gap-1`}
            >
              Veure tot
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          La Pública
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Anuncis */}
          {platform?.announcements && platform.announcements.length > 0 && (
            <>
              {platform.announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(announcement.priority)}`}>
                            {getPriorityLabel(announcement.priority)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatAnnouncementTime(announcement.createdAt)}
                        </div>
                        {announcement.expiryDate && (
                          <div className="flex items-center gap-1">
                            <span>Expira:</span>
                            {formatEventDate(announcement.expiryDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Esdeveniments */}
          {platform?.upcomingEvents && platform.upcomingEvents.length > 0 && (
            <>
              {platform.upcomingEvents.map((event) => (
                <div 
                  key={event.id}
                  className="p-4 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {event.title}
                        </h3>
                        <span className="text-xs text-green-600 font-medium flex-shrink-0">
                          {formatEventDate(event.startDate)}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          {event.location && !event.isOnline && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.isOnline && (
                            <div className="flex items-center gap-1">
                              <Monitor className="w-3 h-3" />
                              <span>En línia</span>
                            </div>
                          )}
                        </div>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Estat buit */}
          {(!platform?.announcements || platform.announcements.length === 0) && 
           (!platform?.upcomingEvents || platform.upcomingEvents.length === 0) && (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-2">No hi ha novetats</p>
              <p className="text-gray-400 text-xs">Els anuncis i esdeveniments apareixeran aquí</p>
            </div>
          )}
        </div>
      )}
      </CardContent>
    </Card>
  )
}