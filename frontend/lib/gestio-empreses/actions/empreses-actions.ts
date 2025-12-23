'use server'

import { prismaClient } from '@/lib/prisma'
import { getGestioSession } from '../auth-helpers'

export interface CompanyFilters {
  search?: string
  status?: string
  accountManagerId?: string
  sector?: string
  size?: string
  isActive?: boolean
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'updatedAt' | 'name'
  orderDir?: 'asc' | 'desc'
}

export async function getEmpreses(filters: CompanyFilters & { page?: number; limit?: number } = {}) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const {
    search = '',
    status,
    accountManagerId,
    sector,
    size,
    isActive = true,
    page = 1,
    limit = 20,
    orderBy = 'createdAt',
    orderDir = 'desc'
  } = filters

  const offset = (page - 1) * limit

  // Construir where clause base
  const whereClause: any = {
    isActive: isActive
  }

  // Aplicar filtros de acceso según rol
  if (session.dataAccess === 'own') {
    // Gestores solo ven sus empresas asignadas
    whereClause.accountManagerId = session.userId
  } else if (session.dataAccess === 'team') {
    // CRM_COMERCIAL ve todas las empresas (supervisa el equipo)
    // No se aplica filtro adicional
  } else if (session.dataAccess === 'all') {
    // ADMIN y SUPER_ADMIN ven todas las empresas
    // No se aplica filtro adicional
  }

  // Aplicar filtros de búsqueda
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { cif: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Aplicar filtros específicos
  if (status) whereClause.status = status
  if (accountManagerId) whereClause.accountManagerId = accountManagerId
  if (sector) whereClause.sector = { contains: sector, mode: 'insensitive' }
  if (size) whereClause.size = size

  try {
    const [empreses, total] = await Promise.all([
      prismaClient.company.findMany({
        where: whereClause,
        include: {
          accountManager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          currentPlan: {
            select: {
              id: true,
              nombre: true,
              planType: true
            }
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true
            },
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              offers: true,
              teamMembers: true,
              invoices: true
            }
          }
        },
        orderBy: { [orderBy]: orderDir },
        skip: offset,
        take: limit
      }),

      prismaClient.company.count({
        where: whereClause
      })
    ])

    return {
      data: empreses,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasMore: total > offset + limit
      }
    }
  } catch (error) {
    console.error('Error obteniendo empresas:', error)
    throw new Error('Error al obtener las empresas')
  }
}

