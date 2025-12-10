// Funcions utilitàries per gestionar fases de leads (no són server actions)

// Ordre de les fases
export const STAGE_ORDER = [
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
  'WON'
] as const

export type LeadStage = typeof STAGE_ORDER[number]

// Etiquetes de les fases
export const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'Nou',
  PROSPECTING: 'Prospecció',
  CONTACTED: 'Contactat',
  QUALIFIED: 'Qualificat',
  PROPOSAL_SENT: 'Proposta enviada',
  PENDING_CRM: 'Pendent CRM',
  CRM_APPROVED: 'Aprovat CRM',
  PENDING_ADMIN: 'Pendent Admin',
  NEGOTIATION: 'Negociació',
  DOCUMENTATION: 'Documentació',
  WON: 'Guanyat'
}

/**
 * Obtenir la següent fase d'un lead
 */
export function getNextStage(currentStatus: string): LeadStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStatus as LeadStage)

  if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
    return null
  }

  return STAGE_ORDER[currentIndex + 1]
}

/**
 * Verificar si una fase és vàlida
 */
export function isValidStage(stage: string): stage is LeadStage {
  return STAGE_ORDER.includes(stage as LeadStage)
}

/**
 * Obtenir l'etiqueta d'una fase
 */
export function getStageLabel(stage: string): string {
  return STAGE_LABELS[stage as LeadStage] || stage
}