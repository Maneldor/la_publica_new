import prisma from '../../config/database';

export class GroupsService {
  async createGroup(data: {
    name: string;
    description?: string;
    type: 'publico' | 'privado';
    category?: string;
    configuration?: any;
    creatorId: string;
  }) {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        creatorId: data.creatorId
      }
    });

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: data.creatorId,
        role: 'admin'
      }
    });

    return group;
  }

  async listGroups(filters: {
    type?: 'publico' | 'privado';
    category?: string;
    isActive?: boolean;
    userId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.userId) {
      where.members = {
        some: {
          userId: filters.userId,
          status: 'active'
        }
      };
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.group.count({ where })
    ]);

    return {
      groups: groups.map(group => ({
        ...group,
        configuration: group.configuration ? JSON.parse(group.configuration as string) : null
      })),
      total
    };
  }

  async getGroupById(id: string) {
    const group = await prisma.group.findUnique({
      where: { id }
    });

    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    return {
      ...group,
      configuration: group.configuration ? JSON.parse(group.configuration as string) : null
    };
  }

  async updateGroup(id: string, userId: string, data: {
    name?: string;
    description?: string;
    type?: 'publico' | 'privado';
    category?: string;
    configuration?: any;
    isActive?: boolean;
  }) {
    const isAdmin = await this.verifyGroupAdmin(id, userId);
    if (!isAdmin) {
      throw new Error('No tienes permisos para editar este grupo');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.configuration !== undefined) {
      updateData.configuration = JSON.stringify(data.configuration);
    }

    const group = await prisma.group.update({
      where: { id },
      data: updateData
    });

    return {
      ...group,
      configuration: group.configuration ? JSON.parse(group.configuration as string) : null
    };
  }

  async deleteGroup(id: string, userId: string) {
    const isAdmin = await this.verifyGroupAdmin(id, userId);
    if (!isAdmin) {
      throw new Error('No tienes permisos para eliminar este grupo');
    }

    await prisma.$transaction([
      prisma.groupPost.deleteMany({
        where: { groupId: id }
      }),
      prisma.groupMember.deleteMany({
        where: { groupId: id }
      }),
      prisma.group.delete({
        where: { id }
      })
    ]);

    return { success: true, message: 'Grupo eliminado correctamente' };
  }

  async addMember(groupId: string, data: {
    userId: string;
    role?: 'member' | 'moderator' | 'admin';
    invitedBy: string;
  }) {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    if (group.type === 'privado') {
      const isAdmin = await this.verifyGroupAdmin(groupId, data.invitedBy);
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden añadir miembros a grupos privados');
      }
    }

    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: data.userId
      }
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new Error('El usuario ya es miembro del grupo');
      }

      return await prisma.groupMember.update({
        where: { id: existingMember.id },
        data: {
          status: 'active',
          joinedAt: new Date(),
          role: data.role || 'member'
        }
      });
    }

    return await prisma.groupMember.create({
      data: {
        groupId,
        userId: data.userId,
        role: data.role || 'member',
        status: 'active'
      }
    });
  }

  async removeMember(groupId: string, userId: string, requesterId: string) {
    const isAdmin = await this.verifyGroupAdmin(groupId, requesterId);
    const isSameUser = userId === requesterId;

    if (!isAdmin && !isSameUser) {
      throw new Error('No tienes permisos para eliminar miembros');
    }

    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'active'
      }
    });

    if (!member) {
      throw new Error('Miembro no encontrado');
    }

    if (member.role === 'admin') {
      const otherAdmins = await prisma.groupMember.count({
        where: {
          groupId,
          role: 'admin',
          status: 'active',
          userId: { not: userId }
        }
      });

      if (otherAdmins === 0) {
        throw new Error('No puedes abandonar el grupo siendo el único administrador');
      }
    }

    await prisma.groupMember.update({
      where: { id: member.id },
      data: {
        status: 'inactive'
      }
    });

    return { success: true, message: 'Miembro eliminado del grupo' };
  }

  async updateMemberRole(groupId: string, userId: string, newRole: 'member' | 'moderator' | 'admin', requesterId: string) {
    const isAdmin = await this.verifyGroupAdmin(groupId, requesterId);
    if (!isAdmin) {
      throw new Error('Solo los administradores pueden cambiar roles');
    }

    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'active'
      }
    });

    if (!member) {
      throw new Error('Miembro no encontrado');
    }

    return await prisma.groupMember.update({
      where: { id: member.id },
      data: { role: newRole }
    });
  }

  async getGroupMembers(groupId: string, filters: {
    role?: 'member' | 'moderator' | 'admin';
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      groupId,
      status: 'active'
    };

    if (filters.role) where.role = filters.role;

    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where,
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' }
        ],
        take: filters.limit || 50,
        skip: filters.offset || 0
      }),
      prisma.groupMember.count({ where })
    ]);

    return { members, total };
  }

  async createGroupPost(data: {
    groupId: string;
    title: string;
    content: string;
    type: 'texto' | 'imagen' | 'video' | 'enlace' | 'encuesta';
    userId: string;
    tags?: string[];
    multimedia?: any;
    publishImmediately?: boolean;
  }) {
    const isMember = await this.verifyActiveMember(data.groupId, data.userId);
    if (!isMember) {
      throw new Error('Debes ser miembro del grupo para publicar');
    }

    const post = await prisma.groupPost.create({
      data: {
        groupId: data.groupId,
        title: data.title,
        content: data.content,
        type: data.type,
        userId: data.userId,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        multimedia: data.multimedia ? JSON.stringify(data.multimedia) : null,
        isPublished: data.publishImmediately !== false,
        publishedAt: data.publishImmediately !== false ? new Date() : null,
        isActive: true
      }
    });

    return {
      ...post,
      tags: post.tags ? JSON.parse(post.tags as string) : [],
      multimedia: post.multimedia ? JSON.parse(post.multimedia as string) : null
    };
  }

  async getGroupPosts(groupId: string, filters: {
    type?: string;
    userId?: string;
    tag?: string;
    isPublished?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      groupId,
      isActive: true
    };

    if (filters.type) where.type = filters.type;
    if (filters.userId) where.userId = filters.userId;
    if (filters.isPublished !== undefined) where.isPublished = filters.isPublished;
    if (filters.tag) {
      where.tags = {
        contains: filters.tag
      };
    }

    const [posts, total] = await Promise.all([
      prisma.groupPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.groupPost.count({ where })
    ]);

    return {
      posts: posts.map(post => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags as string) : [],
        multimedia: post.multimedia ? JSON.parse(post.multimedia as string) : null
      })),
      total
    };
  }

  async updateGroupPost(postId: string, userId: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
    multimedia?: any;
  }) {
    const post = await prisma.groupPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    if (post.userId !== userId) {
      const isModeratorOrAdmin = await this.verifyModeratorOrAdmin(post.groupId, userId);
      if (!isModeratorOrAdmin) {
        throw new Error('No tienes permisos para editar este post');
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.multimedia !== undefined) updateData.multimedia = JSON.stringify(data.multimedia);

    const updatedPost = await prisma.groupPost.update({
      where: { id: postId },
      data: updateData
    });

    return {
      ...updatedPost,
      tags: updatedPost.tags ? JSON.parse(updatedPost.tags as string) : [],
      multimedia: updatedPost.multimedia ? JSON.parse(updatedPost.multimedia as string) : null
    };
  }

  async deleteGroupPost(postId: string, userId: string) {
    const post = await prisma.groupPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new Error('Post no encontrado');
    }

    if (post.userId !== userId) {
      const isModeratorOrAdmin = await this.verifyModeratorOrAdmin(post.groupId, userId);
      if (!isModeratorOrAdmin) {
        throw new Error('No tienes permisos para eliminar este post');
      }
    }

    await prisma.groupPost.update({
      where: { id: postId },
      data: { isActive: false }
    });

    return { success: true, message: 'Post eliminado correctamente' };
  }

  private async verifyGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        role: 'admin',
        status: 'active'
      }
    });
    return !!member;
  }

  private async verifyModeratorOrAdmin(groupId: string, userId: string): Promise<boolean> {
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        role: { in: ['moderator', 'admin'] },
        status: 'active'
      }
    });
    return !!member;
  }

  private async verifyActiveMember(groupId: string, userId: string): Promise<boolean> {
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'active'
      }
    });
    return !!member;
  }
}