// lib/gestio-empreses/ia-lead-actions.ts
'use server'

import { generateLeadsWithDeepSeek } from '@/lib/ai/deepseek-client'
import { prismaClient } from '@/lib/prisma'

export type AIModel = string  // Ara és dinàmic des de la BD

export interface GenerationCriteria {
  sector: string
  location?: string
  companySize?: string
  quantity: number
  keywords?: string
  // Criteris avançats
  minRevenue?: number
  maxRevenue?: number
  foundedAfter?: number
  technologies?: string[]
  excludeExisting?: boolean
}

export interface GeneratedLead {
  id: string
  companyName: string
  sector: string
  location: string
  employees: number
  estimatedRevenue: number
  contactName: string
  contactEmail: string
  contactPhone: string
  score: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  reasoning: string
  website?: string
  linkedin?: string
  description?: string
}

interface Generation {
  id: string
  sector: string
  location: string
  quantity: number
  model: string
  leadsGenerated: number
  leadsAccepted: number
  createdAt: Date
  status: string
}

// Historial local (per compatibilitat)
const mockGenerations: Generation[] = []

// Rols permesos per generar leads amb IA
const ALLOWED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'ADMIN_GESTIO',
  'CRM_COMERCIAL',
  'CRM_CONTINGUT',
  'GESTOR_ESTRATEGIC',
  'GESTOR_ENTERPRISE',
  'GESTOR_ESTANDARD'
]

/**
 * Obtenir noms d'empreses existents per evitar duplicats
 */
async function getExistingCompanyNames(): Promise<string[]> {
  try {
    const existingLeads = await prismaClient.companyLead.findMany({
      select: { companyName: true },
      take: 500  // Limitar per rendiment
    })

    // Normalitzar noms: lowercase i sense espais extra
    return existingLeads.map(lead =>
      lead.companyName.toLowerCase().trim().replace(/\s+/g, ' ')
    )
  } catch (error) {
    console.error('Error obtenint empreses existents:', error)
    return []
  }
}

/**
 * Normalitzar nom d'empresa per comparació
 */
function normalizeCompanyName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Verificar si un lead ja existeix a la BD
 */
async function checkLeadExists(companyName: string, email?: string): Promise<boolean> {
  try {
    const normalizedName = normalizeCompanyName(companyName)

    // Buscar per nom normalitzat
    const existingByName = await prismaClient.companyLead.findFirst({
      where: {
        companyName: {
          mode: 'insensitive',
          equals: normalizedName
        }
      }
    })

    if (existingByName) return true

    // Si té email, buscar també per email
    if (email) {
      const existingByEmail = await prismaClient.companyLead.findFirst({
        where: { email: email.toLowerCase() }
      })
      if (existingByEmail) return true
    }

    return false
  } catch (error) {
    console.error('Error verificant duplicat:', error)
    return false  // En cas de dubte, permetre
  }
}

/**
 * Verificar permisos de l'usuari
 */
async function verifyUserPermissions(userId: string): Promise<{ authorized: boolean; error?: string; user?: any }> {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, isActive: true }
    })

    if (!user) {
      return { authorized: false, error: 'Usuari no trobat' }
    }

    if (!user.isActive) {
      return { authorized: false, error: 'Usuari inactiu' }
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      return { authorized: false, error: 'No tens permisos per generar leads IA' }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error('Error verificant permisos:', error)
    return { authorized: false, error: 'Error verificant permisos' }
  }
}

/**
 * Obtenir estadístiques de generació IA
 */
export async function getIALeadStats(userId: string) {
  try {
    // Intentar obtenir estadístiques reals de la BD
    const stats = await prismaClient.companyLead.aggregate({
      where: {
        source: 'AI_PROSPECTING'
      },
      _count: { id: true },
      _avg: { aiScore: true }
    })

    const highPriorityCount = await prismaClient.companyLead.count({
      where: {
        source: 'AI_PROSPECTING',
        priority: 'HIGH'
      }
    })

    return {
      totalGenerated: stats._count.id || 0,
      totalQualified: Math.floor((stats._count.id || 0) * 0.7),
      qualificationRate: 70,
      highPriority: highPriorityCount,
      avgScore: Math.round(stats._avg.aiScore || 75),
      creditsRemaining: 50,
      creditsUsed: stats._count.id || 0,
      monthlyLimit: 50,
    }
  } catch (error) {
    console.error('Error obtenint estadístiques IA:', error)

    // Fallback a dades per defecte
    return {
      totalGenerated: 0,
      totalQualified: 0,
      qualificationRate: 0,
      highPriority: 0,
      avgScore: 0,
      creditsRemaining: 50,
      creditsUsed: 0,
      monthlyLimit: 50,
    }
  }
}

