'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ca } from 'date-fns/locale'
import { X, Plus, Clock, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AgendaEvent, getCategoryStyle } from '@/lib/constants/agenda'

interface DayPopupProps {
  date: Date
  events: AgendaEvent[]
  position: { x: number; y: number } | null
  onClose: () => void
  onEventClick: (event: AgendaEvent) => void
  onAddEvent: () => void
}

export function DayPopup({ date, events, position, onClose, onEventClick, onAddEvent }: DayPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Tancar al clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Calcular posició
  const style = position ? {
    position: 'fixed' as const,
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 50
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 50
  }

  return (
    <>
      {/* Backdrop sutil */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div
        ref={popupRef}
        style={style}
        className="bg-white rounded-xl shadow-2xl border w-80 max-h-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div>
            <h3 className="font-semibold capitalize">
              {format(date, 'EEEE', { locale: ca })}
            </h3>
            <p className="text-sm text-gray-500">
              {format(date, 'd MMMM yyyy', { locale: ca })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Esdeveniments */}
        <div className="p-2 max-h-[280px] overflow-y-auto">
          {events.length > 0 ? (
            <div className="space-y-1">
              {events.map(event => {
                const category = getCategoryStyle(event.category)

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`
                      w-full text-left p-2.5 rounded-lg transition-colors
                      ${category.bgLight} hover:opacity-80 border-l-3 ${category.borderClass}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {event.title}
                        </p>
                        {(event.startTime || event.allDay) && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {event.allDay ? 'Tot el dia' : event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {event.reminder && (
                          <Bell className="w-3 h-3 text-orange-500" />
                        )}
                        <div className={`w-2 h-2 rounded-full ${category.bgClass}`} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">
              No hi ha esdeveniments
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddEvent}
          >
            <Plus className="w-4 h-4 mr-2" />
            Afegir esdeveniment
          </Button>
        </div>
      </div>
    </>
  )
}
