// components/gestio-empreses/ia-leads/index.ts
// Fitxer d'exportacions per IA Leads Enterprise

export { IALeadStats } from './IALeadStats'
export { IALeadGenerator } from './IALeadGenerator'
export { IALeadHistory } from './IALeadHistory'
export { IALeadPreview } from './IALeadPreview'
export { IALeadChart } from './IALeadChart'
export { AdvancedCriteria } from './AdvancedCriteria'

// Reexport types from actions
export type {
  AIModel,
  GenerationCriteria,
  GeneratedLead
} from '@/lib/gestio-empreses/ia-lead-actions'