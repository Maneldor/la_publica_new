'use client'

import { useMemo } from 'react'
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday
} from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  startTime: Date
}

interface AgendaYearViewProps {
  currentDate: Date
  events: Event[]
  onMonthClick?: (date: Date) => void
  onDayClick?: (date: Date) => void
}

const weekDays = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

export function AgendaYearView({ currentDate, events, onMonthClick, onDayClick }: AgendaYearViewProps) {
  const yearStart = startOfYear(currentDate)
  const yearEnd = endOfYear(currentDate)
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  // Agrupar esdeveniments per data i per mes
  const { eventsByDate, eventsByMonth } = useMemo(() => {
    const byDate: Record<string, number> = {}
    const byMonth: Record<string, number> = {}

    events.forEach((event) => {
      const date = new Date(event.startTime)
      const dateKey = format(date, 'yyyy-MM-dd')
      const monthKey = format(date, 'yyyy-MM')

      byDate[dateKey] = (byDate[dateKey] || 0) + 1
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1
    })

    return { eventsByDate: byDate, eventsByMonth: byMonth }
  }, [events])

  // Generar dies del calendari per un mes (incloent padding per alinear)
  const getCalendarDays = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {format(currentDate, 'yyyy')}
        </h2>
      </div>

      {/* Grid de 12 mesos (3 files x 4 columnes) */}
      <div className="grid grid-cols-4 gap-4">
        {months.map((month) => {
          const monthKey = format(month, 'yyyy-MM')
          const eventCount = eventsByMonth[monthKey] || 0
          const calendarDays = getCalendarDays(month)

          return (
            <div
              key={month.toISOString()}
              className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
            >
              {/* Capçalera del mes */}
              <button
                onClick={() => onMonthClick?.(month)}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-slate-900 capitalize">
                  {format(month, 'MMMM', { locale: ca })}
                </span>
                {eventCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {eventCount}
                  </span>
                )}
              </button>

              {/* Mini calendari */}
              <div className="p-2">
                {/* Dies de la setmana */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs text-slate-400 py-0.5">
                      {day.charAt(0)}
                    </div>
                  ))}
                </div>

                {/* Dies del mes */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const hasEvents = eventsByDate[dateKey] > 0
                    const isCurrentMonth = isSameMonth(day, month)
                    const isDayToday = isToday(day)

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isCurrentMonth) onDayClick?.(day)
                        }}
                        disabled={!isCurrentMonth}
                        className={cn(
                          'relative w-6 h-6 text-xs rounded flex items-center justify-center transition-colors',
                          !isCurrentMonth && 'text-slate-200 cursor-default',
                          isCurrentMonth && !isDayToday && 'text-slate-700 hover:bg-slate-100',
                          isDayToday && 'bg-blue-600 text-white font-medium',
                          hasEvents && isCurrentMonth && !isDayToday && 'font-semibold text-blue-600'
                        )}
                      >
                        {format(day, 'd')}
                        {hasEvents && isCurrentMonth && (
                          <span className={cn(
                            'absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                            isDayToday ? 'bg-white' : 'bg-blue-500'
                          )} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}