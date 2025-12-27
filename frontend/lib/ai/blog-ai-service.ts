import { prisma } from '@/lib/prisma'

// ============================================
// TIPUS
// ============================================

export type BlogAIAction =
  | 'generate_article'      // Generar article complet
  | 'improve_text'          // Millorar/reescriure text
  | 'generate_title'        // Generar títols
  | 'generate_excerpt'      // Generar resum
  | 'suggest_tags'          // Suggerir tags
  | 'fix_grammar'           // Correcció ortogràfica
  | 'translate_ca_es'       // Traduir català → castellà
  | 'translate_es_ca'       // Traduir castellà → català
  | 'expand_text'           // Expandir/ampliar text
  | 'simplify_text'         // Simplificar text
  | 'generate_outline'      // Generar estructura/índex

export interface BlogAIRequest {
  action: BlogAIAction
  input: string              // Text d'entrada o tema
  context?: {
    title?: string
    category?: string
    targetAudience?: string  // "empleats públics"
    tone?: 'formal' | 'informal' | 'professional' | 'friendly'
    language?: 'ca' | 'es'
  }
  options?: {
    maxLength?: number
    numberOfSuggestions?: number
  }
}

export interface BlogAIResponse {
  success: boolean
  result?: string | string[]
  tokens?: {
    input: number
    output: number
    total: number
  }
  error?: string
}

// ============================================
// PROMPTS DEL SISTEMA
// ============================================

const SYSTEM_PROMPTS: Record<BlogAIAction, string> = {
  generate_article: `Ets un redactor expert en continguts per a empleats públics de Catalunya.
Genera articles informatius, ben estructurats i en català.
Format: HTML amb tags <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>.
Estil: Professional però accessible, evitant tecnicismes innecessaris.
Longitud: Articles complets de 800-1200 paraules.`,

  improve_text: `Ets un editor professional. Millora el text proporcionat:
- Corregeix errors gramaticals i ortogràfics
- Millora la claredat i fluïdesa
- Manté el significat original
- Respon NOMÉS amb el text millorat, sense explicacions.`,

  generate_title: `Ets un expert en copywriting. Genera títols atractius per a articles de blog.
- Títols entre 40-70 caràcters
- Atractius i que generin interès
- Adequats per a empleats públics
- Respon amb una llista JSON: ["títol1", "títol2", "títol3", "títol4", "títol5"]`,

  generate_excerpt: `Ets un redactor expert. Genera un resum atractiu per a l'article.
- Màxim 200 caràcters
- Que desperti l'interès per llegir l'article complet
- En el mateix idioma que l'article
- Respon NOMÉS amb el resum, sense explicacions.`,

  suggest_tags: `Ets un expert en SEO i categorització de continguts.
Suggereix entre 3-7 tags rellevants per a l'article.
- Tags curts (1-2 paraules)
- Rellevants pel contingut
- Útils per a la cerca
- Respon amb una llista JSON: ["tag1", "tag2", "tag3"]`,

  fix_grammar: `Ets un corrector professional de català i castellà.
- Corregeix NOMÉS errors ortogràfics i gramaticals
- NO canviïs l'estil ni el contingut
- Respon NOMÉS amb el text corregit, sense explicacions.`,

  translate_ca_es: `Ets un traductor professional català-castellà.
- Tradueix el text de català a castellà
- Manté el to i estil original
- Respon NOMÉS amb la traducció, sense explicacions.`,

  translate_es_ca: `Ets un traductor professional castellà-català.
- Tradueix el text de castellà a català
- Manté el to i estil original
- Utilitza català estàndard
- Respon NOMÉS amb la traducció, sense explicacions.`,

  expand_text: `Ets un redactor expert. Amplia i desenvolupa el text proporcionat:
- Afegeix més detalls i exemples
- Manté el to i estil original
- Duplica aproximadament la longitud
- Format HTML si l'original és HTML
- Respon NOMÉS amb el text ampliat.`,

  simplify_text: `Ets un expert en comunicació clara. Simplifica el text:
- Utilitza paraules més senzilles
- Frases més curtes
- Elimina tecnicismes innecessaris
- Manté la informació essencial
- Respon NOMÉS amb el text simplificat.`,

  generate_outline: `Ets un expert en estructuració de continguts.
Genera una estructura/índex per a l'article sobre el tema donat.
Format JSON:
{
  "title": "Títol suggerit",
  "sections": [
    { "heading": "Secció 1", "points": ["punt 1", "punt 2"] },
    { "heading": "Secció 2", "points": ["punt 1", "punt 2"] }
  ]
}`
}

