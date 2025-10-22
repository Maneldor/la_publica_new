/**
 * Unified Calendar Types - La Pública Platform
 *
 * Centralized type definitions for calendar events across the platform.
 * Used by both user dashboard and admin calendar systems.
 * Supports multi-tenant architecture with proper permission management.
 *
 * Naming convention: camelCase for consistency
 */

// Multi-tenant system types
export type TenantType =
  | 'plataforma'      // Admin de La Pública
  | 'empleat_public'  // Empleado público individual
  | 'empresa';        // Empresa (y sus gestores)

export type EventVisibility =
  | 'public'          // Todos pueden ver (cursos plataforma)
  | 'tenant_only'     // Solo dentro del tenant (empresa)
  | 'private';        // Solo el creador

export type UserRole =
  | 'admin_plataforma'
  | 'empleat_public'
  | 'gestor_empresa'
  | 'empleat_empresa';

// Calendar event categories
export type EventCategory =
  | 'curs'
  | 'assessorament'
  | 'grup'
  | 'esdeveniment'
  | 'recordatori'
  | 'personalitzat'
  | 'webinar';

// Main calendar event interface
export interface CalendarEvent {
  id: string;
  titol: string;
  descripcio?: string;
  dataInici: string; // ISO format
  dataFi: string; // ISO format
  categoria: EventCategory;
  color: string;
  ubicacio?: string;
  organitzador?: string;

  // Participants - Dual system for flexibility
  participants?: number;        // Count of participants (for display)
  participantsList?: string[];  // Full list of participant IDs (for admin management)

  // Multi-tenant and permissions
  tenantType: TenantType;      // Which tenant owns this event
  tenantId: string;            // Specific tenant ID (empresa ID, empleat ID, etc.)
  createdBy: string;           // User ID who created the event
  createdByRole: UserRole;     // Role of the creator
  visibility: EventVisibility; // Who can see this event
  canEdit: string[];           // Array of user IDs who can edit
  canDelete: string[];         // Array of user IDs who can delete

  // Optional extended properties
  modalitat?: 'presencial' | 'online' | 'hibrid';
  linkOnline?: string;
  instructorNom?: string;
  instructorId?: string;       // ID of the instructor
  icon?: string;
  totElDia?: boolean;
  visible?: boolean;           // Legacy field for backward compatibility

  // Related content
  relacionatId?: string;       // ID of related course, assessment, etc.
  relacionatTipus?: string;    // Type of related content

  // Learning management
  materials?: string[];        // Learning materials URLs or IDs
  objectius?: string[];        // Learning objectives

  // Recurrence
  repetir?: {
    frequencia: 'diari' | 'setmanal' | 'mensual' | 'anual';
    interval: number;          // Every X days/weeks/months/years
    fins: string;              // End date for recurrence (ISO format)
  };

  // Timestamps
  creatAt?: string;
  actualitzatAt?: string;
}

// Calendar filters interface
export interface CalendarFilters {
  categoria: string | null;
  searchTerm: string;
  tenantType?: TenantType | null;     // Filter by tenant type
  visibility?: EventVisibility | null; // Filter by visibility level
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Calendar view types
export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

// Calendar state interface
export interface CalendarState {
  currentDate: Date;
  selectedDate?: Date;
  viewType: CalendarViewType;
  filters: CalendarFilters;
  events: CalendarEvent[];
}

// Event creation/update payload
export interface EventPayload {
  titol: string;
  descripcio?: string;
  dataInici: string;
  dataFi: string;
  categoria: EventCategory;
  color: string;
  ubicacio?: string;
  organitzador?: string;
  modalitat?: 'presencial' | 'online' | 'hibrid';
  linkOnline?: string;
  instructorNom?: string;
  icon?: string;
  totElDia?: boolean;
}