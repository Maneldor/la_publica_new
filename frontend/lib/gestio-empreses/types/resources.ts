// types/resources.ts - Interfaces para el sistema de recursos comerciales

export enum ResourceType {
  SPEECH = 'SPEECH',
  EMAIL_TEMPLATE = 'EMAIL_TEMPLATE',
  DOCUMENT = 'DOCUMENT',
  GUIDE = 'GUIDE',
  VIDEO = 'VIDEO',
  CHECKLIST = 'CHECKLIST',
}

export enum PipelinePhase {
  PROSPECCIO = 'PROSPECCIO',
  NEGOCIACIO = 'NEGOCIACIO',
  TANCAMENT = 'TANCAMENT',
  POST_VENDA = 'POST_VENDA',
  ALL = 'ALL'
}

export enum ResourceCategory {
  TRUCADA_INICIAL = 'TRUCADA_INICIAL',
  SEGUIMENT = 'SEGUIMENT',
  PRESENTACIO_PLANS = 'PRESENTACIO_PLANS',
  NEGOCIACIO_PREUS = 'NEGOCIACIO_PREUS',
  TANCAMENT_VENDA = 'TANCAMENT_VENDA',
  DOCUMENTACIO = 'DOCUMENTACIO',
  OBJECIONS = 'OBJECIONS'
}

export enum PlaceholderType {
  COMPANY = 'COMPANY',
  CONTACT = 'CONTACT',
  SYSTEM = 'SYSTEM',
  CUSTOM = 'CUSTOM',
}

export enum ResourceRole {
  ADMIN = 'ADMIN',
  CRM_MANAGER = 'CRM_MANAGER',
  GESTOR_ESTRATEGIC = 'GESTOR_ESTRATEGIC',
  GESTOR_ENTERPRISE = 'GESTOR_ENTERPRISE',
  GESTOR_ESTANDARD = 'GESTOR_ESTANDARD',
}

// Interfaces para placeholders
export interface Placeholder {
  key: string
  label: string
  type: PlaceholderType
  description?: string
  required?: boolean
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
  }
}

// Interface para contenido según el tipo de recurso
export interface SpeechContent {
  script: string
  duration?: number
  objectives: string[]
  keyPoints: string[]
  objections?: Array<{
    objection: string
    response: string
  }>
}

export interface EmailTemplateContent {
  subject: string
  body: string
  attachments?: string[]
  followUpDays?: number
}

export interface DocumentContent {
  format: 'PDF' | 'DOC' | 'HTML' | 'MARKDOWN'
  url?: string
  content?: string
  sections?: Array<{
    title: string
    content: string
  }>
}

export interface GuideContent {
  steps: Array<{
    title: string
    description: string
    tips?: string[]
    warnings?: string[]
  }>
  estimatedTime?: number
}

export interface VideoContent {
  url: string
  duration?: number
  transcript?: string
  chapters?: Array<{
    title: string
    timestamp: number
  }>
}

export interface ChecklistContent {
  items: Array<{
    id: string
    label: string
    description?: string
    required: boolean
    order: number
  }>
  successCriteria?: string
}

export type ResourceContent =
  | SpeechContent
  | EmailTemplateContent
  | DocumentContent
  | GuideContent
  | VideoContent
  | ChecklistContent

// Interface principal para recursos
export interface CommercialResource {
  id: string
  slug: string
  title: string
  description: string
  type: ResourceType
  phase: PipelinePhase
  category: ResourceCategory
  content: ResourceContent
  placeholders?: Placeholder[]
  tags: string[]
  accessRoles: ResourceRole[]
  isActive: boolean
  version: string
  createdAt: Date
  updatedAt: Date
  createdBy?: {
    id: string
    name: string | null
  }
  updatedBy?: {
    id: string
    name: string | null
  }
}

// Interface para uso de recursos
export interface ResourceUsage {
  id: string
  resourceId: string
  leadId: string
  userId: string
  extractedContent?: string
  placeholderValues?: Record<string, any>
  usageContext?: string
  createdAt: Date
}

// Interface para datos de lead para placeholders
export interface LeadData {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  estimatedRevenue?: number
  priority: string
  status: string
  industry?: string
  assignedTo?: {
    id: string
    name: string | null
  }
  createdAt: Date
  updatedAt: Date
}

// Interface para extracción de contenido con datos
export interface ExtractedResource {
  resource: CommercialResource
  extractedContent: string
  placeholderValues: Record<string, any>
  isPreview?: boolean
}

// DTOs para APIs
export interface CreateResourceDTO {
  slug: string
  title: string
  description: string
  type: ResourceType
  phase: PipelinePhase
  category: ResourceCategory
  content: ResourceContent
  placeholders?: Placeholder[]
  tags: string[]
  accessRoles: ResourceRole[]
  version?: string
}

