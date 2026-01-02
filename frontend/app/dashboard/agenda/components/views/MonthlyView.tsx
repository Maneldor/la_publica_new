'use client'

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameMonth } from 'date-fns'
import { ca } from 'date-fns/locale'
import { AgendaEvent, getCategoryStyle } from '../../page'

interface MonthlyViewProps {
  date: Date
  events: AgendaEvent[]
  onDayClick: (date: Date, e?: React.MouseEvent) => void
  onEventClick: (event: AgendaEvent) => void
}

const WEEKDAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

export function MonthlyView({ date, events, onDayClick, onEventClick }: MonthlyViewProps) {
  // Obtenir tots els dies del calendari
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Obtenir esdeveniments per dia
  const getEventsForDay = (day: Date) => {
    return events
      .filter(event =>
        format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
      .sort((a, b) => {
        if (a.allDay && !b.allDay) return -1
        if (!a.allDay && b.allDay) return 1
        const timeA = a.startTime || '00:00'
        const timeB = b.startTime || '00:00'
        return timeA.localeCompare(timeB)
      })
  }

  return (
    <div className="p-4">
      {/* Header amb dies de la setmana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendari */}
      <div className="grid grid-cols-7 border-t border-l">
        {days.map(day => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, date)
          const hasEvents = dayEvents.length > 0

          return (
            <div
              key={day.toISOString()}
              onClick={(e) => onDayClick(day, e)}
              className={`
                min-h-[100px] p-2 border-r border-b cursor-pointer transition-colors
                ${isToday(day) ? 'bg-primary/5' : 'hover:bg-gray-50'}
                ${!isCurrentMonth ? 'bg-gray-50' : ''}
              `}
            >
              {/* Número del dia */}
              <div className={`
                text-sm font-medium mb-1
                ${isToday(day) ? 'bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}
                ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
              `}>
                {format(day, 'd')}
              </div>

              {/* Esdeveniments (màxim 3 visibles) */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => {
                  const category = getCategoryStyle(event.category)
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className={`
                        w-full text-left px-1.5 py-0.5 rounded text-xs truncate
                        ${category.bgLight} ${category.textClass}
                        hover:opacity-80 transition-opacity
                      `}
                    >
                      {event.startTime && (
                        <span className="font-medium mr-1">{event.startTime}</span>
                      )}
                      {event.title}
                    </button>
                  )
                })}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-center text-gray-500 font-medium">
                    +{dayEvents.length - 3} més
                  </div>
                )}
              </div>

              {/* Indicador de esdeveniments (si no es mostren) */}
              {hasEvents && dayEvents.length <= 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 4).map((event, i) => {
                    const category = getCategoryStyle(event.category)
                    return (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${category.bgClass}`}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
