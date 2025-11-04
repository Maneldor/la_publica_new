import { Request, Response } from 'express';
import { AnnouncementsService } from './announcements.service';

const announcementsService = new AnnouncementsService();

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    console.log('👤 Usuario del request:', req.user);
    console.log('📦 Body recibido:', req.body);

    const user = req.user;
    if (!user || !user.id) {
      console.log('❌ Usuario no autenticado');
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const announcementData = {
      ...req.body,
      userId: user.id,
      autorId: user.id
    };

    console.log('📦 Datos con userId:', announcementData);

    const anuncio = await announcementsService.createAnnouncement(announcementData);

    res.status(201).json({
      success: true,
      data: anuncio,
      mensaje: 'Anuncio creado exitosamente'
    });
  } catch (error: any) {
    console.error('🔴 Error en controller:', error);
    console.error('🔴 Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listAnnouncements = async (req: Request, res: Response) => {
  try {
    const {
      tipo,
      prioridad,
      alcance,
      activo,
      fijado,
      expirado,
      status,
      usuarioId,
      comunidad,
      grupo,
      busqueda,
      fechaDesde,
      fechaHasta,
      limit,
      offset
    } = req.query;

    const filters = {
      type: tipo as 'general' | 'urgente' | 'mantenimiento' | 'actualizacion',
      priority: prioridad as 'baja' | 'media' | 'alta' | 'critica',
      scope: alcance as 'global' | 'comunidad' | 'grupo' | 'usuarios',
      status: status as string,
      isActive: activo !== undefined ? activo === 'true' : undefined,
      isPinned: fijado !== undefined ? fijado === 'true' : undefined,
      isExpired: expirado !== undefined ? expirado === 'true' : undefined,
      userId: usuarioId as string,
      comunidad: comunidad as string,
      grupo: grupo as string,
      search: busqueda as string,
      startDate: fechaDesde ? new Date(fechaDesde as string) : undefined,
      endDate: fechaHasta ? new Date(fechaHasta as string) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    };

    const resultado = await announcementsService.listAnnouncements(filters);

    res.json({
      success: true,
      data: [], // resultado.announcements - Método temporalmente deshabilitado
      pagination: {
        total: 0, // resultado.total - Método temporalmente deshabilitado
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

export const getAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const anuncio = await announcementsService.getAnnouncementById(id, user?.id);

    res.json({
      success: true,
      data: anuncio
    });
  } catch (error: any) {
    console.error('Error obteniendo anuncio:', error);
    res.status(error.message === 'Anuncio no encontrado' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const anuncio = await announcementsService.updateAnnouncement(id, user.id, req.body);

    res.json({
      success: true,
      data: anuncio,
      mensaje: 'Anuncio actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando anuncio:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const resultado = await announcementsService.deleteAnnouncement(id, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error eliminando anuncio:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const pinAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const resultado = await announcementsService.pinAnnouncement(id, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error fijando anuncio:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const expireAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const resultado = await announcementsService.expireAnnouncement(id, user.id);

    res.json({
      success: true,
      data: resultado
    });
  } catch (error: any) {
    console.error('Error expirando anuncio:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const markAnnouncementAsRead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const lectura = await announcementsService.markAsRead(id, user.id);

    res.json({
      success: true,
      data: lectura,
      mensaje: 'Anuncio marcado como leído'
    });
  } catch (error: any) {
    console.error('Error marcando anuncio como leído:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getReadStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const estado = await announcementsService.getReadStatus(id, user.id);

    res.json({
      success: true,
      data: estado
    });
  } catch (error: any) {
    console.error('Error obteniendo estado de lectura:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getAnnouncementStats = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const estadisticas = await announcementsService.getAnnouncementStats(id, user.id);

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const getActiveAnnouncements = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { comunidad, grupo, prioridad, limit } = req.query;

    const announcements = await announcementsService.getActiveAnnouncements({
      userId: user?.id,
      comunidad: comunidad as string,
      grupo: grupo as string,
      priority: prioridad as 'baja' | 'media' | 'alta' | 'critica',
      limit: limit ? Number(limit) : undefined
    });

    res.json({
      success: true,
      data: announcements
    });
  } catch (error: any) {
    console.error('Error obteniendo announcements activos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const approveAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const resultado = await announcementsService.approveAnnouncement(id, user.id);

    res.json({
      success: true,
      data: resultado,
      mensaje: 'Anuncio aprobado exitosamente'
    });
  } catch (error: any) {
    console.error('Error aprobando anuncio:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const rejectAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const resultado = await announcementsService.rejectAnnouncement(id, user.id, reason);

    res.json({
      success: true,
      data: resultado,
      mensaje: 'Anuncio rechazado exitosamente'
    });
  } catch (error: any) {
    console.error('Error rechazando anuncio:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const getPendingAnnouncements = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { limit, offset } = req.query;
    const resultado = await announcementsService.getPendingAnnouncements(user.id, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: [], // resultado.announcements - Método temporalmente deshabilitado
      pagination: {
        total: 0, // resultado.total - Método temporalmente deshabilitado
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo anuncios pendientes:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};