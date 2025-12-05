'use client'

import { useMemo } from 'react'
import {
  format,
  startOfQuarter,
  endOfQuarter,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getQuarter
} from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  startTime: Date
}

interface AgendaQuarterViewProps {
  currentDate: Date
  events: Event[]
  onDayClick?: (date: Date) => void
  onMonthClick?: (date: Date) => void
}

export function AgendaQuarterView({ currentDate, events, onDayClick, onMonthClick }: AgendaQuarterViewProps) {
  const quarterStart = startOfQuarter(currentDate)
  const quarterEnd = endOfQuarter(currentDate)
  const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd })
  const quarter = getQuarter(currentDate)

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, number> = {}
    events.forEach((event) => {
      const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd')
      grouped[dateKey] = (grouped[dateKey] || 0) + 1
    })
    return grouped
  }, [events])

  return (
    <div className="flex-1 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          T{quarter} {format(currentDate, 'yyyy')}
        </h2>
        <p className="text-sm text-slate-500">
          {format(quarterStart, "d MMM", { locale: ca })} - {format(quarterEnd, "d MMM yyyy", { locale: ca })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {months.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

          return (
            <div key={month.toISOString()} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Month header */}
              <button
                onClick={() => onMonthClick?.(month)}
                className="w-full px-4 py-2 bg-slate-100 font-medium text-slate-900 text-left hover:bg-slate-200 transition-colors"
              >
                {format(month, 'MMMM', { locale: ca })}
              </button>

              {/* Mini calendar */}
              <div className="p-2">
                <div className="grid grid-cols-7 gap-0.5 text-center">
                  {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map((d) => (
                    <div key={d} className="text-xs text-slate-400 py-1">{d}</div>
                  ))}

                  {/* Empty cells for alignment */}
                  {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const eventCount = eventsByDate[dateKey] || 0

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => onDayClick?.(day)}
                        className={cn(
                          'relative w-7 h-7 text-xs rounded-full flex items-center justify-center transition-colors',
                          isToday(day) && 'bg-blue-600 text-white',
                          !isToday(day) && 'hover:bg-slate-100',
                          eventCount > 0 && !isToday(day) && 'font-medium text-blue-600'
                        )}
                      >
                        {format(day, 'd')}
                        {eventCount > 0 && (
                          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
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