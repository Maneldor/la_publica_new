import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH /api/crm/tasks/[id]/complete - Toggle completada
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

    console.log(`✅ [CRM Task Complete] Toggling completion for task: ${taskId}`);

    // Verificar que existe
    const existingTask = await prismaClient.leadTask.findUnique({
      where: { id: taskId },
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
          },
        },
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

    // Toggle: si está completada, marcar como pendiente; si está pendiente, marcar como completada
    const newStatus = existingTask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const completedAt = newStatus === 'COMPLETED' ? new Date() : null;

    const result = await prismaClient.$transaction(async (tx) => {
      const updatedTask = await tx.leadTask.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          completedAt,
        },
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
            type: newStatus === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_REOPENED',
            description: newStatus === 'COMPLETED'
              ? `Tasca completada: ${updatedTask.title}`
              : `Tasca reoberta: ${updatedTask.title}`,
            metadata: {
              taskId: updatedTask.id,
              previousStatus: existingTask.status,
              newStatus,
            },
          },
        });
      }

      return updatedTask;
    });

    const actionMessage = newStatus === 'COMPLETED'
      ? 'Tasca marcada com a completada'
      : 'Tasca reoberta';

    console.log(`✅ [CRM Task Complete] ${actionMessage}: ${result.title}`);

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
      message: actionMessage,
      action: newStatus === 'COMPLETED' ? 'completed' : 'reopened',
    });
  } catch (error) {
    console.error('❌ [CRM Task Complete] Error toggling completion:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// GET no permitido - usar endpoint principal de tarea
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Utilitza GET /api/crm/tasks/[id] per obtenir detalls' },
    { status: 405 }
  );
}

// POST no permitido
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Utilitza PATCH per canviar l\'estat de completada' },
    { status: 405 }
  );
}

// DELETE no permitido
export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Utilitza DELETE /api/crm/tasks/[id] per eliminar' },
    { status: 405 }
  );
}