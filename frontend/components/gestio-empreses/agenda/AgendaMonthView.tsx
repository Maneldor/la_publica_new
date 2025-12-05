'use client'

import { useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  startTime: Date
  type: string
}

interface AgendaMonthViewProps {
  currentDate: Date
  events: Event[]
  onDayClick?: (date: Date) => void
  onEventClick?: (event: Event) => void
}

const weekDays = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

export function AgendaMonthView({ currentDate, events, onDayClick, onEventClick }: AgendaMonthViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {}
    events.forEach((event) => {
      const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  return (
    <div className="flex-1 p-4">
      {/* Dies de la setmana */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Dies del mes */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDate[dateKey] || []
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={cn(
                'min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors',
                isCurrentMonth ? 'bg-white' : 'bg-slate-50',
                isToday(day) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1',
                  isToday(day) && 'bg-blue-600 text-white font-medium',
                  !isToday(day) && isCurrentMonth && 'text-slate-900',
                  !isCurrentMonth && 'text-slate-400'
                )}
              >
                {format(day, 'd')}
              </span>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded truncate hover:bg-blue-200 transition-colors"
                  >
                    {format(new Date(event.startTime), 'HH:mm')} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500 px-1.5">
                    +{dayEvents.length - 3} més
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}