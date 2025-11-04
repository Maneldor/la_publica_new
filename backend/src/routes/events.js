const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware de autenticació (simulat)
const authenticate = (req, res, next) => {
  // Simulem que l'usuari està autenticat amb ID 1 (gestor d'empreses)
  req.user = { id: 'user-gestor-1', primaryRole: 'GESTOR_EMPRESAS' };
  next();
};

// GET /api/events - Obtenir esdeveniments de l'usuari
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type, status } = req.query;

    let whereClause = {
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
        { startDate: { gte: new Date(startDate) } },
        { endDate: { lte: new Date(endDate) } }
      ];
    }

    if (type) {
      whereClause.type = type.toUpperCase();
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const events = await prisma.event.findMany({
      where: whereClause,
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
      },
      orderBy: { startDate: 'asc' }
    });

    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type.toLowerCase(),
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: event.isAllDay,
      location: event.location,
      onlineLink: event.onlineLink,
      status: event.status.toLowerCase(),
      visibility: event.visibility.toLowerCase(),
      organizer: {
        id: event.organizer.id,
        name: event.organizer.employee ?
          `${event.organizer.employee.firstName} ${event.organizer.employee.lastName}` :
          'Organitzador',
        avatar: event.organizer.employee?.avatar
      },
      attendees: event.attendees.map(att => ({
        id: att.id,
        userId: att.userId,
        email: att.email,
        name: att.name || (att.user?.employee ?
          `${att.user.employee.firstName} ${att.user.employee.lastName}` :
          att.user?.company?.name),
        avatar: att.user?.employee?.avatar || att.user?.company?.logo,
        response: att.response.toLowerCase(),
        isRequired: att.isRequired
      })),
      lead: event.lead ? {
        id: event.lead.id,
        companyName: event.lead.companyName
      } : null,
      company: event.company ? {
        id: event.company.id,
        name: event.company.name,
        logo: event.company.logo
      } : null,
      contact: event.contact,
      reminders: event.reminders.map(rem => ({
        id: rem.id,
        type: rem.type.toLowerCase(),
        triggerTime: rem.triggerTime,
        isTriggered: rem.isTriggered
      })),
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
router.get('/:id', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
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
      },
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
      isAllDay: event.isAllDay,
      timezone: event.timezone,
      location: event.location,
      onlineLink: event.onlineLink,
      status: event.status.toLowerCase(),
      visibility: event.visibility.toLowerCase(),
      organizer: {
        id: event.organizer.id,
        name: event.organizer.employee ?
          `${event.organizer.employee.firstName} ${event.organizer.employee.lastName}` :
          'Organitzador',
        avatar: event.organizer.employee?.avatar
      },
      attendees: event.attendees.map(att => ({
        id: att.id,
        userId: att.userId,
        email: att.email,
        name: att.name || (att.user?.employee ?
          `${att.user.employee.firstName} ${att.user.employee.lastName}` :
          att.user?.company?.name),
        avatar: att.user?.employee?.avatar || att.user?.company?.logo,
        response: att.response.toLowerCase(),
        isRequired: att.isRequired,
        respondedAt: att.respondedAt
      })),
      lead: event.lead,
      company: event.company,
      contact: event.contact,
      reminders: event.reminders.map(rem => ({
        id: rem.id,
        type: rem.type.toLowerCase(),
        triggerTime: rem.triggerTime,
        isTriggered: rem.isTriggered
      })),
      isRecurring: event.isRecurring,
      recurrenceRule: event.recurrenceRule,
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
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
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
        isAllDay,
        timezone,
        location: location?.trim(),
        onlineLink: onlineLink?.trim(),
        status: status.toUpperCase(),
        visibility: visibility.toUpperCase(),
        organizerId: userId,
        leadId,
        companyId,
        contactId,
        attendees: {
          create: attendees.map(att => ({
            userId: att.userId || null,
            email: att.email || null,
            name: att.name || null,
            isRequired: att.isRequired !== false,
            response: 'PENDING'
          }))
        },
        reminders: {
          create: reminders.map(rem => ({
            type: rem.type?.toUpperCase() || 'NOTIFICATION',
            triggerTime: rem.triggerTime || 15
          }))
        }
      },
      include: {
        attendees: true,
        reminders: true
      }
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
router.put('/:id', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Verificar que l'usuari és l'organitzador
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: userId
      }
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

    const updateData = {};

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
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Verificar que l'usuari és l'organitzador
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: userId
      }
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
router.post('/:id/respond', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const { response } = req.body;

    if (!['ACCEPTED', 'DECLINED', 'TENTATIVE'].includes(response?.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Resposta invàlida. Ha de ser: accepted, declined o tentative'
      });
    }

    // Verificar que l'usuari està convidat
    const attendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId: eventId,
        userId: userId
      }
    });

    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'No estàs convidat a aquest esdeveniment'
      });
    }

    await prisma.eventAttendee.update({
      where: { id: attendee.id },
      data: {
        response: response.toUpperCase(),
        respondedAt: new Date()
      }
    });

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
router.get('/calendar/:year/:month', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

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
        OR: [
          { organizerId: userId },
          {
            attendees: {
              some: {
                userId: userId
              }
            }
          }
        ],
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
              },
              {
                AND: [
                  { startDate: { lte: startDate } },
                  { endDate: { gte: endDate } }
                ]
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        type: true,
        startDate: true,
        endDate: true,
        isAllDay: true,
        status: true,
        location: true,
        lead: {
          select: {
            companyName: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      type: event.type.toLowerCase(),
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: event.isAllDay,
      status: event.status.toLowerCase(),
      location: event.location,
      relatedTo: event.lead?.companyName || event.company?.name || null
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

module.exports = router;