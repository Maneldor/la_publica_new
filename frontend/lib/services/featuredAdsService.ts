/**
 * Sistema d'Anuncis Destacats
 *
 * Gestiona anuncis patrocinats amb 3 nivells:
 * - PREMIUM: Slider hero principal
 * - STANDARD: Sidebar destacat
 * - BASIC: Badge + millor posició al llistat
 */

import { prismaClient } from '@/lib/prisma'
import { FeaturedAdLevel, FeaturedAdSource } from '@prisma/client'

// ============================================
// TIPUS I CONSTANTS
// ============================================

export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom'

// Importar tipos de programación avanzada
import { AdvancedScheduling } from '@/lib/types/featuredAds'

export const PERIOD_CONFIG: Record<PeriodType, { label: string; days: number; months: number }> = {
  weekly: { label: '1 Setmana', days: 7, months: 0 },
  monthly: { label: '1 Mes', days: 30, months: 1 },
  quarterly: { label: '3 Mesos', days: 90, months: 3 },
  biannual: { label: '6 Mesos', days: 180, months: 6 },
  annual: { label: '1 Any', days: 365, months: 12 },
  custom: { label: 'Personalitzat', days: 0, months: 0 }
}

export const LEVEL_CONFIG: Record<FeaturedAdLevel, { name: string; description: string; icon: string }> = {
  PREMIUM: {
    name: 'Premium',
    description: 'Slider hero principal amb màxima visibilitat',
    icon: '🌟'
  },
  STANDARD: {
    name: 'Standard',
    description: 'Sidebar destacat amb badge especial',
    icon: '⭐'
  },
  BASIC: {
    name: 'Bàsic',
    description: 'Badge destacat i millor posició al llistat',
    icon: '📌'
  }
}

/**
 * Afegeix mesos a una data
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Afegeix dies a una data
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Calcula la data de fi segons el període
 */
export function calculateEndDate(startDate: Date, period: PeriodType): Date {
  const config = PERIOD_CONFIG[period]
  if (config.months > 0) {
    return addMonths(startDate, config.months)
  }
  return addDays(startDate, config.days)
}

// ============================================
// FUNCIONS DE CONSULTA
// ============================================

/**
 * Obté els anuncis destacats actius per nivell
 * Aplica programació avançada si està configurada
 */
export async function getActiveFeaturedAds(level?: FeaturedAdLevel, applyScheduling = true) {
  const now = new Date()

  const where: any = {
    isActive: true,
    startsAt: { lte: now },
    endsAt: { gte: now }
  }

  if (level) {
    where.level = level
  }

  const ads = await prismaClient.featuredAd.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true
        }
      }
    },
    orderBy: [
      { level: 'asc' }, // PREMIUM primer
      { position: 'asc' },
      { createdAt: 'desc' }
    ]
  })

  // Aplicar filtre de programació avançada si s'indica
  if (applyScheduling) {
    return filterActiveAds(ads)
  }

  return ads
}

/**
 * Obté anuncis Premium per al slider
 */
export async function getPremiumAdsForSlider() {
  return getActiveFeaturedAds('PREMIUM')
}

/**
 * Obté anuncis Standard/Basic per al sidebar
 * Aplica programació avançada
 */
export async function getSidebarAds(limit: number = 5) {
  const now = new Date()

  const ads = await prismaClient.featuredAd.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
      level: { in: ['STANDARD', 'BASIC'] }
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true
        }
      }
    },
    orderBy: [
      { level: 'asc' },
      { position: 'asc' }
    ]
  })

  // Aplicar filtre de programació avançada i limitar
  return filterActiveAds(ads).slice(0, limit)
}

/**
 * Obté la configuració de preus
 */
export async function getFeaturedAdPricing() {
  return prismaClient.featuredAdPricing.findMany({
    where: { isActive: true },
    orderBy: { level: 'asc' }
  })
}

/**
 * Calcula el preu segons nivell i període
 */
export async function calculatePrice(level: FeaturedAdLevel, period: PeriodType): Promise<number> {
  // Custom period no té preu fix
  if (period === 'custom') return 0

  const pricing = await prismaClient.featuredAdPricing.findUnique({
    where: { level }
  })

  if (!pricing) {
    throw new Error(`No hi ha preus configurats per al nivell ${level}`)
  }

  const priceMap: Record<Exclude<PeriodType, 'custom'>, number> = {
    weekly: pricing.priceWeekly,
    monthly: pricing.priceMonthly,
    quarterly: pricing.priceQuarterly,
    biannual: pricing.priceBiannual,
    annual: pricing.priceAnnual
  }

  return priceMap[period]
}

// ============================================
// FUNCIONS DE CREACIÓ
// ============================================

