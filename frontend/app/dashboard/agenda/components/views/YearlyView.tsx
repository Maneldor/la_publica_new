'use client'

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, eachMonthOfInterval, startOfYear, endOfYear, isToday, isSameMonth } from 'date-fns'
import { ca } from 'date-fns/locale'
import { AgendaEvent, getCategoryStyle } from '../../page'

interface YearlyViewProps {
  date: Date
  events: AgendaEvent[]
  onDayClick: (date: Date, e?: React.MouseEvent) => void
}

const WEEKDAYS_SHORT = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

export function YearlyView({ date, events, onDayClick }: YearlyViewProps) {
  // Obtenir tots els mesos de l'any
  const yearStart = startOfYear(date)
  const yearEnd = endOfYear(date)
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  // Obtenir esdeveniments per dia
  const getEventsForDay = (day: Date) => {
    return events.filter(event =>
      format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {months.map(month => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)
          const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
          const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
          const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

          return (
            <div key={month.toISOString()} className="bg-gray-50 rounded-lg p-3">
              {/* Nom del mes */}
              <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize text-center">
                {format(month, 'MMMM', { locale: ca })}
              </h3>

              {/* Dies de la setmana */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {WEEKDAYS_SHORT.map(day => (
                  <div key={day} className="text-[10px] text-center text-gray-400 font-medium">
                    {day[0]}
                  </div>
                ))}
              </div>

              {/* Calendari mini */}
              <div className="grid grid-cols-7 gap-0.5">
                {days.map(day => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, month)
                  const hasEvents = dayEvents.length > 0

                  // Obtenir el color dominant
                  const dominantCategory = hasEvents ? getCategoryStyle(dayEvents[0].category) : null

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={(e) => onDayClick(day, e)}
                      disabled={!isCurrentMonth}
                      className={`
                        aspect-square text-[10px] rounded-sm flex items-center justify-center relative
                        ${isCurrentMonth ? 'hover:bg-gray-200' : 'opacity-0 pointer-events-none'}
                        ${isToday(day) ? 'bg-primary text-white font-bold' : ''}
                        ${hasEvents && !isToday(day) ? `${dominantCategory?.bgLight} font-medium` : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {hasEvents && dayEvents.length > 1 && !isToday(day) && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Llegenda */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>Avui</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-100" />
          <span>Amb esdeveniments</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>Múltiples</span>
        </div>
      </div>
    </div>
  )
}
