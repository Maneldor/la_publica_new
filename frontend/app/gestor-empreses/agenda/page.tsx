'use client';

import { useState, useEffect } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { eventsApi, Event } from '../../../services/eventsApi';
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Building2,
  Target
} from 'lucide-react';

// Mapejat dels tipus d'esdeveniments
type EventTypeMap = {
  'MEETING': 'meeting';
  'CALL': 'call';
  'PRESENTATION': 'presentation';
  'TRAINING': 'training';
  'DEADLINE': 'deadline';
  'REMINDER': 'reminder';
  'OTHER': 'other';
};

type LocalEventType = 'meeting' | 'call' | 'presentation' | 'training' | 'follow_up' | 'deadline' | 'reminder' | 'other';
type LocalEventStatus = 'confirmed' | 'tentative' | 'cancelled' | 'completed';

interface LocalEvent {
  id: string;
  title: string;
  description?: string;
  type: LocalEventType;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  onlineLink?: string;
  status: LocalEventStatus;
  visibility: 'private' | 'public' | 'confidential';
  attendees: Array<{
    id: string;
    name: string;
    email?: string;
    response: 'pending' | 'accepted' | 'declined' | 'tentative';
  }>;
  lead?: {
    id: string;
    companyName: string;
  };
  company?: {
    id: string;
    name: string;
  };
  relatedTo?: string;
}

// Funció per convertir esdeveniments del backend al format local
const convertEvent = (apiEvent: Event): LocalEvent => {
  const typeMap: Record<Event['type'], LocalEventType> = {
    'MEETING': 'meeting',
    'CALL': 'call',
    'PRESENTATION': 'presentation',
    'TRAINING': 'training',
    'DEADLINE': 'deadline',
    'REMINDER': 'reminder',
    'OTHER': 'other'
  };

  const statusMap: Record<Event['status'], LocalEventStatus> = {
    'SCHEDULED': 'confirmed',
    'IN_PROGRESS': 'confirmed',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
    'POSTPONED': 'tentative'
  };

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    type: typeMap[apiEvent.type] || 'other',
    startDate: new Date(apiEvent.startDate),
    endDate: new Date(apiEvent.endDate),
    isAllDay: apiEvent.isAllDay,
    location: apiEvent.location,
    status: statusMap[apiEvent.status] || 'confirmed',
    visibility: 'private',
    attendees: apiEvent.attendees?.map(att => ({
      id: att.id,
      name: att.user?.employee ?
        `${att.user.employee.firstName} ${att.user.employee.lastName}` :
        att.user?.company?.name || att.email,
      email: att.email,
      response: att.status.toLowerCase() as 'pending' | 'accepted' | 'declined' | 'tentative'
    })) || [],
    lead: apiEvent.lead ? {
      id: apiEvent.lead.id,
      companyName: apiEvent.lead.companyName
    } : undefined,
    company: apiEvent.company ? {
      id: apiEvent.company.id,
      name: apiEvent.company.name
    } : undefined
  };
};

const eventTypeColors = {
  meeting: 'bg-blue-500',
  call: 'bg-green-500',
  presentation: 'bg-purple-500',
  training: 'bg-orange-500',
  follow_up: 'bg-yellow-500',
  deadline: 'bg-red-500',
  reminder: 'bg-gray-500',
  other: 'bg-indigo-500'
};

