import prisma from '../../config/database';

// Tipos para prioridades
type PriorityString = 'baja' | 'media' | 'alta' | 'critica';
type PriorityInput = PriorityString | number;

// Mapeo de prioridades string a número
const priorityMap = {
  'baja': 1,
  'media': 5,
  'alta': 8,
  'critica': 10
} as const;

// Función auxiliar para convertir priority a número
function convertPriorityToNumber(priority: PriorityInput | undefined): number | undefined {
  if (priority === undefined) return undefined;
  if (typeof priority === 'number') return priority;
  return priorityMap[priority as PriorityString];
}

export class AnnouncementsService {
  async createAnnouncement(data: {
    title: string;
    content: string;
    type: 'general' | 'urgente' | 'mantenimiento' | 'actualizacion';
    priority: PriorityInput;
    scope: 'global' | 'comunidad' | 'grupo' | 'usuarios';
    targets?: string[];
    startDate?: Date;
    expiresAt?: Date;
    configuration?: any;
    status?: string;
    userId: string;
  }) {
    const announcement = await prisma.announcements.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        priority: convertPriorityToNumber(data.priority),
        scope: data.scope,
        targets: data.targets ? JSON.stringify(data.targets) : undefined,
        startDate: data.startDate || new Date(),
        expiresAt: data.expiresAt,
        configuration: data.configuration ? JSON.stringify(data.configuration) : undefined,
        userId: data.userId,
        status: 'approved',
        isActive: true,
        isPinned: false,
        isRead: false
      },
      include: {
        User: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return {
      ...announcement,
      targets: announcement.targets ? JSON.parse(announcement.targets as string) : [],
      configuration: announcement.configuration ? JSON.parse(announcement.configuration as string) : null
    };
  }

  async listAnnouncements(filters: {
    type?: 'general' | 'urgente' | 'mantenimiento' | 'actualizacion';
    priority?: PriorityString;
    scope?: 'global' | 'comunidad' | 'grupo' | 'usuarios';
    status?: string;
    isActive?: boolean;
    isPinned?: boolean;
    isExpired?: boolean;
    userId?: string;
    comunidad?: string;
    grupo?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    console.log('🔍 Filtros recibidos en service:', filters);
    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.priority) where.priority = convertPriorityToNumber(filters.priority);
    if (filters.scope) where.scope = filters.scope;
    if (filters.status) where.status = filters.status;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.isPinned !== undefined) where.isPinned = filters.isPinned;

