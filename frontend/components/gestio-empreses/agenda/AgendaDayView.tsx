'use client'

import { useMemo } from 'react'
import { format, isSameDay, isToday, setHours, setMinutes } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  type: string
  leadId: string | null
  companyId: string | null
}

interface AgendaDayViewProps {
  currentDate: Date
  events: Event[]
  onEventClick?: (event: Event) => void
  onSlotClick?: (date: Date) => void
}

const hours = Array.from({ length: 24 }, (_, i) => i)

export function AgendaDayView({ currentDate, events, onEventClick, onSlotClick }: AgendaDayViewProps) {
  const dayEvents = useMemo(() => {
    return events.filter(event => isSameDay(new Date(event.startTime), currentDate))
  }, [events, currentDate])

  const getEventPosition = (event: Event) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const startHour = start.getHours() + start.getMinutes() / 60
    const endHour = end.getHours() + end.getMinutes() / 60
    const duration = endHour - startHour

    return {
      top: `${startHour * 60}px`,
      height: `${Math.max(duration * 60, 30)}px`,
    }
  }

  const handleSlotClick = (hour: number) => {
    const date = setMinutes(setHours(currentDate, hour), 0)
    onSlotClick?.(date)
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header amb data */}
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
        <h2 className={cn(
          'text-lg font-semibold',
          isToday(currentDate) ? 'text-blue-600' : 'text-slate-900'
        )}>
          {format(currentDate, "EEEE, d MMMM yyyy", { locale: ca })}
          {isToday(currentDate) && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
              Avui
            </span>
          )}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {dayEvents.length} esdeveniment{dayEvents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Graella d'hores */}
      <div className="relative">
        {hours.map((hour) => (
          <div
            key={hour}
            onClick={() => handleSlotClick(hour)}
            className="flex border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
            style={{ height: '60px' }}
          >
            <div className="w-20 flex-shrink-0 p-2 text-right text-xs text-slate-500 border-r border-slate-100">
              {format(setHours(new Date(), hour), 'HH:mm')}
            </div>
            <div className="flex-1 relative" />
          </div>
        ))}

        {/* Esdeveniments */}
        <div className="absolute top-0 left-20 right-0">
          {dayEvents.map((event) => {
            const position = getEventPosition(event)
            return (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="absolute left-2 right-2 bg-blue-100 border-l-4 border-blue-500 rounded-r-lg p-2 cursor-pointer hover:bg-blue-200 transition-colors overflow-hidden"
                style={{
                  top: position.top,
                  height: position.height,
                }}
              >
                <p className="text-sm font-medium text-blue-900 truncate">{event.title}</p>
                <p className="text-xs text-blue-700">
                  {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                </p>
              </div>
            )
          })}
        </div>

        {/* Línia de l'hora actual */}
        {isToday(currentDate) && (
          <div
            className="absolute left-20 right-0 border-t-2 border-red-500 z-10"
            style={{
              top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 60}px`,
            }}
          >
            <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}