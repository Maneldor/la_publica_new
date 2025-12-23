/**
 * Sistema de Detecció de Frau en Anuncis
 *
 * Detecta patrons d'ús comercial no autoritzat:
 * - Volum alt de publicació
 * - Contingut duplicat
 * - Paraules clau comercials
 * - URLs externes sospitoses
 * - Patrons de contacte repetitiu
 */

import { prismaClient } from '@/lib/prisma'
import { AdAlertType, AlertSeverity } from '@prisma/client'

// Configuració de llindars
const CONFIG = {
  // Volum
  MAX_ADS_PER_DAY: 3,
  MAX_ADS_PER_WEEK: 10,
  MAX_ADS_PER_MONTH: 25,

  // Paraules clau sospitoses (comercials)
  COMMERCIAL_KEYWORDS: [
    'empresa', 'negocio', 'profesional', 'tienda', 'stock', 'liquidación',
    'mayorista', 'distribuidor', 'proveedor', 'envío gratis', 'oferta especial',
    'precio especial', 'descuento', 'promoción', 'garantía', 'nuevo precintado',
    'factura', 'iva incluido', 'por mayor', 'lote', 'pack', 'unidades disponibles',
    'whatsapp', 'telegram', 'contactar por', 'llámame', 'envío 24h',
    'empresa', 'negoci', 'professional', 'botiga', 'estoc', 'liquidació',
    'majorista', 'distribuïdor', 'proveïdor', 'enviament gratuït', 'oferta especial',
    'preu especial', 'descompte', 'promoció', 'garantia', 'nou precintat',
    'factura', 'iva inclòs', 'a l\'engròs', 'lot', 'unitats disponibles'
  ],

  // Patrons d'URL sospitosos
  SUSPICIOUS_URL_PATTERNS: [
    /whatsapp\.com/i,
    /t\.me\//i,
    /telegram\./i,
    /bit\.ly/i,
    /tinyurl/i,
    /goo\.gl/i,
    /rebrand\.ly/i,
    /wa\.me/i,
    /linktr\.ee/i,
    /milanuncios/i,
    /wallapop/i,
    /segundamano/i,
    /amazon/i,
    /aliexpress/i,
    /ebay/i,
  ],

  // Patrons de telèfon repetit
  PHONE_PATTERNS: [
    /\+?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}/g,
    /\d{3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/g,
    /\d{9}/g
  ],

  // Accions automàtiques
  WARNINGS_BEFORE_TEMP_BLOCK: 3,
  WARNINGS_BEFORE_PERM_BLOCK: 5,
  TEMP_BLOCK_DAYS: 7,
}

export interface FraudCheckResult {
  passed: boolean
  alerts: FraudAlert[]
  shouldBlock: boolean
  blockDuration?: number // dies
  blockReason?: string
}

export interface FraudAlert {
  type: AdAlertType
  severity: AlertSeverity
  description: string
  metadata?: Record<string, any>
}

/**
 * Analitza un anunci abans de publicar-lo
 */
