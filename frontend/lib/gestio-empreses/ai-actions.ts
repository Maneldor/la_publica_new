// lib/gestio-empreses/ai-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// Tipus per generació de leads
interface LeadGenerationParams {
  sector: string
  location?: string
  employeeRange?: string
  keywords?: string
  count: number
}

interface GeneratedLead {
  companyName: string
  sector: string
  website?: string
  location?: string
  employeeCount?: string
  contactName?: string
  contactEmail?: string
  contactPosition?: string
  aiScore: number
  aiInsights: string
}

// Tipus per qualificació
interface LeadQualification {
  score: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  insights: string[]
  recommendations: string[]
  risks: string[]
}

// Verificar accés
async function verifyAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }
  return session.user
}

// GENERACIÓ DE LEADS AMB IA
export async function generateLeadsWithAI(params: LeadGenerationParams): Promise<{
  success: boolean
  leads?: GeneratedLead[]
  error?: string
}> {
  try {
    const user = await verifyAccess()

    // Aquí s'integraria amb el sistema d'IA existent
    // Per ara, simulem la generació amb dades estructurades

    const prompt = `
      Genera ${params.count} leads d'empreses del sector ${params.sector}
      ${params.location ? `a la ubicació: ${params.location}` : ''}
      ${params.employeeRange ? `amb ${params.employeeRange} empleats` : ''}
      ${params.keywords ? `relacionades amb: ${params.keywords}` : ''}

      Per cada lead, proporciona:
      - Nom de l'empresa
      - Sector específic
      - Web (si es pot deduir)
      - Ubicació
      - Nombre aproximat d'empleats
      - Nom d'un possible contacte
      - Càrrec del contacte
      - Puntuació de qualitat (0-100)
      - Insights sobre l'empresa
    `

    // TODO: Integrar amb providers reals (Claude, OpenAI, Gemini)
    // Per ara retornem dades de mostra estructurades
    const mockLeads: GeneratedLead[] = [
      {
        companyName: `${params.sector} Solutions SL`,
        sector: params.sector,
        website: `https://www.${params.sector.toLowerCase().replace(' ', '')}solutions.com`,
        location: params.location || 'Barcelona',
        employeeCount: params.employeeRange || '25-50',
        contactName: 'Maria García',
        contactEmail: 'maria@example.com',
        contactPosition: 'Directora Comercial',
        aiScore: 85,
        aiInsights: 'Empresa en creixement amb alta probabilitat de necessitar serveis. Sector en expansió.',
      },
      {
        companyName: `Grup ${params.sector} Catalunya`,
        sector: params.sector,
        website: `https://www.grup${params.sector.toLowerCase()}.cat`,
        location: params.location || 'Girona',
        employeeCount: params.employeeRange || '50-100',
        contactName: 'Joan Martínez',
        contactEmail: 'joan@example.com',
        contactPosition: 'CEO',
        aiScore: 78,
        aiInsights: 'Empresa consolidada buscant innovació. Bon potencial per serveis premium.',
      },
    ]

    return { success: true, leads: mockLeads.slice(0, params.count) }

  } catch (error) {
    console.error('Error generating leads:', error)
    return { success: false, error: 'Error generant leads amb IA' }
  }
}

// GUARDAR LEADS GENERATS
export async function saveGeneratedLeads(leads: GeneratedLead[]): Promise<{
  success: boolean
  savedCount?: number
  error?: string
}> {
  try {
    const user = await verifyAccess()

    let savedCount = 0

    for (const lead of leads) {
      await prismaClient.companyLead.create({
        data: {
          companyName: lead.companyName,
          website: lead.website,
          address: lead.location,
          employeeCount: lead.employeeCount,
          contactName: lead.contactName,
          contactEmail: lead.contactEmail,
          contactPosition: lead.contactPosition,
          source: 'AI_PROSPECTING',
          status: 'NEW',
          priority: lead.aiScore >= 80 ? 'HIGH' : lead.aiScore >= 60 ? 'MEDIUM' : 'LOW',
          score: lead.aiScore,
          notes: lead.aiInsights,
          assignedToId: user.id,
          createdById: user.id,
        },
      })
      savedCount++
    }

    revalidatePath('/gestio/leads')
    revalidatePath('/gestio/leads/ia')

    return { success: true, savedCount }

  } catch (error) {
    console.error('Error saving leads:', error)
    return { success: false, error: 'Error guardant leads' }
  }
}

