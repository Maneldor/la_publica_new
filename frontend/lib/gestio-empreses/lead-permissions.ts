// Definició de permisos per fase de leads

// ============================================
// TIPUS
// ============================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ADMIN_GESTIO'
  | 'CRM_COMERCIAL'
  | 'CRM_CONTINGUT'
  | 'GESTOR_ESTANDARD'
  | 'GESTOR_ESTRATEGIC'
  | 'GESTOR_ENTERPRISE'

export type LeadStage =
  | 'NEW'
  | 'PROSPECTING'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'PENDING_CRM'
  | 'CRM_APPROVED'
  | 'PENDING_ADMIN'
  | 'NEGOTIATION'
  | 'DOCUMENTATION'
  | 'WON'
  | 'LOST'
  | 'ON_HOLD'

// ============================================
// GRUPS DE ROLS
// ============================================

export const GESTOR_ROLES: UserRole[] = [
  'GESTOR_ESTANDARD',
  'GESTOR_ESTRATEGIC',
  'GESTOR_ENTERPRISE',
]

export const CRM_ROLES: UserRole[] = [
  'CRM_COMERCIAL',
  'CRM_CONTINGUT',
]

export const ADMIN_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'ADMIN_GESTIO',
]

// ============================================
// FASES PER ROL
// ============================================

// Fases que el GESTOR pot gestionar
export const GESTOR_ALLOWED_STAGES: LeadStage[] = [
  'NEW',
  'PROSPECTING',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'PENDING_CRM',  // Pot enviar a CRM
]

// Fases que el CRM pot gestionar (verificació)
export const CRM_ALLOWED_STAGES: LeadStage[] = [
  'PENDING_CRM',
  'CRM_APPROVED',
  'PENDING_ADMIN',  // Pot enviar a Admin
]

// Fases que l'ADMIN pot gestionar
export const ADMIN_ALLOWED_STAGES: LeadStage[] = [
  'NEW',
  'PROSPECTING',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'PENDING_CRM',
  'CRM_APPROVED',
  'PENDING_ADMIN',
  'NEGOTIATION',
  'DOCUMENTATION',
  'WON',
  'LOST',
  'ON_HOLD',
]

// ============================================
// TRANSICIONS PERMESES
// ============================================

// Transicions que el GESTOR pot fer
export const GESTOR_ALLOWED_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  'NEW': ['PROSPECTING', 'LOST', 'ON_HOLD'],
  'PROSPECTING': ['CONTACTED', 'LOST', 'ON_HOLD'],
  'CONTACTED': ['QUALIFIED', 'LOST', 'ON_HOLD'],
  'QUALIFIED': ['PROPOSAL_SENT', 'LOST', 'ON_HOLD'],
  'PROPOSAL_SENT': ['PENDING_CRM', 'LOST', 'ON_HOLD'],  // Enviar a CRM
  'PENDING_CRM': [],  // No pot fer res més, espera CRM
  'CRM_APPROVED': [],
  'PENDING_ADMIN': [],
  'NEGOTIATION': [],
  'DOCUMENTATION': [],
  'WON': [],
  'LOST': [],
  'ON_HOLD': ['NEW', 'PROSPECTING'],  // Pot reactivar
}

// Transicions que el CRM pot fer
export const CRM_ALLOWED_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  'NEW': [],
  'PROSPECTING': [],
  'CONTACTED': [],
  'QUALIFIED': [],
  'PROPOSAL_SENT': [],
  'PENDING_CRM': ['CRM_APPROVED', 'LOST'],  // Aprovar o rebutjar
  'CRM_APPROVED': ['PENDING_ADMIN'],  // Enviar a Admin
  'PENDING_ADMIN': [],  // Espera Admin
  'NEGOTIATION': [],
  'DOCUMENTATION': [],
  'WON': [],
  'LOST': [],
  'ON_HOLD': [],
}

// Transicions que l'ADMIN pot fer (totes)
export const ADMIN_ALLOWED_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  'NEW': ['PROSPECTING', 'LOST', 'ON_HOLD'],
  'PROSPECTING': ['CONTACTED', 'NEW', 'LOST', 'ON_HOLD'],
  'CONTACTED': ['QUALIFIED', 'PROSPECTING', 'LOST', 'ON_HOLD'],
  'QUALIFIED': ['PROPOSAL_SENT', 'CONTACTED', 'LOST', 'ON_HOLD'],
  'PROPOSAL_SENT': ['PENDING_CRM', 'QUALIFIED', 'LOST', 'ON_HOLD'],
  'PENDING_CRM': ['CRM_APPROVED', 'PROPOSAL_SENT', 'LOST', 'ON_HOLD'],
  'CRM_APPROVED': ['PENDING_ADMIN', 'PENDING_CRM', 'LOST'],
  'PENDING_ADMIN': ['NEGOTIATION', 'DOCUMENTATION', 'WON', 'CRM_APPROVED', 'LOST'],
  'NEGOTIATION': ['DOCUMENTATION', 'WON', 'LOST'],
  'DOCUMENTATION': ['WON', 'NEGOTIATION', 'LOST'],
  'WON': [],  // Estat final
  'LOST': ['NEW'],  // Pot reobrir
  'ON_HOLD': ['NEW', 'PROSPECTING', 'CONTACTED', 'QUALIFIED'],
}

