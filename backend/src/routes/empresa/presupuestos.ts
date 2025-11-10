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

    const presupuestos = await prisma.presupuesto.findMany({
      where: { empresaId: empresa.id },
      include: {
        empresa: {
          select: { id: true, name: true }
        },
        items: {
          include: {
            featureExtra: true
          }
        },
        solicitud: {
          select: { id: true, estado: true, fechaSolicitud: true }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    res.json(presupuestos);
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const empresa = await prisma.company.findUnique({
      where: { userId },
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const presupuesto = await prisma.presupuesto.findFirst({
      where: {
        id,
        empresaId: empresa.id
      },
      include: {
        empresa: {
          select: { id: true, name: true }
        },
        items: {
          include: {
            featureExtra: true
          }
        },
        solicitud: {
          select: { id: true, estado: true, fechaSolicitud: true }
        }
      }
    });

    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    res.json(presupuesto);
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/:id/aprobar', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const empresa = await prisma.company.findUnique({
      where: { userId },
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const presupuesto = await prisma.presupuesto.findFirst({
      where: {
        id,
        empresaId: empresa.id,
        estado: 'ENVIADO'
      }
    });

    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado o no puede ser aprobado' });
    }

    const presupuestoAprobado = await prisma.presupuesto.update({
      where: { id },
      data: {
        estado: 'APROBADO',
        fechaAprobacion: new Date()
      },
      include: {
        empresa: {
          select: { id: true, name: true }
        },
        items: {
          include: {
            featureExtra: true
          }
        }
      }
    });

    res.json(presupuestoAprobado);
  } catch (error) {
    console.error('Error al aprobar presupuesto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/:id/rechazar', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const empresa = await prisma.company.findUnique({
      where: { userId },
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const presupuesto = await prisma.presupuesto.findFirst({
      where: {
        id,
        empresaId: empresa.id,
        estado: 'ENVIADO'
      }
    });

    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado o no puede ser rechazado' });
    }

    const presupuestoRechazado = await prisma.presupuesto.update({
      where: { id },
      data: {
        estado: 'RECHAZADO',
        fechaRechazo: new Date()
      },
      include: {
        empresa: {
          select: { id: true, name: true }
        },
        items: {
          include: {
            featureExtra: true
          }
        }
      }
    });

    res.json(presupuestoRechazado);
  } catch (error) {
    console.error('Error al rechazar presupuesto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;