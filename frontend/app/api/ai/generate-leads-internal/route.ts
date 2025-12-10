import { NextResponse } from 'next/server'
import { generateLeadsWithDeepSeek } from '@/lib/ai/deepseek-client'
import { prismaClient } from '@/lib/prisma'

interface GenerationCriteria {
  sector: string
  location: string
  quantity: number
  companySize: string
  userId: string // Requiem userId directament
}

interface GeneratedLead {
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
  website: string
  linkedin: string
  description: string
}

// Helper functions per gestió de proveïdors
function getProviderFromModel(model: string): string {
  if (!model) return 'openai'

  const modelLower = model.toLowerCase()

  if (modelLower.includes('deepseek')) return 'deepseek'
  if (modelLower.includes('claude')) return 'anthropic'
  if (modelLower.includes('gemini')) return 'gemini'

  // Default to OpenAI
  return 'openai'
}

function getApiKeyForProvider(provider: string): string | undefined {
  switch (provider) {
    case 'deepseek':
      return process.env.DEEPSEEK_API_KEY
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY
    case 'gemini':
      return process.env.GEMINI_API_KEY
    case 'openai':
    default:
      return process.env.OPENAI_API_KEY
  }
}

function isDefaultApiKey(apiKey: string | undefined, provider: string): boolean {
  if (!apiKey) return true

  const defaultKeys = {
    openai: 'sk-your-openai-api-key-here',
    deepseek: 'sk-your-deepseek-api-key-here',
    anthropic: 'sk-ant-your-anthropic-api-key-here',
    gemini: 'your-gemini-api-key-here'
  }

  return apiKey === defaultKeys[provider as keyof typeof defaultKeys]
}