export async function checkAdForFraud(
  userId: string,
  title: string,
  content: string,
  metadata?: Record<string, any>
): Promise<FraudCheckResult> {
  const alerts: FraudAlert[] = []

  // Obtenir dades de l'usuari
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      adWarningCount: true,
      adBlockedUntil: true,
      isAdBanned: true,
    }
  })

  if (!user) {
    return { passed: false, alerts: [], shouldBlock: true, blockReason: 'Usuari no trobat' }
  }

  // Verificar si l'usuari ja està bloquejat
  if (user.isAdBanned) {
    return {
      passed: false,
      alerts: [],
      shouldBlock: true,
      blockReason: 'Compte bloquejat permanentment per publicar anuncis'
    }
  }

  if (user.adBlockedUntil && new Date(user.adBlockedUntil) > new Date()) {
    const daysLeft = Math.ceil((new Date(user.adBlockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return {
      passed: false,
      alerts: [],
      shouldBlock: true,
      blockReason: `Compte bloquejat temporalment. Resta: ${daysLeft} dies`
    }
  }

  // 1. Verificar volum d'anuncis
  const volumeAlert = await checkAdVolume(userId)
  if (volumeAlert) alerts.push(volumeAlert)

  // 2. Verificar contingut duplicat
  const duplicateAlert = await checkDuplicateContent(userId, title, content)
  if (duplicateAlert) alerts.push(duplicateAlert)

  // 3. Verificar paraules clau comercials
  const keywordAlert = checkCommercialKeywords(title, content)
  if (keywordAlert) alerts.push(keywordAlert)

  // 4. Verificar URLs sospitoses
  const urlAlert = checkSuspiciousUrls(content, metadata?.externalUrl)
  if (urlAlert) alerts.push(urlAlert)

  // 5. Verificar preu sospitós
  if (metadata?.price !== undefined) {
    const priceAlert = checkSuspiciousPrice(metadata.price, metadata.category)
    if (priceAlert) alerts.push(priceAlert)
  }

  // 6. Verificar patró de contacte extern
  const contactAlert = checkExternalContact(content)
  if (contactAlert) alerts.push(contactAlert)

  // Determinar acció basada en alertes
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL')
  const highAlerts = alerts.filter(a => a.severity === 'HIGH')
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM')

  let shouldBlock = false
  let blockDuration: number | undefined
  let blockReason: string | undefined

  // Lògica de bloqueig
  if (criticalAlerts.length > 0) {
    shouldBlock = true
    blockReason = 'Activitat fraudulenta detectada'
  } else if (highAlerts.length >= 2) {
    shouldBlock = true
    blockDuration = CONFIG.TEMP_BLOCK_DAYS
    blockReason = 'Múltiples infraccions greus'
  } else if (user.adWarningCount + alerts.length >= CONFIG.WARNINGS_BEFORE_TEMP_BLOCK) {
    shouldBlock = true
    blockDuration = CONFIG.TEMP_BLOCK_DAYS
    blockReason = 'Massa avisos acumulats'
  }

  // Verificar si s'ha de bloquejar permanentment
  if (user.adWarningCount + alerts.length >= CONFIG.WARNINGS_BEFORE_PERM_BLOCK) {
    shouldBlock = true
    blockDuration = undefined // Permanent
    blockReason = 'Bloqueig permanent per infraccions repetides'
  }

  return {
    passed: alerts.length === 0,
    alerts,
    shouldBlock,
    blockDuration,
    blockReason
  }
}

/**
 * Verifica el volum d'anuncis publicats
 */
async function checkAdVolume(userId: string): Promise<FraudAlert | null> {
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [dailyCount, weeklyCount, monthlyCount] = await Promise.all([
    prismaClient.anuncio.count({
      where: { authorId: userId, createdAt: { gte: dayAgo }, deletedAt: null }
    }),
    prismaClient.anuncio.count({
      where: { authorId: userId, createdAt: { gte: weekAgo }, deletedAt: null }
    }),
    prismaClient.anuncio.count({
      where: { authorId: userId, createdAt: { gte: monthAgo }, deletedAt: null }
    })
  ])

  if (dailyCount >= CONFIG.MAX_ADS_PER_DAY) {
    return {
      type: 'HIGH_VOLUME',
      severity: 'HIGH',
      description: `Superat el límit diari: ${dailyCount}/${CONFIG.MAX_ADS_PER_DAY} anuncis`,
      metadata: { dailyCount, limit: CONFIG.MAX_ADS_PER_DAY }
    }
  }

  if (weeklyCount >= CONFIG.MAX_ADS_PER_WEEK) {
    return {
      type: 'HIGH_VOLUME',
      severity: 'MEDIUM',
      description: `Superat el límit setmanal: ${weeklyCount}/${CONFIG.MAX_ADS_PER_WEEK} anuncis`,
      metadata: { weeklyCount, limit: CONFIG.MAX_ADS_PER_WEEK }
    }
  }

  if (monthlyCount >= CONFIG.MAX_ADS_PER_MONTH) {
    return {
      type: 'HIGH_VOLUME',
      severity: 'LOW',
      description: `Alt volum mensual: ${monthlyCount}/${CONFIG.MAX_ADS_PER_MONTH} anuncis`,
      metadata: { monthlyCount, limit: CONFIG.MAX_ADS_PER_MONTH }
    }
  }

  return null
}

/**
 * Verifica contingut duplicat
 */
async function checkDuplicateContent(
  userId: string,
  title: string,
  content: string
): Promise<FraudAlert | null> {
  // Buscar anuncis similars del mateix usuari
  const recentAds = await prismaClient.anuncio.findMany({
    where: {
      authorId: userId,
      deletedAt: null,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    select: { id: true, title: true, content: true }
  })

  const normalizedTitle = normalizeText(title)
  const normalizedContent = normalizeText(content)

  for (const ad of recentAds) {
    const adTitle = normalizeText(ad.title)
    const adContent = normalizeText(ad.content)

    // Verificar similitud de títol
    const titleSimilarity = calculateSimilarity(normalizedTitle, adTitle)
    const contentSimilarity = calculateSimilarity(normalizedContent, adContent)

    if (titleSimilarity > 0.8 && contentSimilarity > 0.7) {
      return {
        type: 'DUPLICATE_CONTENT',
        severity: 'HIGH',
        description: `Contingut molt similar a un anunci existent`,
        metadata: {
          existingAdId: ad.id,
          titleSimilarity: Math.round(titleSimilarity * 100),
          contentSimilarity: Math.round(contentSimilarity * 100)
        }
      }
    }

    if (titleSimilarity > 0.9) {
      return {
        type: 'DUPLICATE_CONTENT',
        severity: 'MEDIUM',
        description: `Títol gairebé idèntic a un anunci existent`,
        metadata: { existingAdId: ad.id, titleSimilarity: Math.round(titleSimilarity * 100) }
      }
    }
  }

  return null
}

/**
 * Verifica paraules clau comercials
 */
function checkCommercialKeywords(title: string, content: string): FraudAlert | null {
  const fullText = `${title} ${content}`.toLowerCase()
  const foundKeywords: string[] = []

  for (const keyword of CONFIG.COMMERCIAL_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword)
    }
  }

  if (foundKeywords.length >= 5) {
    return {
      type: 'KEYWORD_SPAM',
      severity: 'HIGH',
      description: `Detectades ${foundKeywords.length} paraules clau comercials`,
      metadata: { keywords: foundKeywords.slice(0, 10) }
    }
  }

  if (foundKeywords.length >= 3) {
    return {
      type: 'COMMERCIAL_PATTERN',
      severity: 'MEDIUM',
      description: `Patró comercial detectat amb ${foundKeywords.length} indicadors`,
      metadata: { keywords: foundKeywords }
    }
  }

  return null
}

/**
 * Verifica URLs sospitoses
 */
function checkSuspiciousUrls(content: string, externalUrl?: string): FraudAlert | null {
  const fullText = `${content} ${externalUrl || ''}`
  const foundUrls: string[] = []

  for (const pattern of CONFIG.SUSPICIOUS_URL_PATTERNS) {
    const matches = fullText.match(pattern)
    if (matches) {
      foundUrls.push(...matches)
    }
  }

  if (foundUrls.length > 0) {
    return {
      type: 'EXTERNAL_REDIRECT',
      severity: foundUrls.length > 1 ? 'HIGH' : 'MEDIUM',
      description: `Detectades ${foundUrls.length} URLs externes sospitoses`,
      metadata: { urls: [...new Set(foundUrls)] }
    }
  }

  return null
}

/**
 * Verifica preu sospitós
 */
function checkSuspiciousPrice(price: number, category?: string): FraudAlert | null {
  // Preus extremadament baixos per categories específiques
  const suspiciousLowPrices: Record<string, number> = {
    'electronica': 10,
    'informatica': 20,
    'moviles': 30,
    'vehiculos': 500,
    'motos': 200,
  }

  // Preus extremadament alts
  const suspiciousHighPrice = 50000

  if (category && suspiciousLowPrices[category.toLowerCase()]) {
    if (price > 0 && price < suspiciousLowPrices[category.toLowerCase()]) {
      return {
        type: 'SUSPICIOUS_PRICE',
        severity: 'MEDIUM',
        description: `Preu sospitosament baix per a la categoria: ${price}€`,
        metadata: { price, category, threshold: suspiciousLowPrices[category.toLowerCase()] }
      }
    }
  }

  if (price > suspiciousHighPrice) {
    return {
      type: 'SUSPICIOUS_PRICE',
      severity: 'LOW',
      description: `Preu molt elevat: ${price}€`,
      metadata: { price }
    }
  }

  return null
}

/**
 * Verifica si demana contacte extern
 */
function checkExternalContact(content: string): FraudAlert | null {
  const lowerContent = content.toLowerCase()
  const contactPatterns = [
    /contacta[rm]? por whatsapp/i,
    /escriu[em]? per whatsapp/i,
    /telegram:?\s*@/i,
    /wa\.me/i,
    /solo whatsapp/i,
    /només whatsapp/i,
    /no respondo aquí/i,
    /no responc aquí/i,
    /contactar por privado/i,
    /contactar per privat/i,
  ]

  for (const pattern of contactPatterns) {
    if (pattern.test(content)) {
      return {
        type: 'REPEATED_CONTACT',
        severity: 'MEDIUM',
        description: 'Demana contacte extern a la plataforma',
        metadata: { pattern: pattern.toString() }
      }
    }
  }

  // Verificar si hi ha massa números de telèfon
  let phoneCount = 0
  for (const pattern of CONFIG.PHONE_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) phoneCount += matches.length
  }

  if (phoneCount > 2) {
    return {
      type: 'REPEATED_CONTACT',
      severity: 'LOW',
      description: `Múltiples números de telèfon al contingut: ${phoneCount}`,
      metadata: { phoneCount }
    }
  }

  return null
}

