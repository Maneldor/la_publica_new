'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, TenantType, EventVisibility } from '@/lib/types/calendar';
import { mockCalendarEvents } from '@/lib/data/calendarEvents';

interface CalendarContextType {
  events: CalendarEvent[];
  loading: boolean;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'creatAt' | 'actualitzatAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => CalendarEvent | undefined;
  getEventsByTenant: (tenantType: TenantType) => CalendarEvent[];
  getEventsByVisibility: (visibility: EventVisibility) => CalendarEvent[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'calendar_events';

  // Cargar datos iniciales
  useEffect(() => {
    try {
      console.log('🔄 CalendarContext: Cargando datos iniciales...');

      const storedEvents = localStorage.getItem(STORAGE_KEY);

      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents) as CalendarEvent[];
        console.log('📦 CalendarContext: Datos cargados desde localStorage:', parsedEvents.length, 'eventos');
        setEvents(parsedEvents);
      } else {
        console.log('🆕 CalendarContext: No hay datos en localStorage, usando mockCalendarEvents');
        setEvents(mockCalendarEvents);
        // Guardar los datos mock en localStorage para futuras cargas
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCalendarEvents));
        console.log('💾 CalendarContext: mockCalendarEvents guardados en localStorage');
      }
    } catch (error) {
      console.error('❌ CalendarContext: Error al cargar datos:', error);
      console.log('🔄 CalendarContext: Fallback a mockCalendarEvents');
      setEvents(mockCalendarEvents);
    } finally {
      setLoading(false);
      console.log('✅ CalendarContext: Inicialización completada');
    }
  }, []);

  // Sincronizar con localStorage cuando cambian los eventos
  useEffect(() => {
    if (!loading && events.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        console.log('💾 CalendarContext: Eventos sincronizados con localStorage:', events.length, 'eventos');
      } catch (error) {
        console.error('❌ CalendarContext: Error al sincronizar con localStorage:', error);
      }
    }
  }, [events, loading]);

  // Generar ID único
  const generateId = (): string => {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback para navegadores que no soportan crypto.randomUUID()
      return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  // Validar evento antes de guardar
  const validateEvent = (event: Partial<CalendarEvent>): boolean => {
    if (!event.titol || !event.categoria || !event.dataInici || !event.dataFi) {
      console.error('❌ CalendarContext: Evento inválido - faltan campos obligatorios:', event);
      return false;
    }
    return true;
  };

  // Crear evento
  const createEvent = (eventData: Omit<CalendarEvent, 'id' | 'creatAt' | 'actualitzatAt'>) => {
    try {
      console.log('➕ CalendarContext: Creando nuevo evento:', eventData.titol);

      if (!validateEvent(eventData)) {
        throw new Error('Datos de evento inválidos');
      }

      const now = new Date().toISOString();
      const newEvent: CalendarEvent = {
        ...eventData,
        id: generateId(),
        creatAt: now,
        actualitzatAt: now
      };

      setEvents(prevEvents => {
        const updatedEvents = [...prevEvents, newEvent];
        console.log('✅ CalendarContext: Evento creado con ID:', newEvent.id);
        return updatedEvents;
      });
    } catch (error) {
      console.error('❌ CalendarContext: Error al crear evento:', error);
      throw error;
    }
  };

  // Actualizar evento
  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    try {
      console.log('✏️ CalendarContext: Actualizando evento ID:', id);

      setEvents(prevEvents => {
        const eventIndex = prevEvents.findIndex(event => event.id === id);

        if (eventIndex === -1) {
          console.error('❌ CalendarContext: Evento no encontrado para actualizar:', id);
          throw new Error(`Evento con ID ${id} no encontrado`);
        }

        const updatedEvent = {
          ...prevEvents[eventIndex],
          ...updates,
          actualitzatAt: new Date().toISOString()
        };

        if (!validateEvent(updatedEvent)) {
          throw new Error('Datos de evento actualizados inválidos');
        }

        const updatedEvents = [...prevEvents];
        updatedEvents[eventIndex] = updatedEvent;

        console.log('✅ CalendarContext: Evento actualizado:', id);
        return updatedEvents;
      });
    } catch (error) {
      console.error('❌ CalendarContext: Error al actualizar evento:', error);
      throw error;
    }
  };

  // Eliminar evento
  const deleteEvent = (id: string) => {
    try {
      console.log('🗑️ CalendarContext: Eliminando evento ID:', id);

      setEvents(prevEvents => {
        const eventExists = prevEvents.some(event => event.id === id);

        if (!eventExists) {
          console.error('❌ CalendarContext: Evento no encontrado para eliminar:', id);
          throw new Error(`Evento con ID ${id} no encontrado`);
        }

        const updatedEvents = prevEvents.filter(event => event.id !== id);
        console.log('✅ CalendarContext: Evento eliminado:', id);
        return updatedEvents;
      });
    } catch (error) {
      console.error('❌ CalendarContext: Error al eliminar evento:', error);
      throw error;
    }
  };

  // Obtener evento por ID
  const getEventById = (id: string): CalendarEvent | undefined => {
    const event = events.find(event => event.id === id);
    console.log('🔍 CalendarContext: Buscando evento ID:', id, event ? 'encontrado' : 'no encontrado');
    return event;
  };

  // Obtener eventos por tenant
  const getEventsByTenant = (tenantType: TenantType): CalendarEvent[] => {
    const filteredEvents = events.filter(event => event.tenantType === tenantType);
    console.log('🏢 CalendarContext: Eventos para tenant', tenantType + ':', filteredEvents.length);
    return filteredEvents;
  };

  // Obtener eventos por visibilidad
  const getEventsByVisibility = (visibility: EventVisibility): CalendarEvent[] => {
    const filteredEvents = events.filter(event => event.visibility === visibility);
    console.log('👁️ CalendarContext: Eventos con visibilidad', visibility + ':', filteredEvents.length);
    return filteredEvents;
  };

  const contextValue: CalendarContextType = {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByTenant,
    getEventsByVisibility
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Hook para usar el contexto
export const useCalendarContext = (): CalendarContextType => {
  const context = useContext(CalendarContext);

  if (context === undefined) {
    throw new Error('useCalendarContext debe usarse dentro de un CalendarProvider');
  }

  return context;
};

export { CalendarContext };