// ============================================
// FUNCIONS AUXILIARS
// ============================================

function buildUserPrompt(request: BlogAIRequest): string {
  const { action, input, context, options } = request

  let prompt = ''

  // Context addicional
  if (context) {
    const contextParts = []
    if (context.title) contextParts.push(`Títol: ${context.title}`)
    if (context.category) contextParts.push(`Categoria: ${context.category}`)
    if (context.targetAudience) contextParts.push(`Audiència: ${context.targetAudience}`)
    if (context.tone) contextParts.push(`To: ${context.tone}`)
    if (context.language) contextParts.push(`Idioma: ${context.language === 'ca' ? 'Català' : 'Castellà'}`)

    if (contextParts.length > 0) {
      prompt += `Context:\n${contextParts.join('\n')}\n\n`
    }
  }

  // Opcions
  if (options) {
    if (options.maxLength) {
      prompt += `Longitud màxima: ${options.maxLength} paraules\n`
    }
    if (options.numberOfSuggestions) {
      prompt += `Nombre de suggeriments: ${options.numberOfSuggestions}\n`
    }
  }

  // Input principal
  switch (action) {
    case 'generate_article':
      prompt += `Genera un article complet sobre: ${input}`
      break
    case 'generate_title':
      prompt += `Genera 5 títols atractius per a un article sobre: ${input}`
      break
    case 'generate_outline':
      prompt += `Genera una estructura per a un article sobre: ${input}`
      break
    case 'suggest_tags':
      prompt += `Suggereix tags per al següent contingut:\n\n${input}`
      break
    default:
      prompt += input
  }

  return prompt
}

// ============================================
// FUNCIÓ PRINCIPAL
// ============================================

export async function callBlogAI(request: BlogAIRequest): Promise<BlogAIResponse> {
  try {
    // Obtenir configuració del cas d'ús "CONTENT"
    const configuration = await prisma.aIConfiguration.findFirst({
      where: {
        useCase: 'CONTENT',
        isActive: true
      },
      include: {
        model: {
          include: {
            provider: true
          }
        },
        provider: true
      }
    })

    if (!configuration || !configuration.model) {
      // Fallback: usar configuració per defecte
      console.warn('No s\'ha trobat configuració d\'IA per CONTENT, usant fallback')
      return callBlogAIFallback(request)
    }

    const { model, provider } = configuration

    // Construir prompts
    const systemPrompt = SYSTEM_PROMPTS[request.action]
    const userPrompt = buildUserPrompt(request)

    // Cridar al proveïdor corresponent
    let result: BlogAIResponse

    switch (provider.type) {
      case 'ANTHROPIC':
        result = await callAnthropic(model.modelId, systemPrompt, userPrompt, configuration)
        break
      case 'OPENAI':
        result = await callOpenAI(model.modelId, systemPrompt, userPrompt, configuration)
        break
      case 'DEEPSEEK':
        result = await callDeepSeek(model.modelId, systemPrompt, userPrompt, configuration)
        break
      case 'GEMINI':
        result = await callGemini(model.modelId, systemPrompt, userPrompt, configuration)
        break
      default:
        throw new Error(`Proveïdor no suportat: ${provider.type}`)
    }

    // Registrar ús
    if (result.success && result.tokens) {
      await logAIUsage(
        provider.id,
        model.id,
        result.tokens,
        request.action
      )
    }

    return result

  } catch (error) {
    console.error('Error cridant Blog AI:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconegut'
    }
  }
}

