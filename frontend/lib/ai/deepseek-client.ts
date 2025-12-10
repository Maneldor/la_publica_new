// lib/ai/deepseek-client.ts

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekOptions {
  model?: 'deepseek-chat' | 'deepseek-reasoner'
  temperature?: number
  maxTokens?: number
}

export interface DeepSeekResponse {
  success: boolean
  content?: string
  error?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Client per interactuar amb l'API de DeepSeek
 */
export async function callDeepSeek(
  apiKey: string,
  messages: DeepSeekMessage[],
  options: DeepSeekOptions = {}
): Promise<DeepSeekResponse> {
  const {
    model = 'deepseek-chat',
    temperature = 0.7,
    maxTokens = 4000
  } = options

  try {
    console.log('🤖 [DEEPSEEK] Calling API with:', {
      model,
      temperature,
      maxTokens,
      messagesCount: messages.length,
      apiKeyStart: apiKey.substring(0, 10) + '...'
    })

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    })

    console.log('🤖 [DEEPSEEK] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      if (response.status === 429 && errorData?.error?.code === 'insufficient_quota') {
        return { success: false, error: 'Cuota de DeepSeek excedida. Recarga la cuenta per continuar.' }
      }

      return {
        success: false,
        error: errorData?.error?.message || `Error API DeepSeek: ${response.status}`
      }
    }

    const data = await response.json()

    return {
      success: true,
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
    }
  } catch (error) {
    console.error('Error comunicant amb DeepSeek:', error)
    return {
      success: false,
      error: 'Error de connexió amb DeepSeek'
    }
  }
}

/**
 * Generar leads d'empreses amb DeepSeek
 */