/**
 * Obtenir historial de generacions
 */
export async function getGenerationHistory(userId: string, limit = 10) {
  return mockGenerations.slice(0, limit)
}

/**
 * Generar leads amb IA - CRIDA DIRECTA A DEEPSEEK
 */
export async function generateLeadsWithAI(
  criteria: GenerationCriteria,
  model: AIModel,
  userId: string
): Promise<{ generationId: string; leads: GeneratedLead[]; warning?: string; source?: string }> {
  
  console.log('=== generateLeadsWithAI DIRECT CALL ===')
  console.log('Criteria:', criteria)
  console.log('Model:', model)
  console.log('UserId:', userId)

  // Verificar permisos
  const permissions = await verifyUserPermissions(userId)
  if (!permissions.authorized) {
    console.error('❌ Permisos denegats:', permissions.error)
    return generateMockLeads(criteria, model, 'PERMISSION_DENIED')
  }

  console.log('✅ Usuari verificat:', permissions.user?.email)

  // Obtenir API Key de DeepSeek
  const apiKey = process.env.DEEPSEEK_API_KEY

  console.log('🔑 DeepSeek API Key:', {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    prefix: apiKey?.substring(0, 10) || 'none',
    isPlaceholder: apiKey === 'sk-your-deepseek-api-key-here'
  })

  // Si no hi ha API key vàlida, usar mock
  if (!apiKey || apiKey === 'sk-your-deepseek-api-key-here') {
    console.log('❌ No hi ha API Key vàlida de DeepSeek - usant mock')
    return generateMockLeads(criteria, model, 'NO_API_KEY')
  }

  try {
    console.log('🚀 Cridant DeepSeek directament...')

    // Obtenir empreses existents per passar com a exclusions
    const existingCompanies = await getExistingCompanyNames()
    console.log('📋 Passant', Math.min(existingCompanies.length, 50), 'empreses existents a DeepSeek per excloure')

    // Cridar DeepSeek directament (sense HTTP)
    const result = await generateLeadsWithDeepSeek(
      apiKey,
      {
        sector: criteria.sector,
        location: criteria.location || 'Catalunya',
        quantity: criteria.quantity,
        companySize: criteria.companySize || '',
        keywords: criteria.keywords || '',
        excludeCompanies: existingCompanies.slice(0, 50)  // Limitar a 50 per no sobrecarregar el prompt
      },
      model as 'deepseek-chat' | 'deepseek-reasoner'
    )

    console.log('📦 Resultat DeepSeek:', {
      success: result.success,
      leadsCount: result.leads?.length || 0,
      error: result.error
    })

    // Si falla DeepSeek, usar mock
    if (!result.success || !result.leads || result.leads.length === 0) {
      console.log('❌ DeepSeek ha fallat:', result.error)
      
      let source = 'DEEPSEEK_ERROR'
      if (result.error?.includes('quota') || result.error?.includes('balance')) {
        source = 'DEEPSEEK_QUOTA_EXCEEDED'
      } else if (result.error?.includes('invalid') || result.error?.includes('API')) {
        source = 'DEEPSEEK_API_ERROR'
      }
      
      return generateMockLeads(criteria, model, source)
    }

    // Èxit! Processar leads
    const generationId = `gen-${Date.now()}`
    
    const processedLeads: GeneratedLead[] = result.leads.map((lead: any, index: number) => ({
      id: lead.id || `lead-${generationId}-${index}`,
      companyName: lead.companyName || `Empresa ${index + 1}`,
      sector: lead.sector || criteria.sector,
      location: lead.location || criteria.location || 'Catalunya',
      employees: lead.employees || Math.floor(Math.random() * 100) + 10,
      estimatedRevenue: lead.estimatedRevenue || Math.floor(Math.random() * 500000) + 50000,
      contactName: lead.contactName || '',
      contactEmail: lead.contactEmail || '',
      contactPhone: lead.contactPhone || '',
      score: lead.score || Math.floor(Math.random() * 30) + 70,
      priority: lead.priority || (lead.score >= 85 ? 'HIGH' : lead.score >= 70 ? 'MEDIUM' : 'LOW'),
      reasoning: lead.reasoning || lead.description || 'Lead generat amb IA',
      website: lead.website || '',
      linkedin: lead.linkedin || '',
      description: lead.description || lead.reasoning || 'Lead generat amb DeepSeek'
    }))

    // Guardar a l'historial local
    const generation: Generation = {
      id: generationId,
      sector: criteria.sector,
      location: criteria.location || 'Catalunya',
      quantity: criteria.quantity,
      model: model,
      leadsGenerated: processedLeads.length,
      leadsAccepted: 0,
      createdAt: new Date(),
      status: 'COMPLETED',
    }
    mockGenerations.unshift(generation)

    // Obtenir empreses existents per filtrar duplicats
    const existingNames = await getExistingCompanyNames()
    console.log('📋 Empreses existents a BD:', existingNames.length)

    // Filtrar leads duplicats
    const uniqueLeads: GeneratedLead[] = []
    const duplicateLeads: string[] = []

    for (const lead of processedLeads) {
      const normalizedName = normalizeCompanyName(lead.companyName)

      // Verificar si ja existeix a la BD
      if (existingNames.includes(normalizedName)) {
        duplicateLeads.push(lead.companyName)
        console.log('⚠️ Lead duplicat descartat (BD):', lead.companyName)
        continue
      }

      // Verificar si ja està a la llista actual (duplicat dins la mateixa generació)
      const alreadyInList = uniqueLeads.some(
        existing => normalizeCompanyName(existing.companyName) === normalizedName
      )

      if (alreadyInList) {
        duplicateLeads.push(lead.companyName)
        console.log('⚠️ Lead duplicat descartat (generació):', lead.companyName)
        continue
      }

      uniqueLeads.push(lead)
    }

    console.log('✅ Leads únics després de filtrar:', uniqueLeads.length)
    if (duplicateLeads.length > 0) {
      console.log('⚠️ Leads duplicats descartats:', duplicateLeads.length, duplicateLeads)
    }

    // Actualitzar l'historial local amb les dades finals
    generation.leadsGenerated = uniqueLeads.length

    // Preparar warning si hi ha duplicats
    let warning: string | undefined
    if (duplicateLeads.length > 0) {
      warning = `S'han descartat ${duplicateLeads.length} leads duplicats que ja existeixen a la base de dades.`
    }

    return {
      generationId,
      leads: uniqueLeads,
      source: 'DEEPSEEK_REAL',
      warning,
    }

  } catch (error) {
    console.error('❌ Error cridant DeepSeek:', error)
    return generateMockLeads(criteria, model, 'DEEPSEEK_EXCEPTION')
  }
}

