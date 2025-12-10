// ============================================
// CONFIGURACIÓ DE VISTES PIPELINE PER ROL
// ============================================

export type PipelineViewType = 'gestor' | 'crm_admin'

// Fases del Gestor
export const GESTOR_STAGES = [
  'NEW',
  'PROSPECTING',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'PENDING_CRM'
] as const

// Fases del CRM
export const CRM_STAGES = [
  'PENDING_CRM',
  'CRM_APPROVED',
  'PENDING_ADMIN'
] as const

// Fases de l'Admin (espai propi)
export const ADMIN_STAGES = [
  'PENDING_ADMIN',
  'WON',
  'LOST'
] as const

// Totes les fases (per supervisió)
export const ALL_STAGES = [
  'NEW',
  'PROSPECTING',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'PENDING_CRM',
  'CRM_APPROVED',
  'PENDING_ADMIN',
  'WON',
  'LOST'
] as const

// Rols de Gestor
export const GESTOR_ROLES = [
  'GESTOR_ESTANDARD',
  'GESTOR_ESTRATEGIC',
  'GESTOR_ENTERPRISE'
]

// Rols de CRM
export const CRM_ROLES = [
  'CRM_COMERCIAL',
  'CRM_CONTINGUT'
]

// Rols d'Admin
export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'ADMIN_GESTIO'
]

/**
 * Determina el tipus de vista segons el rol
 */
export function getPipelineViewType(role: string): PipelineViewType {
  if (GESTOR_ROLES.includes(role)) {
    return 'gestor'
  }
  return 'crm_admin'
}

/**
 * Obté les fases de l'espai de treball per rol
 */
export function getWorkspaceStages(role: string): string[] {
  if (GESTOR_ROLES.includes(role)) {
    return [...GESTOR_STAGES]
  }
  if (CRM_ROLES.includes(role)) {
    return [...CRM_STAGES]
  }
  if (ADMIN_ROLES.includes(role)) {
    return [...ADMIN_STAGES]
  }
  return [...GESTOR_STAGES]
}

/**
 * Verifica si el rol pot veure pipelines d'altres gestors
 */
export function canViewGestorPipelines(role: string): boolean {
  return CRM_ROLES.includes(role) || ADMIN_ROLES.includes(role)
}

// Labels per les fases
export const STAGE_LABELS: Record<string, string> = {
  'NEW': 'Nous',
  'PROSPECTING': 'Prospecció',
  'CONTACTED': 'Contactats',
  'QUALIFIED': 'Qualificats',
  'PROPOSAL_SENT': 'Proposta Enviada',
  'PENDING_CRM': 'Pendent CRM',
  'CRM_APPROVED': 'Aprovat CRM',
  'PENDING_ADMIN': 'Pendent Admin',
  'WON': 'Guanyats',
  'LOST': 'Perduts'
}