export async function getEmpresaById(empresaId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  try {
    const empresa = await prismaClient.company.findUnique({
      where: { id: empresaId },
      include: {
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        teamMembers: {
          select: {
            id: true,
            name: true,
            email: true,
            companyRole: true
          }
        },
        currentPlan: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: {
            plan: {
              select: {
                nombre: true,
                planType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        offers: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
            dueDate: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        originalLead: {
          select: {
            id: true,
            companyName: true,
            source: true,
            convertedAt: true
          }
        }
      }
    })

    if (!empresa) {
      throw new Error('Empresa no encontrada')
    }

    // Verificar permisos de acceso
    if (session.dataAccess === 'own' && empresa.accountManagerId !== session.userId) {
      throw new Error('No tienes permisos para acceder a esta empresa')
    }

    return empresa
  } catch (error) {
    console.error('Error obteniendo empresa:', error)
    throw error
  }
}

export async function updateEmpresaStatus(empresaId: string, status: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Solo ADMIN, SUPER_ADMIN y CRM_COMERCIAL pueden cambiar estados de empresa
  if (!['all', 'team'].includes(session.dataAccess)) {
    throw new Error('No tienes permisos para modificar estados de empresa')
  }

  try {
    const updatedEmpresa = await prismaClient.company.update({
      where: { id: empresaId },
      data: {
        status: status as any,
        updatedAt: new Date(),
        ...(status === 'APPROVED' && {
          approvedAt: new Date(),
          approvedById: session.userId
        }),
        ...(status === 'REJECTED' && {
          rejectedAt: new Date(),
          rejectedById: session.userId
        })
      },
      include: {
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Registrar en audit log
    await prismaClient.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.email || '',
        userEmail: session.email || '',
        userRole: session.role,
        action: status === 'APPROVED' ? 'COMPANY_APPROVED' :
                status === 'REJECTED' ? 'COMPANY_REJECTED' :
                'COMPANY_UPDATED',
        entity: 'Company',
        entityId: empresaId,
        entityName: updatedEmpresa.name,
        description: `Estado de empresa cambiado a: ${status}`,
        changes: {
          status: {
            from: 'previous_status',
            to: status
          }
        },
        metadata: {
          updatedBy: session.userId
        }
      }
    })

    return updatedEmpresa
  } catch (error) {
    console.error('Error actualizando estado de empresa:', error)
    throw error
  }
}

export async function assignEmpresaManager(empresaId: string, accountManagerId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Solo ADMIN, SUPER_ADMIN y CRM_COMERCIAL pueden asignar gestores
  if (!['all', 'team'].includes(session.dataAccess)) {
    throw new Error('No tienes permisos para asignar gestores')
  }

  try {
    const updatedEmpresa = await prismaClient.company.update({
      where: { id: empresaId },
      data: {
        accountManagerId,
        updatedAt: new Date()
      },
      include: {
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Registrar en audit log
    await prismaClient.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.email || '',
        userEmail: session.email || '',
        userRole: session.role,
        action: 'COMPANY_UPDATED',
        entity: 'Company',
        entityId: empresaId,
        entityName: updatedEmpresa.name,
        description: `Gestor asignado a: ${updatedEmpresa.accountManager?.name}`,
        changes: {
          accountManagerId: {
            to: accountManagerId
          }
        },
        metadata: {
          assignedBy: session.userId
        }
      }
    })

    return updatedEmpresa
  } catch (error) {
    console.error('Error asignando gestor:', error)
    throw new Error('Error al asignar el gestor')
  }
}

export async function getEmpresaStats() {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const whereClause: any = { isActive: true }

  // Aplicar filtros de acceso según rol
  if (session.dataAccess === 'own') {
    whereClause.accountManagerId = session.userId
  }

  try {
    const [
      totalEmpreses,
      pendingEmpreses,
      approvedEmpreses,
      rejectedEmpreses,
      activeSubscriptions
    ] = await Promise.all([
      prismaClient.company.count({ where: whereClause }),
      prismaClient.company.count({ where: { ...whereClause, status: 'PENDING' } }),
      prismaClient.company.count({ where: { ...whereClause, status: 'APPROVED' } }),
      prismaClient.company.count({ where: { ...whereClause, status: 'REJECTED' } }),
      prismaClient.subscription.count({
        where: {
          status: 'ACTIVE',
          ...(session.dataAccess === 'own' && {
            company: { accountManagerId: session.userId }
          })
        }
      })
    ])

    return {
      total: totalEmpreses,
      pending: pendingEmpreses,
      approved: approvedEmpreses,
      rejected: rejectedEmpreses,
      activeSubscriptions,
      approvalRate: totalEmpreses > 0 ? (approvedEmpreses / totalEmpreses) * 100 : 0
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas de empresas:', error)
    throw new Error('Error al obtener estadísticas')
  }
}

export async function getAvailableManagers() {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Solo usuarios con permisos de equipo o superiores pueden ver la lista de gestores
  if (!['all', 'team'].includes(session.dataAccess)) {
    throw new Error('No tienes permisos para ver la lista de gestores')
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
        email: true,
        role: true,
        _count: {
          select: {
            managedCompanies: true,
            assignedLeads: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return managers
  } catch (error) {
    console.error('Error obteniendo gestores disponibles:', error)
    throw new Error('Error al obtener gestores disponibles')
  }
}