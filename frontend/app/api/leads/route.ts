import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
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
    if (['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'].includes(session.user.role)) {
      where.assignedToId = session.user.id
    }

    // Aplicar filtres
    if (status) where.status = status
    if (priority) where.priority = priority
    if (source) where.source = source
    if (assignedTo) where.assignedToId = assignedTo

    // Obtenir leads
    const leads = await prisma.companyLead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

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
    console.error('Error obtenint leads:', error)
    return NextResponse.json(
      { error: 'Error obtenint els leads' },
      { status: 500 }
    )
  }
}