// components/gestio-empreses/pipeline/index.ts
// Exportacions originals
export { PipelineCard } from './PipelineCard'
export { PipelineColumn } from './PipelineColumn'
export { PipelineBoard } from './PipelineBoard'
export { PipelineFilters } from './PipelineFilters'

// Noves exportacions Pipeline Enterprise
export { PipelinePhases } from './PipelinePhases'
export { PhaseIndicator } from './PhaseIndicator'
export { PhaseColumn } from './PhaseColumn'
export { CompactLeadCard } from './CompactLeadCard'
export { PipelineStats } from './PipelineStats'

// Reexport types from actions
export type {
  PhaseId
} from '@/lib/gestio-empreses/pipeline-utils-phases'