// ============================================
// CRIDES ALS PROVEÏDORS
// ============================================

interface AIConfiguration {
  temperature: number
  maxTokens: number
}

async function callAnthropic(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  config: AIConfiguration
): Promise<BlogAIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no configurada')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()

  return {
    success: true,
    result: data.content[0].text,
    tokens: {
      input: data.usage.input_tokens,
      output: data.usage.output_tokens,
      total: data.usage.input_tokens + data.usage.output_tokens
    }
  }
}

async function callOpenAI(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  config: AIConfiguration
): Promise<BlogAIResponse> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()

  return {
    success: true,
    result: data.choices[0].message.content,
    tokens: {
      input: data.usage.prompt_tokens,
      output: data.usage.completion_tokens,
      total: data.usage.total_tokens
    }
  }
}

async function callDeepSeek(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  config: AIConfiguration
): Promise<BlogAIResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY no configurada')
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error: ${error}`)
  }

  const data = await response.json()

  return {
    success: true,
    result: data.choices[0].message.content,
    tokens: {
      input: data.usage.prompt_tokens,
      output: data.usage.completion_tokens,
      total: data.usage.total_tokens
    }
  }
}

async function callGemini(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  config: AIConfiguration
): Promise<BlogAIResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY no configurada')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: config.maxTokens || 4096,
          temperature: config.temperature || 0.7
        }
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()

  return {
    success: true,
    result: data.candidates[0].content.parts[0].text,
    tokens: {
      input: data.usageMetadata?.promptTokenCount || 0,
      output: data.usageMetadata?.candidatesTokenCount || 0,
      total: data.usageMetadata?.totalTokenCount || 0
    }
  }
}

// ============================================
// FALLBACK (si no hi ha configuració)
// ============================================

async function callBlogAIFallback(request: BlogAIRequest): Promise<BlogAIResponse> {
  // Intentar amb DeepSeek com a fallback (més econòmic)
  let apiKey = process.env.DEEPSEEK_API_KEY

  if (apiKey) {
    const systemPrompt = SYSTEM_PROMPTS[request.action]
    const userPrompt = buildUserPrompt(request)
    return callDeepSeek('deepseek-chat', systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.7
    })
  }

  // Si no hi ha DeepSeek, provar OpenAI
  apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    const systemPrompt = SYSTEM_PROMPTS[request.action]
    const userPrompt = buildUserPrompt(request)
    return callOpenAI('gpt-4o-mini', systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.7
    })
  }

  return {
    success: false,
    error: 'No hi ha cap proveïdor d\'IA configurat'
  }
}

// ============================================
// LOGGING D'ÚS
// ============================================

async function logAIUsage(
  providerId: string,
  modelId: string,
  tokens: { input: number; output: number; total: number },
  action: string
) {
  try {
    await prisma.aIUsageLog.create({
      data: {
        providerId,
        modelId,
        useCase: 'CONTENT',
        inputTokens: tokens.input,
        outputTokens: tokens.output,
        totalTokens: tokens.total,
        success: true
      }
    })
  } catch (error) {
    console.error('Error logging AI usage:', error)
  }
}

// ============================================
// FUNCIONS D'AJUDA PER AL FRONTEND
// ============================================

export function parseAIResponse(action: BlogAIAction, response: string): string | string[] | { title: string; sections: { heading: string; points: string[] }[] } | null {
  try {
    switch (action) {
      case 'generate_title':
      case 'suggest_tags':
        // Espera JSON array
        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
        // Fallback: split per línies
        return response.split('\n').filter(line => line.trim())

      case 'generate_outline':
        // Espera JSON object
        const objMatch = response.match(/\{[\s\S]*\}/)
        if (objMatch) {
          return JSON.parse(objMatch[0])
        }
        return null

      default:
        return response
    }
  } catch {
    return response
  }
}
