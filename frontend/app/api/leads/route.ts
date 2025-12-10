import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // DEBUG: Verificar cookies y headers
    console.log('🍪 DEBUG /api/leads: Headers:', {
      'cookie': req.headers.get('cookie') ? 'Present' : 'Missing',
      'user-agent': req.headers.get('user-agent')?.substring(0, 50) || 'N/A'
    })

    const session = await getServerSession(authOptions)

    console.log('🔐 DEBUG /api/leads: Session status:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email || 'No email',
      userRole: session?.user?.role || 'No role'
    })

    if (!session?.user) {
      console.log('❌ /api/leads: No session found')
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assignedTo')

    // Construir filtre
    const where: any = {}

    // Si l'usuari és un gestor, només veure els seus leads
    // ADMIN_GESTIO pot veure tots els leads per defecte
    if (['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'].includes(session.user.role)) {
      where.assignedToId = session.user.id
    }

    // Aplicar filtres
    if (status) where.status = status
    if (priority) where.priority = priority
    if (source) where.source = source
    if (assignedTo) where.assignedToId = assignedTo

    console.log('✅ /api/leads: About to query with where:', where)

    // Obtenir leads
    const leads = await prismaClient.companyLead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`✅ /api/leads: Found ${leads.length} leads`)

    // Formatar leads per al frontend
    const formattedLeads = leads.map((lead) => ({
      id: lead.id,
      company: lead.companyName,
      contact: lead.contactName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status,
      priority: lead.priority || 'MEDIUM',
      source: lead.source,
      sector: lead.sector || '',
      value: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : 0,
      assignedTo: lead.assignedToId || '',
      gestorName: lead.assignedTo?.name || '',
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      description: lead.notes || '',
      score: lead.score,
      tags: lead.tags || [],
    }))

    return NextResponse.json({ leads: formattedLeads })
  } catch (error) {
    console.error('❌ Error obtenint leads:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Error obtenint els leads' },
      { status: 500 }
    )
  }
}