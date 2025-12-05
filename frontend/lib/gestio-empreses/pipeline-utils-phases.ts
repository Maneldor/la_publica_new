// lib/gestio-empreses/pipeline-utils-phases.ts
// Utilitats per Pipeline Phases (client-side)

export const PIPELINE_PHASES = {
  1: {
    id: 1,
    name: 'Prospecció',
    description: 'Primer contacte i qualificació inicial',
    color: 'blue',
    statuses: ['NEW', 'CONTACTED', 'NEGOTIATION'],
    statusLabels: {
      NEW: 'Nous',
      CONTACTED: 'Contactats',
      NEGOTIATION: 'Negociant',
    },
  },
  2: {
    id: 2,
    name: 'Qualificació',
    description: 'Validació i aprovació CRM',
    color: 'purple',
    statuses: ['QUALIFIED', 'PROPOSAL_SENT', 'PENDING_CRM', 'CRM_APPROVED'],
    statusLabels: {
      QUALIFIED: 'Qualificats',
      PROPOSAL_SENT: 'Proposta enviada',
      PENDING_CRM: 'Pendent CRM',
      CRM_APPROVED: 'Aprovat CRM',
    },
  },
  3: {
    id: 3,
    name: 'Tancament',
    description: 'Conversió final',
    color: 'green',
    statuses: ['PENDING_ADMIN', 'WON', 'LOST'],
    statusLabels: {
      PENDING_ADMIN: 'Pendent Admin',
      WON: 'Guanyats',
      LOST: 'Perduts',
    },
  },
} as const

export type PhaseId = 1 | 2 | 3

/**
 * Obtenir fase d'un estat
 */
export function getPhaseForStatus(status: string): PhaseId {
  for (const [phaseId, phase] of Object.entries(PIPELINE_PHASES)) {
    if (phase.statuses.includes(status as any)) {
      return Number(phaseId) as PhaseId
    }
  }
  return 1
}

/**
 * Obtenir següent estat dins la fase
 */
export function getNextStatusInPhase(currentStatus: string): string | null {
  for (const phase of Object.values(PIPELINE_PHASES)) {
    const index = phase.statuses.indexOf(currentStatus as any)
    if (index !== -1 && index < phase.statuses.length - 1) {
      return phase.statuses[index + 1]
    }
  }
  return null
}

/**
 * Obtenir primer estat de la següent fase
 */
export function getFirstStatusOfNextPhase(currentStatus: string): string | null {
  const currentPhase = getPhaseForStatus(currentStatus)
  if (currentPhase < 3) {
    const nextPhase = PIPELINE_PHASES[(currentPhase + 1) as PhaseId]
    return nextPhase.statuses[0]
  }
  return null
}