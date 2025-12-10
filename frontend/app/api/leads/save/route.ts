import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function POST(req: Request) {
  console.log('=== API /api/leads/save called ===')
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.id)

    if (!session?.user) {
      console.log('ERROR: No session found')
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await req.json()
    const { generationId, leads } = body
    console.log('Request body:', { generationId, leadCount: leads?.length })

    if (!generationId || !leads || !Array.isArray(leads)) {
      console.log('ERROR: Invalid parameters', { generationId, leads })
      return NextResponse.json({ error: 'Paràmetres invàlids' }, { status: 400 })
    }

    // Guardar cada lead a la base de dades
    console.log('Starting to save leads...')
    const savedLeads = await Promise.all(
      leads.map(async (lead, index) => {
        console.log(`Saving lead ${index + 1}:`, lead.companyName)
        try {
          const result = await prismaClient.companyLead.create({
            data: {
              companyName: lead.companyName,
              contactName: lead.contactName || null,
              email: lead.contactEmail || null,
              phone: lead.contactPhone || null,
              sector: lead.sector || null,
              companySize: lead.employees?.toString() || null,
              estimatedRevenue: lead.estimatedRevenue || lead.revenue || null,
              notes: lead.description || null,
              priority: lead.priority || 'MEDIUM',
              score: lead.score || null,
              source: 'AI_PROSPECTING',
              status: 'NEW',
              assignedToId: session.user.id,
              userId: session.user.id,
              tags: [`generation:${generationId}`, 'ai-generated'],
            },
          })
          console.log(`Lead ${index + 1} saved successfully:`, result.id)
          return result
        } catch (error) {
          console.error(`Error saving lead ${index + 1}:`, error)
          throw error
        }
      })
    )
    console.log(`All ${savedLeads.length} leads saved successfully!`)

    // Actualitzar estadístiques de generació (si tenim aquesta taula)
    // await prisma.iaGeneration.update({
    //   where: { id: generationId },
    //   data: { leadsAccepted: leads.length }
    // })

    return NextResponse.json({
      success: true,
      savedCount: savedLeads.length,
      leads: savedLeads
    })
  } catch (error) {
    console.error('Error guardant leads IA:', error)
    return NextResponse.json(
      { error: 'Error guardant els leads' },
      { status: 500 }
    )
  }
}