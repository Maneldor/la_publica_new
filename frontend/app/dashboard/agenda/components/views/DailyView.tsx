'use client'

import { format, isToday } from 'date-fns'
import { ca } from 'date-fns/locale'
import { Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AgendaEvent } from '../../page'
import { EventCard } from '../EventCard'

interface DailyViewProps {
  date: Date
  events: AgendaEvent[]
  onDayClick: (date: Date, e?: React.MouseEvent) => void
  onEventClick: (event: AgendaEvent) => void
}

export function DailyView({ date, events, onDayClick, onEventClick }: DailyViewProps) {
  // Filtrar esdeveniments del dia
  const dayEvents = events.filter(event =>
    format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  )

  // Separar entre tot el dia i amb hora
  const allDayEvents = dayEvents.filter(e => e.allDay)
  const timedEvents = dayEvents.filter(e => !e.allDay).sort((a, b) => {
    const timeA = a.startTime || '00:00'
    const timeB = b.startTime || '00:00'
    return timeA.localeCompare(timeB)
  })

  // Generar franges horàries (7:00 - 22:00)
  const hours = Array.from({ length: 16 }, (_, i) => i + 7)

  const getEventsForHour = (hour: number) => {
    return timedEvents.filter(event => {
      if (!event.startTime) return false
      const eventHour = parseInt(event.startTime.split(':')[0])
      return eventHour === hour
    })
  }

  return (
    <div className="p-6">
      {/* Header del dia */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${isToday(date) ? 'bg-primary text-white' : 'bg-gray-100'}`}>
            <span className="text-xs uppercase font-medium">
              {format(date, 'EEE', { locale: ca })}
            </span>
            <span className="text-2xl font-bold">
              {format(date, 'd')}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold capitalize">
              {format(date, 'EEEE', { locale: ca })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(date, 'd MMMM yyyy', { locale: ca })}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => onDayClick(date, e)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Afegir
        </Button>
      </div>

      {/* Esdeveniments de tot el dia */}
      {allDayEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tot el dia</h3>
          <div className="space-y-2">
            {allDayEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={onEventClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="border rounded-lg overflow-hidden">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour)
          const timeString = `${hour.toString().padStart(2, '0')}:00`

          return (
            <div
              key={hour}
              className="flex border-b last:border-b-0 min-h-[60px] hover:bg-gray-50 transition-colors"
            >
              <div className="w-20 flex-shrink-0 py-2 px-3 text-sm text-gray-500 border-r bg-gray-50">
                {timeString}
              </div>
              <div className="flex-1 p-2">
                {hourEvents.length > 0 ? (
                  <div className="space-y-1">
                    {hourEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={onEventClick}
                        compact
                      />
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={(e) => onDayClick(date, e)}
                    className="w-full h-full min-h-[40px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Missatge si no hi ha res */}
      {dayEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No tens res programat</p>
          <p className="text-sm">Clica a qualsevol hora per afegir un esdeveniment</p>
        </div>
      )}
    </div>
  )
}
