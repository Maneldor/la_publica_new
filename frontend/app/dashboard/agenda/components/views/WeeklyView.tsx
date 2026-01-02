'use client'

import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { ca } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { AgendaEvent } from '../../page'
import { EventCard } from '../EventCard'

interface WeeklyViewProps {
  date: Date
  events: AgendaEvent[]
  onDayClick: (date: Date, e?: React.MouseEvent) => void
  onEventClick: (event: AgendaEvent) => void
}

export function WeeklyView({ date, events, onDayClick, onEventClick }: WeeklyViewProps) {
  // Obtenir els dies de la setmana (Dl-Dg)
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

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
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header amb dies */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div
              key={day.toISOString()}
              className={`p-3 text-center border-r last:border-r-0 ${isToday(day) ? 'bg-primary/5' : ''}`}
            >
              <div className="text-xs text-gray-500 uppercase font-medium">
                {format(day, 'EEE', { locale: ca })}
              </div>
              <div className={`text-xl font-semibold mt-1 ${isToday(day) ? 'bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Contingut */}
        <div className="grid grid-cols-7 min-h-[500px]">
          {weekDays.map(day => {
            const dayEvents = getEventsForDay(day)

            return (
              <div
                key={day.toISOString()}
                className={`border-r last:border-r-0 p-2 ${isToday(day) ? 'bg-primary/5' : ''}`}
              >
                {/* Esdeveniments */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 5).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      compact
                    />
                  ))}

                  {dayEvents.length > 5 && (
                    <button
                      onClick={(e) => onDayClick(day, e)}
                      className="w-full text-xs text-center text-primary hover:underline py-1"
                    >
                      +{dayEvents.length - 5} més
                    </button>
                  )}
                </div>

                {/* Botó afegir */}
                <button
                  onClick={(e) => onDayClick(day, e)}
                  className="w-full mt-2 p-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary hover:text-primary transition-colors opacity-0 hover:opacity-100"
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