const eventTypeLabels = {
  meeting: 'Reunió',
  call: 'Trucada',
  presentation: 'Presentació',
  training: 'Formació',
  follow_up: 'Seguiment',
  deadline: 'Data límit',
  reminder: 'Recordatori',
  other: 'Altre'
};

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayEvents: 0,
    pendingMeetings: 0,
    weeklyEvents: 0,
    pendingResponses: 0
  });

  // Carregar esdeveniments del backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const [apiEvents, apiStats] = await Promise.all([
          eventsApi.getEvents(),
          eventsApi.getEventStats().catch(() => ({
            todayEvents: 0,
            pendingMeetings: 0,
            weeklyEvents: 0,
            pendingResponses: 0
          }))
        ]);

        const convertedEvents = apiEvents.map(convertEvent);
        setEvents(convertedEvents);
        setStats(apiStats);
      } catch (err) {
        console.error('Error carregant esdeveniments:', err);
        setError('Error carregant els esdeveniments');
        // Fallback a dades mock en cas d'error
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Estadístiques calculades localment si no venen del backend
  const today = new Date();
  const localStats = {
    todayEvents: events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === today.toDateString();
    }).length,
    pendingMeetings: events.filter(event =>
      event.type === 'meeting' &&
      new Date(event.startDate) > today &&
      event.status === 'confirmed'
    ).length,
    weeklyEvents: events.filter(event => {
      const eventDate = new Date(event.startDate);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return eventDate >= weekStart && eventDate <= weekEnd;
    }).length,
    pendingResponses: events.reduce((count, event) => {
      return count + event.attendees.filter(att => att.response === 'pending').length;
    }, 0)
  };

  const finalStats = stats.todayEvents > 0 ? stats : localStats;

  const statsData = [
    { label: 'Esdeveniments Avui', value: finalStats.todayEvents.toString(), trend: finalStats.todayEvents > 0 ? '!' : '' },
    { label: 'Reunions Pendents', value: finalStats.pendingMeetings.toString(), trend: finalStats.pendingMeetings > 3 ? '+' : '' },
    { label: 'Aquesta Setmana', value: finalStats.weeklyEvents.toString(), trend: finalStats.weeklyEvents > 5 ? '+' : '' },
    { label: 'Respostes Pendents', value: finalStats.pendingResponses.toString(), trend: finalStats.pendingResponses > 0 ? '!' : '' }
  ];

  // Generar calendari mensual
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Dies del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Dies del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Dies del mes següent per completar la setmana
    const remaining = 42 - days.length; // 6 setmanes x 7 dies
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
  ];
  const dayNames = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];

  return (
    <PageTemplate
      title="Agenda"
      subtitle="Gestió d'esdeveniments i reunions"
      statsData={statsData}
    >
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Carregant esdeveniments...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <>
        {/* Controls superiors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              {/* Navegació de mes */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 min-w-[180px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Avui
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Selector de vista */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['month', 'week', 'day', 'list'] as const).map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      view === viewType
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {viewType === 'month' ? 'Mes' :
                     viewType === 'week' ? 'Setmana' :
                     viewType === 'day' ? 'Dia' : 'Llista'}
                  </button>
                ))}
              </div>

              {/* Botó crear esdeveniment */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nou Esdeveniment
              </button>
            </div>
          </div>
        </div>

        {/* Vista de calendari mensual */}
        {view === 'month' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Headers dels dies */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Dies del calendari */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day.date);
                const isToday = day.date.toDateString() === today.toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-b border-r border-gray-200 p-2 ${
                      !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      !day.isCurrentMonth ? 'text-gray-400' :
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {isToday && (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">
                          {day.date.getDate()}
                        </span>
                      )}
                      {!isToday && day.date.getDate()}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer text-white truncate ${
                            eventTypeColors[event.type]
                          } hover:opacity-80 transition-opacity`}
                        >
                          {!event.isAllDay && (
                            <span className="font-medium">
                              {formatTime(event.startDate)}
                            </span>
                          )}
                          <span className={!event.isAllDay ? 'ml-1' : ''}>
                            {event.title}
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayEvents.length - 3} més
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista de llista */}
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Propers Esdeveniments
              </h3>

              <div className="space-y-4">
                {events
                  .filter(event => new Date(event.startDate) >= today)
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .slice(0, 10)
                  .map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${eventTypeColors[event.type]} mr-4`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          event.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'confirmed' ? 'Confirmat' :
                           event.status === 'tentative' ? 'Provisional' :
                           event.status === 'cancelled' ? 'Cancel·lat' : 'Completat'}
                        </span>
                      </div>

                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {event.startDate.toLocaleDateString('ca-ES')}
                        </div>
                        {!event.isAllDay && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(event.startDate)} - {formatTime(event.endDate)}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.onlineLink && (
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1" />
                            En línia
                          </div>
                        )}
                        {event.company && (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {event.company.name}
                          </div>
                        )}
                        {event.lead && (
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {event.lead.companyName}
                          </div>
                        )}
                      </div>

                      {event.attendees.length > 0 && (
                        <div className="flex items-center mt-2">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {event.attendees.length} participant{event.attendees.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalls de l'esdeveniment */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedEvent.title}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      eventTypeColors[selectedEvent.type]
                    } text-white`}>
                      {eventTypeLabels[selectedEvent.type]}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {selectedEvent.description && (
                  <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>
                      {selectedEvent.startDate.toLocaleDateString('ca-ES')}
                      {!selectedEvent.isAllDay && (
                        <span className="ml-2">
                          {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
                        </span>
                      )}
                    </span>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  {selectedEvent.onlineLink && (
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-3 text-gray-400" />
                      <a
                        href={selectedEvent.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Enllaç de la reunió
                      </a>
                    </div>
                  )}

                  {selectedEvent.company && (
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{selectedEvent.company.name}</span>
                    </div>
                  )}

                  {selectedEvent.lead && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{selectedEvent.lead.companyName}</span>
                    </div>
                  )}

                  {selectedEvent.attendees.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Users className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="font-medium">Participants</span>
                      </div>
                      <div className="ml-7 space-y-1">
                        {selectedEvent.attendees.map((attendee) => (
                          <div key={attendee.id} className="flex items-center justify-between">
                            <span>{attendee.name}</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              attendee.response === 'accepted' ? 'bg-green-100 text-green-800' :
                              attendee.response === 'declined' ? 'bg-red-100 text-red-800' :
                              attendee.response === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {attendee.response === 'accepted' ? 'Acceptat' :
                               attendee.response === 'declined' ? 'Declina' :
                               attendee.response === 'tentative' ? 'Provisional' : 'Pendent'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Tancar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </PageTemplate>
  );
}