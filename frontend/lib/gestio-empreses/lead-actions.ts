'use server'

import { prisma } from '@/lib/prisma'
import { getGestioSession } from './auth-helpers'
import { revalidatePath } from 'next/cache'

export async function bulkAssignLeads(leadIds: string[], gestorId: string, userId: string) {
  try {
    const session = await getGestioSession()
    if (!session?.user?.id) {
      throw new Error('No autenticat')
    }

    // Verificar permisos
    const userType = session.role || 'USER'
    const canAssign = ['SUPER_ADMIN', 'ADMIN', 'COMPANY_MANAGER', 'ACCOUNT_MANAGER'].includes(userType)

    if (!canAssign) {
      throw new Error('No tens permisos per assignar leads')
    }

    // Verificar que el gestor existeix
    const gestor = await prisma.user.findUnique({
      where: { id: gestorId }
    })

    if (!gestor) {
      throw new Error('Gestor no trobat')
    }

    // Actualitzar els leads
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds }
      },
      data: {
        assignedTo: gestorId,
        updatedAt: new Date()
      }
    })

    // Crear activitat per cada lead
    const activities = leadIds.map(leadId => ({
      leadId,
      type: 'ASSIGNMENT' as const,
      description: `Lead assignat a ${gestor.name || gestor.email}`,
      performedBy: session.userId,
      createdAt: new Date()
    }))

    await prisma.leadActivity.createMany({
      data: activities
    })

    revalidatePath('/gestio/leads')

    return { success: true, message: `${leadIds.length} leads assignats correctament` }
  } catch (error) {
    console.error('Error assignant leads:', error)
    throw error
  }
}

export async function bulkUpdateLeadStatus(leadIds: string[], status: string, userId: string) {
  try {
    const session = await getGestioSession()
    if (!session?.user?.id) {
      throw new Error('No autenticat')
    }

    // Verificar permisos
    const userType = session.role || 'USER'
    const canUpdate = ['SUPER_ADMIN', 'ADMIN', 'COMPANY_MANAGER', 'ACCOUNT_MANAGER', 'SALES_REP'].includes(userType)

    if (!canUpdate) {
      throw new Error('No tens permisos per actualitzar l\'estat dels leads')
    }

    // Validar estat
    const validStatuses = [
      'NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION',
      'PROPOSAL_SENT', 'PENDING_CRM', 'CRM_APPROVED', 'CRM_REJECTED',
      'PENDING_ADMIN', 'WON', 'LOST'
    ]

    if (!validStatuses.includes(status)) {
      throw new Error('Estat no vàlid')
    }

    // Actualitzar els leads
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds }
      },
      data: {
        status,
        stage: status,  // Sincronitzar stage amb status
        updatedAt: new Date()
      }
    })

    // Crear activitat per cada lead
    const statusLabels = {
      'NEW': 'Nou',
      'CONTACTED': 'Contactat',
      'QUALIFIED': 'Qualificat',
      'NEGOTIATION': 'Negociant',
      'PROPOSAL_SENT': 'Proposta enviada',
      'PENDING_CRM': 'Pendent CRM',
      'CRM_APPROVED': 'Aprovat CRM',
      'CRM_REJECTED': 'Rebutjat CRM',
      'PENDING_ADMIN': 'Pendent Admin',
      'WON': 'Guanyat',
      'LOST': 'Perdut'
    }

    const activities = leadIds.map(leadId => ({
      leadId,
      type: 'STATUS_CHANGE' as const,
      description: `Estat canviat a ${statusLabels[status as keyof typeof statusLabels]}`,
      performedBy: session.userId,
      createdAt: new Date()
    }))

    await prisma.leadActivity.createMany({
      data: activities
    })

    revalidatePath('/gestio/leads')

    return { success: true, message: `${leadIds.length} leads actualitzats correctament` }
  } catch (error) {
    console.error('Error actualitzant estat:', error)
    throw error
  }
}

export async function bulkDeleteLeads(leadIds: string[], userId: string) {
  try {
    const session = await getGestioSession()
    if (!session?.user?.id) {
      throw new Error('No autenticat')
    }

    // Verificar permisos - només admins poden eliminar
    const userType = session.role || 'USER'
    const canDelete = ['SUPER_ADMIN', 'ADMIN'].includes(userType)

    if (!canDelete) {
      throw new Error('No tens permisos per eliminar leads')
    }

    // Eliminar activitats relacionades primer
    await prisma.leadActivity.deleteMany({
      where: {
        leadId: { in: leadIds }
      }
    })

    // Eliminar els leads
    const result = await prisma.lead.deleteMany({
      where: {
        id: { in: leadIds }
      }
    })

    revalidatePath('/gestio/leads')

    return { success: true, message: `${result.count} leads eliminats correctament` }
  } catch (error) {
    console.error('Error eliminant leads:', error)
    throw error
  }
}

// Funcions auxiliars per obtenir dades
export async function getGestorsForAssignment() {
  try {
    const session = await getGestioSession()
    if (!session?.user?.id) {
      throw new Error('No autenticat')
    }

    const gestors = await prisma.user.findMany({
      where: {
        userType: {
          in: ['SALES_REP', 'ACCOUNT_MANAGER', 'COMPANY_MANAGER', 'ADMIN']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return gestors.map(gestor => ({
      id: gestor.id,
      name: gestor.name,
      email: gestor.email
    }))
  } catch (error) {
    console.error('Error obtenint gestors:', error)
    return []
  }
}

export async function getFilteredLeads(params: {
  search?: string
  status?: string[]
  priority?: string[]
  source?: string[]
  sector?: string[]
  gestor?: string[]
  page?: number
  limit?: number
}) {
  try {
    const session = await getGestioSession()
    if (!session?.userId) {
      throw new Error('No autenticat')
    }

    const userId = session.userId
    const userType = session.role || 'USER'
    const isSupervisor = ['SUPER_ADMIN', 'ADMIN', 'COMPANY_MANAGER', 'ACCOUNT_MANAGER'].includes(userType)

    const {
      search,
      status,
      priority,
      source,
      sector,
      gestor,
      page = 1,
      limit = 50
    } = params

    const skip = (page - 1) * limit

    // Construir filtres
    const where: any = {}

    // Si no és supervisor, només veure els seus leads
    if (!isSupervisor) {
      where.assignedTo = userId
    }

    // Filtrar per gestor (si és supervisor)
    if (isSupervisor && gestor && gestor.length > 0) {
      where.assignedTo = { in: gestor }
    }

    // Cerca per text
    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtres específics
    if (status && status.length > 0) {
      where.status = { in: status }
    }

    if (priority && priority.length > 0) {
      where.priority = { in: priority }
    }

    if (source && source.length > 0) {
      where.source = { in: source }
    }

    if (sector && sector.length > 0) {
      where.sector = { in: sector }
    }

    // Obtenir leads amb informació del gestor
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedToUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.lead.count({ where })
    ])

    // Formatear dades
    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      company: lead.company,
      contact: lead.contact,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      priority: lead.priority,
      source: lead.source,
      sector: lead.sector,
      value: lead.value,
      assignedTo: lead.assignedTo,
      gestorName: lead.assignedToUser?.name || lead.assignedToUser?.email || null,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    }))

    return {
      leads: formattedLeads,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error obtenint leads filtrats:', error)
    throw error
  }
}