// Types for Featured Ads Wizard

export type FeaturedAdLevel = 'PREMIUM' | 'STANDARD' | 'BASIC'
export type FeaturedAdSource = 'LA_PUBLICA' | 'PARTNER' | 'COMPANY'
export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

// Franja horaria
export interface TimeSlot {
  id: string
  startTime: string // HH:mm format
  endTime: string   // HH:mm format
}

// Período de campaña (para múltiples fechas)
export interface CampaignPeriod {
  id: string
  startDate: string
  endDate: string
  isActive: boolean
}

// Configuración de rotación
export interface RotationConfig {
  enabled: boolean
  weight: number        // 1-100, peso para la rotación
  maxImpressions?: number  // Límite de impresiones
  maxClicks?: number       // Límite de clics
}

// Configuración de recurrencia
export interface RecurrenceConfig {
  type: RecurrenceType
  interval: number       // Cada X días/semanas/meses
  endAfterOccurrences?: number  // Terminar después de X ocurrencias
  endByDate?: string     // O terminar en esta fecha
}

// Programación avanzada completa
export interface AdvancedScheduling {
  // Modo de programación
  mode: 'simple' | 'advanced'

  // Fechas básicas (modo simple)
  startsAt: string
  endsAt?: string
  period: PeriodType

  // Franjas horarias (mostrar solo en ciertas horas)
  timeSlots: {
    enabled: boolean
    slots: TimeSlot[]
    timezone: string
  }

  // Días de la semana
  weekDays: {
    enabled: boolean
    days: DayOfWeek[]
  }

  // Múltiples períodos de campaña
  campaigns: {
    enabled: boolean
    periods: CampaignPeriod[]
  }

  // Rotación y prioridad
  rotation: RotationConfig
  priority: number  // 1-10, mayor = más prioridad

  // Recurrencia
  recurrence: RecurrenceConfig
}

export interface Company {
  id: string
  name: string
  cif?: string
  email?: string
  logo?: string
  address?: string
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
}

export interface Pricing {
  id: string
  level: FeaturedAdLevel
  name: string
  description: string
  priceWeekly: number
  priceMonthly: number
  priceQuarterly: number
  priceBiannual: number
  priceAnnual: number
  features: string[]
  isActive: boolean
}

export interface WizardFormData {
  // Step 1: Origin
  source: FeaturedAdSource

  // Step 2: Details (common)
  level: FeaturedAdLevel
  title: string
  description: string
  shortDescription: string
  ctaText: string
  ctaUrl: string
  targetBlank: boolean
  images: string[]

  // Scheduling (basic - for backward compatibility)
  startsAt: string
  period: PeriodType

  // Advanced Scheduling
  scheduling: AdvancedScheduling

  // Source-specific: LA_PUBLICA
  internalNotes?: string

  // Source-specific: PARTNER
  publisherName?: string
  publisherLogo?: string
  partnerContact?: string
  partnerEmail?: string

  // Source-specific: COMPANY
  companyId?: string
  generateInvoice?: boolean
  invoiceData?: {
    clientName: string
    clientCif: string
    clientEmail: string
    clientAddress: string
    paymentMethod: 'TRANSFER' | 'CARD' | 'DOMICILIATION'
    notes?: string
  }
}