/**
 * Registra alertes i actualitza l'usuari
 */
export async function recordFraudAlerts(
  userId: string,
  anuncioId: string | null,
  alerts: FraudAlert[],
  shouldBlock: boolean,
  blockDuration?: number,
  isPermanentBlock?: boolean
): Promise<void> {
  // Crear alertes a la BD
  for (const alert of alerts) {
    await prismaClient.adAlert.create({
      data: {
        userId,
        anuncioId,
        type: alert.type,
        severity: alert.severity,
        description: alert.description,
        metadata: alert.metadata,
        actionTaken: shouldBlock ?
          (isPermanentBlock ? 'AUTO_BLOCK_PERMANENT' :
           blockDuration ? 'AUTO_BLOCK_TEMP' : 'MANUAL_REVIEW')
          : 'AUTO_WARNING'
      }
    })
  }

  // Actualitzar comptador d'avisos
  const updateData: any = {
    adWarningCount: { increment: alerts.length }
  }

  if (shouldBlock) {
    if (isPermanentBlock) {
      updateData.isAdBanned = true
      updateData.adBlockReason = 'Bloqueig permanent per infraccions repetides'
    } else if (blockDuration) {
      updateData.adBlockedUntil = new Date(Date.now() + blockDuration * 24 * 60 * 60 * 1000)
      updateData.adBlockReason = `Bloqueig temporal de ${blockDuration} dies`
    }
  }

  await prismaClient.user.update({
    where: { id: userId },
    data: updateData
  })
}

