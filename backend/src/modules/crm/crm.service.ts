import prisma from '../../config/database';

export class CrmService {
  // ============================================================================
  // COMPANY LEADS
  // ============================================================================

  async createLead(data: {
    companyName: string;
    cif?: string;
    sector?: string;
    website?: string;
    employees?: number;
    source: string;
    priority: string;
    status?: string;
    estimatedValue?: number;
    assignedToId?: string;
    notes?: string;
  }) {
    return prisma.company_leads.create({
      data: {
        companyName: data.companyName,
        cif: data.cif,
        sector: data.sector,
        website: data.website,
        employees: data.employees,
        source: data.source as any,
        priority: data.priority as any,
        status: (data.status || 'new') as any,
        estimatedValue: data.estimatedValue,
        assignedToId: data.assignedToId,
        notes: data.notes
      } as any,
      include: {
        User: {
          select: { id: true, email: true }
        },
        contacts: true,
        lead_interactions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async listLeads(filters: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    source?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.source) where.source = filters.source;

    return prisma.company_leads.findMany({
      where,
      include: {
        User: {
          select: { id: true, email: true }
        },
        contacts: true,
        _count: {
          select: { lead_interactions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 20,
      skip: filters.offset || 0
    });
  }

  async getLeadById(id: string) {
    const lead = await prisma.company_leads.findUnique({
      where: { id },
      include: {
        User: {
          select: { id: true, email: true }
        },
        contacts: {
          orderBy: { isPrimary: 'desc' }
        },
        lead_interactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            contact: true,
            createdBy: {
              select: { id: true, email: true }
            }
          }
        },
        companies: true
      }
    });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    return lead;
  }

  async updateLead(id: string, data: any) {
    return prisma.company_leads.update({
      where: { id },
      data,
      include: {
        User: {
          select: { id: true, email: true }
        },
        contacts: true
      }
    });
  }

  async convertLeadToCompany(leadId: string, companyData: any) {
    const lead = await this.getLeadById(leadId);

    return prisma.$transaction(async (tx) => {
      // Crear usuario para la empresa
      const user = await tx.user.create({
        data: {
          email: companyData.email,
          password: companyData.password, // Debería estar hasheada
          primaryRole: 'COMPANY_MANAGER',
          isActive: true
        }
      });

      // Crear la empresa
      const company = await tx.companies.create({
        data: {
          name: lead.companyName,
          description: companyData.description || `Empresa ${lead.companyName}`,
          sector: lead.sector || 'otros',
          size: companyData.size || 'pequeña',
          cif: lead.cif,
          email: companyData.email,
          website: lead.website,
          isVerified: false,
          isActive: false,
          userId: user.id,
          accountManagerId: lead.assignedToId
        }
      });

      // Actualizar el lead como convertido
      await tx.company_leads.update({
        where: { id: leadId },
        data: {
          status: 'WON' as any as any,
          convertedToCompanyId: company.id,
          convertedAt: new Date()
        }
      });

      // Transferir contactos al company
      await tx.contact.updateMany({
        where: { companyLeadId: leadId },
        data: {
          companyId: company.id,
          companyLeadId: null
        }
      });

      // Transferir interacciones al company
      await tx.interaction.updateMany({
        where: { companyLeadId: leadId },
        data: {
          companyId: company.id,
          companyLeadId: null
        }
      });

      return company;
    });
  }

  // ============================================================================
  // INTERACTIONS
  // ============================================================================

  async createInteraction(data: {
    type: string;
    subject?: string;
    content: string;
    outcome?: string;
    nextAction?: string;
    nextActionDate?: Date;
    companyLeadId?: string;
    companyId?: string;
    contactId?: string;
    userId: string;
  }) {
    return prisma.lead_interactions.create({
      data: {
        id: `interaction_${Date.now()}_${Math.random()}`,
        leadId: data.companyLeadId || '',
        userId: data.userId,
        type: data.type as any,
        title: data.subject,
        description: data.content || '',
        outcome: data.outcome,
        nextAction: data.nextAction,
        nextActionDate: data.nextActionDate,
        contactId: data.contactId
      } as any,
      include: {
        contact: true,
        createdBy: {
          select: { id: true, email: true }
        },
        company_leads: {
          select: { id: true, companyName: true }
        }
      }
    });
  }

  async listInteractions(filters: {
    companyLeadId?: string;
    companyId?: string;
    contactId?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.companyLeadId) where.companyLeadId = filters.companyLeadId;
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.contactId) where.contactId = filters.contactId;
    if (filters.type) where.type = filters.type;

    return prisma.lead_interactions.findMany({
      where,
      include: {
        contact: true,
        createdBy: {
          select: { id: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0
    });
  }

  async updateInteraction(id: string, data: any) {
    return prisma.lead_interactions.update({
      where: { id },
      data,
      include: {
        contact: true,
        createdBy: {
          select: { id: true, email: true }
        }
      }
    });
  }

  async markActionCompleted(id: string) {
    return prisma.lead_interactions.update({
      where: { id },
      data: {
        nextActionCompleted: true
      }
    });
  }

  // ============================================================================
  // CONTACTS
  // ============================================================================

  async createContact(data: {
    name: string;
    position?: string;
    phone?: string;
    email?: string;
    linkedin?: string;
    isPrimary?: boolean;
    companyLeadId?: string;
    companyId?: string;
    notes?: string;
  }) {
    return prisma.contact.create({
      data: {
        firstName: data.name,
        name: data.name,
        position: data.position,
        phone: data.phone,
        email: data.email,
        linkedin: data.linkedin,
        isPrimary: data.isPrimary || false,
        companyLeadId: data.companyLeadId,
        companyId: data.companyId,
        notes: data.notes
      }
    });
  }

  async listContacts(filters: {
    companyLeadId?: string;
    companyId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.companyLeadId) where.companyLeadId = filters.companyLeadId;
    if (filters.companyId) where.companyId = filters.companyId;

    return prisma.contact.findMany({
      where,
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ],
      take: filters.limit || 20,
      skip: filters.offset || 0
    });
  }

  // ============================================================================
  // DASHBOARD DATA
  // ============================================================================

  async getDashboardData(userId: string) {
    // KPIs básicos
    const totalLeads = await prisma.company_leads.count({
      where: { assignedToId: userId }
    });

    const contactedLeads = await prisma.company_leads.count({
      where: {
        assignedToId: userId,
        status: { in: ['CONTACTED', 'NEGOTIATION', 'WON'] as any }
      }
    });

    const convertedLeads = await prisma.company_leads.count({
      where: {
        assignedToId: userId,
        status: 'WON' as any
      }
    });

    const pendingTasks = await prisma.lead_interactions.count({
      where: {
        userId: userId,
        nextActionCompleted: false,
        nextActionDate: {
          lte: new Date()
        }
      }
    });

    // Pipeline data
    const pipelineData = await prisma.company_leads.groupBy({
      by: ['status'],
      where: { assignedToId: userId },
      _count: true
    });

    const pipeline = {
      new: 0,
      contacted: 0,
      negotiating: 0,
      converted: 0
    };

    pipelineData.forEach((item) => {
      if (item.status in pipeline) {
        (pipeline as any)[item.status] = item._count;
      }
    });

    // Conversion rate
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return {
      kpis: {
        totalLeads,
        contactedLeads,
        conversionRate,
        pendingTasks
      },
      pipeline
    };
  }

  async getPendingTasks(userId: string) {
    return prisma.lead_interactions.findMany({
      where: {
        userId: userId,
        nextActionCompleted: false,
        nextAction: { not: null },
        nextActionDate: {
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Próximas 24 horas
        }
      },
      include: {
        company_leads: {
          select: { id: true, companyName: true }
        },
        contact: true
      },
      orderBy: { nextActionDate: 'asc' }
    });
  }

  // ============================================================================
  // NOTIFICATIONS - Con restricciones para gestores de empresas
  // ============================================================================

  async getAvailableRecipients(senderId: string, senderRole: string) {
    let whereConditions: any = {};

    if (senderRole === 'GESTOR_EMPRESAS') {
      // Gestores de empresas pueden enviar a:
      // 1. Otros gestores de empresas
      // 2. Admins y super admins
      // 3. Empresas que tenga asignadas

      whereConditions = {
        OR: [
          // Otros gestores de empresas
          { primaryRole: 'GESTOR_EMPRESAS' },
          // Admins
          { primaryRole: { in: ['ADMIN', 'SUPER_ADMIN'] } },
          // Empresas asignadas
          {
            primaryRole: 'EMPRESA',
            company: {
              accountManagerId: senderId
            }
          }
        ]
      };
    } else if (['ADMIN', 'SUPER_ADMIN'].includes(senderRole)) {
      // Admins pueden enviar a cualquiera excepto a sí mismos
      whereConditions = {
        id: { not: senderId }
      };
    }

    // Excluir al propio usuario siempre
    whereConditions.id = { not: senderId };

    return prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        email: true,
        primaryRole: true,
        ownedCompanyId: true
      },
      orderBy: [
        { primaryRole: 'asc' },
        { email: 'asc' }
      ]
    });
  }

  async listNotifications(userId: string, filters: {
    filter?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { userId };

    // Aplicar filtros adicionales
    if (filters.filter === 'unread') {
      where.isRead = false;
    } else if (filters.filter === 'high') {
      where.priority = 'HIGH';
    }

    return prisma.notifications.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: filters.limit || 50,
      skip: filters.offset || 0
    });
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notifications.findFirst({
      where: {
        id: notificationId,
        userId: userId
      }
    });

    if (!notification) {
      throw new Error('Notificación no encontrada o no tienes permisos para acceder a ella');
    }

    return prisma.notifications.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      },
      include: {
        company: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    return prisma.notifications.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async createNotification(data: {
    userId: string;
    type: 'REMINDER' | 'ALERT' | 'SUCCESS' | 'INFO';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    message: string;
    actionType?: string;
    actionUrl?: string;
    leadId?: string;
    companyId?: string;
    dueDate?: Date;
    metadata?: any;
  }) {
    return prisma.notifications.create({
      data: {
        userId: data.userId,
        type: data.type,
        priority: data.priority || 'MEDIUM',
        title: data.title,
        message: data.message,
        actionType: data.actionType,
        actionUrl: data.actionUrl,
        leadId: data.leadId,
        companyId: data.companyId,
        dueDate: data.dueDate,
        metadata: data.metadata
      } as any,
      include: {
        company: {
          select: { id: true, name: true }
        }
      }
    });
  }

  // Verificar si un gestor puede enviar notificaciones a un usuario específico
  async canSendNotificationTo(senderId: string, senderRole: string, recipientId: string): Promise<boolean> {
    // Admins y super admins pueden enviar a cualquiera
    if (['ADMIN', 'SUPER_ADMIN'].includes(senderRole)) {
      return true;
    }

    // Gestores de empresas solo pueden enviar a:
    if (senderRole === 'GESTOR_EMPRESAS') {
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: {
          id: true,
          primaryRole: true,
          ownedCompanyId: true
        }
      });

      if (!recipient) {
        return false;
      }

      // 1. Otros gestores de empresas
      if (recipient.primaryRole === 'GESTOR_EMPRESAS') {
        return true;
      }

      // 2. Admins
      if (recipient.primaryRole && ['ADMIN', 'SUPER_ADMIN'].includes(recipient.primaryRole)) {
        return true;
      }

      // 3. Empresas que tenga asignadas
      if (recipient.primaryRole === 'COMPANY' && recipient.ownedCompanyId) {
        const assignedCompany = await prisma.companies.findFirst({
          where: {
            id: recipient.ownedCompanyId,
            accountManagerId: senderId
          }
        });
        return !!assignedCompany;
      }
    }

    return false;
  }