export const LEVEL_CONFIG = {
  PREMIUM: {
    label: 'Premium',
    icon: '🌟',
    description: 'Slider hero principal amb màxima visibilitat',
    color: 'purple',
    bgGradient: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  STANDARD: {
    label: 'Standard',
    icon: '⭐',
    description: 'Sidebar destacat amb badge especial',
    color: 'amber',
    bgGradient: 'from-amber-50 to-amber-100',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700'
  },
  BASIC: {
    label: 'Bàsic',
    icon: '📌',
    description: 'Badge destacat i millor posició al llistat',
    color: 'gray',
    bgGradient: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700'
  }
} as const

export const PERIOD_CONFIG: Record<PeriodType, { label: string; days: number }> = {
  weekly: { label: '1 Setmana', days: 7 },
  monthly: { label: '1 Mes', days: 30 },
  quarterly: { label: '3 Mesos', days: 90 },
  biannual: { label: '6 Mesos', days: 180 },
  annual: { label: '1 Any', days: 365 },
  custom: { label: 'Personalitzat', days: 0 }
}

export const WEEKDAYS_CONFIG: Record<DayOfWeek, { label: string; shortLabel: string }> = {
  monday: { label: 'Dilluns', shortLabel: 'Dl' },
  tuesday: { label: 'Dimarts', shortLabel: 'Dt' },
  wednesday: { label: 'Dimecres', shortLabel: 'Dc' },
  thursday: { label: 'Dijous', shortLabel: 'Dj' },
  friday: { label: 'Divendres', shortLabel: 'Dv' },
  saturday: { label: 'Dissabte', shortLabel: 'Ds' },
  sunday: { label: 'Diumenge', shortLabel: 'Dg' }
}

export const RECURRENCE_CONFIG: Record<RecurrenceType, { label: string; description: string }> = {
  none: { label: 'Sense repetició', description: 'L\'anunci s\'executa una sola vegada' },
  daily: { label: 'Diari', description: 'Es repeteix cada X dies' },
  weekly: { label: 'Setmanal', description: 'Es repeteix cada X setmanes' },
  monthly: { label: 'Mensual', description: 'Es repeteix cada X mesos' }
}

export const SOURCE_CONFIG = {
  LA_PUBLICA: {
    label: 'La Pública',
    icon: '🏠',
    description: 'Anunci intern de la plataforma',
    color: 'blue'
  },
  PARTNER: {
    label: 'Partner',
    icon: '🤝',
    description: 'Anunci de partner extern',
    color: 'green'
  },
  COMPANY: {
    label: 'Empresa',
    icon: '🏢',
    description: "Anunci d'una empresa registrada (amb facturació)",
    color: 'purple'
  }
} as const

// Valores por defecto para programación avanzada
export const DEFAULT_SCHEDULING: AdvancedScheduling = {
  mode: 'simple',
  startsAt: new Date().toISOString().split('T')[0],
  period: 'monthly',
  timeSlots: {
    enabled: false,
    slots: [],
    timezone: 'Europe/Madrid'
  },
  weekDays: {
    enabled: false,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  campaigns: {
    enabled: false,
    periods: []
  },
  rotation: {
    enabled: false,
    weight: 50
  },
  priority: 5,
  recurrence: {
    type: 'none',
    interval: 1
  }
}

export const INITIAL_FORM_DATA: WizardFormData = {
  source: 'LA_PUBLICA',
  level: 'STANDARD',
  title: '',
  description: '',
  shortDescription: '',
  ctaText: 'Veure més',
  ctaUrl: '',
  targetBlank: true,
  images: [],
  startsAt: new Date().toISOString().split('T')[0],
  period: 'monthly',
  scheduling: { ...DEFAULT_SCHEDULING },
  internalNotes: '',
  publisherName: '',
  publisherLogo: '',
  partnerContact: '',
  partnerEmail: '',
  companyId: '',
  generateInvoice: true,
  invoiceData: {
    clientName: '',
    clientCif: '',
    clientEmail: '',
    clientAddress: '',
    paymentMethod: 'TRANSFER',
    notes: ''
  }
}

// Helper to calculate price from pricing data
export function calculatePrice(pricing: Pricing[], level: FeaturedAdLevel, period: PeriodType): number {
  const levelPricing = pricing.find(p => p.level === level)
  if (!levelPricing) return 0

  // Custom period no tiene precio fijo
  if (period === 'custom') return 0

  const priceMap: Record<Exclude<PeriodType, 'custom'>, number> = {
    weekly: levelPricing.priceWeekly,
    monthly: levelPricing.priceMonthly,
    quarterly: levelPricing.priceQuarterly,
    biannual: levelPricing.priceBiannual,
    annual: levelPricing.priceAnnual
  }

  return priceMap[period] / 100 // Convert cents to euros
}

// Helper to calculate end date
export function calculateEndDate(startDate: string, period: PeriodType): Date {
  const start = new Date(startDate)
  const days = PERIOD_CONFIG[period].days
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
}
