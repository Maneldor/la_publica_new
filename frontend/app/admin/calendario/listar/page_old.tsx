'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Globe, BookOpen, Video } from 'lucide-react';
import { CalendarEvent } from '@/lib/types/calendar';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { StatCard } from '@/components/ui/StatCard';

const CalendarioListarPage = () => {
  const { events, loading, getEventStats, deleteEvent } = useCalendar();
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  useEffect(() => {
    let filtered = events;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.categoria === selectedCategory);
    }

    // Filtrar por propietario
    if (selectedOwner !== 'all') {
      filtered = filtered.filter(event => event.tenantType === selectedOwner);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.titol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.descripcio && event.descripcio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, selectedOwner, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      'curs': 'bg-blue-100 text-blue-800',
      'assessorament': 'bg-green-100 text-green-800',
      'grup': 'bg-purple-100 text-purple-800',
      'recordatori': 'bg-red-100 text-red-800',
      'webinar': 'bg-indigo-100 text-indigo-800',
      'esdeveniment': 'bg-yellow-100 text-yellow-800',
      'personalitzat': 'bg-gray-100 text-gray-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getOwnerBadge = (tipus: string) => {
    return tipus === 'empleat_public' ?
      'bg-emerald-100 text-emerald-800' :
      'bg-sky-100 text-sky-800';
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      deleteEvent(eventId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Gestión de Calendario</h1>
          <p className="text-gray-600">Administra los eventos del calendario de la plataforma</p>
        </div>
        <Link
          href="/admin/calendario/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Evento
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Eventos"
          value={getEventStats().total}
          icon={<Calendar className="w-10 h-10" />}
          color="blue"
        />
        <StatCard
          title="Eventos Plataforma"
          value={getEventStats().byTenant.plataforma || 0}
          icon={<Globe className="w-10 h-10" />}
          color="green"
        />
        <StatCard
          title="Cursos"
          value={getEventStats().byCategory.curs || 0}
          icon={<BookOpen className="w-10 h-10" />}
          color="purple"
        />
        <StatCard
          title="Webinars"
          value={getEventStats().byCategory.webinar || 0}
          icon={<Video className="w-10 h-10" />}
          color="yellow"
        />
      </div>

      {/* Filtros */
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar eventos..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="curs">Cursos</option>
              <option value="assessorament">Assessoraments</option>
              <option value="grup">Grupos</option>
              <option value="webinar">Webinars</option>
              <option value="esdeveniment">Eventos</option>
              <option value="recordatori">Recordatorios</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="empleat_public">Eventos personales</option>
              <option value="plataforma">Eventos de plataforma</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedOwner('all');
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Eventos ({filteredEvents.length})
          </h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay eventos que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{event.icon}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.titol}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.categoria)}`}>
                            {event.categoria}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOwnerBadge(event.tenantType)}`}>
                            {event.tenantType === 'empleat_public' ? 'Personal' : 'Plataforma'}
                          </span>
                          {!event.visible && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Oculto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-4">
                        <span>📅 {formatDate(event.dataInici)}</span>
                        <span>📍 {event.modalitat}</span>
                        {event.instructorNom && <span>👨‍🏫 {event.instructorNom}</span>}
                        {event.organitzador && <span>🏢 {event.organitzador}</span>}
                      </div>
                    </div>

                    {event.descripcio && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {event.descripcio}
                      </p>
                    )}

                    {event.participants && (
                      <div className="text-sm text-gray-500">
                        👥 {event.participants} participantes interesados
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/admin/calendario/editar/${event.id}`}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioListarPage;