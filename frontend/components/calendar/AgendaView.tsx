'use client';

import { useMemo } from 'react';
import { type Event } from '@/lib/calendar/mockData';

interface AgendaViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  // Agrupar esdeveniments per dia
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, Event[]>();

    // Ordenar esdeveniments per data
    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.data_inici).getTime() - new Date(b.data_inici).getTime()
    );

    sortedEvents.forEach(event => {
      const date = new Date(event.data_inici);
      const dateKey = date.toISOString().split('T')[0];

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(event);
    });

    return grouped;
  }, [events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startTime = start.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {eventsByDay.size === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hi ha esdeveniments per mostrar
        </div>
      ) : (
        Array.from(eventsByDay.entries()).map(([dateKey, dayEvents]) => (
          <div key={dateKey} className="mb-8">
            {/* Data */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {formatDate(dateKey)}
            </h3>
            <div className="border-l-2 border-gray-200 pl-4">
              {dayEvents.length === 0 ? (
                <p className="text-gray-500 italic">Sense esdeveniments</p>
              ) : (
                <div className="space-y-4">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`
                        relative p-4 rounded-lg cursor-pointer
                        transition-all duration-200 hover:shadow-md
                        ${event.tipus_propietari === 'meu'
                          ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-600'
                          : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-blue-400'}
                      `}
                    >
                      <div className="flex items-start gap-4">
                        {/* Hora */}
                        <div className="text-sm font-medium text-gray-600 min-w-[140px]">
                          {formatTime(event.data_inici, event.data_fi)}
                        </div>

                        {/* Contingut */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            {/* Icona */}
                            <span className="text-2xl">{event.icon}</span>

                            {/* Detalls */}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {event.titol}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {event.instructor_nom || event.organitzador} · {event.modalitat}
                                {event.ubicacio && ` · ${event.ubicacio}`}
                              </p>

                              {/* Tags */}
                              <div className="flex gap-2 mt-2">
                                {event.tipus_propietari === 'meu' ? (
                                  <span className="inline-block text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                    MEU
                                  </span>
                                ) : (
                                  <span className="inline-block text-xs bg-blue-400 text-white px-2 py-0.5 rounded">
                                    PLATAFORMA
                                  </span>
                                )}

                                {event.participants_count && (
                                  <span className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                    👥 {event.participants_count} interessats
                                  </span>
                                )}
                              </div>

                              {/* Accions */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(event);
                                }}
                                className="mt-2 text-sm text-blue-600 font-medium hover:underline"
                              >
                                {event.tipus_propietari === 'meu' ? 'Veure detalls' : "Inscriure'm"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}