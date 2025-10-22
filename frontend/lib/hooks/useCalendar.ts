import { useMemo } from 'react';
import { useCalendarContext } from '@/lib/context/CalendarContext';
import { CalendarEvent, TenantType, EventVisibility, EventCategory } from '@/lib/types/calendar';

interface UseCalendarReturn {
  // Estado base
  events: CalendarEvent[];
  loading: boolean;

  // CRUD
  createEvent: (event: Omit<CalendarEvent, 'id' | 'creatAt' | 'actualitzatAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => CalendarEvent | undefined;

  // Filtros útiles
  getEventsByTenant: (tenantType: TenantType) => CalendarEvent[];
  getEventsByVisibility: (visibility: EventVisibility) => CalendarEvent[];
  getEventsByCategory: (category: EventCategory) => CalendarEvent[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => CalendarEvent[];
  searchEvents: (searchTerm: string) => CalendarEvent[];

  // Filtros para usuario específico
  getEventsForUser: (userId: string, userRole: 'empleat_public' | 'empleat_empresa', empresaId?: string) => CalendarEvent[];

  // Estadísticas
  getEventStats: () => {
    total: number;
    byTenant: Record<TenantType, number>;
    byCategory: Record<EventCategory, number>;
    byVisibility: Record<EventVisibility, number>;
  };
}

/**
 * Hook personalizado para gestión avanzada del calendario
 * Proporciona funciones de filtrado, búsqueda y estadísticas optimizadas
 */
export const useCalendar = (): UseCalendarReturn => {
  const context = useCalendarContext();

  const {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByTenant,
    getEventsByVisibility
  } = context;

  /**
   * Filtrar eventos por categoría
   */
  const getEventsByCategory = useMemo(() => {
    return (category: EventCategory): CalendarEvent[] => {
      return events.filter(event => event.categoria === category);
    };
  }, [events]);

  /**
   * Filtrar eventos por rango de fechas
   * @param startDate - Fecha de inicio del rango
   * @param endDate - Fecha de fin del rango
   */
  const getEventsByDateRange = useMemo(() => {
    return (startDate: Date, endDate: Date): CalendarEvent[] => {
      return events.filter(event => {
        const eventStart = new Date(event.dataInici);
        const eventEnd = new Date(event.dataFi);

        // El evento está en el rango si:
        // - Empieza antes del fin del rango Y termina después del inicio del rango
        return eventStart <= endDate && eventEnd >= startDate;
      });
    };
  }, [events]);

  /**
   * Buscar eventos por término de búsqueda
   * Busca en: título, descripción, ubicación, organizador
   * @param searchTerm - Término de búsqueda (case insensitive)
   */
  const searchEvents = useMemo(() => {
    return (searchTerm: string): CalendarEvent[] => {
      if (!searchTerm.trim()) {
        return events;
      }

      const term = searchTerm.toLowerCase().trim();

      return events.filter(event => {
        const searchableFields = [
          event.titol,
          event.descripcio || '',
          event.ubicacio || '',
          event.organitzador || '',
          event.instructorNom || ''
        ];

        return searchableFields.some(field =>
          field.toLowerCase().includes(term)
        );
      });
    };
  }, [events]);

  /**
   * Obtener eventos para un usuario específico según su rol y permisos
   * @param userId - ID del usuario
   * @param userRole - Rol del usuario ('empleat_public' | 'empleat_empresa')
   * @param empresaId - ID de la empresa (requerido para empleat_empresa)
   */
  const getEventsForUser = useMemo(() => {
    return (userId: string, userRole: 'empleat_public' | 'empleat_empresa', empresaId?: string): CalendarEvent[] => {
      return events.filter(event => {
        // 1. Eventos públicos de la plataforma - todos pueden ver
        if (event.tenantType === 'plataforma' && event.visibility === 'public') {
          return true;
        }

        // 2. Eventos privados del usuario - solo el creador
        if (event.visibility === 'private' && event.createdBy === userId) {
          return true;
        }

        // 3. Para empleados públicos
        if (userRole === 'empleat_public') {
          // Solo pueden ver eventos públicos de plataforma y sus eventos privados
          // (ya cubierto arriba)
          return false;
        }

        // 4. Para empleados de empresa
        if (userRole === 'empleat_empresa' && empresaId) {
          // Eventos de su empresa con visibilidad tenant_only
          if (event.tenantType === 'empresa' &&
              event.tenantId === empresaId &&
              event.visibility === 'tenant_only') {
            return true;
          }
        }

        return false;
      });
    };
  }, [events]);

  /**
   * Calcular estadísticas agregadas de los eventos
   */
  const getEventStats = useMemo(() => {
    return () => {
      const stats = {
        total: events.length,
        byTenant: {} as Record<TenantType, number>,
        byCategory: {} as Record<EventCategory, number>,
        byVisibility: {} as Record<EventVisibility, number>
      };

      // Inicializar contadores
      const tenantTypes: TenantType[] = ['plataforma', 'empleat_public', 'empresa'];
      const categories: EventCategory[] = ['curs', 'assessorament', 'grup', 'esdeveniment', 'recordatori', 'personalitzat', 'webinar'];
      const visibilities: EventVisibility[] = ['public', 'tenant_only', 'private'];

      tenantTypes.forEach(type => { stats.byTenant[type] = 0; });
      categories.forEach(category => { stats.byCategory[category] = 0; });
      visibilities.forEach(visibility => { stats.byVisibility[visibility] = 0; });

      // Contar eventos
      events.forEach(event => {
        stats.byTenant[event.tenantType]++;
        stats.byCategory[event.categoria]++;
        stats.byVisibility[event.visibility]++;
      });

      return stats;
    };
  }, [events]);

  return {
    // Estado base
    events,
    loading,

    // CRUD
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,

    // Filtros útiles
    getEventsByTenant,
    getEventsByVisibility,
    getEventsByCategory,
    getEventsByDateRange,
    searchEvents,

    // Filtros para usuario específico
    getEventsForUser,

    // Estadísticas
    getEventStats
  };
};