    if (filters.isExpired !== undefined) {
      if (filters.isExpired) {
        where.expiresAt = {
          lt: new Date()
        };
      } else {
        where.OR = [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ];
      }
    }

    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) where.startDate.gte = filters.startDate;
      if (filters.endDate) where.startDate.lte = filters.endDate;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.userId || filters.comunidad || filters.grupo) {
      const targetsFilter = [];
      if (filters.userId) targetsFilter.push(`"usuarios":["${filters.userId}"]`);
      if (filters.comunidad) targetsFilter.push(`"comunidades":["${filters.comunidad}"]`);
      if (filters.grupo) targetsFilter.push(`"grupos":["${filters.grupo}"]`);

      if (targetsFilter.length > 0) {
        where.OR = [
          { scope: 'global' },
          ...targetsFilter.map(filter => ({
            targets: { contains: filter }
          }))
        ];
      }
    }

    console.log('📋 Query WHERE:', JSON.stringify(where, null, 2));

    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              email: true
            }
          },
          announcement_reads: true
        },
        orderBy: [
          { isPinned: 'desc' },
          { priority: 'desc' },
          { startDate: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.announcements.count({ where })
    ]);

    console.log(`✅ Trobats ${announcements.length} anuncis de ${total} total`);
    console.log('📢 Primer anunci:', announcements[0]);

    return {
      announcements: announcements.map(announcement => ({
        ...announcement,
        targets: announcement.targets ? JSON.parse(announcement.targets as string) : [],
        configuration: announcement.configuration ? JSON.parse(announcement.configuration as string) : null,
        totalReads: announcement.announcement_reads?.length || 0,
        isExpired: announcement.expiresAt ? announcement.expiresAt < new Date() : false
      })),
      total
    };
  }

  async getAnnouncementById(id: string, userId?: string) {
    const announcement = await prisma.announcements.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            email: true
          }
        },
        _count: {
          select: {
            announcement_reads: true
          }
        },
        announcement_reads: userId ? {
          where: { userId },
          take: 1
        } : false
      }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    const readByUser = userId && announcement.announcement_reads && announcement.announcement_reads.length > 0;

    if (userId && !readByUser) {
      await this.markAsRead(id, userId);
    }

    return {
      ...announcement,
      targets: announcement.targets ? JSON.parse(announcement.targets as string) : [],
      configuration: announcement.configuration ? JSON.parse(announcement.configuration as string) : null,
      totalReads: announcement._count.announcement_reads,
      isExpired: announcement.expiresAt ? announcement.expiresAt < new Date() : false,
      readByUser
    };
  }

  async updateAnnouncement(id: string, userId: string, data: {
    title?: string;
    content?: string;
    type?: 'general' | 'urgente' | 'mantenimiento' | 'actualizacion';
    priority?: PriorityInput;
    scope?: 'global' | 'comunidad' | 'grupo' | 'usuarios';
    targets?: string[];
    startDate?: Date;
    expiresAt?: Date;
    configuration?: any;
    isActive?: boolean;
  }) {
    const announcement = await prisma.announcements.findUnique({
      where: { id }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    if (announcement.userId !== userId) {
      const isAdmin = await this.verifyAdminPermission(userId);
      if (!isAdmin) {
        throw new Error('No tienes permisos para editar este anuncio');
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.priority !== undefined) updateData.priority = convertPriorityToNumber(data.priority);
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.targets !== undefined) updateData.targets = JSON.stringify(data.targets);
    if (data.configuration !== undefined) {
      updateData.configuration = JSON.stringify(data.configuration);
    }

    const updatedAnnouncement = await prisma.announcements.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            email: true
          }
        },
        _count: {
          select: {
            announcement_reads: true
          }
        }
      }
    });

    return {
      ...updatedAnnouncement,
      targets: updatedAnnouncement.targets ? JSON.parse(updatedAnnouncement.targets as string) : [],
      configuration: updatedAnnouncement.configuration ? JSON.parse(updatedAnnouncement.configuration as string) : null,
      totalReads: updatedAnnouncement._count.announcement_reads,
      isExpired: updatedAnnouncement.expiresAt ? updatedAnnouncement.expiresAt < new Date() : false
    };
  }

  async deleteAnnouncement(id: string, userId: string) {
    const announcement = await prisma.announcements.findUnique({
      where: { id }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    if (announcement.userId !== userId) {
      const isAdmin = await this.verifyAdminPermission(userId);
      if (!isAdmin) {
        throw new Error('No tienes permisos para eliminar este anuncio');
      }
    }

    await prisma.$transaction([
      prisma.announcement_reads.deleteMany({
        where: { announcementId: id }
      }),
      prisma.announcements.delete({
        where: { id }
      })
    ]);

    return { success: true, message: 'Anuncio eliminado correctamente' };
  }

  async pinAnnouncement(id: string, userId: string) {
    const announcement = await prisma.announcements.findUnique({
      where: { id }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    const isAdmin = await this.verifyAdminPermission(userId);
    if (!isAdmin) {
      throw new Error('No tienes permisos para fijar anuncios');
    }

    const updatedAnnouncement = await prisma.announcements.update({
      where: { id },
      data: { isPinned: !announcement.isPinned }
    });

    return {
      success: true,
      message: updatedAnnouncement.isPinned ? 'Anuncio fijado' : 'Anuncio desfijado',
      isPinned: updatedAnnouncement.isPinned
    };
  }

  async expireAnnouncement(id: string, userId: string) {
    const announcement = await prisma.announcements.findUnique({
      where: { id }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    if (announcement.userId !== userId) {
      const isAdmin = await this.verifyAdminPermission(userId);
      if (!isAdmin) {
        throw new Error('No tienes permisos para expirar este anuncio');
      }
    }

    const updatedAnnouncement = await prisma.announcements.update({
      where: { id },
      data: {
        expiresAt: new Date(),
        isActive: false
      }
    });

    return {
      success: true,
      message: 'Anuncio expirado correctamente',
      expiresAt: updatedAnnouncement.expiresAt
    };
  }

  async markAsRead(announcementId: string, userId: string) {
    const existingRead = await prisma.announcement_reads.findFirst({
      where: {
        announcementId,
        userId
      }
    });

    if (existingRead) {
      return existingRead;
    }

    const read = await prisma.announcement_reads.create({
      data: {
        announcementId,
        userId,
        readAt: new Date()
      }
    });

    return read;
  }

  async getReadStatus(announcementId: string, userId: string) {
    const read = await prisma.announcement_reads.findFirst({
      where: {
        announcementId,
        userId
      }
    });

    return {
      isRead: !!read,
      readAt: read?.readAt || null
    };
  }

  async getAnnouncementStats(id: string, userId: string) {
    const announcement = await prisma.announcements.findUnique({
      where: { id }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    if (announcement.userId !== userId) {
      const isAdmin = await this.verifyAdminPermission(userId);
      if (!isAdmin) {
        throw new Error('No tienes permisos para ver las estadísticas de este anuncio');
      }
    }

    const [totalReads, readsByDay] = await Promise.all([
      prisma.announcement_reads.count({
        where: { announcementId: id }
      }),
      prisma.announcement_reads.groupBy({
        by: ['readAt'],
        where: {
          announcementId: id,
          readAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        _count: {
          _all: true
        }
      })
    ]);

    const readsByDate = readsByDay.reduce((acc: Record<string, number>, item: any) => {
      const date = item.readAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + item._count._all;
      return acc;
    }, {});

    const estimatedReach = await this.calculateEstimatedReach(announcement);

    return {
      totalReads,
      estimatedReach,
      readRate: estimatedReach > 0 ? (totalReads / estimatedReach) * 100 : 0,
      readsByDate,
      createdAt: announcement.createdAt,
      expiresAt: announcement.expiresAt,
      isActive: announcement.isActive,
      isExpired: announcement.expiresAt ? announcement.expiresAt < new Date() : false
    };
  }

  async getActiveAnnouncements(filters: {
    userId?: string;
    comunidad?: string;
    grupo?: string;
    priority?: PriorityString;
    limit?: number;
  }) {
    const where: any = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ],
      startDate: { lte: new Date() }
    };

    if (filters.priority) {
      where.priority = convertPriorityToNumber(filters.priority);
    }

    if (filters.userId || filters.comunidad || filters.grupo) {
      const targetsFilter = [];
      if (filters.userId) targetsFilter.push(`"usuarios":["${filters.userId}"]`);
      if (filters.comunidad) targetsFilter.push(`"comunidades":["${filters.comunidad}"]`);
      if (filters.grupo) targetsFilter.push(`"grupos":["${filters.grupo}"]`);

      if (targetsFilter.length > 0) {
        where.OR = [
          { scope: 'global' },
          ...targetsFilter.map(filter => ({
            targets: { contains: filter }
          }))
        ];
      }
    }

    const announcements = await prisma.announcements.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            email: true
          }
        },
        announcement_reads: filters.userId ? {
          where: { userId: filters.userId }
        } : false
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { startDate: 'desc' }
      ],
      take: filters.limit || 10
    });

    return announcements.map(announcement => ({
      ...announcement,
      targets: announcement.targets ? JSON.parse(announcement.targets as string) : [],
      configuration: announcement.configuration ? JSON.parse(announcement.configuration as string) : null,
      readByUser: filters.userId ? announcement.announcement_reads && announcement.announcement_reads.length > 0 : undefined
    }));
  }

  private async calculateEstimatedReach(announcement: any): Promise<number> {
    if (announcement.scope === 'global') {
      return await prisma.user.count();
    }

    if (!announcement.targets) {
      return 0;
    }

    const targets = JSON.parse(announcement.targets);
    let reach = 0;

    if (targets.usuarios && Array.isArray(targets.usuarios)) {
      reach += targets.usuarios.length;
    }

    if (targets.comunidades && Array.isArray(targets.comunidades)) {
      reach += targets.comunidades.length * 100; // Estimation
    }

    if (targets.grupos && Array.isArray(targets.grupos)) {
      const groupsCount = await prisma.group_members.count({
        where: {
          groupId: { in: targets.grupos },
          status: 'active'
        }
      });
      reach += groupsCount;
    }

    return reach;
  }

  async approveAnnouncement(id: string, userId: string) {
    // TODO: Arreglar después de resolver conflictos de schema
    throw new Error('Función temporalmente deshabilitada');
    /*
    const announcement = await prisma.announcements.findUnique({
      where: { id }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    const isAdmin = await this.verifyAdminPermission(userId);
    if (!isAdmin) {
      throw new Error('No tienes permisos para aprobar anuncios');
    }

    const updatedAnnouncement = await prisma.announcements.update({
      where: { id },
      data: {
        status: 'approved',
        isActive: true
      },
      include: {
        User: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Anuncio aprobado correctamente',
      announcement: {
        ...updatedAnnouncement,
        targets: updatedAnnouncement.targets ? JSON.parse(updatedAnnouncement.targets as string) : [],
        configuration: updatedAnnouncement.configuration ? JSON.parse(updatedAnnouncement.configuration as string) : null
      }
    };
    */
  }

  async rejectAnnouncement(id: string, userId: string, reason?: string) {
    // TODO: Arreglar después de resolver conflictos de schema
    throw new Error('Función temporalmente deshabilitada');
    /*
    const announcement = await prisma.announcements.findUnique({
      where: { id }
    });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    const isAdmin = await this.verifyAdminPermission(userId);
    if (!isAdmin) {
      throw new Error('No tienes permisos para rechazar anuncios');
    }

    // Construir la nueva configuración con la razón de rechazo
    let newConfiguration;
    if (announcement.configuration) {
      const currentConfig = JSON.parse(announcement.configuration as string);
      newConfiguration = JSON.stringify({
        ...currentConfig,
        rejectionReason: reason
      });
    } else {
      newConfiguration = JSON.stringify({ rejectionReason: reason });
    }

    const updatedAnnouncement = await prisma.announcements.update({
      where: { id },
      data: {
        status: 'rejected',
        isActive: false,
        configuration: newConfiguration
      },
      include: {
        User: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Anuncio rechazado correctamente',
      announcement: {
        ...updatedAnnouncement,
        targets: updatedAnnouncement.targets ? JSON.parse(updatedAnnouncement.targets as string) : [],
        configuration: updatedAnnouncement.configuration ? JSON.parse(updatedAnnouncement.configuration as string) : null
      }
    };
  }
    */
  }

  async getPendingAnnouncements(userId: string, filters: {
    limit?: number;
    offset?: number;
  } = {}) {
    // TODO: Arreglar después de resolver conflictos de schema
    throw new Error('Función temporalmente deshabilitada');
    /*
    const isAdmin = await this.verifyAdminPermission(userId);
    if (!isAdmin) {
      throw new Error('No tienes permisos para ver anuncios pendientes');
    }

    const where = {
      isActive: false
    };

    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              email: true
            }
          },
          announcement_reads: true
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.announcements.count({ where })
    ]);

    return {
      announcements: announcements.map(announcement => ({
        ...announcement,
        targets: announcement.targets ? JSON.parse(announcement.targets as string) : [],
        configuration: announcement.configuration ? JSON.parse(announcement.configuration as string) : null,
        totalReads: announcement.announcement_reads?.length || 0,
        isExpired: announcement.expiresAt ? announcement.expiresAt < new Date() : false
      })),
      total
    };
    */
  }

  private async verifyAdminPermission(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Roles que pueden moderar anuncios
    const moderationRoles = [
      'SUPER_ADMIN',
      'ADMIN',
      'MODERADOR_GRUPO',
      'GESTOR_CONTENIDO'
    ];

    return moderationRoles.includes(user?.primaryRole || '');
  }
}