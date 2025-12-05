import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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

export async function POST(req: Request) {
  console.log('=== API /api/ai/generate-leads called ===')
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { criteria, model } = await req.json()
    console.log('Generation criteria:', criteria)

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
      console.log('Using mock data - no real OpenAI API key configured')
      return generateMockLeads(criteria)
    }

    // Generar leads reals amb OpenAI
    const generationId = `gen-${Date.now()}`

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
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('OpenAI response received')

    const aiContent = data.choices[0]?.message?.content
    if (!aiContent) {
      throw new Error('No content received from OpenAI')
    }

    // Parsejar resposta JSON de l'IA
    let parsedLeads
    try {
      const cleanContent = aiContent.replace(/```json\n?|\n?```/g, '').trim()
      parsedLeads = JSON.parse(cleanContent)
    } catch (error) {
      console.error('Error parsing AI response:', aiContent)
      throw new Error('Error parseant la resposta de l\'IA')
    }

    // Transformar i validar leads
    const leads: GeneratedLead[] = parsedLeads.leads.map((lead: any, index: number) => ({
      id: `ai-lead-${Date.now()}-${index}`,
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
      reasoning: lead.reasoning || 'Lead generat per IA',
      website: lead.website || `https://empresa${index}.com`,
      linkedin: lead.linkedin || `https://linkedin.com/company/empresa${index}`,
      description: lead.description || 'Empresa generada per IA'
    }))

    console.log(`Generated ${leads.length} AI leads successfully`)

    return NextResponse.json({
      generationId,
      leads,
      model: model,
      source: 'OPENAI_REAL'
    })

  } catch (error) {
    console.error('Error generating AI leads:', error)

    // Fallback a dades mock si hi ha error
    console.log('Falling back to mock data due to error')
    return generateMockLeads(req.body || { criteria: { quantity: 5 } })
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

  return NextResponse.json({
    generationId,
    leads: mockLeads,
    model: 'MOCK',
    source: 'MOCK_FALLBACK'
  })
}