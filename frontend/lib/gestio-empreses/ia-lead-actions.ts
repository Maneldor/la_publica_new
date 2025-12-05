// lib/gestio-empreses/ia-lead-actions.ts
'use server'

export type AIModel = 'claude' | 'gpt4' | 'gemini'

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

// Mock data
let mockGenerations: Generation[] = []

/**
 * Obtenir estadístiques de generació IA (REAL)
 */
export async function getIALeadStats(userId: string) {
  try {
    const response = await fetch('/api/ai/credits')

    if (!response.ok) {
      throw new Error('Error obtenint estadístiques')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error obtenint estadístiques IA:', error)

    // Fallback a dades mock si hi ha error
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
  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 100))

  return mockGenerations.slice(0, limit)
}

/**
 * Generar leads amb IA (REAL)
 */
export async function generateLeadsWithAI(
  criteria: GenerationCriteria,
  model: AIModel,
  userId: string
): Promise<{ generationId: string; leads: GeneratedLead[] }> {
  try {
    console.log('Cridant API real de generació IA...', { criteria, model })

    const response = await fetch('/api/ai/generate-leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ criteria, model, userId }),
    })

    if (!response.ok) {
      throw new Error('Error en la resposta de l\'API de generació')
    }

    const data = await response.json()
    console.log('Resposta rebuda de l\'API:', data)

    // Afegir camp description si no existeix
    const leadsWithDescription = data.leads.map((lead: any) => ({
      ...lead,
      description: lead.description || lead.reasoning || 'Lead generat per IA'
    }))

    // Guardar generació a l'historial mock (per compatibilitat)
    const generation: Generation = {
      id: data.generationId,
      sector: criteria.sector,
      location: criteria.location || 'Catalunya',
      quantity: criteria.quantity,
      model: model,
      leadsGenerated: leadsWithDescription.length,
      leadsAccepted: 0,
      createdAt: new Date(),
      status: 'COMPLETED',
    }
    mockGenerations.unshift(generation)

    return {
      generationId: data.generationId,
      leads: leadsWithDescription,
    }
  } catch (error) {
    console.error('Error generant leads amb IA real:', error)

    // Fallback a generació mock si hi ha error
    console.log('Utilitzant fallback mock...')
    return generateMockLeads(criteria, model)
  }
}

/**
 * Funció de fallback per generar leads mock
 */
function generateMockLeads(criteria: GenerationCriteria, model: AIModel) {
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

  const names = ['Anna García', 'Joan Martínez', 'Maria López', 'Pere Fernández', 'Laura Sánchez',
                  'Marc Soler', 'Núria Puig', 'David Rovira', 'Marta Vila', 'Jordi Serra']
  const sectorCompanies = sectors[criteria.sector] || sectors.TECHNOLOGY

  const leads: GeneratedLead[] = []
  for (let i = 0; i < criteria.quantity; i++) {
    const score = Math.floor(Math.random() * 40) + 60 // 60-100
    const priority = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'LOW'

    leads.push({
      id: `mock-lead-${Date.now()}-${i}`,
      companyName: `${sectorCompanies[i % sectorCompanies.length]} ${criteria.location || 'BCN'}`,
      sector: criteria.sector,
      location: criteria.location || 'Barcelona',
      employees: Math.floor(Math.random() * 200) + 10,
      estimatedRevenue: Math.floor(Math.random() * 500000) + 50000,
      contactName: names[i % names.length],
      contactEmail: `mock${i}@example.com`,
      contactPhone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      score,
      priority: priority as 'HIGH' | 'MEDIUM' | 'LOW',
      reasoning: `Lead mock per testing del sector ${criteria.sector}. ${
        score >= 85 ? 'Coincideix amb tots els criteris de recerca.' :
        score >= 70 ? 'Bon encaix amb els criteris principals.' :
        'Encaix parcial amb els criteris.'
      }`,
      website: `https://${sectorCompanies[i % sectorCompanies.length].toLowerCase().replace(/\s/g, '')}.com`,
      linkedin: `https://linkedin.com/company/${sectorCompanies[i % sectorCompanies.length].toLowerCase().replace(/\s/g, '')}`,
      description: `Empresa mock del sector ${criteria.sector} per a desenvolupament`
    })
  }

  // Guardar generació a l'historial mock
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

  return {
    generationId,
    leads,
  }
}

/**
 * Guardar leads seleccionats
 */
export async function saveGeneratedLeads(
  generationId: string,
  leads: GeneratedLead[],
  userId: string
) {
  try {
    const response = await fetch('/api/leads/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ generationId, leads }),
    })

    if (!response.ok) {
      throw new Error('Error guardant els leads')
    }

    const result = await response.json()

    // Actualitzar comptador de leads acceptats en la generació mock (per compatibilitat)
    const generation = mockGenerations.find(g => g.id === generationId)
    if (generation) {
      generation.leadsAccepted = leads.length
    }

    return result.leads
  } catch (error) {
    console.error('Error guardant leads:', error)
    throw error
  }
}

/**
 * Obtenir dades per al gràfic de rendiment
 */
export async function getGenerationPerformance(userId: string) {
  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Dades mock per al gràfic
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

/**
 * Repetir una generació anterior
 */
export async function repeatGeneration(generationId: string, userId: string) {
  // Trobar la generació original
  const original = mockGenerations.find(g => g.id === generationId)

  if (!original) {
    throw new Error('Generació no trobada')
  }

  // Simular criteris de la generació original
  const criteria: GenerationCriteria = {
    sector: original.sector,
    location: original.location,
    quantity: original.quantity,
    companySize: '11-50',
  }

  return generateLeadsWithAI(criteria, original.model as AIModel, userId)
}