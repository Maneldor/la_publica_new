import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/crm/leads/[id] - Obtener lead específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const leadId = params.id;

    console.log(`🔍 [CRM Lead] Loading lead: ${leadId} for user: ${session.user.email}`);

    // Buscar el lead con todos sus datos
    const lead = await prismaClient.companyLead.findFirst({
      where: {
        id: leadId,
        assignedToId: userId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
          orderBy: { dueDate: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no trobat' },
        { status: 404 }
      );
    }

    console.log(`✅ [CRM Lead] Lead found: ${lead.companyName}`);

    // Formatear respuesta similar al mock del frontend
    const response = {
      id: lead.id,
      companyName: lead.companyName,
      cif: lead.cif,
      sector: lead.sector,
      website: lead.website,
      source: lead.source.toLowerCase(),
      priority: lead.priority.toLowerCase(),
      status: lead.status.toLowerCase(),
      estimatedValue: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : undefined,
      companySize: lead.companySize,
      currentPlatforms: lead.currentPlatforms,
      competitorOffers: lead.competitorOffers,
      discountTypes: lead.discountTypes,
      assignedToId: lead.assignedToId,
      assignedTo: lead.assignedTo ? {
        id: lead.assignedTo.id,
        name: lead.assignedTo.name,
        email: lead.assignedTo.email
      } : undefined,
      lastContactDate: lead.lastContactDate?.toISOString() || null,
      nextFollowUpDate: lead.nextFollowUpDate?.toISOString() || null,
      notes: lead.notes,
      internalNotes: lead.internalNotes,
      tags: lead.tags,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),

      // Datos relacionados
      contacts: [], // TODO: Agregar cuando se cree el modelo de contactos
      interactions: lead.interactions.map(interaction => ({
        id: interaction.id,
        type: interaction.type,
        description: interaction.description,
        createdAt: interaction.createdAt.toISOString(),
        user: interaction.user
      })),
      tasks: lead.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status.toLowerCase(),
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        user: task.user
      })),
      activities: lead.activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt.toISOString(),
        user: activity.user
      })),

      _count: {
        contacts: 0, // TODO: Contar contactos reales
        interactions: lead.interactions.length
      }
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('❌ [CRM Lead] Error obteniendo lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/leads/[id] - Actualizar lead
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const leadId = params.id;
    const body = await request.json();

    console.log(`📝 [CRM Lead] Updating lead: ${leadId}`);

    // Verificar que el lead existe y pertenece al usuario
    const existingLead = await prismaClient.companyLead.findFirst({
      where: {
        id: leadId,
        assignedToId: userId,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead no trobat' },
        { status: 404 }
      );
    }

    // Validar email si se proporciona
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Email invàlid' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};

    // Campos básicos
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.cif !== undefined) updateData.cif = body.cif;
    if (body.sector !== undefined) updateData.sector = body.sector;
    if (body.contactName !== undefined) updateData.contactName = body.contactName;
    if (body.contactRole !== undefined) updateData.contactRole = body.contactRole;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.companySize !== undefined) updateData.companySize = body.companySize;
    if (body.estimatedRevenue !== undefined) updateData.estimatedRevenue = body.estimatedRevenue;
    if (body.currentPlatforms !== undefined) updateData.currentPlatforms = body.currentPlatforms;
    if (body.competitorOffers !== undefined) updateData.competitorOffers = body.competitorOffers;
    if (body.discountTypes !== undefined) updateData.discountTypes = body.discountTypes;

    // Estados y metadatos
    if (body.status !== undefined) updateData.status = body.status.toUpperCase();
    if (body.priority !== undefined) updateData.priority = body.priority.toUpperCase();
    if (body.source !== undefined) updateData.source = body.source.toUpperCase();
    if (body.score !== undefined) updateData.score = body.score;
    if (body.scoreGrade !== undefined) updateData.scoreGrade = body.scoreGrade;
    if (body.lastContactDate !== undefined) {
      updateData.lastContactDate = body.lastContactDate ? new Date(body.lastContactDate) : null;
    }
    if (body.nextFollowUpDate !== undefined) {
      updateData.nextFollowUpDate = body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null;
    }
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes;

    // Si se está marcando como convertido, agregar fecha
    if (body.status === 'won' || body.status === 'WON') {
      updateData.convertedAt = new Date();
    }

    // Actualizar lead
    const updatedLead = await prismaClient.companyLead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Registrar actividad de actualización
    await prismaClient.leadActivity.create({
      data: {
        leadId: leadId,
        userId: userId,
        type: 'LEAD_UPDATED',
        description: `Lead actualitzat per ${session.user.name}`,
        metadata: {
          updatedFields: Object.keys(updateData),
          previousStatus: existingLead.status,
          newStatus: updatedLead.status,
        },
      },
    });

    console.log(`✅ [CRM Lead] Lead updated successfully: ${updatedLead.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLead.id,
        companyName: updatedLead.companyName,
        cif: updatedLead.cif,
        sector: updatedLead.sector,
        source: updatedLead.source.toLowerCase(),
        priority: updatedLead.priority.toLowerCase(),
        status: updatedLead.status.toLowerCase(),
        estimatedValue: updatedLead.estimatedRevenue ? Number(updatedLead.estimatedRevenue) : undefined,
        assignedToId: updatedLead.assignedToId,
        assignedTo: updatedLead.assignedTo,
        createdAt: updatedLead.createdAt.toISOString(),
        updatedAt: updatedLead.updatedAt.toISOString(),
        contacts: [],
        _count: {
          contacts: 0,
          interactions: 0
        }
      },
      message: 'Lead actualitzat correctament',
    });
  } catch (error) {
    console.error('❌ [CRM Lead] Error actualizando lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/leads/[id] - Eliminar (marcar como perdido)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const leadId = params.id;

    console.log(`🗑️ [CRM Lead] Deleting lead: ${leadId}`);

    // Verificar que el lead existe y pertenece al usuario
    const existingLead = await prismaClient.companyLead.findFirst({
      where: {
        id: leadId,
        assignedToId: userId,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead no trobat' },
        { status: 404 }
      );
    }

    // Soft delete: marcar como LOST en lugar de eliminar físicamente
    const deletedLead = await prismaClient.companyLead.update({
      where: { id: leadId },
      data: {
        status: 'LOST',
        updatedAt: new Date(),
      },
    });

    // Registrar actividad de eliminación
    await prismaClient.leadActivity.create({
      data: {
        leadId: leadId,
        userId: userId,
        type: 'LEAD_DELETED',
        description: `Lead marcat com a perdut per ${session.user.name}`,
        metadata: {
          previousStatus: existingLead.status,
          deleteReason: 'Manual deletion',
        },
      },
    });

    console.log(`✅ [CRM Lead] Lead marked as lost: ${deletedLead.id}`);

    return NextResponse.json({
      success: true,
      message: 'Lead marcat com a perdut correctament',
      data: {
        id: deletedLead.id,
        status: 'lost',
      },
    });
  } catch (error) {
    console.error('❌ [CRM Lead] Error eliminando lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}