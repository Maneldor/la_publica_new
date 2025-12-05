// types/gestio-empreses.ts
// FITXER NOU - Tipus per al dashboard de Gestió d'Empreses

/**
 * Rols de Gestor per al dashboard
 * IMPORTANT: Aquests rols s'afegiran al enum UserRole de Prisma més endavant
 * Per ara, els definim aquí per poder treballar
 */
export type GestorRole =
  | 'GESTOR_ESTANDARD'   // Empreses petites: <25 empleats, <10K€
  | 'GESTOR_ESTRATEGIC'  // Empreses mitjanes: 25-100 empleats, 10K-50K€
  | 'GESTOR_ENTERPRISE'  // Grans comptes: >100 empleats, >50K€
  | 'GESTOR_CRM'         // Cap/Supervisor - veu tot, verifica leads

export type GestorSegment = 'ESTANDARD' | 'ESTRATEGIC' | 'ENTERPRISE'

/**
 * Usuari del sistema de gestió
 */
export interface GestorUser {
  id: string
  name: string | null
  email: string
  role: GestorRole
  image?: string | null
  segment?: GestorSegment | null
  maxActiveLeads?: number | null
  maxActiveCompanies?: number | null
}

/**
 * Item del menú de navegació
 */
export interface MenuItem {
  label: string
  labelCat: string // Etiqueta en català
  icon: string
  href: string
  badge?: 'leadsCount' | 'tasksCount' | 'pendingVerification' | 'messagesCount'
  roles: GestorRole[] | 'ALL'
  section?: 'main' | 'crm'
}

/**
 * Estadístiques del dashboard
 */
export interface DashboardStats {
  // Comuns a tots els gestors
  totalLeads: number
  leadsNous: number
  leadsContactats: number
  leadsNegociant: number
  leadsConvertits: number
  leadsPerduts: number
  totalEmpreses: number
  empresesActives: number
  tasquesPendents: number
  tasquesAvui: number
  pipelineValue: number

  // Només per GESTOR_CRM
  pendentsVerificacio?: number
  totalGestors?: number
  conversionsSetmana?: number
  conversionsMes?: number
}

/**
 * Resum d'un lead per mostrar en llistes
 */
export interface LeadSummary {
  id: string
  companyName: string
  contactName: string
  email: string
  status: string
  priority: string
  score: number | null
  estimatedValue: number | null
  createdAt: Date
  lastContactDate: Date | null
  nextFollowUpDate: Date | null
}

/**
 * Resum d'una empresa per mostrar en llistes
 */
export interface CompanySummary {
  id: string
  name: string
  cif: string | null
  status: string
  sector: string | null
  currentPlanTier: string | null
  createdAt: Date
  isActive: boolean
}

/**
 * Resum d'una tasca per mostrar en llistes
 */
export interface TaskSummary {
  id: string
  title: string
  type: string
  status: string
  priority: string
  dueDate: Date | null
  leadId: string | null
  leadName: string | null
  companyId: string | null
  companyName: string | null
}

/**
 * Filtres per a la llista de leads
 */
export interface LeadFilters {
  status?: string[]
  priority?: string[]
  source?: string[]
  assignedToId?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
  scoreMin?: number
  scoreMax?: number
}

/**
 * Configuració de paginació
 */
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Resposta paginada genèrica
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationConfig
}

/**
 * Criteris d'assignació automàtica de leads
 */
export interface AutoAssignmentCriteria {
  segment: GestorSegment
  minEmployees?: number
  maxEmployees?: number
  minEstimatedValue?: number
  maxEstimatedValue?: number
  sectors?: string[]
}

/**
 * Configuració de límits per gestor
 */
export interface GestorLimits {
  maxActiveLeads: number
  maxActiveCompanies: number
  maxLeadsPerDay: number
}

/**
 * Estats del pipeline de leads
 */
export const LEAD_PIPELINE_STAGES = [
  { value: 'NEW', label: 'Nou', labelCat: 'Nous', color: 'blue' },
  { value: 'CONTACTED', label: 'Contactat', labelCat: 'Contactats', color: 'yellow' },
  { value: 'NEGOTIATION', label: 'Negociant', labelCat: 'Negociant', color: 'orange' },
  { value: 'PENDING_CRM', label: 'Pendent CRM', labelCat: 'Pendent CRM', color: 'purple' },
  { value: 'WON', label: 'Convertit', labelCat: 'Convertits', color: 'green' },
  { value: 'LOST', label: 'Perdut', labelCat: 'Perduts', color: 'red' },
] as const

/**
 * Prioritats de leads
 */
export const LEAD_PRIORITIES = [
  { value: 'URGENT', label: 'Urgent', color: 'red' },
  { value: 'HIGH', label: 'Alta', color: 'orange' },
  { value: 'MEDIUM', label: 'Mitjana', color: 'yellow' },
  { value: 'LOW', label: 'Baixa', color: 'gray' },
] as const

/**
 * Fonts de leads
 */
export const LEAD_SOURCES = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'WEB_FORM', label: 'Formulari Web' },
  { value: 'AI_PROSPECTING', label: 'Prospecció IA' },
  { value: 'REFERRAL', label: 'Referit' },
  { value: 'EMPLOYEE_SUGGESTION', label: 'Suggeriment Empleat' },
  { value: 'INBOUND', label: 'Inbound' },
  { value: 'COLD_OUTREACH', label: 'Outreach' },
] as const