/**
 * Funció de fallback per generar leads mock
 */
function generateMockLeads(
  criteria: GenerationCriteria, 
  model: AIModel,
  source: string = 'MOCK_FALLBACK'
): { generationId: string; leads: GeneratedLead[]; warning?: string; source: string } {
  
  console.log('📦 Generant leads MOCK amb source:', source)
  
  const generationId = `mock-gen-${Date.now()}`

  const sectors: Record<string, string[]> = {
    TECHNOLOGY: ['Tech Solutions', 'Digital Innovations', 'Cloud Systems', 'Data Analytics', 'Software Plus'],
    FINANCE: ['Capital Partners', 'Investment Group', 'Financial Services', 'Asset Management', 'Banking Solutions'],
    RETAIL: ['Retail Express', 'Commerce Hub', 'Shop Networks', 'Retail Dynamics', 'Consumer Brands'],
    MARKETING: ['Creative Agency', 'Brand Solutions', 'Marketing Pro', 'Digital Marketing', 'Growth Partners'],
    CONSTRUCTION: ['BuildCo', 'Construction Plus', 'Urban Developers', 'Infrastructure Group', 'Project Builders'],
    LOGISTICS: ['LogiTech', 'Supply Chain Pro', 'Transport Solutions', 'Freight Masters', 'Distribution Hub'],
    HEALTH: ['HealthTech', 'Medical Solutions', 'Care Plus', 'Wellness Group', 'Digital Health'],
    EDUCATION: ['EduTech', 'Learning Solutions', 'Academy Plus', 'Skills Center', 'Training Hub'],
    HOSPITALITY: ['Hotel Group', 'Restaurant Chain', 'Tourism Plus', 'Hospitality Solutions', 'Event Spaces'],
    CONSULTING: ['Business Advisors', 'Strategy Partners', 'Consulting Pro', 'Advisory Group', 'Management Solutions'],
  }

  const names = [
    'Anna García', 'Joan Martínez', 'Maria López', 'Pere Fernández', 'Laura Sánchez',
    'Marc Soler', 'Núria Puig', 'David Rovira', 'Marta Vila', 'Jordi Serra'
  ]
  
  const sectorCompanies = sectors[criteria.sector] || sectors.TECHNOLOGY

  const leads: GeneratedLead[] = []
  for (let i = 0; i < criteria.quantity; i++) {
    const score = Math.floor(Math.random() * 40) + 60
    const priority = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'LOW'

    leads.push({
      id: `mock-lead-${Date.now()}-${i}`,
      companyName: `${sectorCompanies[i % sectorCompanies.length]} ${criteria.location || 'BCN'}`,
      sector: criteria.sector,
      location: criteria.location || 'Barcelona',
      employees: Math.floor(Math.random() * 200) + 10,
      estimatedRevenue: Math.floor(Math.random() * 500000) + 50000,
      contactName: names[i % names.length],
      contactEmail: `contacte${i}@example.com`,
      contactPhone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      score,
      priority: priority as 'HIGH' | 'MEDIUM' | 'LOW',
      reasoning: `[MOCK] Lead de prova del sector ${criteria.sector}. ${
        score >= 85 ? 'Alta coincidència amb criteris.' :
        score >= 70 ? 'Bona coincidència amb criteris.' :
        'Coincidència parcial amb criteris.'
      }`,
      website: `https://${sectorCompanies[i % sectorCompanies.length].toLowerCase().replace(/\s/g, '')}.com`,
      linkedin: `https://linkedin.com/company/${sectorCompanies[i % sectorCompanies.length].toLowerCase().replace(/\s/g, '')}`,
      description: `[MOCK] Empresa de prova del sector ${criteria.sector}`
    })
  }

  // Guardar a l'historial
  const generation: Generation = {
    id: generationId,
    sector: criteria.sector,
    location: criteria.location || 'Catalunya',
    quantity: criteria.quantity,
    model: model,
    leadsGenerated: leads.length,
    leadsAccepted: 0,
    createdAt: new Date(),
    status: 'COMPLETED',
  }
  mockGenerations.unshift(generation)

  // Generar warning segons la font
  const warnings: Record<string, string> = {
    NO_API_KEY: 'S\'han utilitzat dades de prova. Configura DEEPSEEK_API_KEY al fitxer .env per usar IA real.',
    DEEPSEEK_QUOTA_EXCEEDED: 'Quota de DeepSeek exhaurida. S\'han utilitzat dades de prova. Recarrega el teu compte a platform.deepseek.com',
    DEEPSEEK_API_ERROR: 'Error amb l\'API de DeepSeek. S\'han utilitzat dades de prova. Verifica la teva API Key.',
    DEEPSEEK_EXCEPTION: 'Error inesperat amb DeepSeek. S\'han utilitzat dades de prova.',
    DEEPSEEK_ERROR: 'Error amb DeepSeek. S\'han utilitzat dades de prova.',
    PERMISSION_DENIED: 'No tens permisos per generar leads amb IA.',
    MOCK_FALLBACK: 'Mode desenvolupament: s\'han utilitzat dades de prova.'
  }

  return {
    generationId,
    leads,
    warning: warnings[source] || warnings.MOCK_FALLBACK,
    source,
  }
}

