'use client';

import { type Event } from '@/lib/calendar/mockData';

interface EventCardProps {
  event: Event;
  onClick: () => void;
  compact?: boolean;
}

export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  const isMeu = event.tipus_propietari === 'meu';

  // Formatejar hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className={`
        mb-3 p-3 rounded-lg border-l-4 cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isMeu
          ? 'border-blue-600 bg-blue-50 hover:bg-blue-100'
          : 'border-blue-400 bg-gray-50 hover:bg-gray-100'}
      `}
    >
      <div className="flex items-start gap-2">
        {/* Icona tipus */}
        <span className="text-xl flex-shrink-0">{event.icon}</span>

        <div className="flex-1 min-w-0">
          {/* Hora */}
          <p className="text-sm font-medium text-gray-900">
            {formatTime(event.data_inici)}
          </p>

          {/* Títol */}
          <h4 className="font-semibold text-gray-900 truncate">
            {event.titol}
          </h4>

          {!compact && (
            <>
              {/* Info extra */}
              <p className="text-sm text-gray-600">
                {event.instructor_nom || event.organitzador} · {event.modalitat}
              </p>

              {/* Badges */}
              {isMeu && (
                <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                  Inscrit
                </span>
              )}

              {/* Participants per esdeveniments plataforma */}
              {!isMeu && event.participants_count && (
                <p className="text-xs text-gray-500 mt-1">
                  👥 {event.participants_count} interessats
                </p>
              )}

              {/* Acció */}
              <button
                className="mt-2 text-sm text-blue-600 font-medium hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                {isMeu ? 'Veure detalls' : "Inscriure'm"}
              </button>
            </>
          )}
        </div>

        {/* Indicador visual MEU/PLATAFORMA */}
        <div
          className={`
            w-2 h-2 rounded-full flex-shrink-0 mt-1
            ${isMeu ? 'bg-blue-600' : 'bg-blue-400'}
          `}
          title={isMeu ? 'El meu esdeveniment' : 'Esdeveniment plataforma'}
        />
      </div>
    </div>
  );
}