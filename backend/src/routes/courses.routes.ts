import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/courses - Listar cursos con filtros
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      level,
      mode,
      search,
      status = 'PUBLISHED',
      page = '1',
      limit = '20',
      featured,
      highlighted
    } = req.query;

    const where: any = {
      status
    };

    // Filtros
    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (mode) {
      where.mode = mode;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (highlighted === 'true') {
      where.isHighlighted = true;
    }

    // Búsqueda por texto
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { instructor: { contains: search as string, mode: 'insensitive' } },
        { institution: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Paginación
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [courses, total] = await Promise.all([
      (prisma.courses.findMany as any)({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              employee: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          _count: {
            select: {
              enrollments: true,
              ratings: true,
              reviews: true
            }
          }
        },
        orderBy: [
          { isHighlighted: 'desc' },
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take
      }),
      prisma.courses.count({ where })
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/courses/:id - Obtener curso por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await (prisma.courses.findUnique as any)({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                employee: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            enrollments: true,
            ratings: true,
            reviews: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    // Incrementar contador de views
    await (prisma.courses.update as any)({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      } as any
    });

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/courses/categories/stats - Estadísticas por categoría
router.get('/categories/stats', async (req: Request, res: Response) => {
  try {
    const stats = await prisma.courses.groupBy({
      by: ['category'],
      where: {
        status: 'PUBLISHED'
      } as any,
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/courses/:id/enroll - Inscribirse a un curso (requiere autenticación)
router.post('/:id/enroll', async (req: Request, res: Response) => {
  try {
    const { id: courseId } = req.params;
    // TODO: Obtener userId del token JWT cuando esté implementado
    const userId = req.body.userId || 'temp-user-id';

    // Verificar que el curso existe
    const course = await (prisma.courses.findUnique as any)({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    // Verificar si ya está inscrito
    const existingEnrollment = await (prisma as any).enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Ya estás inscrito en este curso'
      });
    }

    // Crear inscripción
    const enrollment = await (prisma as any).enrollment.create({
      data: {
        courseId,
        userId,
        status: 'CONFIRMED',
        paymentAmount: course.price
      }
    });

    // Incrementar contador de inscripciones
    await (prisma.courses.update as any)({
      where: { id: courseId },
      data: {
        enrollment_count: {
          increment: 1
        }
      } as any
    });

    res.json({
      success: true,
      data: enrollment,
      message: 'Inscripción realizada correctamente'
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;