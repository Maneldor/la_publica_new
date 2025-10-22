/**
 * Centralized Calendar Events Data - La Pública Platform
 *
 * Mock data for calendar events used across the platform.
 * Unified data source for both user dashboard and admin calendar systems.
 * Multi-tenant architecture with proper permissions.
 */

import { CalendarEvent } from '@/lib/types/calendar';

export const mockCalendarEvents: CalendarEvent[] = [
  // CURSOS OFICIALS PLATAFORMA (5 eventos)
  {
    id: 'evt-1',
    titol: 'Curs RGPD - Sessió 3',
    descripcio: 'Implementació de mesures tècniques de protecció de dades',
    dataInici: '2025-10-25T18:00:00Z',
    dataFi: '2025-10-25T20:00:00Z',
    categoria: 'curs',
    color: '#2563eb',
    ubicacio: 'Carrer Mallorca, 47, Barcelona',
    organitzador: 'Autoritat Catalana de Protecció de Dades',
    modalitat: 'hibrid',
    linkOnline: 'https://zoom.us/j/123456',
    instructorNom: 'Núria Mata',
    instructorId: 'inst_001',
    icon: '📚',
    participants: 25,
    participantsList: ['user_123', 'user_456', 'user_789'],
    totElDia: false,
    visible: true,
    tenantType: 'plataforma',
    tenantId: 'plataforma',
    createdBy: 'admin_001',
    createdByRole: 'admin_plataforma',
    visibility: 'public',
    canEdit: ['admin_001'],
    canDelete: ['admin_001'],
    relacionatId: 'curs-123',
    relacionatTipus: 'curs',
    materials: ['Manual_RGPD_2025.pdf', 'Casos_practics.pdf'],
    objectius: ['Implementar mesures tècniques', 'Complir normativa RGPD', 'Gestionar dades personals'],
    repetir: {
      frequencia: 'setmanal',
      interval: 1,
      fins: '2025-12-20T18:00:00Z'
    },
    creatAt: '2025-10-01T10:00:00Z',
    actualitzatAt: '2025-10-01T10:00:00Z'
  },

  {
    id: 'evt-2',
    titol: 'Excel Avançat - Sessió 2',
    descripcio: 'Continuació del curs d\'Excel Avançat amb macros i anàlisi de dades',
    dataInici: '2025-11-08T18:00:00Z',
    dataFi: '2025-11-08T20:00:00Z',
    categoria: 'curs',
    color: '#60a5fa',
    organitzador: 'Centre de Formació La Pública',
    modalitat: 'online',
    linkOnline: 'https://zoom.us/j/789456',
    instructorNom: 'Pere Puig',
    instructorId: 'inst_002',
    icon: '📚',
    participants: 18,
    participantsList: ['user_456', 'user_789', 'user_012'],
    totElDia: false,
    visible: true,
    tenantType: 'plataforma',
    tenantId: 'plataforma',
    createdBy: 'admin_001',
    createdByRole: 'admin_plataforma',
    visibility: 'public',
    canEdit: ['admin_001'],
    canDelete: ['admin_001'],
    relacionatId: 'curs-456',
    relacionatTipus: 'curs',
    materials: ['Excel_Avancat_Manual.xlsx', 'Macros_Exemples.xlsm'],
    objectius: ['Dominar funcions avançades', 'Crear macros bàsics', 'Anàlisi de dades'],
    creatAt: '2025-10-01T10:00:00Z',
    actualitzatAt: '2025-10-01T10:00:00Z'
  },

  {
    id: 'evt-9',
    titol: 'Webinar: IA i Administració Pública',
    descripcio: 'Descobreix com la Intel·ligència Artificial pot transformar l\'administració pública',
    dataInici: '2025-11-05T17:00:00Z',
    dataFi: '2025-11-05T18:30:00Z',
    categoria: 'webinar',
    color: '#0ea5e9',
    organitzador: 'Generalitat de Catalunya',
    modalitat: 'online',
    linkOnline: 'https://youtube.com/live/ia-administracio',
    instructorNom: 'Dr. Marc Torres',
    instructorId: 'inst_009',
    icon: '📢',
    participants: 234,
    totElDia: false,
    visible: true,
    tenantType: 'plataforma',
    tenantId: 'plataforma',
    createdBy: 'admin_001',
    createdByRole: 'admin_plataforma',
    visibility: 'public',
    canEdit: ['admin_001'],
    canDelete: ['admin_001'],
    creatAt: '2025-10-01T10:00:00Z',
    actualitzatAt: '2025-10-01T10:00:00Z'
  },

  {
    id: 'evt-7',
    titol: 'Fira de l\'Ocupació 2025',
    descripcio: 'Gran fira amb empreses locals i oportunitats laborals',
    dataInici: '2025-11-20T09:00:00Z',
    dataFi: '2025-11-20T18:00:00Z',
    categoria: 'esdeveniment',
    color: '#f97316',
    ubicacio: 'Palau de Congressos de Barcelona',
    organitzador: 'Ajuntament de Barcelona',
    modalitat: 'presencial',
    icon: '🎪',
    participants: 450,
    totElDia: true,
    visible: true,
    tenantType: 'plataforma',
    tenantId: 'plataforma',
    createdBy: 'admin_001',
    createdByRole: 'admin_plataforma',
    visibility: 'public',
    canEdit: ['admin_001'],
    canDelete: ['admin_001'],
    creatAt: '2025-09-15T10:00:00Z',
    actualitzatAt: '2025-10-01T10:00:00Z'
  },

  {
    id: 'evt-10',
    titol: 'Webinar: Transformació Digital Empresarial',
    descripcio: 'Estratègies per a la digitalització de petites i mitjanes empreses',
    dataInici: '2025-12-03T16:00:00Z',
    dataFi: '2025-12-03T17:30:00Z',
    categoria: 'webinar',
    color: '#7c3aed',
    organitzador: 'Institut Tecnològic de Catalunya',
    modalitat: 'online',
    linkOnline: 'https://teams.microsoft.com/transformacio-digital',
    instructorNom: 'Laura González',
    instructorId: 'inst_010',
    icon: '📢',
    participants: 156,
    totElDia: false,
    visible: true,
    tenantType: 'plataforma',
    tenantId: 'plataforma',
    createdBy: 'admin_001',
    createdByRole: 'admin_plataforma',
    visibility: 'public',
    canEdit: ['admin_001'],
    canDelete: ['admin_001'],
    creatAt: '2025-11-01T10:00:00Z',
    actualitzatAt: '2025-11-01T10:00:00Z'
  },

  // RECORDATORIS EMPLEATS PÚBLICS (5 eventos)
  {
    id: 'evt-11',
    titol: 'Data límit: Oferta portàtils',
    descripcio: 'Últim dia per aprofitar el descompte del 25% en portàtils',
    dataInici: '2025-10-31T23:59:00Z',
    dataFi: '2025-10-31T23:59:00Z',
    categoria: 'recordatori',
    color: '#ef4444',
    icon: '⏰',
    totElDia: true,
    visible: true,
    tenantType: 'empleat_public',
    tenantId: 'user_123',
    createdBy: 'user_123',
    createdByRole: 'empleat_public',
    visibility: 'private',
    canEdit: ['user_123'],
    canDelete: ['user_123'],
    creatAt: '2025-10-15T10:00:00Z',
    actualitzatAt: '2025-10-15T10:00:00Z'
  },

  {
    id: 'evt-12',
    titol: 'Recordatori: Entrega documentació fiscal',
    descripcio: 'Últim dia per entregar la documentació fiscal trimestral',
    dataInici: '2025-11-30T23:59:00Z',
    dataFi: '2025-11-30T23:59:00Z',
    categoria: 'recordatori',
    color: '#dc2626',
    icon: '📋',
    totElDia: true,
    visible: true,
    tenantType: 'empleat_public',
    tenantId: 'user_123',
    createdBy: 'user_123',
    createdByRole: 'empleat_public',
    visibility: 'private',
    canEdit: ['user_123'],
    canDelete: ['user_123'],
    creatAt: '2025-11-01T09:00:00Z',
    actualitzatAt: '2025-11-01T09:00:00Z'
  },

  {
    id: 'evt-13',
    titol: 'Reunió amb equip tècnic',
    descripcio: 'Revisió trimestral del projecte de modernització',
    dataInici: '2025-11-02T10:00:00Z',
    dataFi: '2025-11-02T11:30:00Z',
    categoria: 'personalitzat',
    color: '#6366f1',
    ubicacio: 'Oficina principal, Sala de Juntes',
    modalitat: 'presencial',
    icon: '📅',
    participants: 6,
    totElDia: false,
    visible: true,
    tenantType: 'empleat_public',
    tenantId: 'user_123',
    createdBy: 'user_123',
    createdByRole: 'empleat_public',
    visibility: 'private',
    canEdit: ['user_123'],
    canDelete: ['user_123'],
    creatAt: '2025-10-25T09:00:00Z',
    actualitzatAt: '2025-10-25T09:00:00Z'
  },

  {
    id: 'evt-14',
    titol: 'Preparació presentació Q4',
    descripcio: 'Preparar la presentació de resultats del quart trimestre',
    dataInici: '2025-12-15T14:00:00Z',
    dataFi: '2025-12-15T16:00:00Z',
    categoria: 'personalitzat',
    color: '#f59e0b',
    modalitat: 'online',
    linkOnline: 'https://zoom.us/personal-prep',
    icon: '📊',
    totElDia: false,
    visible: true,
    tenantType: 'empleat_public',
    tenantId: 'user_456',
    createdBy: 'user_456',
    createdByRole: 'empleat_public',
    visibility: 'private',
    canEdit: ['user_456'],
    canDelete: ['user_456'],
    creatAt: '2025-12-01T10:00:00Z',
    actualitzatAt: '2025-12-01T10:00:00Z'
  },

  {
    id: 'evt-15',
    titol: 'Curs WordPress - Completat',
    descripcio: 'Curs de creació de webs amb WordPress - ja finalitzat',
    dataInici: '2025-09-15T09:00:00Z',
    dataFi: '2025-09-15T13:00:00Z',
    categoria: 'curs',
    color: '#6b7280',
    organitzador: 'Centre de Formació Digital',
    modalitat: 'presencial',
    ubicacio: 'Aula 2, Centre de Formació',
    instructorNom: 'Laura Martínez',
    instructorId: 'inst_015',
    icon: '📚',
    participants: 18,
    totElDia: false,
    visible: true,
    tenantType: 'empleat_public',
    tenantId: 'user_789',
    createdBy: 'user_789',
    createdByRole: 'empleat_public',
    visibility: 'private',
    canEdit: ['user_789'],
    canDelete: ['user_789'],
    creatAt: '2025-08-01T10:00:00Z',
    actualitzatAt: '2025-09-16T10:00:00Z'
  },

  // ESDEVENIMENTS EMPRESA (3 eventos)
  {
    id: 'evt-16',
    titol: 'Reunió Consell Administració',
    descripcio: 'Reunió mensual del consell d\'administració per revisar objectius',
    dataInici: '2025-11-10T16:00:00Z',
    dataFi: '2025-11-10T18:00:00Z',
    categoria: 'grup',
    color: '#8b5cf6',
    ubicacio: 'Sala de Juntes Principal',
    modalitat: 'presencial',
    icon: '👥',
    participants: 8,
    participantsList: ['ges_001', 'ges_002', 'emp_001', 'emp_002'],
    totElDia: false,
    visible: true,
    tenantType: 'empresa',
    tenantId: 'empresa_001',
    createdBy: 'ges_001',
    createdByRole: 'gestor_empresa',
    visibility: 'tenant_only',
    canEdit: ['ges_001', 'ges_002'],
    canDelete: ['ges_001'],
    creatAt: '2025-10-15T10:00:00Z',
    actualitzatAt: '2025-10-15T10:00:00Z'
  },

  {
    id: 'evt-17',
    titol: 'Formació Interna: Noves Polítiques',
    descripcio: 'Sessió formativa sobre les noves polítiques de recursos humans',
    dataInici: '2025-11-15T10:00:00Z',
    dataFi: '2025-11-15T12:00:00Z',
    categoria: 'curs',
    color: '#059669',
    ubicacio: 'Aula de Formació',
    modalitat: 'hibrid',
    linkOnline: 'https://teams.microsoft.com/formacio-rrhh',
    instructorNom: 'Maria Fernández',
    icon: '📚',
    participants: 25,
    participantsList: ['emp_001', 'emp_002', 'emp_003', 'emp_004'],
    totElDia: false,
    visible: true,
    tenantType: 'empresa',
    tenantId: 'empresa_001',
    createdBy: 'ges_001',
    createdByRole: 'gestor_empresa',
    visibility: 'tenant_only',
    canEdit: ['ges_001', 'ges_002'],
    canDelete: ['ges_001'],
    materials: ['Politiques_RRHH_2025.pdf', 'Manual_Procediments.pdf'],
    objectius: ['Conèixer noves polítiques', 'Aplicar procediments', 'Complir normativa interna'],
    creatAt: '2025-10-20T14:00:00Z',
    actualitzatAt: '2025-10-20T14:00:00Z'
  },

  {
    id: 'evt-18',
    titol: 'Networking Emprenedors Tecnològics',
    descripcio: 'Trobada d\'emprenedors del sector tecnològic',
    dataInici: '2025-11-25T18:00:00Z',
    dataFi: '2025-11-25T21:00:00Z',
    categoria: 'esdeveniment',
    color: '#dc2626',
    ubicacio: 'Hub Barcelona, Carrer Almogàvers',
    organitzador: 'Barcelona Activa',
    modalitat: 'presencial',
    icon: '🤝',
    participants: 89,
    totElDia: false,
    visible: true,
    tenantType: 'empresa',
    tenantId: 'empresa_002',
    createdBy: 'ges_003',
    createdByRole: 'gestor_empresa',
    visibility: 'tenant_only',
    canEdit: ['ges_003'],
    canDelete: ['ges_003'],
    creatAt: '2025-10-10T12:00:00Z',
    actualitzatAt: '2025-10-15T12:00:00Z'
  }
];

