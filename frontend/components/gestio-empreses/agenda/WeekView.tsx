// components/gestio-empreses/agenda/WeekView.tsx
'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Users,
  Clock,
  Target,
  Calendar as CalendarIcon
} from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ca } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  type: string
  startDate: Date
  endDate: Date | null
  allDay: boolean
  location: string | null
  completed: boolean
  lead?: { id: string; companyName: string } | null
  company?: { id: string; name: string } | null
}

interface WeekViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateChange: (start: Date, end: Date) => void
}

const eventTypeConfig: Record<string, { icon: any; color: string }> = {
  CALL: { icon: Phone, color: 'bg-green-100 text-green-700 border-green-200' },
  MEETING: { icon: Users, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  FOLLOW_UP: { icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  DEMO: { icon: Target, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  OTHER: { icon: CalendarIcon, color: 'bg-slate-100 text-slate-700 border-slate-200' },
}

export function WeekView({ events, onEventClick, onDateChange }: WeekViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  const today = new Date()

  const goToPreviousWeek = () => {
    const newStart = addDays(currentWeekStart, -7)
    setCurrentWeekStart(newStart)
    onDateChange(newStart, addDays(newStart, 6))
  }

  const goToNextWeek = () => {
    const newStart = addDays(currentWeekStart, 7)
    setCurrentWeekStart(newStart)
    onDateChange(newStart, addDays(newStart, 6))
  }

  const goToToday = () => {
    const newStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    setCurrentWeekStart(newStart)
    onDateChange(newStart, addDays(newStart, 6))
  }

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startDate), day))
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </button>
          <h2 className="text-lg font-medium text-slate-900 ml-2">
            {format(currentWeekStart, "d MMM", { locale: ca })} - {' '}
            {format(addDays(currentWeekStart, 6), "d MMM yyyy", { locale: ca })}
          </h2>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
        >
          Avui
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 divide-x divide-slate-200">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)

          return (
            <div key={day.toISOString()} className="min-h-[200px]">
              {/* Day header */}
              <div className={cn(
                'p-2 text-center border-b border-slate-100',
                isToday && 'bg-blue-50'
              )}>
                <p className="text-xs text-slate-500 uppercase">
                  {format(day, 'EEE', { locale: ca })}
                </p>
                <p className={cn(
                  'text-lg font-medium',
                  isToday ? 'text-blue-600' : 'text-slate-900'
                )}>
                  {format(day, 'd')}
                </p>
              </div>

              {/* Events */}
              <div className="p-1 space-y-1">
                {dayEvents.map((event) => {
                  const config = eventTypeConfig[event.type] || eventTypeConfig.OTHER
                  const Icon = config.icon

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'w-full p-2 text-left rounded border text-xs transition-colors',
                        config.color,
                        event.completed && 'opacity-50 line-through'
                      )}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Icon className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />
                        <span className="font-medium truncate">{event.title}</span>
                      </div>
                      {!event.allDay && (
                        <p className="text-[10px] opacity-75">
                          {format(new Date(event.startDate), 'HH:mm')}
                        </p>
                      )}
                      {(event.lead || event.company) && (
                        <p className="text-[10px] opacity-75 truncate">
                          {event.lead?.companyName || event.company?.name}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}