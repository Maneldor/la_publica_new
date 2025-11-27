import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateLeadData {
  companyName: string;
  cif?: string;
  sector?: string;
  website?: string;
  employees?: number;
  source: string;
  priority: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  notes?: string;
  assignedToId?: string;
  contacts?: CreateContactData[];
}

export interface CreateContactData {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  notes?: string;
}

export interface UpdateLeadData {
  companyName?: string;
  cif?: string;
  sector?: string;
  website?: string;
  employees?: number;
  source?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  lostReason?: string;
  estimatedValue?: number;
  notes?: string;
  assignedToId?: string;
}

export interface LeadFilters {
  status?: string;
  priority?: string;
  source?: string;
  sector?: string;
  assignedToId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Crear un nuevo lead con contactos
 */
export async function createLead(data: CreateLeadData) {
  const { contacts, ...leadData } = data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Crear el lead
      const lead = await (tx as any).company_leads.create({
        data: {
          ...leadData,
          status: 'NEW' as any, // Estado inicial
        } as any
      });

      // Crear los contactos si existen
      if (contacts && contacts.length > 0) {
        const contactsData = contacts.map((contact, index) => ({
          ...contact,
          company_leadsId: lead.id,
          isPrimary: index === 0 // El primer contacto es principal por defecto
        }));

        await (tx as any).contact.createMany({
          data: contactsData as any
        });
      }

      // Retornar el lead con sus contactos
      return await (tx as any).company_leads.findUnique({
        where: { id: lead.id },
        include: {
          contacts: {
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ]
          },
          assignedTo: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });
    });

    return result;
  } catch (error) {
    console.error('Error creando lead:', error);
    throw new Error('Error al crear el lead');
  }
}

/**
 * Obtener un lead por ID
 */
export async function getLeadById(id: string) {
  try {
    const lead = await (prisma as any).company_leads.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
          }
        },
        interactions: {
          include: {
            contact: true,
            createdBy: {
              select: {
                id: true,
                email: true,
                }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    return lead;
  } catch (error) {
    console.error('Error obteniendo lead:', error);
    throw error;
  }
}

/**
 * Listar leads con filtros
 */
export async function listLeads(filters: LeadFilters = {}) {
  const {
    status,
    priority,
    source,
    sector,
    assignedToId,
    search,
    limit = 20,
    offset = 0
  } = filters;

  try {
    // Construir filtros WHERE
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (source) where.source = source;
    if (sector) where.sector = sector;
    if (assignedToId) where.assignedToId = assignedToId;

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { cif: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtener leads y total
    const [leads, total] = await Promise.all([
      (prisma as any).company_leads.findMany({
        where,
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1
          },
          assignedTo: {
            select: {
              id: true,
              email: true
            }
          },
          _count: {
            select: {
              contacts: true,
              interactions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      (prisma as any).company_leads.count({ where })
    ]);

    return {
      leads,
      total,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error listando leads:', error);
    throw new Error('Error al obtener la lista de leads');
  }
}

/**
 * Actualizar un lead
 */
export async function updateLead(id: string, data: UpdateLeadData) {
  try {
    const lead = await (prisma as any).company_leads.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        contacts: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    return lead;
  } catch (error) {
    console.error('Error actualizando lead:', error);
    throw new Error('Error al actualizar el lead');
  }
}

/**
 * Eliminar un lead
 */
export async function deleteLead(id: string) {
  try {
    await (prisma as any).company_leads.delete({
      where: { id }
    });

    return { success: true };
  } catch (error) {
    console.error('Error eliminando lead:', error);
    throw new Error('Error al eliminar el lead');
  }
}

/**
 * Obtener estadísticas del dashboard
 */
export async function getDashboardStats(userId?: string) {
  try {
    const whereClause = userId ? { assignedToId: userId } : {};

    const [
      totalLeads,
      newLeads,
      inProgressLeads,
      convertedLeads,
      totalValue,
      recentLeads
    ] = await Promise.all([
      (prisma as any).company_leads.count({ where: whereClause }),
      (prisma as any).company_leads.count({
        where: { ...whereClause, status: 'NEW' as any }
      }),
      (prisma as any).company_leads.count({
        where: {
          ...whereClause,
          status: { in: ['CONTACTED' as any, 'NEGOTIATION' as any] }
        }
      }),
      (prisma as any).company_leads.count({
        where: { ...whereClause, status: 'CONVERTED' as any }
      }),
      (prisma as any).company_leads.aggregate({
        where: { ...whereClause, estimatedValue: { not: null } },
        _sum: { estimatedValue: true }
      }),
      (prisma as any).company_leads.findMany({
        where: whereClause,
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return {
      totalLeads,
      newLeads,
      inProgressLeads,
      convertedLeads,
      totalValue: totalValue._sum.estimatedValue || 0,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads * 100) : 0,
      recentLeads
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw new Error('Error al obtener estadísticas del dashboard');
  }
}

export default {
  createLead,
  getLeadById,
  listLeads,
  updateLead,
  deleteLead,
  getDashboardStats
};