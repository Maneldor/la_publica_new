import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';

const router = Router();
const prisma = new PrismaClient();

// Crear contenido
router.post('/', authenticateToken, invalidateCacheMiddleware('GET:/api/v1/content*'), async (req: Request, res: Response) => {
  try {
    const { title, slug, excerpt, content, status, categoryId, tags, pinned } = req.body;
    const userId = (req as any).user?.id;

    // Solo admin puede anclar posts
    const isPinned = (req as any).user?.primaryRole === 'ADMIN' ? (pinned || false) : false;

    const newContent = await prisma.content.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        status,
        pinned: isPinned,
        authorId: userId!,
        categoryId: categoryId || null,
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') }
          })) || []
        }
      },
      include: {
        author: {
          select: {
            email: true
          }
        },
        tags: true
      }
    });

    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creando contenido:', error);
    res.status(500).json({ message: 'Error creando contenido' });
  }
});

// Obtener contenido
router.get('/', cacheMiddleware(300), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, categoryId, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true
            }
          },
          category: true,
          tags: true
        },
        orderBy: [
          { pinned: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: Number(limit)
      }),
      prisma.content.count({ where })
    ]);

    res.json({
      content,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo contenido:', error);
    res.status(500).json({ message: 'Error obteniendo contenido' });
  }
});

// Obtener contenido por ID
router.get('/:id', cacheMiddleware(300), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        },
        category: true,
        tags: true
      }
    });

    if (!content) {
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error obteniendo contenido:', error);
    res.status(500).json({ message: 'Error obteniendo contenido' });
  }
});

// Actualizar contenido
router.put('/:id', authenticateToken, invalidateCacheMiddleware('GET:/api/v1/content*'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, status, categoryId, tags, pinned } = req.body;
    const userId = (req as any).user?.id;

    // Verificar que el contenido existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingContent) {
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }

    // Verificar que el usuario es el autor o es admin
    const isAuthor = existingContent.authorId === userId;
    const isAdminUser = (req as any).user?.primaryRole === 'ADMIN';

    if (!isAuthor && !isAdminUser) {
      return res.status(403).json({ message: 'No tienes permisos para editar este contenido' });
    }

    // Solo admin puede cambiar el estado de pinned
    const isPinned = isAdminUser ? (pinned !== undefined ? pinned : existingContent.pinned) : existingContent.pinned;

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        status,
        pinned: isPinned,
        categoryId: categoryId || null,
        tags: tags ? {
          set: [],
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') }
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            email: true
          }
        },
        tags: true
      }
    });

    res.json(updatedContent);
  } catch (error) {
    console.error('Error actualizando contenido:', error);
    res.status(500).json({ message: 'Error actualizando contenido' });
  }
});

// Eliminar contenido
router.delete('/:id', authenticateToken, invalidateCacheMiddleware('GET:/api/v1/content*'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Verificar que el contenido existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingContent) {
      return res.status(404).json({ message: 'Contenido no encontrado' });
    }

    // Verificar que el usuario es el autor o es admin
    const isAuthor = existingContent.authorId === userId;
    const isAdminUser = (req as any).user?.primaryRole === 'ADMIN';

    if (!isAuthor && !isAdminUser) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este contenido' });
    }

    await prisma.content.delete({
      where: { id }
    });

    res.json({ message: 'Contenido eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando contenido:', error);
    res.status(500).json({ message: 'Error eliminando contenido' });
  }
});

export default router;