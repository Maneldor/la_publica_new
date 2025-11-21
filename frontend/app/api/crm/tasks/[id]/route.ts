import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/crm/tasks/[id] - Detalle de tarea
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

    const taskId = params.id;

    console.log(`🔍 [CRM Task] Loading task: ${taskId} for user: ${session.user.email}`);

    const task = await prismaClient.leadTask.findUnique({
      where: { id: taskId },
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            status: true,
            priority: true,
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

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tasca no trobada' },
        { status: 404 }
      );
    }

    // Verificar que es del usuario
    if (
      task.userId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No tens accés a aquesta tasca' },
        { status: 403 }
      );
    }

    console.log(`✅ [CRM Task] Task loaded: ${task.title}`);

    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString() || null,
        priority: task.priority.toLowerCase(),
        status: task.status.toLowerCase(),
        completedAt: task.completedAt?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        lead: task.lead ? {
          id: task.lead.id,
          companyName: task.lead.companyName,
          status: task.lead.status.toLowerCase(),
          priority: task.lead.priority.toLowerCase(),
        } : null,
        user: task.user,
      },
    });
  } catch (error) {
    console.error('❌ [CRM Task] Error obteniendo tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/tasks/[id] - Actualizar tarea
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

    const taskId = params.id;
    const body = await request.json();

    console.log(`✏️ [CRM Task] Updating task: ${taskId}`);

    // Verificar que existe
    const existingTask = await prismaClient.leadTask.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Tasca no trobada' },
        { status: 404 }
      );
    }

    // Verificar ownership
    if (
      existingTask.userId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No tens accés a aquesta tasca' },
        { status: 403 }
      );
    }

    // Preparar campos a actualizar
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.priority !== undefined) updateData.priority = body.priority.toUpperCase();
    if (body.status !== undefined) {
      updateData.status = body.status.toUpperCase();
      // Si se marca como completada, registrar fecha
      if (body.status.toUpperCase() === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
        updateData.completedAt = new Date();
      }
      // Si se marca como no completada, limpiar fecha
      if (body.status.toUpperCase() !== 'COMPLETED' && existingTask.completedAt) {
        updateData.completedAt = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          id: existingTask.id,
          title: existingTask.title,
          description: existingTask.description,
          dueDate: existingTask.dueDate?.toISOString() || null,
          priority: existingTask.priority.toLowerCase(),
          status: existingTask.status.toLowerCase(),
          completedAt: existingTask.completedAt?.toISOString() || null,
          createdAt: existingTask.createdAt.toISOString(),
          updatedAt: existingTask.updatedAt.toISOString(),
        },
        message: 'Cap canvi per aplicar',
      });
    }

    // Actualizar en transacción
    const result = await prismaClient.$transaction(async (tx) => {
      const updatedTask = await tx.leadTask.update({
        where: { id: taskId },
        data: updateData,
        include: {
          lead: {
            select: {
              id: true,
              companyName: true,
              status: true,
              priority: true,
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

      // Registrar actividad si está asociada a un lead
      if (updatedTask.leadId) {
        await tx.leadActivity.create({
          data: {
            leadId: updatedTask.leadId,
            userId: session.user.id,
            type: 'TASK_UPDATED',
            description: `Tasca actualitzada: ${updatedTask.title}`,
            metadata: {
              taskId: updatedTask.id,
              changes: updateData,
              previousValues: {
                title: existingTask.title,
                status: existingTask.status,
                priority: existingTask.priority,
                dueDate: existingTask.dueDate?.toISOString(),
              },
            },
          },
        });
      }

      return updatedTask;
    });

    console.log(`✅ [CRM Task] Task updated: ${result.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        title: result.title,
        description: result.description,
        dueDate: result.dueDate?.toISOString() || null,
        priority: result.priority.toLowerCase(),
        status: result.status.toLowerCase(),
        completedAt: result.completedAt?.toISOString() || null,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        lead: result.lead ? {
          id: result.lead.id,
          companyName: result.lead.companyName,
          status: result.lead.status.toLowerCase(),
          priority: result.lead.priority.toLowerCase(),
        } : null,
        user: result.user,
      },
      message: 'Tasca actualitzada correctament',
    });
  } catch (error) {
    console.error('❌ [CRM Task] Error actualizando tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/tasks/[id] - Eliminar tarea
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

    const taskId = params.id;

    console.log(`🗑️ [CRM Task] Deleting task: ${taskId}`);

    // Verificar que existe
    const existingTask = await prismaClient.leadTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        userId: true,
        leadId: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Tasca no trobada' },
        { status: 404 }
      );
    }

    // Verificar ownership
    if (
      existingTask.userId !== session.user.id &&
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'No tens accés a aquesta tasca' },
        { status: 403 }
      );
    }

    // Eliminar en transacción
    await prismaClient.$transaction(async (tx) => {
      await tx.leadTask.delete({
        where: { id: taskId },
      });

      // Registrar actividad si estaba asociada a un lead
      if (existingTask.leadId) {
        await tx.leadActivity.create({
          data: {
            leadId: existingTask.leadId,
            userId: session.user.id,
            type: 'TASK_DELETED',
            description: `Tasca eliminada: ${existingTask.title}`,
            metadata: {
              deletedTaskId: taskId,
              taskTitle: existingTask.title,
            },
          },
        });
      }
    });

    console.log(`✅ [CRM Task] Task deleted: ${existingTask.title}`);

    return NextResponse.json({
      success: true,
      message: 'Tasca eliminada correctament',
      data: {
        deletedId: taskId,
      },
    });
  } catch (error) {
    console.error('❌ [CRM Task] Error eliminando tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}