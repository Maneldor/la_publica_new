'use client';

import { type Event } from '@/lib/calendar/mockData';

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
}

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const isMeu = event.tipus_propietari === 'meu';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startTime = start.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });

    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const hours = Math.floor(duration);
    const minutes = Math.floor((duration - hours) * 60);

    return `${startTime} - ${endTime} (${hours}h ${minutes > 0 ? minutes + 'min' : ''})`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[200] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-2xl bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {event.icon} {event.titol}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Data i hora */}
          <div className="mb-6 space-y-2">
            <p className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">📅</span>
              {formatDate(event.data_inici)}
            </p>
            <p className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">🕐</span>
              {formatTime(event.data_inici, event.data_fi)}
            </p>
          </div>

          {/* Informació específica */}
          <div className="mb-6 space-y-3">
            {event.instructor_nom && (
              <p className="flex items-start gap-2 text-gray-700">
                <span className="text-lg">👨‍🏫</span>
                <span>
                  <strong>Instructor:</strong> {event.instructor_nom}
                </span>
              </p>
            )}

            {event.organitzador && (
              <p className="flex items-start gap-2 text-gray-700">
                <span className="text-lg">🏢</span>
                <span>
                  <strong>Organitzador:</strong> {event.organitzador}
                </span>
              </p>
            )}

            <p className="flex items-start gap-2 text-gray-700">
              <span className="text-lg">📍</span>
              <span>
                <strong>Modalitat:</strong> {event.modalitat}
                {event.ubicacio && (
                  <>
                    <br />
                    {event.modalitat === 'presencial' && `• Lloc: ${event.ubicacio}`}
                    {event.modalitat === 'online' && `• Link: ${event.ubicacio}`}
                    {event.modalitat === 'hibrid' && (
                      <>
                        <br />• Presencial: {event.ubicacio}
                        <br />• Online: {event.link_online || 'Link per confirmar'}
                      </>
                    )}
                  </>
                )}
              </span>
            </p>

            {!isMeu && event.participants_count && (
              <p className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">👥</span>
                <strong>{event.participants_count}</strong> persones interessades
              </p>
            )}
          </div>

          {/* Descripció */}
          {event.descripcio && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">📝 Descripció:</h3>
              <p className="text-gray-600">{event.descripcio}</p>
            </div>
          )}

          {/* Materials si és MEU */}
          {isMeu && event.materials && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">📎 Materials:</h3>
              <ul className="space-y-1">
                {event.materials.map((material, index) => (
                  <li key={index} className="text-blue-600 hover:underline cursor-pointer">
                    • {material}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Què aprendràs si és PLATAFORMA */}
          {!isMeu && event.objectius && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">✨ Què aprendràs:</h3>
              <ul className="space-y-1">
                {event.objectius.map((objectiu, index) => (
                  <li key={index} className="text-gray-600">
                    • {objectiu}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer amb accions */}
        <div className="p-6 border-t bg-gray-50">
          {isMeu ? (
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Veure curs complet
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Afegir a Google Calendar
              </button>
              <button className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                Cancel·lar inscripció
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                🎯 Inscriure&apos;m
              </button>
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                ❤️ Guardar
              </button>
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🔗 Compartir
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}