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
  isToday,
  addMonths
} from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  startTime: Date
}

interface AgendaSemesterViewProps {
  currentDate: Date
  events: Event[]
  onDayClick?: (date: Date) => void
  onMonthClick?: (date: Date) => void
}

const weekDays = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

export function AgendaSemesterView({ currentDate, events, onDayClick, onMonthClick }: AgendaSemesterViewProps) {
  // Determinar quin semestre estem (S1: gener-juny, S2: juliol-desembre)
  const semester = currentDate.getMonth() < 6 ? 1 : 2
  const year = currentDate.getFullYear()

  // Primer mes del semestre
  const semesterStart = new Date(year, semester === 1 ? 0 : 6, 1)

  // Generar els 6 mesos del semestre
  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => addMonths(semesterStart, i))
  }, [semesterStart.getTime()])

  // Agrupar esdeveniments per data
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, number> = {}
    events.forEach((event) => {
      const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd')
      grouped[dateKey] = (grouped[dateKey] || 0) + 1
    })
    return grouped
  }, [events])

  // Generar dies del calendari per un mes (incloent padding)
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
          S{semester} {year}
        </h2>
        <p className="text-sm text-slate-500">
          {semester === 1 ? 'Gener - Juny' : 'Juliol - Desembre'} {year}
        </p>
      </div>

      {/* Grid de 6 mesos (2 files x 3 columnes) */}
      <div className="grid grid-cols-3 gap-6">
        {months.map((month) => {
          const calendarDays = getCalendarDays(month)

          return (
            <div key={month.toISOString()} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Capçalera del mes */}
              <button
                onClick={() => onMonthClick?.(month)}
                className="w-full px-4 py-2 bg-slate-100 font-medium text-slate-900 text-left hover:bg-slate-200 transition-colors capitalize"
              >
                {format(month, 'MMMM', { locale: ca })}
              </button>

              {/* Calendari */}
              <div className="p-3">
                {/* Dies de la setmana */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dies del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const eventCount = eventsByDate[dateKey] || 0
                    const isCurrentMonth = isSameMonth(day, month)
                    const isDayToday = isToday(day)

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => isCurrentMonth && onDayClick?.(day)}
                        disabled={!isCurrentMonth}
                        className={cn(
                          'relative w-7 h-7 text-xs rounded-full flex items-center justify-center transition-colors',
                          !isCurrentMonth && 'text-slate-300 cursor-default',
                          isCurrentMonth && !isDayToday && 'hover:bg-slate-100',
                          isDayToday && 'bg-blue-600 text-white font-medium',
                          eventCount > 0 && isCurrentMonth && !isDayToday && 'font-medium text-blue-600'
                        )}
                      >
                        {format(day, 'd')}
                        {eventCount > 0 && isCurrentMonth && (
                          <span className={cn(
                            'absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
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