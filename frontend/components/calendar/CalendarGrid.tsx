'use client';

import { useMemo } from 'react';
import { type Event } from '@/lib/calendar/mockData';

interface CalendarGridProps {
  events: Event[];
  currentDate: Date;
  view: 'month' | 'week' | 'day' | 'agenda';
  onEventClick: (event: Event) => void;
}

export function CalendarGrid({ events, currentDate, view, onEventClick }: CalendarGridProps) {
  // Obtenir informació del mes
  const monthInfo = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primer dia del mes
    const firstDay = new Date(year, month, 1);
    // Últim dia del mes
    const lastDay = new Date(year, month + 1, 0);
    // Dia de la setmana del primer dia (0 = diumenge, 1 = dilluns, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Ajustar per començar en dilluns (0 = dilluns, 6 = diumenge)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    return {
      year,
      month,
      firstDay,
      lastDay,
      firstDayOfWeek,
      daysInMonth: lastDay.getDate()
    };
  }, [currentDate]);

  // Generar array de dies del calendari (inclou dies del mes anterior i següent)
  const calendarDays = useMemo(() => {
    const days = [];
    const { year, month, firstDayOfWeek, daysInMonth } = monthInfo;

    // Dies del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
        date: new Date(month === 0 ? year - 1 : year, month - 1, prevMonthLastDay - i)
      });
    }

    // Dies del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        month,
        year,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }

    // Dies del mes següent
    const remainingDays = 42 - days.length; // 6 setmanes × 7 dies
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        date: new Date(month === 11 ? year + 1 : year, month + 1, day)
      });
    }

    return days;
  }, [monthInfo]);

  // Obtenir esdeveniments per dia
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.data_inici);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Verificar si és avui
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (view !== 'month') {
    // Implementar altres vistes (week, day) més endavant
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Vista {view} en desenvolupament...
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Headers dies setmana */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 mb-px">
        {['Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(day => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-700 py-2 bg-white"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dies del mes */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 h-[calc(100%-40px)]">
        {calendarDays.map((dayInfo, index) => {
          const dayEvents = getEventsForDay(dayInfo.date);
          const todayClass = isToday(dayInfo.date);

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 bg-white overflow-hidden
                ${!dayInfo.isCurrentMonth ? 'bg-gray-50' : ''}
                ${todayClass ? 'ring-2 ring-blue-500 ring-inset' : ''}
              `}
            >
              {/* Número del dia */}
              <div className={`
                text-sm font-medium mb-1
                ${!dayInfo.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                ${todayClass ? 'text-blue-600' : ''}
              `}>
                {dayInfo.day}
              </div>

              {/* Esdeveniments del dia */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`
                      w-full text-left px-1 py-0.5 rounded text-xs truncate
                      transition-colors duration-200
                      ${event.tipus_propietari === 'meu'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }
                    `}
                    title={event.titol}
                  >
                    {event.icon} {event.titol}
                  </button>
                ))}

                {dayEvents.length > 3 && (
                  <button
                    className="text-xs text-blue-600 hover:underline pl-1"
                    onClick={() => {
                      // Mostrar modal amb tots els esdeveniments del dia
                      console.log(`Mostrar ${dayEvents.length - 3} esdeveniments més`);
                    }}
                  >
                    +{dayEvents.length - 3} més
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}