'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'

interface Event {
  id: string
  time: string
  title: string
  description?: string
}

export function TodayEvents({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch(`/api/agenda/events?date=${today}`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data.slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [userId])

  return (
    <Card>
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

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 min-w-[60px]">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-900 text-sm font-medium block truncate">{event.title}</span>
                  {event.description && (
                    <span className={`${TYPOGRAPHY.small} block truncate`}>{event.description}</span>
                  )}
                </div>
              </div>
            ))}

            {events.length === 4 && (
              <Link
                href="/dashboard/agenda"
                className="flex items-center justify-center gap-2 p-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Veure tots els esdeveniments
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
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
        )}
      </CardContent>
    </Card>
  )
}