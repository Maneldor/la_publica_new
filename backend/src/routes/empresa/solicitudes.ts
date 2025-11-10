import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const empresa = await prisma.company.findUnique({
      where: { userId },
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const solicitudes = await prisma.solicitudExtra.findMany({
      where: { empresaId: empresa.id },
      include: {
        usuario: {
          select: { id: true, email: true }
        },
        gestor: {
          select: { id: true, email: true }
        },
        presupuesto: {
          include: {
            items: {
              include: {
                featureExtra: true
              }
            }
          }
        }
      },
      orderBy: { fechaSolicitud: 'desc' }
    });

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { extrasIds, mensaje, telefono } = req.body;

    const empresa = await prisma.company.findUnique({
      where: { userId },
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const solicitud = await prisma.solicitudExtra.create({
      data: {
        empresaId: empresa.id,
        usuarioId: userId,
        extrasIds,
        mensaje,
        telefono,
        estado: 'PENDIENTE'
      },
      include: {
        usuario: {
          select: { id: true, email: true }
        },
        empresa: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json(solicitud);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;