// Helper function to get events by category
export const getEventsByCategory = (categoria: string) => {
  return mockCalendarEvents.filter(event => event.categoria === categoria);
};

// Helper function to get events by tenant type
export const getEventsByTenantType = (tenantType: 'plataforma' | 'empleat_public' | 'empresa') => {
  return mockCalendarEvents.filter(event => event.tenantType === tenantType);
};

// Helper function to get events by visibility
export const getEventsByVisibility = (visibility: 'public' | 'tenant_only' | 'private') => {
  return mockCalendarEvents.filter(event => event.visibility === visibility);
};

// Helper function to get upcoming events
export const getUpcomingEvents = () => {
  const now = new Date();
  return mockCalendarEvents.filter(event => new Date(event.dataInici) > now);
};

// Helper function to get events for a specific date
export const getEventsForDate = (date: Date) => {
  return mockCalendarEvents.filter(event => {
    const eventDate = new Date(event.dataInici);
    return eventDate.getDate() === date.getDate() &&
           eventDate.getMonth() === date.getMonth() &&
           eventDate.getFullYear() === date.getFullYear();
  });
};

// Helper function to get events accessible by user (based on visibility and permissions)
export const getEventsForUser = (userId: string, userRole: string, tenantId?: string) => {
  return mockCalendarEvents.filter(event => {
    // Public events - everyone can see
    if (event.visibility === 'public') return true;

    // Private events - only creator can see
    if (event.visibility === 'private') return event.createdBy === userId;

    // Tenant only events - only same tenant can see
    if (event.visibility === 'tenant_only') {
      return event.tenantId === tenantId || event.createdBy === userId;
    }

    return false;
  });
};