export async function POST(req: Request) {
  console.log('=== API /api/ai/generate-leads-internal called ===')
  console.log('🔧 DEBUG: Environment check:')
  console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...` : 'NOT SET')

  try {
    const { criteria, model, userId } = await req.json()
    console.log('🆔 User ID received:', userId)
    console.log('Generation criteria:', criteria)
    console.log('Model selected:', model)

    // Verificar que l'usuari existeix i té permisos
    if (!userId) {
      console.log('❌ INTERNAL: No userId provided')
      return NextResponse.json({ error: 'No s\'ha proporcionat ID d\'usuari' }, { status: 400 })
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, isActive: true }
    })

    if (!user) {
      console.log('❌ INTERNAL: User not found:', userId)
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    if (!user.isActive) {
      console.log('❌ INTERNAL: User not active:', userId)
      return NextResponse.json({ error: 'Usuari inactiu' }, { status: 403 })
    }

    // Verificar permisos (rols que poden generar IA)
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE']
    if (!allowedRoles.includes(user.role)) {
      console.log('❌ INTERNAL: User role not allowed:', user.role)
      return NextResponse.json({ error: 'No tens permisos per generar leads IA' }, { status: 403 })
    }

    console.log('✅ INTERNAL: Valid user found:', user.email, 'Role:', user.role)

    // Detectar proveïdor per model
    const provider = getProviderFromModel(model)
    console.log('🤖 Provider detected:', provider)

    // Verificar clau API segons el proveïdor
    const apiKey = getApiKeyForProvider(provider)
    console.log(`🔑 ${provider} API Key status:`, {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || 'none',
      isDefault: isDefaultApiKey(apiKey, provider)
    })

    if (!apiKey || isDefaultApiKey(apiKey, provider)) {
      console.log(`❌ Using mock data - no real ${provider} API key configured`)
      return generateMockLeads({ ...criteria, userId })
    }

    console.log(`✅ Using real ${provider} API for lead generation`)

    // Generar leads reals amb el proveïdor seleccionat
    const generationId = `gen-${Date.now()}`

    // Generar leads segons el proveïdor
    let leadResult

    // Cridar al proveïdor corresponent
    switch (provider) {
      case 'deepseek':
        console.log('🤖 [DEEPSEEK] Calling generateLeadsWithDeepSeek...')
        leadResult = await generateLeadsWithDeepSeek(apiKey, {
          sector: criteria.sector,
          location: criteria.location,
          quantity: criteria.quantity,
          companySize: criteria.companySize,
          keywords: criteria.keywords || ''
        }, model as 'deepseek-chat' | 'deepseek-reasoner')
        console.log('🤖 [DEEPSEEK] Result:', { success: leadResult.success, leadsCount: leadResult.leads?.length, error: leadResult.error })
        break

      case 'gemini':
        // Placeholder per a futura implementació de Gemini
        leadResult = { success: false, error: 'Gemini no implementat encara' }
        break

      case 'openai':
      default:
        // Fallback a mock si OpenAI no està configurat
        leadResult = { success: false, error: 'OpenAI no implementat en aquesta API interna' }
        break
    }

    // Verificar el resultat
    if (!leadResult.success) {
      console.log(`❌ Error amb ${provider}: ${leadResult.error}`)

      // Si és DeepSeek i falla per quota, usar mock amb missatge específic
      if (provider === 'deepseek' && leadResult.error?.includes('cuota')) {
        return generateMockLeads({ ...criteria, userId, source: 'DEEPSEEK_QUOTA_EXCEEDED' })
      }

      // Fallback general
      return generateMockLeads({ ...criteria, userId, source: 'API_ERROR' })
    }

    console.log(`✅ Generated ${leadResult.leads?.length || 0} leads successfully with ${provider}`)

    return NextResponse.json({
      generationId,
      leads: leadResult.leads,
      model: model,
      source: `${provider.toUpperCase()}_REAL`,
      usage: leadResult.usage,  // DeepSeek proporciona informació d'ús
      warning: leadResult.warning || undefined
    })

  } catch (error) {
    console.error('Error generating AI leads (internal):', error)

    // Fallback a dades mock si hi ha error
    console.log('Falling back to mock data due to error')
    const fallbackCriteria = typeof req.body === 'object' ? req.body.criteria : { quantity: 5 }
    return generateMockLeads({ ...fallbackCriteria, userId: 'unknown' })
  }
}

// Funció per obtenir missatge de warning segons la font
function getWarningMessage(source: string): string {
  switch (source) {
    case 'QUOTA_EXCEEDED':
      return 'S\'han utilitzat dades mock degut a cuota insuficient d\'OpenAI. Recarga el compte per usar IA real.'
    case 'DEEPSEEK_QUOTA_EXCEEDED':
      return 'S\'han utilitzat dades mock degut a cuota insuficient de DeepSeek. Recarga el compte per usar IA ultra-econòmica.'
    case 'API_ERROR':
      return 'S\'han utilitzat dades mock degut a un error de l\'API d\'IA. Verifica la configuració.'
    default:
      return 'Usant dades mock per desenvolupament.'
  }
}

// Funció de fallback amb dades mock
function generateMockLeads(criteria: any) {
  const generationId = `mock-gen-${Date.now()}`

  const mockLeads: GeneratedLead[] = Array.from({ length: criteria.quantity || 5 }, (_, i) => ({
    id: `mock-lead-${Date.now()}-${i}`,
    companyName: `Empresa Mock ${i + 1} ${criteria.location || 'BCN'}`,
    sector: criteria.sector || 'TECHNOLOGY',
    location: criteria.location || 'Barcelona',
    employees: Math.floor(Math.random() * 200) + 10,
    estimatedRevenue: Math.floor(Math.random() * 500000) + 50000,
    contactName: `Contacte Mock ${i + 1}`,
    contactEmail: `mock${i}@example.com`,
    contactPhone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    score: Math.floor(Math.random() * 40) + 60,
    priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as 'HIGH' | 'MEDIUM' | 'LOW',
    reasoning: `Lead mock generat per a testing del sector ${criteria.sector}. Coincideix amb tots els criteris de recerca.`,
    website: `https://mock${i}.example.com`,
    linkedin: `https://linkedin.com/company/mock${i}`,
    description: `Empresa mock del sector ${criteria.sector} per a desenvolupament`
  }))

  const source = criteria.source || 'MOCK_FALLBACK'

  return NextResponse.json({
    generationId,
    leads: mockLeads,
    model: 'MOCK',
    source: source,
    warning: getWarningMessage(source)
  })
}