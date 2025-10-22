import { Request, Response } from 'express';
import { ForumsService } from './forums.service';

const forumsService = new ForumsService();

// Foros
export const createForum = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const foro = await forumsService.createForum({
      ...req.body,
      creadorId: user.id
    });

    res.status(201).json({
      success: true,
      data: foro,
      mensaje: 'Foro creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando foro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listForums = async (req: Request, res: Response) => {
  try {
    const { category, type, isActive, search, limit, offset } = req.query;

    const resultado = await forumsService.listForums({
      category: category as string,
      type: type as 'publico' | 'privado' | 'moderado',
      isActive: isActive === 'true',
      search: search as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.forums,
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

export const getForum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const foro = await forumsService.getForumById(id);

    res.json({
      success: true,
      data: foro
    });
  } catch (error: any) {
    console.error('Error obteniendo foro:', error);
    res.status(error.message === 'Foro no encontrado' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateForum = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const foro = await forumsService.updateForum(id, user.id, req.body);

    res.json({
      success: true,
      data: foro,
      mensaje: 'Foro actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando foro:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteForum = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const resultado = await forumsService.deleteForum(id, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error eliminando foro:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

// Topics
export const createTopic = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const topic = await forumsService.createTopic({
      ...req.body,
      foroId: id,
      autorId: user.id
    });

    res.status(201).json({
      success: true,
      data: topic,
      mensaje: 'Topic creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando topic:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const listTopics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, autorId, fijado, bloqueado, search, etiqueta, limit, offset } = req.query;

    const resultado = await forumsService.listTopics(id, {
      type: type as 'discusion' | 'pregunta' | 'anuncio',
      userId: autorId as string,
      isPinned: fijado === 'true',
      isLocked: bloqueado === 'true',
      search: search as string,
      tag: etiqueta as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.topics,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo topics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const topic = await forumsService.getTopicById(topicId);

    res.json({
      success: true,
      data: topic
    });
  } catch (error: any) {
    console.error('Error obteniendo topic:', error);
    res.status(error.message === 'Topic no encontrado' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { topicId } = req.params;
    const topic = await forumsService.updateTopic(topicId, user.id, req.body);

    res.json({
      success: true,
      data: topic,
      mensaje: 'Topic actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando topic:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { topicId } = req.params;
    const resultado = await forumsService.deleteTopic(topicId, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error eliminando topic:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const pinTopic = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { topicId } = req.params;
    const topic = await forumsService.getTopicById(topicId);
    const resultado = await forumsService.updateTopic(topicId, user.id, { isPinned: true });

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error fijando topic:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const lockTopic = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { topicId } = req.params;
    const topic = await forumsService.getTopicById(topicId);
    const resultado = await forumsService.updateTopic(topicId, user.id, { isLocked: true });

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error bloqueando topic:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

// Respuestas
export const createReply = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { topicId } = req.params;
    const respuesta = await forumsService.createReply({
      ...req.body,
      topicId,
      autorId: user.id
    });

    res.status(201).json({
      success: true,
      data: respuesta,
      mensaje: 'Respuesta creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando respuesta:', error);
    res.status(error.message.includes('bloqueado') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const listReplies = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { autorId, limit, offset } = req.query;

    const resultado = await forumsService.listReplies(topicId, {
      userId: autorId as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.replies,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo respuestas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateReply = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { replyId } = req.params;
    const respuesta = await forumsService.updateReply(replyId, user.id, req.body);

    res.json({
      success: true,
      data: respuesta,
      mensaje: 'Respuesta actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando respuesta:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteReply = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { replyId } = req.params;
    const resultado = await forumsService.deleteReply(replyId, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error eliminando respuesta:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

// Moderadores
export const addModerator = async (req: Request, res: Response) => {
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

    const moderador = await forumsService.addModerator(id, {
      userId: usuarioId,
      role: rol,
      assignedBy: user.id
    });

    res.status(201).json({
      success: true,
      data: moderador,
      mensaje: 'Moderador añadido exitosamente'
    });
  } catch (error: any) {
    console.error('Error añadiendo moderador:', error);
    res.status(error.message.includes('administradores') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const removeModerator = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id, usuarioId } = req.params;
    const resultado = await forumsService.removeModerator(id, usuarioId, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error removiendo moderador:', error);
    res.status(error.message.includes('administradores') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};