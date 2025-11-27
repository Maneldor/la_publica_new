import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
    interactionId: string;
  };
}

// PATCH /api/crm/leads/[id]/interactions/[interactionId] - Editar interacción
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

    const { id: leadId, interactionId } = params;
    const body = await request.json();

    console.log(`✏️ [CRM Interaction] Editing interaction: ${interactionId} for lead: ${leadId}`);

    // Verificar que la interacción existe
    const existingInteraction = await prismaClient.leadInteraction.findUnique({
      where: { id: interactionId },
      include: {
        lead: {
          select: {
            assignedToId: true,
            companyName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingInteraction) {
      return NextResponse.json(
        { success: false, error: 'Interacció no trobada' },
        { status: 404 }
      );
    }

    // Verificar que pertenece al lead correcto
    if (existingInteraction.leadId !== leadId) {
      return NextResponse.json(
        { success: false, error: 'Interacció no pertany a aquest lead' },
        { status: 400 }
      );
    }

    // Solo el creador o admin puede editar
    if (
      existingInteraction.userId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No pots editar aquesta interacció' },
        { status: 403 }
      );
    }

    // Preparar campos a actualizar
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.outcome !== undefined) updateData.outcome = body.outcome;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          id: existingInteraction.id,
          type: 'interaction',
          interactionType: existingInteraction.type,
          title: existingInteraction.title,
          description: existingInteraction.description,
          outcome: existingInteraction.outcome,
          duration: existingInteraction.duration,
          metadata: existingInteraction.metadata,
          createdAt: existingInteraction.createdAt.toISOString(),
          updatedAt: existingInteraction.createdAt.toISOString(),
          user: existingInteraction.user,
          canEdit: true,
        },
        message: 'Cap canvi per aplicar',
      });
    }

    // Actualizar en transacción
    const result = await prismaClient.$transaction(async (tx) => {
      const updatedInteraction = await tx.leadInteraction.update({
        where: { id: interactionId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Registrar actividad
      await tx.leadActivity.create({
        data: {
          leadId,
          userId: session.user.id,
          type: 'INTERACTION_UPDATED',
          description: `Interacció actualitzada per ${session.user.name}`,
          metadata: {
            interactionId,
            changes: updateData,
            previousValues: {
              title: existingInteraction.title,
              description: existingInteraction.description,
              outcome: existingInteraction.outcome,
              duration: existingInteraction.duration,
            },
          },
        },
      });

      return updatedInteraction;
    });

    console.log(`✅ [CRM Interaction] Interaction updated: ${result.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        type: 'interaction',
        interactionType: result.type,
        title: result.title,
        description: result.description,
        outcome: result.outcome,
        duration: result.duration,
        metadata: result.metadata,
        createdAt: result.createdAt.toISOString(),
          updatedAt: result.createdAt.toISOString(),
        user: result.user,
        canEdit: true,
      },
      message: 'Interacció actualitzada correctament',
    });
  } catch (error) {
    console.error('❌ [CRM Interaction] Error actualizando interacción:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/leads/[id]/interactions/[interactionId] - Eliminar interacción
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

    const { id: leadId, interactionId } = params;

    console.log(`🗑️ [CRM Interaction] Deleting interaction: ${interactionId} for lead: ${leadId}`);

    // Verificar que la interacción existe
    const existingInteraction = await prismaClient.leadInteraction.findUnique({
      where: { id: interactionId },
      select: {
        id: true,
        leadId: true,
        userId: true,
        type: true,
        description: true,
        createdAt: true,
      },
    });

    if (!existingInteraction) {
      return NextResponse.json(
        { success: false, error: 'Interacció no trobada' },
        { status: 404 }
      );
    }

    // Verificar que pertenece al lead correcto
    if (existingInteraction.leadId !== leadId) {
      return NextResponse.json(
        { success: false, error: 'Interacció no pertany a aquest lead' },
        { status: 400 }
      );
    }

    // Solo el creador o admin puede eliminar
    if (
      existingInteraction.userId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No pots eliminar aquesta interacció' },
        { status: 403 }
      );
    }

    // Eliminar en transacción
    await prismaClient.$transaction(async (tx) => {
      await tx.leadInteraction.delete({
        where: { id: interactionId },
      });

      // Registrar actividad
      await tx.leadActivity.create({
        data: {
          leadId,
          userId: session.user.id,
          type: 'INTERACTION_DELETED',
          description: `Interacció eliminada: ${existingInteraction.description.substring(0, 50)}${existingInteraction.description.length > 50 ? '...' : ''}`,
          metadata: {
            deletedInteractionId: interactionId,
            interactionType: existingInteraction.type,
            originalCreatedAt: existingInteraction.createdAt.toISOString(),
            deletedBy: session.user.name,
          },
        },
      });
    });

    console.log(`✅ [CRM Interaction] Interaction deleted: ${interactionId}`);

    return NextResponse.json({
      success: true,
      message: 'Interacció eliminada correctament',
      data: {
        deletedId: interactionId,
      },
    });
  } catch (error) {
    console.error('❌ [CRM Interaction] Error eliminando interacción:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/crm/leads/[id]/interactions/[interactionId] - Obtener interacción específica
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

    const { id: leadId, interactionId } = params;

    // Verificar que la interacción existe y pertenece al lead
    const interaction = await prismaClient.leadInteraction.findFirst({
      where: {
        id: interactionId,
        leadId: leadId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            assignedToId: true,
            companyName: true,
          },
        },
      },
    });

    if (!interaction) {
      return NextResponse.json(
        { success: false, error: 'Interacció no trobada' },
        { status: 404 }
      );
    }

    // Verificar acceso al lead
    if (
      interaction.lead.assignedToId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No tens accés a aquest lead' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: interaction.id,
        type: 'interaction',
        interactionType: interaction.type,
        title: interaction.title,
        description: interaction.description,
        outcome: interaction.outcome,
        duration: interaction.duration,
        metadata: interaction.metadata,
        createdAt: interaction.createdAt.toISOString(),
          updatedAt: interaction.createdAt.toISOString(),
        user: interaction.user,
        canEdit: interaction.userId === session.user.id || ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role),
      },
    });
  } catch (error) {
    console.error('❌ [CRM Interaction] Error obteniendo interacción:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}