'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { TaskStatus, TaskPriority } from '@prisma/client';

interface TaskCalendarProps {
  tasks: any[];
  loading?: boolean;
  onTaskClick?: (taskId: string) => void;
  onDateClick?: (date: Date) => void;
  filters?: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    search?: string;
  };
}

export default function TaskCalendar({
  tasks,
  loading = false,
  onTaskClick,
  onDateClick,
  filters
}: TaskCalendarProps) {
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  // Aplicar filtros
  useEffect(() => {
    let filtered = tasks;

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters?.priority && filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters?.assignedToId && filters.assignedToId !== 'all') {
      filtered = filtered.filter(task => task.assignedTo?.id === filters.assignedToId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  // Colores según prioridad
  const getPriorityColors = (priority: TaskPriority) => {
    const colors = {
      URGENT: { bg: '#ef4444', border: '#dc2626' }, // red-500/red-600
      HIGH: { bg: '#f97316', border: '#ea580c' }, // orange-500/orange-600
      MEDIUM: { bg: '#eab308', border: '#ca8a04' }, // yellow-500/yellow-600
      LOW: { bg: '#22c55e', border: '#16a34a' } // green-500/green-600
    };
    return colors[priority] || colors.MEDIUM;
  };

  // Colores según estado
  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      PENDING: '#fbbf24', // yellow-400
      IN_PROGRESS: '#3b82f6', // blue-500
      WAITING: '#8b5cf6', // violet-500
      COMPLETED: '#10b981', // emerald-500
      CANCELLED: '#6b7280' // gray-500
    };
    return colors[status] || colors.PENDING;
  };

  // Transformar tareas a eventos de FullCalendar
  const events = filteredTasks.map(task => {
    const priorityColors = getPriorityColors(task.priority);
    const statusColor = getStatusColor(task.status);

    // Usar dueDate si existe, sino startDate, sino fecha actual
    const eventDate = task.dueDate || task.startDate || new Date().toISOString();

    return {
      id: task.id,
      title: task.title,
      start: eventDate,
      backgroundColor: priorityColors.bg,
      borderColor: priorityColors.border,
      textColor: 'white',
      extendedProps: {
        task: task,
        status: task.status,
        priority: task.priority,
        statusColor: statusColor
      },
      classNames: [`fc-event-priority-${task.priority.toLowerCase()}`, `fc-event-status-${task.status.toLowerCase()}`]
    };
  });

  // Manejar click en evento
  const handleEventClick = (info: any) => {
    const taskId = info.event.id;
    onTaskClick?.(taskId);
  };

  // Manejar click en fecha
  const handleDateClick = (info: any) => {
    onDateClick?.(info.date);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header con estadísticas */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Calendario ({filteredTasks.length})
          </h3>
          {/* Leyenda de prioridades - compacta */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Urgente</span>
              <span className="text-gray-600 sm:hidden">U</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Alta</span>
              <span className="text-gray-600 sm:hidden">A</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Media</span>
              <span className="text-gray-600 sm:hidden">M</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded"></div>
              <span className="text-gray-600 hidden sm:inline">Baja</span>
              <span className="text-gray-600 sm:hidden">B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="p-2 sm:p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale="es"
          firstDay={1}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek'
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            list: 'Lista'
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDisplay="block"
          dayMaxEvents={2}
          moreLinkClick="popover"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false
          }}
          eventDidMount={(info) => {
            const status = info.event.extendedProps.status;
            const title = info.el.querySelector('.fc-event-title');

            if (title) {
              // Truncar título si es muy largo
              const originalTitle = title.textContent || '';
              if (originalTitle.length > 15) {
                title.textContent = originalTitle.substring(0, 12) + '...';
              }

              // Añadir indicadores de estado compactos
              if (status === 'COMPLETED') {
                const checkIcon = document.createElement('span');
                checkIcon.innerHTML = ' ✓';
                checkIcon.style.color = '#10b981';
                checkIcon.style.fontSize = '12px';
                title.appendChild(checkIcon);
              } else if (status === 'IN_PROGRESS') {
                const progressIcon = document.createElement('span');
                progressIcon.innerHTML = ' ●';
                progressIcon.style.color = '#3b82f6';
                progressIcon.style.fontSize = '10px';
                title.appendChild(progressIcon);
              }
            }

            // Tooltip compacto
            info.el.title = `${info.event.title}\n${info.event.extendedProps.priority} - ${info.event.extendedProps.status}`;
          }}
          // Personalización adicional
          dayHeaderClassNames="fc-day-header-custom"
          eventClassNames="fc-event-custom"
          viewClassNames="fc-view-custom"
          // Responsive - más compacto
          aspectRatio={window.innerWidth < 768 ? 0.8 : 1.2}
          contentHeight="auto"
        />
      </div>

      {/* Footer con información adicional */}
      {filteredTasks.length === 0 && !loading && (
        <div className="p-8 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas programadas</h3>
          <p className="text-gray-500 text-sm">
            {filters?.search || filters?.status !== 'all' || filters?.priority !== 'all'
              ? 'No se encontraron tareas que coincidan con los filtros aplicados.'
              : 'Haz clic en una fecha para crear una nueva tarea.'}
          </p>
        </div>
      )}
    </div>
  );
}