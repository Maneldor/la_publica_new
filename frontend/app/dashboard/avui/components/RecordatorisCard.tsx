'use client'

import { useEffect, useState, useMemo } from 'react'
import { Bell, Clock, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'
import { getCategoryStyles } from '@/lib/constants/agenda'
import Link from 'next/link'
import {
  isEventFuture,
  getDayLabel,
  getDateKey,
  toDate,
  isSameDay,
  addDays,
} from '@/lib/utils/calendar'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  time: string | null
  startTime?: string | null
  category?: string
  reminder?: boolean
}

const MAX_VISIBLE = 3
const CARD_MIN_HEIGHT = 'min-h-[320px]'

export function RecordatorisCard({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchWeekEvents = async () => {
      try {
        const res = await fetch('/api/agenda/events/week')
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch (error) {
        console.error('Error fetching week events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWeekEvents()
  }, [userId])

  // Filtrar SOLO eventos con RECORDATORIO ACTIVO y que sean FUTUROS
  const futureEvents = useMemo(() => {
    const now = new Date()
    const weekEnd = addDays(now, 7)

    return events
      .filter(event => {
        if (!event.reminder) return false
        if (!isEventFuture(event)) return false
        const eventDate = toDate(event.date)
        if (!eventDate) return false
        return eventDate <= weekEnd
      })
      .sort((a, b) => {
        const dateA = toDate(a.date)!
        const dateB = toDate(b.date)!

        if (isSameDay(dateA, dateB)) {
          const timeA = a.startTime || a.time || '00:00'
          const timeB = b.startTime || b.time || '00:00'
          return timeA.localeCompare(timeB)
        }

        return dateA.getTime() - dateB.getTime()
      })
  }, [events])

  // Eventos visibles según estado expandido
  const visibleEvents = isExpanded ? futureEvents : futureEvents.slice(0, MAX_VISIBLE)
  const hiddenCount = futureEvents.length - MAX_VISIBLE
  const hasMore = hiddenCount > 0

  // Agrupar por día solo los eventos visibles
  const groupedByDay = useMemo(() => {
    const groups: Record<string, { label: string; events: Event[] }> = {}

    visibleEvents.forEach(event => {
      const dateKey = getDateKey(event.date)
      const label = getDayLabel(event.date)

      if (!groups[dateKey]) {
        groups[dateKey] = { label, events: [] }
      }
      groups[dateKey].events.push(event)
    })

    return groups
  }, [visibleEvents])

  // Ordenar los grupos por fecha
  const sortedGroups = useMemo(() => {
    return Object.entries(groupedByDay).sort(([keyA], [keyB]) => {
      return keyA.localeCompare(keyB)
    })
  }, [groupedByDay])

  // Estilo del badge según el día
  const getDayBadgeStyle = (label: string) => {
    if (label === 'Avui') return 'bg-blue-600 text-white'
    if (label === 'Demà') return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <Card className={`${CARD_MIN_HEIGHT} flex flex-col`}>
      <CardHeader>
        <CardTitle
          icon={<Bell className="w-5 h-5 text-orange-500" />}
          action={
            <Link
              href="/dashboard/agenda"
              className={`${TYPOGRAPHY.link} flex items-center gap-1`}
            >
              Veure tot
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          Recordatoris
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : futureEvents.length > 0 ? (
          <>
            {/* Llista de recordatoris agrupats */}
            <div className="flex-1 space-y-4">
              {sortedGroups.map(([dateKey, { label, events: dayEvents }]) => (
                <div key={dateKey}>
                  {/* Day header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${getDayBadgeStyle(label)}`}>
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Day events */}
                  <div className="space-y-1.5 pl-1">
                    {dayEvents.map(event => {
                      const catStyles = getCategoryStyles(event.category)
                      const displayTime = event.startTime || event.time

                      return (
                        <Link
                          key={event.id}
                          href="/dashboard/agenda"
                          className={`flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group border-l-3 ${catStyles.borderColor} ${catStyles.bgLight}`}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${catStyles.bgColor}`} />

                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm text-gray-900 block truncate">
                              {event.title}
                            </span>

                            {displayTime && (
                              <div className={`flex items-center gap-1 text-xs mt-0.5 ${catStyles.textColor}`}>
                                <Clock className="w-3 h-3" />
                                {displayTime}
                              </div>
                            )}

                            {event.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {event.description}
                              </p>
                            )}
                          </div>

                          <Bell className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Botó Més/Menys */}
            {hasMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full pt-3 mt-auto border-t flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isExpanded ? (
                  <>
                    Menys
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Més ({hiddenCount})
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className={TYPOGRAPHY.body}>No tens recordatoris pendents</p>
              <p className="text-xs text-gray-400 mt-1">
                Activa el recordatori en crear un esdeveniment perquè aparegui aquí
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