export interface CreateFeaturedAdInput {
  title: string
  description: string
  shortDescription?: string
  images: string[]
  level: FeaturedAdLevel
  source: FeaturedAdSource
  companyId?: string
  publisherName?: string
  publisherLogo?: string
  ctaText?: string
  ctaUrl?: string
  targetBlank?: boolean
  startsAt: Date
  endsAt?: Date // Para período 'custom'
  period: PeriodType
  createdById: string
  budgetId?: string
  invoiceId?: string
  // Programación avanzada
  scheduling?: AdvancedScheduling
  priority?: number
  maxImpressions?: number
  maxClicks?: number
}

/**
 * Genera un slug únic
 */
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const existingCount = await prismaClient.featuredAd.count({
    where: { slug: { startsWith: baseSlug } }
  })

  return existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug
}

/**
 * Crea un anunci destacat
 */
export async function createFeaturedAd(input: CreateFeaturedAdInput) {
  const {
    period,
    startsAt,
    endsAt: customEndsAt,
    scheduling,
    priority,
    maxImpressions,
    maxClicks,
    ...rest
  } = input

  // Calcular data fi segons període o usar la personalizada
  let endsAt: Date
  if (period === 'custom' && customEndsAt) {
    endsAt = customEndsAt
  } else if (period === 'custom' && scheduling?.endsAt) {
    endsAt = new Date(scheduling.endsAt)
  } else {
    endsAt = calculateEndDate(startsAt, period)
  }

  // Generar slug únic
  const slug = await generateUniqueSlug(input.title)

  // Obtenir posició màxima del nivell
  const maxPosition = await prismaClient.featuredAd.aggregate({
    where: { level: input.level },
    _max: { position: true }
  })

  const position = (maxPosition._max.position || 0) + 1

  // Preparar datos para crear
  const createData: any = {
    ...rest,
    slug,
    startsAt,
    endsAt,
    position,
    priority: priority || scheduling?.priority || 5
  }

  // Añadir scheduling si existe y está en modo avanzado
  if (scheduling && scheduling.mode === 'advanced') {
    createData.scheduling = scheduling
  }

  // Añadir límites opcionales
  if (maxImpressions) {
    createData.maxImpressions = maxImpressions
  }
  if (maxClicks) {
    createData.maxClicks = maxClicks
  }

  return prismaClient.featuredAd.create({
    data: createData,
    include: {
      company: true,
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

/**
 * Actualitza un anunci destacat
 */
export async function updateFeaturedAd(
  id: string,
  data: Partial<Omit<CreateFeaturedAdInput, 'createdById'>> & { isActive?: boolean }
) {
  const { period, startsAt, endsAt: customEndsAt, scheduling, ...updateData } = data

  // Si canvia el període o data d'inici, recalcular data fi
  if (period && startsAt) {
    if (period === 'custom' && customEndsAt) {
      ;(updateData as any).endsAt = customEndsAt
    } else if (period === 'custom' && scheduling?.endsAt) {
      ;(updateData as any).endsAt = new Date(scheduling.endsAt)
    } else {
      const endsAt = calculateEndDate(startsAt, period)
      ;(updateData as any).endsAt = endsAt
    }
    ;(updateData as any).startsAt = startsAt
  }

  // Actualizar scheduling si existe
  if (scheduling) {
    if (scheduling.mode === 'advanced') {
      ;(updateData as any).scheduling = scheduling
    } else {
      // Si vuelve a modo simple, limpiar scheduling
      ;(updateData as any).scheduling = null
    }
    ;(updateData as any).priority = scheduling.priority || 5
  }

  return prismaClient.featuredAd.update({
    where: { id },
    data: updateData,
    include: {
      company: true,
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

/**
 * Elimina un anunci destacat
 */
export async function deleteFeaturedAd(id: string) {
  return prismaClient.featuredAd.delete({
    where: { id }
  })
}

/**
 * Obté un anunci destacat per ID
 */
export async function getFeaturedAdById(id: string) {
  return prismaClient.featuredAd.findUnique({
    where: { id },
    include: {
      company: true,
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

// ============================================
// MÈTRIQUES I ANALYTICS
// ============================================

/**
 * Registra una impressió
 */
export async function recordImpression(featuredAdId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prismaClient.$transaction([
    // Incrementar contador general
    prismaClient.featuredAd.update({
      where: { id: featuredAdId },
      data: { impressions: { increment: 1 } }
    }),
    // Registrar en analytics diari
    prismaClient.featuredAdAnalytics.upsert({
      where: {
        featuredAdId_date: { featuredAdId, date: today }
      },
      create: {
        featuredAdId,
        date: today,
        impressions: 1
      },
      update: {
        impressions: { increment: 1 }
      }
    })
  ])
}

/**
 * Registra múltiples impressions (batch)
 */
export async function recordImpressions(featuredAdIds: string[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const operations = featuredAdIds.flatMap(featuredAdId => [
    prismaClient.featuredAd.update({
      where: { id: featuredAdId },
      data: { impressions: { increment: 1 } }
    }),
    prismaClient.featuredAdAnalytics.upsert({
      where: {
        featuredAdId_date: { featuredAdId, date: today }
      },
      create: {
        featuredAdId,
        date: today,
        impressions: 1
      },
      update: {
        impressions: { increment: 1 }
      }
    })
  ])

  await prismaClient.$transaction(operations)
}

/**
 * Registra un clic
 */
export async function recordClick(featuredAdId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prismaClient.$transaction([
    prismaClient.featuredAd.update({
      where: { id: featuredAdId },
      data: { clicks: { increment: 1 } }
    }),
    prismaClient.featuredAdAnalytics.upsert({
      where: {
        featuredAdId_date: { featuredAdId, date: today }
      },
      create: {
        featuredAdId,
        date: today,
        clicks: 1
      },
      update: {
        clicks: { increment: 1 }
      }
    })
  ])
}

/**
 * Obté estadístiques d'un anunci
 */
export async function getAdAnalytics(featuredAdId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const [ad, dailyStats] = await Promise.all([
    prismaClient.featuredAd.findUnique({
      where: { id: featuredAdId },
      select: {
        impressions: true,
        clicks: true,
        startsAt: true,
        endsAt: true
      }
    }),
    prismaClient.featuredAdAnalytics.findMany({
      where: {
        featuredAdId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    })
  ])

  if (!ad) return null

  const ctr = ad.impressions > 0
    ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
    : '0.00'

  return {
    total: {
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: `${ctr}%`
    },
    daily: dailyStats,
    period: {
      startsAt: ad.startsAt,
      endsAt: ad.endsAt
    }
  }
}

// ============================================
// GESTIÓ (per admin)
// ============================================

export interface GetFeaturedAdsFilters {
  status?: 'active' | 'scheduled' | 'expired' | 'all'
  level?: FeaturedAdLevel
  source?: FeaturedAdSource
  companyId?: string
}

/**
 * Obté tots els anuncis destacats amb filtres (per gestió)
 */
export async function getAllFeaturedAds(filters: GetFeaturedAdsFilters = {}) {
  const now = new Date()
  let where: any = {}

  switch (filters.status) {
    case 'active':
      where = { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } }
      break
    case 'scheduled':
      where = { startsAt: { gt: now } }
      break
    case 'expired':
      where = { endsAt: { lt: now } }
      break
  }

  if (filters.level) {
    where.level = filters.level
  }

  if (filters.source) {
    where.source = filters.source
  }

  if (filters.companyId) {
    where.companyId = filters.companyId
  }

  return prismaClient.featuredAd.findMany({
    where,
    include: {
      company: { select: { id: true, name: true, logo: true } },
      createdBy: { select: { id: true, name: true } }
    },
    orderBy: [{ level: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }]
  })
}

/**
 * Obté estadístiques generals
 */
export async function getFeaturedAdsStats() {
  const now = new Date()

  const [total, byLevel, totalImpressions, totalClicks] = await Promise.all([
    prismaClient.featuredAd.count(),
    prismaClient.featuredAd.groupBy({
      by: ['level'],
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      _count: true
    }),
    prismaClient.featuredAd.aggregate({
      _sum: { impressions: true }
    }),
    prismaClient.featuredAd.aggregate({
      _sum: { clicks: true }
    })
  ])

  return {
    total,
    active: byLevel.reduce((sum, b) => sum + b._count, 0),
    byLevel: byLevel.reduce((acc, b) => ({ ...acc, [b.level]: b._count }), {}),
    totalImpressions: totalImpressions._sum.impressions || 0,
    totalClicks: totalClicks._sum.clicks || 0
  }
}

// ============================================
// PROGRAMACIÓ AVANÇADA
// ============================================

/**
 * Verifica si un anunci hauria de mostrar-se ara segons la seva programació avançada
 */
export function shouldShowAd(ad: {
  isActive: boolean
  startsAt: Date
  endsAt: Date
  scheduling?: AdvancedScheduling | null
  impressions?: number
  clicks?: number
  maxImpressions?: number | null
  maxClicks?: number | null
}): boolean {
  const now = new Date()

  // Verificacions bàsiques
  if (!ad.isActive) return false
  if (now < new Date(ad.startsAt)) return false
  if (now > new Date(ad.endsAt)) return false

  // Si té límits de impressions/clics i s'han superat
  if (ad.maxImpressions && ad.impressions && ad.impressions >= ad.maxImpressions) return false
  if (ad.maxClicks && ad.clicks && ad.clicks >= ad.maxClicks) return false

  // Si no hi ha programació avançada o està en mode simple, mostrar
  if (!ad.scheduling || ad.scheduling.mode === 'simple') return true

  const scheduling = ad.scheduling

  // Verificar dia de la setmana
  if (scheduling.weekDays?.enabled && scheduling.weekDays.days.length > 0) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const currentDay = dayNames[now.getDay()]
    if (!scheduling.weekDays.days.includes(currentDay as any)) return false
  }

  // Verificar franja horària
  if (scheduling.timeSlots?.enabled && scheduling.timeSlots.slots.length > 0) {
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute // minuts des de mitjanit

    const inTimeSlot = scheduling.timeSlots.slots.some(slot => {
      const [startH, startM] = slot.startTime.split(':').map(Number)
      const [endH, endM] = slot.endTime.split(':').map(Number)
      const slotStart = startH * 60 + startM
      const slotEnd = endH * 60 + endM
      return currentTime >= slotStart && currentTime <= slotEnd
    })

    if (!inTimeSlot) return false
  }

  // Verificar períodes de campanya
  if (scheduling.campaigns?.enabled && scheduling.campaigns.periods.length > 0) {
    const inCampaignPeriod = scheduling.campaigns.periods.some(period => {
      const periodStart = new Date(period.startDate)
      const periodEnd = new Date(period.endDate)
      return now >= periodStart && now <= periodEnd
    })

    if (!inCampaignPeriod) return false
  }

  return true
}

/**
 * Filtra anuncis actius segons programació avançada
 */
export function filterActiveAds<T extends {
  isActive: boolean
  startsAt: Date
  endsAt: Date
  scheduling?: any
  impressions?: number
  clicks?: number
  maxImpressions?: number | null
  maxClicks?: number | null
  priority?: number
}>(ads: T[]): T[] {
  // Filtrar per programació avançada
  const activeAds = ads.filter(ad => shouldShowAd(ad))

  // Ordenar per prioritat (major primer) i rotació aleatòria amb pes
  return activeAds.sort((a, b) => {
    const priorityA = a.priority || 5
    const priorityB = b.priority || 5

    // Si tenen diferent prioritat, ordenar per prioritat
    if (priorityA !== priorityB) {
      return priorityB - priorityA
    }

    // Si tenen la mateixa prioritat, aplicar aleatorietat lleuger
    // per simular rotació
    return Math.random() - 0.5
  })
}

// ============================================
// SEED DE PREUS INICIALS
// ============================================

export async function seedFeaturedAdPricing() {
  const pricing = [
    {
      level: 'PREMIUM' as FeaturedAdLevel,
      name: 'Premium',
      description: 'Màxima visibilitat al slider principal',
      priceWeekly: 5000,      // 50€
      priceMonthly: 15000,    // 150€
      priceQuarterly: 40000,  // 400€
      priceBiannual: 70000,   // 700€
      priceAnnual: 120000,    // 1200€
      features: [
        'Slider hero a la pàgina principal',
        'Imatge gran amb animació',
        'Màxima visibilitat',
        'Estadístiques detallades',
        'Suport prioritari'
      ]
    },
    {
      level: 'STANDARD' as FeaturedAdLevel,
      name: 'Standard',
      description: 'Destacat al sidebar amb badge',
      priceWeekly: 2500,      // 25€
      priceMonthly: 7500,     // 75€
      priceQuarterly: 20000,  // 200€
      priceBiannual: 35000,   // 350€
      priceAnnual: 60000,     // 600€
      features: [
        'Posició destacada al sidebar',
        'Badge "Destacat"',
        'Logo de l\'empresa visible',
        'Estadístiques bàsiques'
      ]
    },
    {
      level: 'BASIC' as FeaturedAdLevel,
      name: 'Bàsic',
      description: 'Badge i millor posició al llistat',
      priceWeekly: 1000,      // 10€
      priceMonthly: 3000,     // 30€
      priceQuarterly: 8000,   // 80€
      priceBiannual: 14000,   // 140€
      priceAnnual: 24000,     // 240€
      features: [
        'Badge "Destacat" a l\'anunci',
        'Millor posició als resultats',
        'Estadístiques bàsiques'
      ]
    }
  ]

  for (const p of pricing) {
    await prismaClient.featuredAdPricing.upsert({
      where: { level: p.level },
      create: p,
      update: p
    })
  }

  console.log('✅ Preus d\'anuncis destacats configurats')
}
