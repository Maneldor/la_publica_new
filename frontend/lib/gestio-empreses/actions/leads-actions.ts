'use server'

import { prismaClient } from '@/lib/prisma'
import { getGestioSession } from '../auth-helpers'

export interface LeadFilters {
  search?: string
  status?: string
  priority?: string
  source?: string
  assignedToId?: string
  sector?: string
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'updatedAt' | 'score'
  orderDir?: 'asc' | 'desc'
}

export async function getLeads(filters: LeadFilters & { page?: number; limit?: number } = {}) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const {
    search = '',
    status,
    priority,
    source,
    assignedToId,
    sector,
    page = 1,
    limit = 20,
    orderBy = 'createdAt',
    orderDir = 'desc'
  } = filters

  const offset = (page - 1) * limit

  // Construir where clause base
  let whereClause: any = {}

  // Aplicar filtros de acceso según rol
  if (session.dataAccess === 'own') {
    // Gestores solo ven sus leads asignados
    whereClause.assignedToId = session.userId
  } else if (session.dataAccess === 'team') {
    // CRM_COMERCIAL ve todos los leads (supervisa el equipo)
    // No se aplica filtro adicional
  } else if (session.dataAccess === 'all') {
    // ADMIN y SUPER_ADMIN ven todos los leads
    // No se aplica filtro adicional
  }

  // Aplicar filtros de búsqueda
  if (search) {
    whereClause.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { cif: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Aplicar filtros específicos
  if (status) whereClause.status = status
  if (priority) whereClause.priority = priority
  if (source) whereClause.source = source
  if (assignedToId) whereClause.assignedToId = assignedToId
  if (sector) whereClause.sector = { contains: sector, mode: 'insensitive' }

  try {
    const [leads, total] = await Promise.all([
      prismaClient.companyLead.findMany({
        where: whereClause,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          convertedCompany: {
            select: {
              id: true,
              name: true
            }
          },
          contacts: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isPrimary: true
            },
            take: 3
          },
          interactions: {
            select: {
              id: true,
              type: true,
              createdAt: true
            },
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              contacts: true,
              interactions: true,
              tasks: true
            }
          }
        },
        orderBy: { [orderBy]: orderDir },
        skip: offset,
        take: limit
      }),

      prismaClient.companyLead.count({
        where: whereClause
      })
    ])

    return {
      data: leads,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasMore: total > offset + limit
      }
    }
  } catch (error) {
    console.error('Error obteniendo leads:', error)
    throw new Error('Error al obtener los leads')
  }
}

export async function getLeadById(leadId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  try {
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        convertedCompany: true,
        contacts: {
          orderBy: { isPrimary: 'desc' }
        },
        interactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            contacts: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { dueDate: 'asc' }
        },
        documents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    // Verificar permisos de acceso
    if (session.dataAccess === 'own' && lead.assignedToId !== session.userId) {
      throw new Error('No tienes permisos para acceder a este lead')
    }

    return lead
  } catch (error) {
    console.error('Error obteniendo lead:', error)
    throw error
  }
}

export async function updateLeadStatus(leadId: string, status: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  try {
    // Verificar acceso al lead
    const lead = await prismaClient.companyLead.findUnique({
      where: { id: leadId },
      select: { assignedToId: true }
    })

    if (!lead) {
      throw new Error('Lead no encontrado')
    }

    // Verificar permisos
    if (session.dataAccess === 'own' && lead.assignedToId !== session.userId) {
      throw new Error('No tienes permisos para modificar este lead')
    }

    const updatedLead = await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: status as any,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Registrar actividad
    await prismaClient.leadActivity.create({
      data: {
        leadId: leadId,
        userId: session.userId,
        type: 'STATUS_CHANGE',
        description: `Estado cambiado a: ${status}`,
        metadata: {
          previousStatus: lead,
          newStatus: status,
          userId: session.userId
        }
      }
    })

    return updatedLead
  } catch (error) {
    console.error('Error actualizando estado del lead:', error)
    throw error
  }
}

export async function assignLead(leadId: string, assignedToId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Solo ADMIN, SUPER_ADMIN y CRM_COMERCIAL pueden asignar leads
  if (!['all', 'team'].includes(session.dataAccess)) {
    throw new Error('No tienes permisos para asignar leads')
  }

  try {
    const updatedLead = await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        assignedToId,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Registrar actividad
    await prismaClient.leadActivity.create({
      data: {
        leadId: leadId,
        userId: session.userId,
        type: 'ASSIGNMENT',
        description: `Lead asignado a: ${updatedLead.assignedTo?.name}`,
        metadata: {
          assignedToId,
          assignedBy: session.userId
        }
      }
    })

    return updatedLead
  } catch (error) {
    console.error('Error asignando lead:', error)
    throw new Error('Error al asignar el lead')
  }
}

export async function getLeadStats() {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  let whereClause: any = {}

  // Aplicar filtros de acceso según rol
  if (session.dataAccess === 'own') {
    whereClause.assignedToId = session.userId
  }

  try {
    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads
    ] = await Promise.all([
      prismaClient.companyLead.count({ where: whereClause }),
      prismaClient.companyLead.count({ where: { ...whereClause, status: 'NEW' } }),
      prismaClient.companyLead.count({ where: { ...whereClause, status: 'QUALIFIED' } }),
      prismaClient.companyLead.count({ where: { ...whereClause, status: 'WON' } }),
      prismaClient.companyLead.count({ where: { ...whereClause, status: 'LOST' } })
    ])

    return {
      total: totalLeads,
      new: newLeads,
      qualified: qualifiedLeads,
      won: wonLeads,
      lost: lostLeads,
      conversionRate: totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas de leads:', error)
    throw new Error('Error al obtener estadísticas')
  }
}

export async function getAvailableLeadManagers() {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Solo usuarios con permisos de equipo o superiores pueden ver la lista de gestores
  if (!['all', 'team'].includes(session.dataAccess)) {
    return []
  }

  try {
    const managers = await prismaClient.user.findMany({
      where: {
        isActive: true,
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL']
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    return managers
  } catch (error) {
    console.error('Error obteniendo gestores disponibles:', error)
    return []
  }
}