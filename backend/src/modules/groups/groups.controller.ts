import { Request, Response } from 'express';
import { GroupsService } from './groups.service';

const groupsService = new GroupsService();

export const createGroup = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const grupo = await groupsService.createGroup({
      ...req.body,
      creadorId: user.id
    });

    res.status(201).json({
      success: true,
      data: grupo,
      mensaje: 'Grupo creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando grupo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listGroups = async (req: Request, res: Response) => {
  try {
    const { tipo, category, activo, usuarioId, busqueda, limit, offset } = req.query;

    const resultado = await groupsService.listGroups({
      type: tipo as 'publico' | 'privado',
      category: category as string,
      isActive: activo === 'true',
      userId: usuarioId as string,
      search: busqueda as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.groups,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grupo = await groupsService.getGroupById(id);

    res.json({
      success: true,
      data: grupo
    });
  } catch (error: any) {
    console.error('Error obteniendo grupo:', error);
    res.status(error.message === 'Grupo no encontrado' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const grupo = await groupsService.updateGroup(id, user.id, req.body);

    res.json({
      success: true,
      data: grupo,
      mensaje: 'Grupo actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando grupo:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const resultado = await groupsService.deleteGroup(id, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error eliminando grupo:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const addGroupMember = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const { usuarioId, rol } = req.body;

    const member = await groupsService.addMember(id, {
      userId: usuarioId,
      role: rol,
      invitedBy: user.id
    });

    res.status(201).json({
      success: true,
      data: member,
      mensaje: 'Miembro añadido exitosamente'
    });
  } catch (error: any) {
    console.error('Error añadiendo member:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const removeGroupMember = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id, usuarioId } = req.params;
    const resultado = await groupsService.removeMember(id, usuarioId, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error eliminando member:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id, usuarioId } = req.params;
    const { rol } = req.body;

    const member = await groupsService.updateMemberRole(id, usuarioId, rol, user.id);

    res.json({
      success: true,
      data: member,
      mensaje: 'Rol actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando role:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const getGroupMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rol, limit, offset } = req.query;

    const resultado = await groupsService.getGroupMembers(id, {
      role: rol as 'member' | 'moderator' | 'admin',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.members,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo members:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createGroupPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const post = await groupsService.createGroupPost({
      ...req.body,
      grupoId: id,
      userId: user.id
    });

    res.status(201).json({
      success: true,
      data: post,
      mensaje: 'Post creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando post:', error);
    res.status(error.message.includes('member') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const getGroupPosts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo, userId, etiqueta, publicado, limit, offset } = req.query;

    const resultado = await groupsService.getGroupPosts(id, {
      type: tipo as string,
      userId: userId as string,
      tag: etiqueta as string,
      isPublished: publicado === 'true',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.posts,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo posts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateGroupPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { postId } = req.params;
    const post = await groupsService.updateGroupPost(postId, user.id, req.body);

    res.json({
      success: true,
      data: post,
      mensaje: 'Post actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando post:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteGroupPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { postId } = req.params;
    const resultado = await groupsService.deleteGroupPost(postId, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error eliminando post:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};