export interface UpdateResourceDTO extends Partial<CreateResourceDTO> {
  id: string
}

export interface ResourceFilterDTO {
  type?: ResourceType
  phase?: PipelinePhase
  category?: ResourceCategory
  tags?: string[]
  search?: string
  roles?: ResourceRole[]
  isActive?: boolean
}

// Interface para respuestas de API
export interface ResourceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Interface para estadísticas de uso
export interface ResourceStats {
  resourceId: string
  totalUsages: number
  uniqueUsers: number
  recentUsages: ResourceUsage[]
  popularPlaceholders: Array<{
    key: string
    count: number
  }>
}

// Interface para configuración de placeholders por lead
export interface PlaceholderConfig {
  leadId: string
  customValues?: Record<string, any>
  systemValues: Record<string, any>
  companyValues: Record<string, any>
  contactValues: Record<string, any>
}

// Interface para preview de contenido
export interface ContentPreview {
  originalContent: string
  processedContent: string
  placeholdersUsed: string[]
  missingPlaceholders: string[]
  warnings?: string[]
}

// Constants per defecte
export const DEFAULT_PLACEHOLDERS: Record<PlaceholderType, Placeholder[]> = {
  [PlaceholderType.COMPANY]: [
    {
      key: 'company.name',
      label: 'Nom de l\'empresa',
      type: PlaceholderType.COMPANY,
      description: 'Nom oficial de l\'empresa del lead',
      required: true
    },
    {
      key: 'company.industry',
      label: 'Sector',
      type: PlaceholderType.COMPANY,
      description: 'Sector d\'activitat de l\'empresa'
    },
    {
      key: 'company.revenue',
      label: 'Facturació estimada',
      type: PlaceholderType.COMPANY,
      description: 'Valor estimat del negoci'
    }
  ],
  [PlaceholderType.CONTACT]: [
    {
      key: 'contact.name',
      label: 'Nom del contacte',
      type: PlaceholderType.CONTACT,
      description: 'Nom de la persona de contacte',
      required: true
    },
    {
      key: 'contact.email',
      label: 'Email del contacte',
      type: PlaceholderType.CONTACT,
      description: 'Adreça de correu electrònic'
    },
    {
      key: 'contact.phone',
      label: 'Telèfon del contacte',
      type: PlaceholderType.CONTACT,
      description: 'Número de telèfon de contacte'
    }
  ],
  [PlaceholderType.SYSTEM]: [
    {
      key: 'system.date',
      label: 'Data actual',
      type: PlaceholderType.SYSTEM,
      description: 'Data del sistema'
    },
    {
      key: 'system.user.name',
      label: 'Nom del gestor',
      type: PlaceholderType.SYSTEM,
      description: 'Nom de l\'usuari actual'
    },
    {
      key: 'system.company.name',
      label: 'La Pública Solucions',
      type: PlaceholderType.SYSTEM,
      description: 'Nom de la nostra empresa'
    }
  ],
  [PlaceholderType.CUSTOM]: []
}

// Mapeo de tipos de contenido a etiquetas
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  [ResourceType.SPEECH]: 'Discurs/Presentació',
  [ResourceType.EMAIL_TEMPLATE]: 'Plantilla d\'Email',
  [ResourceType.DOCUMENT]: 'Document',
  [ResourceType.GUIDE]: 'Guia',
  [ResourceType.VIDEO]: 'Video',
  [ResourceType.CHECKLIST]: 'Checklist',
}

export const PIPELINE_PHASE_LABELS: Record<PipelinePhase, string> = {
  [PipelinePhase.NEW]: 'Nou Lead',
  [PipelinePhase.CONTACTED]: 'Contactat',
  [PipelinePhase.NEGOTIATION]: 'Negociació',
  [PipelinePhase.QUALIFIED]: 'Qualificat',
  [PipelinePhase.PENDING_CRM]: 'Pendent CRM',
  [PipelinePhase.CRM_APPROVED]: 'Aprovat CRM',
  [PipelinePhase.PENDING_ADMIN]: 'Pendent Admin',
  [PipelinePhase.WON]: 'Guanyat',
  [PipelinePhase.LOST]: 'Perdut',
  [PipelinePhase.GENERAL]: 'General',
}

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  [ResourceCategory.PROSPECTION]: 'Prospecció',
  [ResourceCategory.PRESENTATION]: 'Presentació',
  [ResourceCategory.NEGOTIATION]: 'Negociació',
  [ResourceCategory.CLOSING]: 'Tancament',
  [ResourceCategory.FOLLOWUP]: 'Seguiment',
  [ResourceCategory.TRAINING]: 'Formació',
  [ResourceCategory.LEGAL]: 'Legal',
  [ResourceCategory.ADMINISTRATIVE]: 'Administratiu',
}