const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Crear lead con contactos
app.post('/api/v1/crm/leads', async (req, res) => {
  try {
    console.log('📨 Datos recibidos para crear lead:', req.body);
    const { contacts, ...leadData } = req.body;

    // Usar transacción para crear lead + contactos atómicamente
    const result = await prisma.$transaction(async (tx) => {
      // Asegurar que existe un usuario mock (solo crear si no existe)
      await tx.user.upsert({
        where: { id: 'user1' },
        create: {
          id: 'user1',
          email: 'admin@lapublica.com',
          password: 'mock',
          primaryRole: 'COMPANY_MANAGER',
          isActive: true
        },
        update: {}
      });

      // Crear el lead
      const lead = await tx.companyLead.create({
        data: {
          ...leadData,
          assignedToId: 'user1', // Mock user - usar assignedToId en lugar de userId
          status: 'new'
        }
      });

      // Crear los contactos si existen
      if (contacts && contacts.length > 0) {
        const contactsData = contacts.map((contact, index) => ({
          ...contact,
          companyLeadId: lead.id,
          isPrimary: index === 0 // El primer contacto es principal
        }));

        await tx.contact.createMany({
          data: contactsData
        });
      }

      // Retornar el lead con sus contactos
      return await tx.companyLead.findUnique({
        where: { id: lead.id },
        include: {
          contacts: {
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ]
          }
        }
      });
    });

    console.log('✅ Lead creado exitosamente:', result.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error creando lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar leads
app.get('/api/v1/crm/leads', async (req, res) => {
  try {
    const { status, priority, search, dateFrom, dateTo, limit = 20, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { cif: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtros de fecha
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom + 'T00:00:00.000Z');
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    const [leads, total] = await Promise.all([
      prisma.companyLead.findMany({
        where,
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: {
              contacts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      }),
      prisma.companyLead.count({ where })
    ]);

    res.json({
      success: true,
      data: { leads, total, hasMore: Number(offset) + Number(limit) < total }
    });
  } catch (error) {
    console.error('❌ Error listando leads:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener lead por ID
app.get('/api/v1/crm/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.companyLead.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        interactions: {
          include: {
            contact: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('❌ Error obteniendo lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats
app.get('/api/v1/crm/dashboard', async (req, res) => {
  try {
    const [
      totalLeads,
      newLeads,
      inProgressLeads,
      convertedLeads,
      totalValue,
      recentLeads
    ] = await Promise.all([
      prisma.companyLead.count(),
      prisma.companyLead.count({ where: { status: 'new' } }),
      prisma.companyLead.count({
        where: { status: { in: ['contacted', 'negotiating'] } }
      }),
      prisma.companyLead.count({ where: { status: 'converted' } }),
      prisma.companyLead.aggregate({
        where: { estimatedValue: { not: null } },
        _sum: { estimatedValue: true }
      }),
      prisma.companyLead.findMany({
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        inProgressLeads,
        convertedLeads,
        totalValue: totalValue._sum.estimatedValue || 0,
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads * 100) : 0,
        recentLeads
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar lead
app.put('/api/v1/crm/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { contacts, ...leadData } = req.body;

    console.log('🔄 Actualizando lead:', id, leadData);

    const result = await prisma.$transaction(async (tx) => {
      // Actualizar el lead
      const lead = await tx.companyLead.update({
        where: { id },
        data: leadData
      });

      // Si hay contactos para actualizar
      if (contacts && contacts.length > 0) {
        // Eliminar contactos existentes
        await tx.contact.deleteMany({
          where: { companyLeadId: id }
        });

        // Crear nuevos contactos
        const contactsData = contacts.map((contact, index) => ({
          ...contact,
          companyLeadId: id,
          isPrimary: index === 0
        }));

        await tx.contact.createMany({
          data: contactsData
        });
      }

      // Retornar lead actualizado con contactos
      return await tx.companyLead.findUnique({
        where: { id },
        include: {
          contacts: {
            orderBy: [
              { isPrimary: 'desc' },
              { createdAt: 'asc' }
            ]
          }
        }
      });
    });

    console.log('✅ Lead actualizado exitosamente:', result.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error actualizando lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar lead
app.delete('/api/v1/crm/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Eliminando lead:', id);

    await prisma.$transaction(async (tx) => {
      // Eliminar interacciones primero
      await tx.interaction.deleteMany({
        where: { companyLeadId: id }
      });

      // Eliminar contactos
      await tx.contact.deleteMany({
        where: { companyLeadId: id }
      });

      // Eliminar el lead
      await tx.companyLead.delete({
        where: { id }
      });
    });

    console.log('✅ Lead eliminado exitosamente:', id);
    res.json({ success: true, message: 'Lead eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar solo el estado de un lead
app.patch('/api/v1/crm/leads/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('🔄 Actualizando estado de lead:', id, 'a', status);

    const lead = await prisma.companyLead.update({
      where: { id },
      data: { status },
      include: {
        contacts: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });

    console.log('✅ Estado actualizado exitosamente');
    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear interacción
app.post('/api/v1/crm/leads/:leadId/interactions', async (req, res) => {
  try {
    const { leadId } = req.params;
    const interactionData = req.body;

    console.log('📋 Creando interacción para lead:', leadId, interactionData);

    // Verificar que el lead existe
    const lead = await prisma.companyLead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    // Crear la interacción
    const interaction = await prisma.interaction.create({
      data: {
        ...interactionData,
        companyLeadId: leadId,
        createdById: 'user1', // Mock user
        nextActionCompleted: false
      },
      include: {
        contact: true,
        createdBy: {
          select: { id: true, email: true }
        }
      }
    });

    console.log('✅ Interacción creada exitosamente:', interaction.id);
    res.json({ success: true, data: interaction });
  } catch (error) {
    console.error('❌ Error creando interacción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de acción de seguimiento
app.put('/api/v1/crm/interactions/:interactionId/complete-action', async (req, res) => {
  try {
    const { interactionId } = req.params;

    const interaction = await prisma.interaction.update({
      where: { id: interactionId },
      data: { nextActionCompleted: true },
      include: {
        contact: true,
        createdBy: {
          select: { id: true, email: true }
        }
      }
    });

    console.log('✅ Acción completada para interacción:', interactionId);
    res.json({ success: true, data: interaction });
  } catch (error) {
    console.error('❌ Error completando acción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'CRM con Prisma', timestamp: new Date().toISOString() });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 CRM Backend con Prisma funcionando en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/v1/health`);
});