/**
 * Guardar leads seleccionats a la BD
 */
export async function saveGeneratedLeads(
  generationId: string,
  leads: GeneratedLead[],
  userId: string
): Promise<any[]> {
  console.log('💾 ============================================')
  console.log('💾 GUARDANT LEADS A LA BD')
  console.log('💾 ============================================')
  console.log('💾 GenerationId:', generationId)
  console.log('💾 Leads a guardar:', leads.length)
  console.log('💾 UserId:', userId)

  // Verificar permisos
  const permissions = await verifyUserPermissions(userId)
  if (!permissions.authorized) {
    console.error('❌ Permisos denegats:', permissions.error)
    throw new Error(permissions.error || 'No tens permisos')
  }

  console.log('✅ Usuari verificat per guardar:', permissions.user?.email)

  const savedLeads: any[] = []
  
  for (const lead of leads) {
    try {
      console.log('💾 Processant lead:', lead.companyName)

      // Verificar si ja existeix a la BD (doble check de seguretat)
      const exists = await checkLeadExists(lead.companyName, lead.contactEmail)
      if (exists) {
        console.log('⚠️ Lead ja existeix, saltant:', lead.companyName)
        continue
      }

      console.log('💾 Guardant lead:', lead.companyName)

      // Crear lead amb tots els camps disponibles del model CompanyLead
      const savedLead = await prismaClient.companyLead.create({
        data: {
          companyName: lead.companyName,
          sector: lead.sector,
          contactName: lead.contactName || null,
          email: lead.contactEmail || null,
          phone: lead.contactPhone || null,
          website: lead.website || null,
          linkedinProfile: lead.linkedin || null,
          companySize: lead.employees ? String(lead.employees) : null,
          employees: lead.employees || null,
          estimatedValue: lead.estimatedRevenue ? lead.estimatedRevenue : null,
          city: lead.location || null,
          description: lead.description || lead.reasoning || null,
          score: lead.score || null,
          aiScore: lead.score || null,
          priority: lead.priority || 'MEDIUM',
          status: 'NEW',
          source: 'AI_PROSPECTING',
          generationMethod: 'AI_PROSPECTING',
          assignedToId: null,  // Sense assignar per defecte - apareixerà a "per assignar"
          aiInsights: {
            reasoning: lead.reasoning,
            generationId: generationId,
            generatedAt: new Date().toISOString(),
            model: 'deepseek'
          },
          tags: ['IA', 'DeepSeek', lead.sector].filter(Boolean),
          notes: `Generat amb IA (DeepSeek)\nGeneration ID: ${generationId}\nRaonament: ${lead.reasoning || 'N/A'}`
        }
      })
      
      savedLeads.push(savedLead)
      console.log('✅ Lead guardat amb ID:', savedLead.id)
      
    } catch (leadError: any) {
      console.error('❌ Error guardant lead:', lead.companyName)
      console.error('❌ Error detall:', leadError.message)
      // Continuar amb els altres leads
    }
  }

  // Actualitzar comptador a l'historial local
  const generation = mockGenerations.find(g => g.id === generationId)
  if (generation) {
    generation.leadsAccepted = savedLeads.length
  }

  // Serialitzar leads per evitar errors amb Decimal
  const serializedLeads = savedLeads.map(lead => ({
    id: lead.id,
    companyName: lead.companyName,
    sector: lead.sector,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    linkedinProfile: lead.linkedinProfile,
    companySize: lead.companySize,
    employees: lead.employees,
    city: lead.city,
    description: lead.description,
    score: lead.score,
    aiScore: lead.aiScore,
    priority: lead.priority,
    status: lead.status,
    source: lead.source,
    generationMethod: lead.generationMethod,
    assignedToId: lead.assignedToId,
    tags: lead.tags,
    notes: lead.notes,
    // Convertir Decimals a numbers
    estimatedValue: lead.estimatedValue ? Number(lead.estimatedValue) : null,
    estimatedRevenue: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : null,
    // Convertir Dates a strings ISO
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }))

  const skippedCount = leads.length - savedLeads.length

  console.log('💾 ============================================')
  console.log('💾 TOTAL LEADS GUARDATS:', serializedLeads.length)
  if (skippedCount > 0) {
    console.log('⚠️ LEADS SALTATS (duplicats):', skippedCount)
  }
  console.log('💾 ============================================')

  return serializedLeads
}

