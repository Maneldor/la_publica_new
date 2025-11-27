import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware as authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    primaryRole: string;
  };
}

// GET /api/events - Obtenir esdeveniments de l'usuari
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, type, status } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no autenticat'
      });
    }

    let whereClause: any = {
      OR: [
        { organizerId: userId },
        {
          attendees: {
            some: {
              userId: userId
            }
          }
        }
      ]
    };

    // Filtres opcionals
    if (startDate && endDate) {
      whereClause.AND = [
        { startDate: { gte: new Date(startDate as string) } },
        { endDate: { lte: new Date(endDate as string) } }
      ];
    }

    if (type) {
      whereClause.type = (type as string).toUpperCase();
    }

    if (status) {
      whereClause.status = (status as string).toUpperCase();
    }

    const events = await prisma.event.findMany({
      where: whereClause as any,
      orderBy: { startDate: 'asc' }
    });

    const transformedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type.toLowerCase(),
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: event.isAllDay || false,
      location: event.location,
      onlineLink: event.onlineLink,
      status: (event.status || 'CONFIRMED').toLowerCase(),
      visibility: (event.visibility || 'PRIVATE').toLowerCase(),
      organizer: {
        id: event.organizer || event.organizerId,
        name: 'Organitzador',
        avatar: null
      },
      attendees: [],
      lead: null,
      company: null,
      contact: null,
      reminders: [],
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.json({
      success: true,
      data: transformedEvents
    });

  } catch (error) {
    console.error('Error obtenint esdeveniments:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// GET /api/events/:id - Obtenir un esdeveniment específic
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no autenticat'
      });
    }

    const event = await (prisma.event.findFirst as any)({
      where: {
        id: eventId,
        OR: [
          { organizer: { id: userId } },
          {
            attendees: {
              some: {
                userId: userId
              }
            }
          }
        ]
      } as any,
      include: {
        organizer: {
          select: {
            id: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                employee: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                },
                company: {
                  select: {
                    name: true,
                    logo: true
                  }
                }
              }
            }
          }
        },
        lead: {
          select: {
            id: true,
            companyName: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        contact: {
          select: {
            id: true,
            name: true,
            position: true,
            email: true,
            phone: true
          }
        },
        reminders: true
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Esdeveniment no trobat'
      });
    }

    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type.toLowerCase(),
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: false,
      timezone: 'Europe/Madrid',
      location: event.location,
      onlineLink: null,
      status: 'confirmed',
      visibility: 'private',
      organizer: {
        id: event.organizer,
        name: 'Organitzador',
        avatar: null
      },
      attendees: [],
      lead: null,
      company: null,
      contact: null,
      reminders: [],
      isRecurring: false,
      recurrenceRule: null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };

    res.json({
      success: true,
      data: transformedEvent
    });

  } catch (error) {
    console.error('Error obtenint esdeveniment:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// POST /api/events - Crear un nou esdeveniment
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      title,
      description,
      type = 'MEETING',
      startDate,
      endDate,
      isAllDay = false,
      timezone = 'Europe/Madrid',
      location,
      onlineLink,
      status = 'CONFIRMED',
      visibility = 'PRIVATE',
      leadId,
      companyId,
      contactId,
      attendees = [],
      reminders = []
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no autenticat'
      });
    }

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Títol, data d\'inici i data de fi són obligatoris'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'La data de fi ha de ser posterior a la data d\'inici'
      });
    }

    // Crear l'esdeveniment
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        type: type.toUpperCase(),
        startDate: start,
        endDate: end,
        location: location?.trim(),
        organizer: userId,
        tags: []
      } as any
    });

    res.json({
      success: true,
      data: { id: event.id },
      message: 'Esdeveniment creat correctament'
    });

  } catch (error) {
    console.error('Error creant esdeveniment:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// PUT /api/events/:id - Actualitzar un esdeveniment
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no autenticat'
      });
    }

    // Verificar que l'usuari és l'organitzador
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizer: userId
      } as any
    });

    if (!existingEvent) {
      return res.status(403).json({
        success: false,
        error: 'No tens permisos per modificar aquest esdeveniment'
      });
    }

    const {
      title,
      description,
      type,
      startDate,
      endDate,
      isAllDay,
      timezone,
      location,
      onlineLink,
      status,
      visibility
    } = req.body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (type !== undefined) updateData.type = type.toUpperCase();
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isAllDay !== undefined) updateData.isAllDay = isAllDay;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (location !== undefined) updateData.location = location?.trim();
    if (onlineLink !== undefined) updateData.onlineLink = onlineLink?.trim();
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (visibility !== undefined) updateData.visibility = visibility.toUpperCase();

    // Validar dates si s'han proporcionat
    if (updateData.startDate && updateData.endDate && updateData.startDate >= updateData.endDate) {
      return res.status(400).json({
        success: false,
        error: 'La data de fi ha de ser posterior a la data d\'inici'
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData
    });

    res.json({
      success: true,
      data: { id: updatedEvent.id },
      message: 'Esdeveniment actualitzat correctament'
    });

  } catch (error) {
    console.error('Error actualitzant esdeveniment:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// DELETE /api/events/:id - Eliminar un esdeveniment
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no autenticat'
      });
    }

    // Verificar que l'usuari és l'organitzador
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizer: userId
      } as any
    });

    if (!existingEvent) {
      return res.status(403).json({
        success: false,
        error: 'No tens permisos per eliminar aquest esdeveniment'
      });
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    res.json({
      success: true,
      message: 'Esdeveniment eliminat correctament'
    });

  } catch (error) {
    console.error('Error eliminant esdeveniment:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// POST /api/events/:id/respond - Respondre a una invitació
router.post('/:id/respond', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id;
    const { response } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no autenticat'
      });
    }

    if (!['ACCEPTED', 'DECLINED', 'TENTATIVE'].includes(response?.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Resposta invàlida. Ha de ser: accepted, declined o tentative'
      });
    }

    // Simplified - no attendee system
    const event = await prisma.event.findFirst({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Esdeveniment no trobat'
      });
    }

    res.json({
      success: true,
      message: 'Resposta registrada correctament'
    });

  } catch (error) {
    console.error('Error registrant resposta:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// GET /api/events/calendar/:year/:month - Obtenir esdeveniments del calendari per mes
router.get('/calendar/:year/:month', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuari no autenticat'
      });
    }

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Any i mes han de ser números vàlids'
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const events = await prisma.event.findMany({
      where: {
        organizer: userId,
        AND: [
          {
            OR: [
              {
                startDate: {
                  gte: startDate,
                  lte: endDate
                }
              },
              {
                endDate: {
                  gte: startDate,
                  lte: endDate
                }
              }
            ]
          }
        ]
      } as any,
      select: {
        id: true,
        title: true,
        type: true,
        startDate: true,
        endDate: true,
        location: true
      },
      orderBy: { startDate: 'asc' }
    });

    const transformedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      type: event.type.toLowerCase(),
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: false,
      status: 'confirmed',
      location: event.location,
      relatedTo: null
    }));

    res.json({
      success: true,
      data: transformedEvents
    });

  } catch (error) {
    console.error('Error obtenint calendari:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

export default router;