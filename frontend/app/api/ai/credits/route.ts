import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Per ara, retornem estadístiques mockejades per cada usuari
    // En un futur es podrien guardar a la BD

    const userId = session.user.id

    // Calcular leads generats aquest mes (basat en leads reals de la BD)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const leadsThisMonth = await prismaClient.companyLead.count({
      where: {
        assignedToId: userId,
        source: 'AI_PROSPECTING',
        createdAt: {
          gte: currentMonth
        }
      }
    })

    const totalAILeads = await prismaClient.companyLead.count({
      where: {
        assignedToId: userId,
        source: 'AI_PROSPECTING'
      }
    })

    const qualifiedLeads = await prismaClient.companyLead.count({
      where: {
        assignedToId: userId,
        source: 'AI_PROSPECTING',
        status: {
          in: ['QUALIFIED', 'NEGOTIATION', 'WON']
        }
      }
    })

    // Límits de crèdits basats en el rol de l'usuari
    let monthlyLimit = 50 // Gestor per defecte

    if (['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      monthlyLimit = 500
    } else if (session.user.role === 'CRM_COMERCIAL') {
      monthlyLimit = 200
    }

    const creditsUsed = leadsThisMonth
    const creditsRemaining = Math.max(0, monthlyLimit - creditsUsed)
    const qualificationRate = totalAILeads > 0 ? Math.round((qualifiedLeads / totalAILeads) * 100) : 0

    return NextResponse.json({
      totalGenerated: totalAILeads,
      totalQualified: qualifiedLeads,
      qualificationRate,
      highPriority: Math.floor(qualifiedLeads * 0.4), // Estimació
      avgScore: totalAILeads > 0 ? 78 : 0, // Puntuació mitjana estimada
      creditsRemaining,
      creditsUsed,
      monthlyLimit,
      resetDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString(),
    })

  } catch (error) {
    console.error('Error obtenint crèdits IA:', error)
    return NextResponse.json(
      { error: 'Error obtenint les estadístiques' },
      { status: 500 }
    )
  }
}