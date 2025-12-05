'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, isToday, isTomorrow } from 'date-fns'
import { ca } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  Phone,
  Video,
  Users,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUpcomingEvents, type UpcomingEvent } from '@/lib/gestio-empreses/dashboard-actions'

interface UpcomingEventsProps {
  userId: string
}

const eventTypeIcons: Record<string, any> = {
  'CALL': Phone,
  'VIDEO_CALL': Video,
  'MEETING': Users,
  'VISIT': MapPin,
  'OTHER': Calendar
}

const eventTypeColors: Record<string, string> = {
  'CALL': 'bg-blue-100 text-blue-600',
  'VIDEO_CALL': 'bg-purple-100 text-purple-600',
  'MEETING': 'bg-green-100 text-green-600',
  'VISIT': 'bg-amber-100 text-amber-600',
  'OTHER': 'bg-slate-100 text-slate-600'
}

export function UpcomingEvents({ userId }: UpcomingEventsProps) {
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await getUpcomingEvents(userId)
        setEvents(result)
      } catch (error) {
        console.error('Error carregant esdeveniments:', error)
      }
      setIsLoading(false)
    }

    loadEvents()
  }, [userId])

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return 'Avui'
    if (isTomorrow(date)) return 'Demà'
    return format(date, 'EEEE', { locale: ca })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-900">Agenda pròxima</h3>
        </div>
        <Link
          href="/gestio/agenda"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Veure tot
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Events list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" strokeWidth={1.5} />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-slate-500">No tens esdeveniments aquesta setmana</p>
          <Link
            href="/gestio/agenda"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            Programar un esdeveniment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const Icon = eventTypeIcons[event.type] || Calendar
            const colorClass = eventTypeColors[event.type] || eventTypeColors['OTHER']

            return (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className={cn('p-2 rounded-lg', colorClass)}>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{event.title}</p>
                  {event.relatedTo && (
                    <p className="text-xs text-slate-500 truncate">{event.relatedTo}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      'text-xs font-medium',
                      isToday(new Date(event.startTime)) ? 'text-blue-600' : 'text-slate-500'
                    )}>
                      {formatEventDate(new Date(event.startTime))}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {format(new Date(event.startTime), 'HH:mm', { locale: ca })}
                    </span>
                  </div>
                </div>

                {isToday(new Date(event.startTime)) && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                    Avui
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}