  async generateAutomaticNotifications(userId: string) {
    const leads = await prisma.company_leads.findMany({
      where: { assignedToId: userId },
      include: {
        lead_interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    const notifications: any[] = [];
    const now = new Date();

    for (const lead of leads) {
      const lastActivity = lead.lead_interactions.length > 0
        ? new Date(lead.lead_interactions[0].createdAt)
        : new Date(lead.createdAt);

      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      // Lead sin actividad por más de 3 días
      if (daysSinceActivity >= 3 && lead.status !== 'WON' && lead.status !== 'LOST') {
        notifications.push({
          userId: userId,
          type: 'REMINDER',
          priority: daysSinceActivity >= 7 ? 'HIGH' : 'MEDIUM',
          title: 'Seguimiento requerido',
          message: `${lead.companyName} lleva ${daysSinceActivity} días sin actividad`,
          leadId: lead.id,
          actionType: 'call',
          actionUrl: `/gestor-empreses/leads/${lead.id}`,
          dueDate: now
        });
      }

      // Lead de alta prioridad sin conversión
      if (lead.priority === 'HIGH' && lead.status !== 'WON' && daysSinceActivity >= 2) {
        notifications.push({
          userId: userId,
          type: 'ALERT',
          priority: 'HIGH',
          title: 'Lead de alta prioridad requiere atención',
          message: `${lead.companyName} (Prioridad Alta) necesita seguimiento inmediato`,
          leadId: lead.id,
          actionType: 'email',
          actionUrl: `/gestor-empreses/leads/${lead.id}`,
          dueDate: now
        });
      }

      // Acciones vencidas
      for (const interaction of lead.lead_interactions) {
        if (interaction.nextAction && !interaction.nextActionCompleted && interaction.nextActionDate) {
          const actionDate = new Date(interaction.nextActionDate);
          if (actionDate <= now) {
            notifications.push({
              userId: userId,
              type: 'ALERT',
              priority: 'HIGH',
              title: 'Acción vencida',
              message: `${interaction.nextAction} para ${lead.companyName} está vencida`,
              leadId: lead.id,
              actionType: 'follow_up',
              actionUrl: `/gestor-empreses/leads/${lead.id}`,
              dueDate: actionDate,
              metadata: { interactionId: interaction.id }
            });
          }
        }
      }
    }

    // Crear las notificaciones en lote
    const createdNotifications = [];
    for (const notificationData of notifications) {
      // Verificar si ya existe una notificación similar reciente
      const existingNotification = await prisma.notifications.findFirst({
        where: {
          userId: notificationData.userId,
          leadId: notificationData.leadId,
          type: notificationData.type,
          title: notificationData.title,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      });

      if (!existingNotification) {
        const created = await this.createNotification(notificationData);
        createdNotifications.push(created);
      }
    }

    return createdNotifications;
  }
}