// QUALIFICAR LEAD EXISTENT
export async function qualifyLeadWithAI(leadId: string): Promise<{
  success: boolean
  qualification?: LeadQualification
  error?: string
}> {
  try {
    await verifyAccess()

    // Obtenir dades del lead
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      include: {
        interactions: true,
        activities: true,
      },
    })

    if (!lead) {
      return { success: false, error: 'Lead no trobat' }
    }

    // TODO: Integrar amb IA real
    // Per ara, calculem una qualificació basada en dades existents

    let score = 50 // Base
    const insights: string[] = []
    const recommendations: string[] = []
    const risks: string[] = []

    // Factors positius
    if (lead.estimatedRevenue && lead.estimatedRevenue > 10000) {
      score += 15
      insights.push('Valor estimat alt indica oportunitat significativa')
    }
    if (lead.contactEmail && lead.contactPhone) {
      score += 10
      insights.push('Dades de contacte completes faciliten el seguiment')
    }
    if (lead.website) {
      score += 5
      insights.push('Presència web indica empresa establerta')
    }
    if (lead.interactions && lead.interactions.length > 0) {
      score += 10
      insights.push(`${lead.interactions.length} interaccions registrades mostren interès`)
    }

    // Factors de risc
    if (!lead.contactName) {
      score -= 10
      risks.push('Falta contacte directe - dificulta la comunicació')
    }
    if (lead.status === 'NEW' && lead.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      risks.push('Lead sense contactar durant més d\'una setmana')
    }

    // Recomanacions
    if (!lead.contactPhone) {
      recommendations.push('Obtenir número de telèfon per contacte directe')
    }
    if (lead.priority === 'LOW' && score >= 70) {
      recommendations.push('Considerar augmentar la prioritat basant-se en la qualificació')
    }
    if (!lead.estimatedRevenue) {
      recommendations.push('Estimar valor potencial del contracte')
    }
    recommendations.push('Programar seguiment en les pròximes 48h')

    // Limitar score entre 0 i 100
    score = Math.max(0, Math.min(100, score))

    const priority = score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW'

    // Actualitzar lead amb la qualificació
    await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        score: score,
        notes: insights.join(' | '),
        priority: priority,
      },
    })

    revalidatePath(`/gestio/leads/${leadId}`)
    revalidatePath('/gestio/leads')

    return {
      success: true,
      qualification: {
        score,
        priority,
        insights,
        recommendations,
        risks,
      },
    }

  } catch (error) {
    console.error('Error qualifying lead:', error)
    return { success: false, error: 'Error qualificant lead' }
  }
}

// QUALIFICAR MÚLTIPLES LEADS
export async function qualifyMultipleLeads(leadIds: string[]): Promise<{
  success: boolean
  qualifiedCount?: number
  error?: string
}> {
  try {
    await verifyAccess()

    let qualifiedCount = 0

    for (const leadId of leadIds) {
      const result = await qualifyLeadWithAI(leadId)
      if (result.success) {
        qualifiedCount++
      }
    }

    revalidatePath('/gestio/leads')

    return { success: true, qualifiedCount }

  } catch (error) {
    console.error('Error qualifying leads:', error)
    return { success: false, error: 'Error qualificant leads' }
  }
}

// OBTENIR LEADS PENDENTS DE QUALIFICACIÓ
export async function getLeadsPendingQualification(userId: string, isSupervisor: boolean): Promise<any[]> {
  const whereClause = isSupervisor
    ? { score: null }
    : { assignedToId: userId, score: null }

  return prismaClient.companyLead.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

// OBTENIR ESTADÍSTIQUES IA
export async function getAIStats(userId: string, isSupervisor: boolean): Promise<{
  totalGenerated: number
  totalQualified: number
  avgScore: number
  highPriority: number
}> {
  const whereClause = isSupervisor ? {} : { assignedToId: userId }

  const [generated, qualified, scores] = await Promise.all([
    prismaClient.companyLead.count({
      where: { ...whereClause, source: 'AI_PROSPECTING' },
    }),
    prismaClient.companyLead.count({
      where: { ...whereClause, score: { not: null } },
    }),
    prismaClient.companyLead.aggregate({
      where: { ...whereClause, score: { not: null } },
      _avg: { score: true },
    }),
  ])

  const highPriority = await prismaClient.companyLead.count({
    where: { ...whereClause, score: { gte: 75 } },
  })

  return {
    totalGenerated: generated,
    totalQualified: qualified,
    avgScore: Math.round(scores._avg.score || 0),
    highPriority,
  }
}