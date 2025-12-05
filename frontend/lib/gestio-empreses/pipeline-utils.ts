// lib/gestio-empreses/pipeline-utils.ts

// Definició dels estats del pipeline
export const PIPELINE_STAGES = [
  { id: 'NEW', label: 'Nous', color: 'blue' },
  { id: 'CONTACTED', label: 'Contactats', color: 'yellow' },
  { id: 'NEGOTIATION', label: 'Negociant', color: 'purple' },
  { id: 'QUALIFIED', label: 'Qualificats', color: 'indigo' },
  { id: 'PENDING_CRM', label: 'Pendent CRM', color: 'orange' },
  { id: 'CRM_APPROVED', label: 'Aprovat CRM', color: 'green' },
  { id: 'CRM_REJECTED', label: 'Rebutjat CRM', color: 'red' },
  { id: 'PENDING_ADMIN', label: 'Pendent Admin', color: 'amber' },
  { id: 'WON', label: 'Guanyats', color: 'emerald' },
  { id: 'LOST', label: 'Perduts', color: 'slate' },
] as const

// Tipus
export type PipelineStage = typeof PIPELINE_STAGES[number]['id']

// Obtenir propers passos suggerits
export function getNextStages(currentStatus: string, isSupervisor: boolean): string[] {
  const transitions: Record<string, string[]> = {
    'NEW': ['CONTACTED'],
    'CONTACTED': ['NEGOTIATION'],
    'NEGOTIATION': ['QUALIFIED'],
    'QUALIFIED': ['PENDING_CRM'],
    'PENDING_CRM': isSupervisor ? ['CRM_APPROVED', 'CRM_REJECTED'] : [],
    'CRM_APPROVED': isSupervisor ? ['PENDING_ADMIN'] : [],
    'CRM_REJECTED': ['QUALIFIED'],
    'PENDING_ADMIN': isSupervisor ? ['WON', 'LOST'] : [],
    'WON': [],
    'LOST': ['NEW'],
  }
  return transitions[currentStatus] || []
}