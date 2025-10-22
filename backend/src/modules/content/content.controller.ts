import { Request, Response } from 'express';
import { ContentService } from './content.service';

const contentService = new ContentService();

export const crearYPublicarContenido = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const resultado = await contentService.crearYPublicar({
      ...req.body,
      autorId: user.id,
      autorNombre: user.email
    });

    res.status(201).json({
      success: true,
      data: resultado,
      mensaje: `Contenido publicado en ${resultado.publicaciones.length} ubicaciones`
    });
  } catch (error: any) {
    console.error('Error creando contenido:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listarContenido = async (req: Request, res: Response) => {
  try {
    const { tipo, estado, limit, offset } = req.query;

    const resultado = await contentService.listarContenido({
      tipo: tipo as string,
      estado: estado as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.contenidos,
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