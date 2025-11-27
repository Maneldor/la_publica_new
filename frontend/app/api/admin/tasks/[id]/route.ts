import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { recalculateTaskScores } from '@/lib/tasks/taskScoring';

// GET /api/admin/tasks/[id] - Obtener tarea por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const task = await prismaClient.task.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        lead: true,
        company: true,
        parentTask: true,
        subtasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error al obtener tarea:', error);
    return NextResponse.json(
      { error: 'Error al obtener tarea', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/tasks/[id] - Actualizar tarea
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      priority,
      category,
      assignedToId,
      dueDate,
      startDate,
      estimatedMinutes,
      actualMinutes,
      reminderDate,
      tags,
      customFields,
    } = body;

    // VERIFICAR QUE EXISTE
    const existingTask = await prismaClient.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    // PREPARAR DATA DE ACTUALIZACIÓN
    const updateData: any = {};
    const changes: string[] = [];

    if (title !== undefined && title !== existingTask.title) {
      updateData.title = title.trim();
      changes.push(`título cambiado a "${title}"`);
    }

    if (description !== undefined && description !== existingTask.description) {
      updateData.description = description?.trim();
      changes.push('descripción actualizada');
    }

    if (type !== undefined && type !== existingTask.type) {
      updateData.type = type;
      changes.push(`tipo cambiado a ${type}`);
    }

    if (status !== undefined && status !== existingTask.status) {
      updateData.status = status;
      changes.push(`estado cambiado a ${status}`);

      // Si se completa la tarea
      if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
        updateData.completedAt = new Date();
        changes.push('tarea completada');
      }

      // Si se reabre la tarea
      if (status !== 'COMPLETED' && existingTask.status === 'COMPLETED') {
        updateData.completedAt = null;
        changes.push('tarea reabierta');
      }
    }

    if (priority !== undefined && priority !== existingTask.priority) {
      updateData.priority = priority;
      changes.push(`prioridad cambiada a ${priority}`);
    }

    if (category !== undefined && category !== existingTask.category) {
      updateData.category = category;
      changes.push(`categoría cambiada a ${category}`);
    }

    if (assignedToId !== undefined && assignedToId !== existingTask.assignedToId) {
      updateData.assignedToId = assignedToId;
      changes.push('tarea reasignada');
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
      changes.push('fecha límite actualizada');
    }

    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }

    if (estimatedMinutes !== undefined) {
      updateData.estimatedMinutes = estimatedMinutes;
    }

    if (actualMinutes !== undefined) {
      updateData.actualMinutes = actualMinutes;
    }

    if (reminderDate !== undefined) {
      updateData.reminderDate = reminderDate ? new Date(reminderDate) : null;
    }

    if (tags !== undefined) {
      updateData.tags = tags;
    }

    if (customFields !== undefined) {
      updateData.customFields = customFields;
    }

    // RECALCULAR SCORES si cambió algo relevante
    if (priority !== undefined || dueDate !== undefined || status !== undefined || estimatedMinutes !== undefined) {
      const scores = recalculateTaskScores({
        priority: priority || existingTask.priority,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        status: status || existingTask.status,
        estimatedMinutes: estimatedMinutes !== undefined ? estimatedMinutes : existingTask.estimatedMinutes,
        leadId: existingTask.leadId,
        companyId: existingTask.companyId,
      });
      Object.assign(updateData, scores);
    }

    // ACTUALIZAR TAREA
    const task = await prismaClient.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        lead: true,
        company: true,
      },
    });

    // REGISTRAR ACTIVIDAD
    if (changes.length > 0) {
      await prismaClient.taskActivity.create({
        data: {
          taskId: task.id,
          userId: session.user.id,
          action: 'UPDATED',
          description: `Tarea actualizada: ${changes.join(', ')}`,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarea', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tasks/[id] - Eliminar tarea
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const task = await prismaClient.task.findUnique({
      where: { id: params.id },
      select: { title: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    await prismaClient.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tarea eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar tarea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tarea', details: error.message },
      { status: 500 }
    );
  }
}