/**
 * Obtenir dades per al gràfic de rendiment
 */
export async function getGenerationPerformance(userId: string) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const leads = await prismaClient.companyLead.findMany({
      where: {
        source: 'AI_PROSPECTING',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        status: true
      }
    })

    // Agrupar per setmana
    const weeks: Record<string, { generated: number; accepted: number }> = {}
    
    leads.forEach(lead => {
      const weekStart = new Date(lead.createdAt)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { generated: 0, accepted: 0 }
      }
      weeks[weekKey].generated++
      if (lead.status !== 'NEW') {
        weeks[weekKey].accepted++
      }
    })

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      generated: data.generated,
      accepted: data.accepted
    }))

  } catch (error) {
    console.error('Error obtenint rendiment:', error)
    
    const today = new Date()
    const weeks = []

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - i * 7)
      weeks.push({
        week: weekStart.toISOString().split('T')[0],
        generated: Math.floor(Math.random() * 20) + 10,
        accepted: Math.floor(Math.random() * 15) + 5,
      })
    }

    return weeks
  }
}

/**
 * Repetir una generació anterior
 */
export async function repeatGeneration(generationId: string, userId: string) {
  const original = mockGenerations.find(g => g.id === generationId)

  if (!original) {
    throw new Error('Generació no trobada')
  }

  const criteria: GenerationCriteria = {
    sector: original.sector,
    location: original.location,
    quantity: original.quantity,
    companySize: '11-50',
  }

  return generateLeadsWithAI(criteria, original.model as AIModel, userId)
}