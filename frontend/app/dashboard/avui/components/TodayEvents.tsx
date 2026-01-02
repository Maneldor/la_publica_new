'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock, ChevronRight, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'
import { getCategoryStyles } from '@/lib/constants/agenda'

interface Event {
  id: string
  time: string | null
  startTime: string | null
  title: string
  description?: string
  category?: string
  allDay?: boolean
}

const MAX_VISIBLE = 3
const CARD_MIN_HEIGHT = 'min-h-[320px]'

export function TodayEvents({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch(`/api/agenda/events?date=${today}`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [userId])

  const visibleEvents = isExpanded ? events : events.slice(0, MAX_VISIBLE)
  const hiddenCount = events.length - MAX_VISIBLE
  const hasMore = hiddenCount > 0

  return (
    <Card className={`${CARD_MIN_HEIGHT} flex flex-col`}>
      <CardHeader>
        <CardTitle
          icon={<CalendarDays className="w-5 h-5 text-blue-500" />}
          action={
            <Link
              href="/dashboard/agenda"
              className={`${TYPOGRAPHY.link} flex items-center gap-1`}
            >
              Veure agenda
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          Avui tens
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            {/* Llista d'esdeveniments */}
            <div className="flex-1 space-y-2">
              {visibleEvents.map((event) => {
                const catStyles = getCategoryStyles(event.category)
                const displayTime = event.startTime || event.time
                return (
                  <Link
                    key={event.id}
                    href="/dashboard/agenda"
                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-l-4 ${catStyles.borderColor} ${catStyles.bgLight}`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${catStyles.bgColor}`} />
                    <div className={`flex items-center gap-2 text-sm font-medium min-w-[60px] ${catStyles.textColor}`}>
                      <Clock className="w-4 h-4" />
                      {event.allDay ? 'Tot el dia' : displayTime || '--:--'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-900 text-sm font-medium block truncate">{event.title}</span>
                      {event.description && (
                        <span className={`${TYPOGRAPHY.small} block truncate`}>{event.description}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
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
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className={`${TYPOGRAPHY.body} mb-3`}>No tens res programat per avui</p>
              <Link
                href="/dashboard/agenda"
                className={`${BUTTONS.primary} inline-flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Afegir esdeveniment
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
