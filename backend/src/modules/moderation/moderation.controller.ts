import { Request, Response } from 'express';
import { ModerationService } from './moderation.service';
import prisma from '../../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

const moderationService = new ModerationService();

export class ModerationController {
  async getAllReportedContent(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        type,
        status,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const result = await moderationService.getAllReportedContent({
        type: type as string,
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED',
        limit: Number(limit),
        offset
      });

      res.json({
        ...result,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Error obteniendo contenido reportado:', error);
      res.status(500).json({
        error: 'Error obteniendo contenido reportado',
        message: error.message
      });
    }
  }

  async moderateContent(req: AuthenticatedRequest, res: Response) {
    try {
      const { reportId } = req.params;
      const { action, contentId, type, moderatorNotes } = req.body;

      if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({
          error: 'Acción inválida',
          message: 'La acción debe ser APPROVE o REJECT'
        });
      }

      if (!contentId || !type) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: 'Se requiere contentId y type'
        });
      }

      const result = await moderationService.moderateContent({
        type,
        contentId,
        reportId,
        action,
        moderatorNotes
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error moderando contenido:', error);
      res.status(500).json({
        error: 'Error moderando contenido',
        message: error.message
      });
    }
  }

  async getModerationStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await moderationService.getModerationStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error obteniendo estadísticas',
        message: error.message
      });
    }
  }

  async bulkModeration(req: AuthenticatedRequest, res: Response) {
    try {
      const { reports, action } = req.body;

      if (!Array.isArray(reports) || reports.length === 0) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'Se requiere un array de reportes'
        });
      }

      if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({
          error: 'Acción inválida',
          message: 'La acción debe ser APPROVE o REJECT'
        });
      }

      const results = [];
      const errors = [];

      for (const report of reports) {
        try {
          const result = await moderationService.moderateContent({
            type: report.type,
            contentId: report.contentId,
            reportId: report.reportId,
            action,
            moderatorNotes: `Moderación en lote: ${action}`
          });
          results.push({ reportId: report.reportId, ...result });
        } catch (error: any) {
          errors.push({
            reportId: report.reportId,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        processed: results.length,
        errorCount: errors.length,
        results,
        errors
      });
    } catch (error: any) {
      console.error('Error en moderación en lote:', error);
      res.status(500).json({
        error: 'Error en moderación en lote',
        message: error.message
      });
    }
  }

  async getContentDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { type, contentId } = req.params;

      let content = null;

      switch (type) {
        case 'CONTENT':
          content = await (prisma as any).content.findUnique({
            where: { id: contentId },
            include: {
              author: { select: { id: true, email: true } }
            } as any
          });
          break;

        case 'POST':
          content = await (prisma as any).post.findUnique({
            where: { id: contentId },
            include: {
              user: { select: { id: true, email: true } }
            } as any
          });
          break;

        case 'POST_COMMENT':
          content = await (prisma as any).postComment.findUnique({
            where: { id: contentId },
            include: {} as any
          });
          break;

        case 'GROUP_POST':
          content = await (prisma as any).groupPost.findUnique({
            where: { id: contentId },
            include: {} as any
          });
          break;

        case 'FORUM_TOPIC':
          content = await prisma.forumTopic.findUnique({
            where: { id: contentId },
            include: {} as any
          });
          break;

        case 'FORUM_REPLY':
          content = await prisma.forumReply.findUnique({
            where: { id: contentId },
            include: {} as any
          });
          break;

        case 'ANNOUNCEMENT':
          content = await prisma.announcement.findUnique({
            where: { id: contentId },
            include: {} as any
          });
          break;

        default:
          return res.status(400).json({
            error: 'Tipo de contenido no soportado',
            message: `El tipo ${type} no está soportado actualmente`
          });
      }

      if (!content) {
        return res.status(404).json({
          error: 'Contenido no encontrado',
          message: 'El contenido solicitado no existe'
        });
      }

      res.json(content);
    } catch (error: any) {
      console.error('Error obteniendo detalles del contenido:', error);
      res.status(500).json({
        error: 'Error obteniendo detalles del contenido',
        message: error.message
      });
    }
  }

  async getReportHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Buscar reportes hechos por el usuario
      const reportsMade = await Promise.all([
        (prisma as any).report.findMany({
          where: { reporterId: userId },
          include: {
            content: { select: { title: true, id: true } }
          } as any,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: Number(limit)
        }),
        (prisma as any).postReport.findMany({
          where: { reporterId: userId } as any,
          include: {
            post: { select: { content: true, id: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: Number(limit)
        })
      ]);

      // Buscar contenido reportado del usuario
      const contentReported = await Promise.all([
        (prisma as any).content.findMany({
          where: {
            authorId: userId
          } as any,
          include: {
            reports: {
              include: {
                reporter: { select: { email: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: Number(limit)
        }),
        (prisma as any).post.findMany({
          where: {
            authorId: userId
          } as any,
          include: {
            reports: {
              include: {
                reporter: { select: { email: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: Number(limit)
        })
      ]);

      res.json({
        reportsMade: {
          content: reportsMade[0],
          posts: reportsMade[1]
        },
        contentReported: {
          content: contentReported[0],
          posts: contentReported[1]
        }
      });
    } catch (error: any) {
      console.error('Error obteniendo historial de reportes:', error);
      res.status(500).json({
        error: 'Error obteniendo historial de reportes',
        message: error.message
      });
    }
  }
}