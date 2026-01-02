'use client'

import { Clock, MapPin, Bell } from 'lucide-react'
import { AgendaEvent, getCategoryStyle } from '@/lib/constants/agenda'

interface EventCardProps {
  event: AgendaEvent
  onClick?: (event: AgendaEvent) => void
  compact?: boolean
}

export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  const category = getCategoryStyle(event.category)

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(event)}
        className={`w-full text-left px-2 py-1 rounded text-xs font-medium truncate transition-all hover:opacity-80 ${category.bgLight} ${category.textClass} border-l-2 ${category.borderClass}`}
      >
        {event.startTime && <span className="mr-1">{event.startTime}</span>}
        {event.title}
      </button>
    )
  }

  return (
    <button
      onClick={() => onClick?.(event)}
      className={`w-full text-left p-3 rounded-lg transition-all hover:shadow-md border-l-4 ${category.borderClass} ${category.bgLight} group`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate group-hover:text-gray-700">
            {event.title}
          </h4>

          {event.description && (
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {event.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            )}

            {event.allDay && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Tot el dia
              </span>
            )}

            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {event.reminder && (
            <Bell className="w-4 h-4 text-orange-500" />
          )}
          <div className={`w-2 h-2 rounded-full ${category.bgClass}`} />
        </div>
      </div>
    </button>
  )
}