export async function generateLeadsWithDeepSeek(
  apiKey: string,
  criteria: {
    sector: string
    location?: string
    quantity: number
    companySize?: string
    keywords?: string
    excludeCompanies?: string[]
  },
  model: 'deepseek-chat' | 'deepseek-reasoner' = 'deepseek-chat'
): Promise<{
  success: boolean
  leads?: any[]
  error?: string
  usage?: any
}> {
  // Construir llista d'exclusions si existeix
  const exclusionList = criteria.excludeCompanies && criteria.excludeCompanies.length > 0
    ? `\n\nIMPORTANT - NO INCLOURE AQUESTES EMPRESES (ja les tenim a la base de dades):\n${criteria.excludeCompanies.slice(0, 50).join('\n')}\n\nGenera empreses DIFERENTS a les llistades.`
    : ''

  const systemPrompt = `Ets un assistent expert en generació de leads B2B per a una plataforma de serveis per a empleats públics a Catalunya.

La teva tasca és generar leads d'empreses REALS i VERIFICABLES del sector especificat.

REGLES IMPORTANTS:
1. Les empreses han de ser REALS i existir actualment
2. Els noms han de ser empreses catalanes o amb presència a Catalunya
3. Les dades de contacte han de ser plausibles (no inventar emails genèrics)
4. Cada empresa ha de ser ÚNICA (no repetir)
5. Prioritza empreses mitjanes i grans (més de 20 empleats)
${exclusionList}

Per cada lead, proporciona en format JSON:
{
  "companyName": "Nom legal complet de l'empresa",
  "sector": "Sector (TECHNOLOGY, FINANCE, HEALTH, EDUCATION, RETAIL, HOSPITALITY, SERVICES, LOGISTICS, CONSTRUCTION, MARKETING, CONSULTING)",
  "location": "Ciutat principal",
  "employees": número estimat d'empleats,
  "estimatedRevenue": número estimat de facturació anual en euros,
  "contactName": "Nom del contacte (càrrec directiu)",
  "contactEmail": "Email professional real o plausible",
  "contactPhone": "Telèfon amb format +34 XXX XXX XXX",
  "website": "URL del web corporatiu",
  "linkedin": "URL del perfil de LinkedIn de l'empresa",
  "score": número de 60 a 100 indicant qualitat del lead,
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "Explicació de per què és un bon lead per a serveis d'empleats públics",
  "description": "Breu descripció de l'activitat de l'empresa"
}

Retorna NOMÉS un array JSON vàlid amb els leads. Sense explicacions addicionals, sense markdown, sense backticks.`

  const userPrompt = `Genera ${criteria.quantity} leads d'empreses del sector ${criteria.sector}${criteria.location ? ` a ${criteria.location}` : ' a Catalunya'}.
${criteria.companySize ? `Mida empresarial: ${criteria.companySize}.` : ''}
${criteria.keywords ? `Paraules clau: ${criteria.keywords}.` : ''}

Focus: Empreses que puguin necessitar serveis per als seus empleats (beneficis, formació, benestar, etc.)`

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  const result = await callDeepSeek(apiKey, messages, {
    model: model,
    temperature: model === 'deepseek-reasoner' ? 0.7 : 0.3,  // Més creativitat pel reasoner
    maxTokens: model === 'deepseek-reasoner' ? 12000 : 8000  // Més tokens pel reasoner
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  try {
    // Parsejar JSON de la resposta
    const content = result.content || ''

    // Buscar l'objecte JSON a la resposta
    let jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      // Intentar trobar només l'array de leads
      jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const leads = JSON.parse(jsonMatch[0])
        return {
          success: true,
          leads,
          usage: result.usage
        }
      } else {
        return {
          success: false,
          error: 'No s\'ha pogut parsejar la resposta JSON de DeepSeek'
        }
      }
    }

    const parsedData = JSON.parse(jsonMatch[0])
    const leads = parsedData.leads || parsedData

    // Validar que tenim leads vàlids
    if (!Array.isArray(leads) || leads.length === 0) {
      return {
        success: false,
        error: 'DeepSeek no ha retornat leads vàlids'
      }
    }

    // Assignar IDs únics als leads
    const leadsWithIds = leads.map((lead, index) => ({
      ...lead,
      id: `deepseek-${Date.now()}-${index}`,
      // Assegurar camps obligatoris
      companyName: lead.companyName || `Empresa ${index + 1}`,
      sector: lead.sector || criteria.sector,
      location: lead.location || criteria.location || 'Catalunya',
      employees: lead.employees || 50,
      estimatedRevenue: lead.estimatedRevenue || 100000,
      contactName: lead.contactName || 'Contacte Desconegut',
      contactEmail: lead.contactEmail || `contacte${index}@empresa.cat`,
      contactPhone: lead.contactPhone || '+34 600 000 000',
      score: Math.min(Math.max(lead.score || 75, 60), 95),
      priority: lead.priority || 'MEDIUM',
      reasoning: lead.reasoning || 'Lead generat per DeepSeek IA',
      website: lead.website || `https://empresa${index}.cat`,
      linkedin: lead.linkedin || `https://linkedin.com/company/empresa${index}`,
      description: lead.description || 'Empresa generada per IA'
    }))

    return {
      success: true,
      leads: leadsWithIds,
      usage: result.usage
    }
  } catch (error) {
    console.error('Error parsejant resposta de DeepSeek:', error)
    return {
      success: false,
      error: 'Error parsejant la resposta JSON de DeepSeek'
    }
  }
}

/**
 * Constants per a DeepSeek
 */
export const DEEPSEEK_MODELS = {
  CHAT: 'deepseek-chat',
  REASONER: 'deepseek-reasoner'
} as const

export const DEEPSEEK_PRICING = {
  [DEEPSEEK_MODELS.CHAT]: {
    input: 0.27,   // $ per 1M tokens
    output: 1.10
  },
  [DEEPSEEK_MODELS.REASONER]: {
    input: 0.55,   // $ per 1M tokens
    output: 2.19
  }
} as const

/**
 * Calcular cost estimat per a una crida a DeepSeek
 */
export function calculateDeepSeekCost(
  model: keyof typeof DEEPSEEK_MODELS,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = DEEPSEEK_PRICING[model]
  if (!pricing) return 0

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output

  return inputCost + outputCost
}