import prisma from '../../config/database';

export class ForumsService {
  async createForum(data: {
    title: string;
    description?: string;
    type: string;
    category: string;
    comunidadSlug?: string;
    creatorId: string;
    configuration?: any;
    order?: number;
  }) {
    const forum = await prisma.forum.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        comunidadSlug: data.comunidadSlug,
        creatorId: data.creatorId,
        configuration: data.configuration ? JSON.stringify(data.configuration) : null,
        order: data.order || 0,
        isPinned: false,
        isActive: true,
        isLocked: false
      }
    });

    return {
      ...forum,
      configuration: forum.configuration ? JSON.parse(forum.configuration as string) : null
    };
  }

  async listForums(filters: {
    type?: string;
    category?: string;
    comunidad?: string;
    isPinned?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.comunidad) where.comunidadSlug = filters.comunidad;
    if (filters.isPinned !== undefined) where.isPinned = filters.isPinned;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.isLocked !== undefined) where.isLocked = filters.isLocked;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [forums, total] = await Promise.all([
      prisma.forum.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.forum.count({ where })
    ]);

    return {
      forums: forums.map(forum => ({
        ...forum,
        configuration: forum.configuration ? JSON.parse(forum.configuration as string) : null
      })),
      total
    };
  }

  async getForumById(id: string) {
    const forum = await prisma.forum.findUnique({
      where: { id }
    });

    if (!forum) {
      throw new Error('Foro no encontrado');
    }

    return {
      ...forum,
      configuration: forum.configuration ? JSON.parse(forum.configuration as string) : null
    };
  }

  async updateForum(id: string, userId: string, data: {
    title?: string;
    description?: string;
    type?: string;
    category?: string;
    configuration?: any;
    order?: number;
    isPinned?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
  }) {
    const forum = await prisma.forum.findUnique({
      where: { id }
    });

    if (!forum) {
      throw new Error('Foro no encontrado');
    }

    if (forum.creatorId !== userId) {
      throw new Error('No tienes permisos para editar este foro');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isLocked !== undefined) updateData.isLocked = data.isLocked;
    if (data.configuration !== undefined) updateData.configuration = JSON.stringify(data.configuration);

    const updatedForum = await prisma.forum.update({
      where: { id },
      data: updateData
    });

    return {
      ...updatedForum,
      configuration: updatedForum.configuration ? JSON.parse(updatedForum.configuration as string) : null
    };
  }

  async deleteForum(id: string, userId: string) {
    const forum = await prisma.forum.findUnique({
      where: { id }
    });

    if (!forum) {
      throw new Error('Foro no encontrado');
    }

    if (forum.creatorId !== userId) {
      throw new Error('No tienes permisos para eliminar este foro');
    }

    await prisma.$transaction([
      prisma.forumReply.deleteMany({
        where: {
          topic: {
            forumId: id
          }
        }
      }),
      prisma.forumTopic.deleteMany({
        where: { forumId: id }
      }),
      prisma.forumModerator.deleteMany({
        where: { forumId: id }
      }),
      prisma.forum.delete({
        where: { id }
      })
    ]);

    return { success: true, message: 'Foro eliminado correctamente' };
  }

  async createTopic(data: {
    forumId: string;
    title: string;
    content: string;
    type: 'discusion' | 'pregunta' | 'anuncio';
    userId: string;
    tags?: string[];
    isPinned?: boolean;
  }) {
    const forum = await prisma.forum.findUnique({
      where: { id: data.forumId }
    });

    if (!forum || !forum.isActive) {
      throw new Error('Foro no encontrado o inactivo');
    }

    if (forum.isLocked) {
      throw new Error('El foro está bloqueado');
    }

    const topic = await prisma.forumTopic.create({
      data: {
        forumId: data.forumId,
        title: data.title,
        content: data.content,
        type: data.type,
        userId: data.userId,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isPinned: data.isPinned || false,
        isActive: true,
        isLocked: false,
        lastActivity: new Date()
      }
    });

    return {
      ...topic,
      tags: topic.tags ? JSON.parse(topic.tags as string) : []
    };
  }

  async listTopics(forumId: string, filters: {
    type?: 'discusion' | 'pregunta' | 'anuncio';
    userId?: string;
    isPinned?: boolean;
    isLocked?: boolean;
    search?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      forumId,
      isActive: true
    };

    if (filters.type) where.type = filters.type;
    if (filters.userId) where.userId = filters.userId;
    if (filters.isPinned !== undefined) where.isPinned = filters.isPinned;
    if (filters.isLocked !== undefined) where.isLocked = filters.isLocked;
    if (filters.tag) {
      where.tags = {
        contains: filters.tag
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { lastActivity: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.forumTopic.count({ where })
    ]);

    return {
      topics: topics.map(topic => ({
        ...topic,
        tags: topic.tags ? JSON.parse(topic.tags as string) : []
      })),
      total
    };
  }

  async getTopicById(id: string) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id }
    });

    if (!topic) {
      throw new Error('Topic no encontrado');
    }

    return {
      ...topic,
      tags: topic.tags ? JSON.parse(topic.tags as string) : []
    };
  }

  async updateTopic(id: string, userId: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
    isLocked?: boolean;
  }) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id }
    });

    if (!topic) {
      throw new Error('Topic no encontrado');
    }

    if (topic.userId !== userId) {
      const isModerator = await this.verifyModeratorOrAdmin(topic.forumId, userId);
      if (!isModerator) {
        throw new Error('No tienes permisos para editar este topic');
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    if (data.isLocked !== undefined) updateData.isLocked = data.isLocked;

    const updatedTopic = await prisma.forumTopic.update({
      where: { id },
      data: updateData
    });

    return {
      ...updatedTopic,
      tags: updatedTopic.tags ? JSON.parse(updatedTopic.tags as string) : []
    };
  }

  async deleteTopic(id: string, userId: string) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id }
    });

    if (!topic) {
      throw new Error('Topic no encontrado');
    }

    if (topic.userId !== userId) {
      const isModerator = await this.verifyModeratorOrAdmin(topic.forumId, userId);
      if (!isModerator) {
        throw new Error('No tienes permisos para eliminar este topic');
      }
    }

    await prisma.$transaction([
      prisma.forumReply.deleteMany({
        where: { topicId: id }
      }),
      prisma.forumTopic.update({
        where: { id },
        data: { isActive: false }
      })
    ]);

    return { success: true, message: 'Topic eliminado correctamente' };
  }

  async createReply(data: {
    topicId: string;
    content: string;
    userId: string;
    replyToId?: string;
  }) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: data.topicId }
    });

    if (!topic || !topic.isActive) {
      throw new Error('Topic no encontrado o inactivo');
    }

    if (topic.isLocked) {
      throw new Error('El topic está bloqueado');
    }

    const reply = await prisma.forumReply.create({
      data: {
        topicId: data.topicId,
        content: data.content,
        userId: data.userId,
        replyToId: data.replyToId,
        isActive: true
      }
    });

    await prisma.forumTopic.update({
      where: { id: data.topicId },
      data: { lastActivity: new Date() }
    });

    return reply;
  }

  async listReplies(topicId: string, filters: {
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      topicId,
      isActive: true
    };

    if (filters.userId) where.userId = filters.userId;

    const [replies, total] = await Promise.all([
      prisma.forumReply.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      }),
      prisma.forumReply.count({ where })
    ]);

    return { replies, total };
  }

  async updateReply(id: string, userId: string, data: {
    content: string;
  }) {
    const reply = await prisma.forumReply.findUnique({
      where: { id }
    });

    if (!reply) {
      throw new Error('Respuesta no encontrada');
    }

    if (reply.userId !== userId) {
      throw new Error('No tienes permisos para editar esta respuesta');
    }

    const updatedReply = await prisma.forumReply.update({
      where: { id },
      data: { content: data.content }
    });

    return updatedReply;
  }

  async deleteReply(id: string, userId: string) {
    const reply = await prisma.forumReply.findUnique({
      where: { id },
      include: { topic: true }
    });

    if (!reply) {
      throw new Error('Respuesta no encontrada');
    }

    if (reply.userId !== userId) {
      const isModerator = await this.verifyModeratorOrAdmin(reply.topic.forumId, userId);
      if (!isModerator) {
        throw new Error('No tienes permisos para eliminar esta respuesta');
      }
    }

    await prisma.forumReply.update({
      where: { id },
      data: { isActive: false }
    });

    return { success: true, message: 'Respuesta eliminada correctamente' };
  }

  async addModerator(forumId: string, data: {
    userId: string;
    role: 'admin' | 'moderator';
    assignedBy: string;
  }) {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId }
    });

    if (!forum) {
      throw new Error('Foro no encontrado');
    }

    if (forum.creatorId !== data.assignedBy) {
      const isAdmin = await this.verifyForumAdmin(forumId, data.assignedBy);
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden añadir moderadores');
      }
    }

    const existingModerator = await prisma.forumModerator.findFirst({
      where: {
        forumId,
        userId: data.userId
      }
    });

    if (existingModerator) {
      throw new Error('El usuario ya es moderador de este foro');
    }

    const moderator = await prisma.forumModerator.create({
      data: {
        forumId,
        userId: data.userId,
        role: data.role,
        assignedAt: new Date()
      }
    });

    return moderator;
  }

  async removeModerator(forumId: string, userId: string, requesterId: string) {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId }
    });

    if (!forum) {
      throw new Error('Foro no encontrado');
    }

    if (forum.creatorId !== requesterId) {
      const isAdmin = await this.verifyForumAdmin(forumId, requesterId);
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden remover moderadores');
      }
    }

    const moderator = await prisma.forumModerator.findFirst({
      where: {
        forumId,
        userId
      }
    });

    if (!moderator) {
      throw new Error('Moderador no encontrado');
    }

    await prisma.forumModerator.delete({
      where: { id: moderator.id }
    });

    return { success: true, message: 'Moderador removido correctamente' };
  }

  private async verifyForumAdmin(forumId: string, userId: string): Promise<boolean> {
    const moderator = await prisma.forumModerator.findFirst({
      where: {
        forumId,
        userId,
        role: 'admin'
      }
    });
    return !!moderator;
  }

  private async verifyModeratorOrAdmin(forumId: string, userId: string): Promise<boolean> {
    const moderator = await prisma.forumModerator.findFirst({
      where: {
        forumId,
        userId,
        role: { in: ['moderator', 'admin'] }
      }
    });
    return !!moderator;
  }
}