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
    if (req.user?.primaryRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const solicitudes = await prisma.solicitudExtra.findMany({
      include: {
        usuario: {
          select: { id: true, email: true }
        },
        empresa: {
          select: { id: true, name: true, email: true }
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

router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.primaryRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;

    const solicitud = await prisma.solicitudExtra.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, email: true }
        },
        empresa: {
          select: { id: true, name: true, email: true, phone: true }
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
      }
    });

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/:id/asignar', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.primaryRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const { gestorId } = req.body;

    const solicitud = await prisma.solicitudExtra.update({
      where: { id },
      data: {
        gestorId,
        estado: 'EN_PROCESO'
      },
      include: {
        usuario: {
          select: { id: true, email: true }
        },
        empresa: {
          select: { id: true, name: true }
        },
        gestor: {
          select: { id: true, email: true }
        }
      }
    });

    res.json(solicitud);
  } catch (error) {
    console.error('Error al asignar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/:id/estado', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.primaryRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const { estado, fechaRespuesta } = req.body;

    const updateData: any = { estado };
    if (fechaRespuesta) {
      updateData.fechaRespuesta = new Date(fechaRespuesta);
    }

    const solicitud = await prisma.solicitudExtra.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: { id: true, email: true }
        },
        empresa: {
          select: { id: true, name: true }
        },
        gestor: {
          select: { id: true, email: true }
        }
      }
    });

    res.json(solicitud);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/:id/presupuesto', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.primaryRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const { planActual, planObjetivo, basePremium, items } = req.body;

    const solicitud = await prisma.solicitudExtra.findUnique({
      where: { id },
      include: { empresa: true }
    });

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    let totalExtras = 0;
    if (items && items.length > 0) {
      totalExtras = items.reduce((sum: number, item: any) => sum + (item.precioSnapshot * item.cantidad), 0);
    }

    const subtotal = basePremium + totalExtras;
    const prorrateo = 0; // Calcular según plan actual
    const totalAPagar = subtotal - prorrateo;

    const presupuesto = await prisma.presupuesto.create({
      data: {
        empresaId: solicitud.empresaId,
        planActual,
        planObjetivo,
        basePremium,
        totalExtras,
        subtotal,
        prorrateo,
        totalAPagar,
        estado: 'BORRADOR',
        items: {
          create: items?.map((item: any) => ({
            featureExtraId: item.featureExtraId,
            nombreSnapshot: item.nombreSnapshot,
            precioSnapshot: item.precioSnapshot,
            limitesSnapshot: item.limitesSnapshot,
            cantidad: item.cantidad
          })) || []
        }
      },
      include: {
        items: {
          include: {
            featureExtra: true
          }
        }
      }
    });

    await prisma.solicitudExtra.update({
      where: { id },
      data: {
        presupuestoId: presupuesto.id,
        estado: 'PRESUPUESTO_ENVIADO'
      }
    });

    res.status(201).json(presupuesto);
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;