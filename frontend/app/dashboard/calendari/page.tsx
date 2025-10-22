'use client';

import { useState } from 'react';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { CalendarEvent, EventCategory } from '@/lib/types/calendar';
import { ChevronLeft, ChevronRight, Calendar, Filter, Plus } from 'lucide-react';

export default function CalendariPage() {
  const { events, loading, getEventStats, createEvent } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    titol: '',
    descripcio: '',
    dataInici: '',
    horaInici: '09:00',
    dataFi: '',
    horaFi: '10:00',
    categoria: 'personalitzat' as EventCategory,
    color: '#3b82f6',
    totElDia: false
  });

  // Loading state
  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Carregant esdeveniments...</div>
      </div>
    );
  }

  const stats = getEventStats();
  const totalEvents = events.length;
  const myEvents = stats.byTenant.empleat_public || 0;
  const platformEvents = stats.byTenant.plataforma || 0;
  const upcomingEvents = events.filter(e => new Date(e.dataInici) > new Date()).length;

  const statsData = [
    {
      label: 'Total Esdeveniments',
      value: totalEvents.toString(),
      trend: '+12%',
      icon: '📅'
    },
    {
      label: 'Els Meus',
      value: myEvents.toString(),
      trend: '+8%',
      icon: '👤'
    },
    {
      label: 'Plataforma',
      value: platformEvents.toString(),
      trend: '+15%',
      icon: '🏢'
    },
    {
      label: 'Propers',
      value: upcomingEvents.toString(),
      trend: '+5%',
      icon: '⏰'
    }
  ];

  // Helper functions para el calendario
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push({ date: dayDate, isCurrentMonth: true });
    }

    // Días del siguiente mes para completar la grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({ date: dayDate, isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.dataInici);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newEvent: Omit<CalendarEvent, 'id' | 'creatAt' | 'actualitzatAt'> = {
        titol: newEventForm.titol,
        descripcio: newEventForm.descripcio,
        dataInici: `${newEventForm.dataInici}T${newEventForm.horaInici}:00`,
        dataFi: `${newEventForm.dataFi}T${newEventForm.horaFi}:00`,
        categoria: newEventForm.categoria,
        color: newEventForm.color,
        totElDia: newEventForm.totElDia,

        // Valores fijos para empleado público
        tenantType: 'empleat_public',
        tenantId: 'user_empleat_001', // ID del usuario actual (temporal)
        createdBy: 'user_empleat_001',
        createdByRole: 'empleat_public',
        visibility: 'private',
        canEdit: ['user_empleat_001'],
        canDelete: ['user_empleat_001'],
        visible: true,

        // Campos opcionales con valores por defecto
        modalitat: 'presencial',
        ubicacio: '',
        linkOnline: '',
        instructorNom: '',
        organitzador: '',
        icon: '📌',
        materials: [],
        objectius: []
      };

      createEvent(newEvent);
      setShowCreateModal(false);

      // Reset form
      setNewEventForm({
        titol: '',
        descripcio: '',
        dataInici: '',
        horaInici: '09:00',
        dataFi: '',
        horaFi: '10:00',
        categoria: 'personalitzat',
        color: '#3b82f6',
        totElDia: false
      });

      alert('Esdeveniment creat correctament!');
    } catch (error) {
      console.error('Error creant esdeveniment:', error);
      alert('Error al crear l\'esdeveniment');
    }
  };

  const monthNames = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
  ];

  const dayNames = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];
  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            Calendari
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
            Gestiona els teus esdeveniments i consulta les activitats de la plataforma
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {statsData.map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </span>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                  {stat.trend}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Container */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          {/* Calendar Main */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)', overflow: 'hidden' }}>
            {/* Calendar Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigateMonth('prev')}
                  style={{
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  style={{
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ padding: '20px' }}>
              {/* Days of week header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '8px' }}>
                {dayNames.map((day) => (
                  <div key={day} style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase'
                  }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                {daysInMonth.map((day, index) => {
                  const dayEvents = getEventsForDay(day.date);
                  const isCurrentDay = isToday(day.date);

                  return (
                    <div key={index} style={{
                      minHeight: '80px',
                      backgroundColor: day.isCurrentMonth ? (isCurrentDay ? '#dbeafe' : '#fff') : '#f9fafb',
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: isCurrentDay ? '600' : day.isCurrentMonth ? '500' : '400',
                        color: isCurrentDay ? '#2563eb' : day.isCurrentMonth ? '#111827' : '#9ca3af',
                        marginBottom: '4px'
                      }}>
                        {day.date.getDate()}
                      </div>

                      {/* Events for this day */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayEvents.slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            onClick={() => setSelectedEvent(event)}
                            style={{
                              backgroundColor: event.color,
                              color: 'white',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: '500',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }}>
                            {event.titol}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div style={{
                            fontSize: '9px',
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            +{dayEvents.length - 2} més
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Accions Ràpides
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Crear Esdeveniment
                </button>
                <button style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  📥 Importar Calendari
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Propers Esdeveniments
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.filter(e => {
                  // DEBUG: Logging events with 'Fiesta' or 'Prueba' in title
                  if (e.titol.includes('Fiesta') || e.titol.includes('Prueba')) {
                    console.log('🔍 DEBUG EVENT:', {
                      title: e.titol,
                      tenantType: e.tenantType,
                      visibility: e.visibility,
                      tenantId: e.tenantId,
                      dataInici: e.dataInici
                    });
                  }

                  const isFuture = new Date(e.dataInici) > new Date();

                  // Eventos visibles para empleado público:
                  // 1. Eventos públicos de plataforma (incluso sin visibility definida para retrocompatibilidad)
                  const isPublicPlatform = e.tenantType === 'plataforma' && (e.visibility === 'public' || !e.visibility);

                  // 2. Sus propios eventos privados
                  const isMyPrivate = e.tenantType === 'empleat_public' && e.tenantId === 'user_empleat_001';

                  const shouldShow = isFuture && (isPublicPlatform || isMyPrivate);

                  // DEBUG: Additional logging for events with 'Fiesta' or 'Prueba'
                  if (e.titol.includes('Fiesta') || e.titol.includes('Prueba')) {
                    console.log('🎯 FILTER RESULT:', {
                      title: e.titol,
                      isFuture,
                      isPublicPlatform,
                      isMyPrivate,
                      shouldShow
                    });
                  }

                  return shouldShow;
                })
                .sort((a, b) => new Date(a.dataInici).getTime() - new Date(b.dataInici).getTime())
                .slice(0, 10)
                .map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{event.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {event.titol}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(event.dataInici).toLocaleDateString('ca-ES')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles del evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedEvent.titol}</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-3">
              <div><strong>📅 Data inici:</strong> {new Date(selectedEvent.dataInici).toLocaleString('ca-ES')}</div>
              <div><strong>📅 Data fi:</strong> {new Date(selectedEvent.dataFi).toLocaleString('ca-ES')}</div>
              {selectedEvent.descripcio && <div><strong>📝 Descripció:</strong> {selectedEvent.descripcio}</div>}
              {selectedEvent.ubicacio && <div><strong>📍 Ubicació:</strong> {selectedEvent.ubicacio}</div>}
              {selectedEvent.modalitat && <div><strong>💻 Modalitat:</strong> {selectedEvent.modalitat}</div>}
              {selectedEvent.organitzador && <div><strong>👤 Organitzador:</strong> {selectedEvent.organitzador}</div>}
              {selectedEvent.instructorNom && <div><strong>👨‍🏫 Instructor:</strong> {selectedEvent.instructorNom}</div>}
              {selectedEvent.participants && <div><strong>👥 Participants:</strong> {selectedEvent.participants}</div>}
              <div><strong>🏷️ Categoria:</strong> {selectedEvent.categoria}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación de evento */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Crear Esdeveniment Personal</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-1">Títol *</label>
                <input
                  type="text"
                  required
                  value={newEventForm.titol}
                  onChange={(e) => setNewEventForm({...newEventForm, titol: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-1">Descripció</label>
                <textarea
                  value={newEventForm.descripcio}
                  onChange={(e) => setNewEventForm({...newEventForm, descripcio: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              {/* Fecha inicio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data inici *</label>
                  <input
                    type="date"
                    required
                    value={newEventForm.dataInici}
                    onChange={(e) => setNewEventForm({...newEventForm, dataInici: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora inici</label>
                  <input
                    type="time"
                    value={newEventForm.horaInici}
                    onChange={(e) => setNewEventForm({...newEventForm, horaInici: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    disabled={newEventForm.totElDia}
                  />
                </div>
              </div>

              {/* Fecha fin */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data fi *</label>
                  <input
                    type="date"
                    required
                    value={newEventForm.dataFi}
                    onChange={(e) => setNewEventForm({...newEventForm, dataFi: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora fi</label>
                  <input
                    type="time"
                    value={newEventForm.horaFi}
                    onChange={(e) => setNewEventForm({...newEventForm, horaFi: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    disabled={newEventForm.totElDia}
                  />
                </div>
              </div>

              {/* Todo el día */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEventForm.totElDia}
                  onChange={(e) => setNewEventForm({...newEventForm, totElDia: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Tot el dia</label>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoria *</label>
                <select
                  value={newEventForm.categoria}
                  onChange={(e) => setNewEventForm({...newEventForm, categoria: e.target.value as EventCategory})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="recordatori">Recordatori</option>
                  <option value="personalitzat">Personalitzat</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={newEventForm.color}
                  onChange={(e) => setNewEventForm({...newEventForm, color: e.target.value})}
                  className="w-20 h-10 border rounded cursor-pointer"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Crear Esdeveniment
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel·lar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}