/**
 * Obté estadístiques d'alertes per al panel de gestió
 */
export async function getAlertStats() {
  const [
    totalAlerts,
    unresolvedAlerts,
    criticalAlerts,
    blockedUsers,
    alertsByType
  ] = await Promise.all([
    prismaClient.adAlert.count(),
    prismaClient.adAlert.count({ where: { isResolved: false } }),
    prismaClient.adAlert.count({ where: { severity: 'CRITICAL', isResolved: false } }),
    prismaClient.user.count({ where: { OR: [{ isAdBanned: true }, { adBlockedUntil: { gt: new Date() } }] } }),
    prismaClient.adAlert.groupBy({
      by: ['type'],
      _count: true,
      where: { isResolved: false }
    })
  ])

  return {
    totalAlerts,
    unresolvedAlerts,
    criticalAlerts,
    blockedUsers,
    alertsByType: alertsByType.map(a => ({ type: a.type, count: a._count }))
  }
}

// Utilitats
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar accents
    .replace(/[^a-z0-9\s]/g, '') // Només alfanumèrics
    .replace(/\s+/g, ' ')
    .trim()
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1
  if (!str1 || !str2) return 0

  const words1 = new Set(str1.split(' '))
  const words2 = new Set(str2.split(' '))

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size // Jaccard similarity
}
