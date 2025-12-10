import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateLeadsWithDeepSeek } from '@/lib/ai/deepseek-client'

interface GenerationCriteria {
  sector: string
  location: string
  quantity: number
  companySize: string
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

// Funció per generar leads amb OpenAI (compatible amb lògica antiga)
async function generateLeadsWithOpenAI(apiKey: string, criteria: any, model: string) {
  try {
    const prompt = `
Genera ${criteria.quantity} leads reals d'empreses del sector ${criteria.sector} ubicades a ${criteria.location}, España.

Per cada empresa proporciona:
- Nom de l'empresa (real i creïble)
- Sector específic
- Ubicació exacta
- Número d'empleats (entre 10-500)
- Ingressos estimats anuals en euros
- Nom del contacte (directiu o CEO)
- Email corporatiu
- Telèfon corporatiu espanyol
- Lloc web
- Perfil LinkedIn de l'empresa
- Descripció breu del negoci
- Puntuació de qualitat (0-100) basada en potencial comercial
- Prioritat (HIGH/MEDIUM/LOW)
- Raonament de per què és un bon lead

Format de resposta en JSON:
{
  "leads": [
    {
      "companyName": "string",
      "sector": "string",
      "location": "string",
      "employees": number,
      "estimatedRevenue": number,
      "contactName": "string",
      "contactEmail": "string",
      "contactPhone": "string",
      "website": "string",
      "linkedin": "string",
      "description": "string",
      "score": number,
      "priority": "HIGH|MEDIUM|LOW",
      "reasoning": "string"
    }
  ]
}

Important: Les empreses han de ser realistes i creïbles per al sector ${criteria.sector} a ${criteria.location}.
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model === 'GPT4_TURBO' ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ets un expert en generació de leads B2B per empreses espanyoles. Proporciona dades realistes i creïbles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)

      if (response.status === 429 && errorData?.error?.code === 'insufficient_quota') {
        return { success: false, error: 'Cuota de OpenAI excedida' }
      }

      return { success: false, error: `OpenAI API error: ${response.status}` }
    }

    const data = await response.json()
    const aiContent = data.choices[0]?.message?.content

    if (!aiContent) {
      return { success: false, error: 'No content received from OpenAI' }
    }

    // Parsejar resposta JSON
    let parsedLeads
    try {
      const cleanContent = aiContent.replace(/```json\n?|\n?```/g, '').trim()
      parsedLeads = JSON.parse(cleanContent)
    } catch (error) {
      return { success: false, error: 'Error parseant la resposta de l\'IA' }
    }

    // Transformar i validar leads
    const leads = parsedLeads.leads.map((lead: any, index: number) => ({
      id: `openai-lead-${Date.now()}-${index}`,
      companyName: lead.companyName || `Empresa ${index + 1}`,
      sector: lead.sector || criteria.sector,
      location: lead.location || criteria.location,
      employees: lead.employees || 50,
      estimatedRevenue: lead.estimatedRevenue || 100000,
      contactName: lead.contactName || 'Contacte Desconegut',
      contactEmail: lead.contactEmail || `contacte${index}@empresa.com`,
      contactPhone: lead.contactPhone || '+34 900 000 000',
      score: lead.score || 75,
      priority: lead.priority || 'MEDIUM',
      reasoning: lead.reasoning || 'Lead generat per OpenAI',
      website: lead.website || `https://empresa${index}.com`,
      linkedin: lead.linkedin || `https://linkedin.com/company/empresa${index}`,
      description: lead.description || 'Empresa generada per IA'
    }))

    return { success: true, leads, usage: data.usage }
  } catch (error) {
    console.error('Error en generateLeadsWithOpenAI:', error)
    return { success: false, error: 'Error de connexió amb OpenAI' }
  }
}

export async function POST(req: Request) {
  console.log('=== API /api/ai/generate-leads called ===')
  console.log('🔧 DEBUG: Environment check:')
  console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...` : 'NOT SET')
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET')

  // DEBUG: Headers i cookies
  console.log('🍪 DEBUG: Headers:', {
    'user-agent': req.headers.get('user-agent')?.substring(0, 50),
    'cookie': req.headers.get('cookie') ? 'Present' : 'Missing',
    'authorization': req.headers.get('authorization') ? 'Present' : 'Missing',
    'content-type': req.headers.get('content-type')
  })

  try {
    const session = await getServerSession(authOptions)
    console.log('🔐 DEBUG: Session status:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email || 'No email',
      userRole: session?.user?.role || 'No role',
      sessionExpires: session?.expires || 'No expiration'
    })

    if (!session?.user) {
      console.log('❌ SESSION: No session or user found')
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    console.log('✅ SESSION: Valid session found for', session.user.email)

    const { criteria, model } = await req.json()
    console.log('Generation criteria:', criteria)
    console.log('Model selected:', model)

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
      return generateMockLeads(criteria)
    }

    console.log(`✅ Using real ${provider} API for lead generation`)

    // Generar leads reals amb el proveïdor seleccionat
    const generationId = `gen-${Date.now()}`

    // Generar leads segons el proveïdor
    let leadResult

    // Cridar al proveïdor corresponent
    switch (provider) {
      case 'deepseek':
        leadResult = await generateLeadsWithDeepSeek(apiKey, {
          sector: criteria.sector,
          location: criteria.location,
          quantity: criteria.quantity,
          companySize: criteria.companySize,
          keywords: criteria.keywords || ''
        }, model as 'deepseek-chat' | 'deepseek-reasoner')
        break

      case 'gemini':
        // Placeholder per a futura implementació de Gemini
        leadResult = { success: false, error: 'Gemini no implementat encara' }
        break

      case 'openai':
      default:
        // Fallback a OpenAI si encara està configurat
        leadResult = await generateLeadsWithOpenAI(apiKey, criteria, model)
        break
    }

    // Verificar el resultat
    if (!leadResult.success) {
      console.log(`❌ Error amb ${provider}: ${leadResult.error}`)

      // Si és DeepSeek i falla per quota, usar mock amb missatge específic
      if (provider === 'deepseek' && leadResult.error?.includes('cuota')) {
        return generateMockLeads({ ...criteria, source: 'DEEPSEEK_QUOTA_EXCEEDED' })
      }

      // Fallback general
      return generateMockLeads({ ...criteria, source: 'API_ERROR' })
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
    console.error('Error generating AI leads:', error)

    // Fallback a dades mock si hi ha error
    console.log('Falling back to mock data due to error')
    return generateMockLeads(req.body || { criteria: { quantity: 5 } })
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
    reasoning: `Lead mock generat per a testing del sector ${criteria.sector}`,
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