// ============================================
// FUNCIONS DE VERIFICACIÓ
// ============================================

/**
 * Verifica si un rol és de tipus Gestor
 */
export function isGestor(role: string): boolean {
  return GESTOR_ROLES.includes(role as UserRole)
}

/**
 * Verifica si un rol és de tipus CRM
 */
export function isCRM(role: string): boolean {
  return CRM_ROLES.includes(role as UserRole)
}

/**
 * Verifica si un rol és de tipus Admin
 */
export function isAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role as UserRole)
}

/**
 * Obté les transicions permeses per un rol des d'un estat
 */
export function getAllowedTransitions(
  role: string,
  currentStage: LeadStage
): LeadStage[] {
  if (isAdmin(role)) {
    return ADMIN_ALLOWED_TRANSITIONS[currentStage] || []
  }
  if (isCRM(role)) {
    return CRM_ALLOWED_TRANSITIONS[currentStage] || []
  }
  if (isGestor(role)) {
    return GESTOR_ALLOWED_TRANSITIONS[currentStage] || []
  }
  return []
}

/**
 * Verifica si un rol pot fer una transició específica
 */
export function canTransition(
  role: string,
  currentStage: LeadStage,
  targetStage: LeadStage
): boolean {
  const allowed = getAllowedTransitions(role, currentStage)
  return allowed.includes(targetStage)
}

/**
 * Verifica si un rol pot gestionar un lead en un estat determinat
 */
export function canManageLead(role: string, leadStage: LeadStage): boolean {
  if (isAdmin(role)) {
    return true  // Admin pot gestionar tot
  }
  if (isCRM(role)) {
    return CRM_ALLOWED_STAGES.includes(leadStage)
  }
  if (isGestor(role)) {
    return GESTOR_ALLOWED_STAGES.includes(leadStage)
  }
  return false
}

/**
 * Obté el missatge d'error per una transició no permesa
 */
export function getTransitionErrorMessage(
  role: string,
  currentStage: LeadStage,
  targetStage: LeadStage
): string {
  if (isGestor(role)) {
    if (targetStage === 'CRM_APPROVED' || targetStage === 'PENDING_ADMIN') {
      return 'Els gestors no poden verificar leads. Envia el lead a CRM per verificació.'
    }
    if (targetStage === 'WON') {
      return 'Els gestors no poden registrar empreses. El lead ha de passar per CRM i Admin.'
    }
  }

  if (isCRM(role)) {
    if (targetStage === 'WON') {
      return 'El CRM no pot registrar empreses. Envia el lead a Admin per registrar.'
    }
    if (!CRM_ALLOWED_STAGES.includes(currentStage)) {
      return 'El CRM només pot gestionar leads en fase de verificació (PENDING_CRM).'
    }
  }

  return `No tens permisos per moure el lead de ${currentStage} a ${targetStage}.`
}

/**
 * Obté les columnes visibles del Pipeline segons el rol
 */
export function getVisibleColumns(role: string): LeadStage[] {
  // Tots veuen totes les columnes, però només poden interactuar amb les seves
  return [
    'NEW',
    'PROSPECTING',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'PENDING_CRM',
    'CRM_APPROVED',
    'PENDING_ADMIN',
    'WON',
    'LOST',
  ]
}

/**
 * Verifica si l'usuari pot arrossegar un lead
 */
export function canDragLead(role: string, leadStage: LeadStage): boolean {
  return getAllowedTransitions(role, leadStage).length > 0
}

/**
 * Obté el tipus de rol de forma simplificada
 */
export function getRoleType(role: string): 'GESTOR' | 'CRM' | 'ADMIN' | 'UNKNOWN' {
  if (isGestor(role)) return 'GESTOR'
  if (isCRM(role)) return 'CRM'
  if (isAdmin(role)) return 'ADMIN'
  return 'UNKNOWN'
}

/**
 * Obté les fases que aquest rol pot gestionar activament
 */
export function getManageableStages(role: string): LeadStage[] {
  if (isAdmin(role)) return ADMIN_ALLOWED_STAGES
  if (isCRM(role)) return CRM_ALLOWED_STAGES
  if (isGestor(role)) return GESTOR_ALLOWED_STAGES
  return []
}