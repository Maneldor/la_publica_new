import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/crm/tasks - Lista de tareas
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);

    console.log(`📋 [CRM Tasks] Loading tasks for user: ${session.user.email}`);

    // Filtros
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const leadId = searchParams.get('leadId');
    const overdue = searchParams.get('overdue') === 'true';
    const today = searchParams.get('today') === 'true';

    // Construcción de filtros
    const where: Prisma.LeadTaskWhereInput = {
      userId,
    };

    if (status) {
      where.status = status as any;
    }

    if (priority) {
      where.priority = priority as any;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (overdue) {
      where.status = { in: ['PENDING', 'IN_PROGRESS'] };
      where.dueDate = { lt: new Date() };
    }

    if (today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      where.dueDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Consulta principal
    const tasks = await prismaClient.leadTask.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // PENDING primero
        { priority: 'desc' }, // URGENT primero
        { dueDate: 'asc' }, // Más próximas primero
      ],
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

    console.log(`📊 [CRM Tasks] Found ${tasks.length} tasks`);

    // Estadísticas
    const [totalTasks, pendingTasks, overdueTasks, todayTasks, completedThisWeek] = await Promise.all([
      prismaClient.leadTask.count({ where: { userId } }),

      prismaClient.leadTask.count({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),

      prismaClient.leadTask.count({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() },
        },
      }),

      prismaClient.leadTask.count({
        where: {
          userId,
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),

      prismaClient.leadTask.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Agrupar por categorías para frontend
    const urgent = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED');
    const todayList = tasks.filter(t => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      const now = new Date();
      return (
        taskDate.getDate() === now.getDate() &&
        taskDate.getMonth() === now.getMonth() &&
        taskDate.getFullYear() === now.getFullYear() &&
        t.status !== 'COMPLETED'
      );
    });
    const upcoming = tasks.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      return new Date(t.dueDate) > new Date() && !todayList.includes(t);
    });
    const completed = tasks.filter(t => t.status === 'COMPLETED');

    // Formatear respuesta
    const formatTask = (task: any) => ({
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
    });

    console.log(`✅ [CRM Tasks] Stats - Total: ${totalTasks}, Pending: ${pendingTasks}, Overdue: ${overdueTasks}`);

    return NextResponse.json({
      success: true,
      data: {
        all: tasks.map(formatTask),
        urgent: urgent.map(formatTask),
        today: todayList.map(formatTask),
        upcoming: upcoming.map(formatTask),
        completed: completed.map(formatTask),
        stats: {
          total: totalTasks,
          pending: pendingTasks,
          overdue: overdueTasks,
          today: todayTasks,
          completedThisWeek,
        },
      },
    });
  } catch (error) {
    console.error('❌ [CRM Tasks] Error obteniendo tareas:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/crm/tasks - Crear tarea
export async function POST(request: NextRequest) {
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
    const body = await request.json();

    console.log(`📝 [CRM Tasks] Creating task: ${body.title}`);

    // Validación
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Camp title obligatori' },
        { status: 400 }
      );
    }

    // Si se asocia a un lead, verificar acceso
    if (body.leadId) {
      const lead = await prismaClient.companyLead.findUnique({
        where: { id: body.leadId },
        select: {
          id: true,
          assignedToId: true,
          companyName: true,
        },
      });

      if (!lead) {
        return NextResponse.json(
          { success: false, error: 'Lead no trobat' },
          { status: 404 }
        );
      }

      if (
        lead.assignedToId !== userId &&
        !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
      ) {
        return NextResponse.json(
          { success: false, error: 'No tens accés a aquest lead' },
          { status: 403 }
        );
      }
    }

    // Crear tarea en transacción
    const result = await prismaClient.$transaction(async (tx) => {
      const task = await tx.leadTask.create({
        data: {
          userId,
          leadId: body.leadId || null,
          title: body.title,
          description: body.description || null,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          priority: body.priority || 'MEDIUM',
          status: body.status || 'PENDING',
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
      if (task.leadId) {
        await tx.leadActivity.create({
          data: {
            leadId: task.leadId,
            userId,
            type: 'TASK_CREATED',
            description: `Tasca creada: ${task.title}`,
            metadata: {
              taskId: task.id,
              dueDate: task.dueDate?.toISOString(),
              priority: task.priority,
            },
          },
        });
      }

      return task;
    });

    console.log(`✅ [CRM Tasks] Task created: ${result.id}`);

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
      message: 'Tasca creada correctament',
    });
  } catch (error) {
    console.error('❌ [CRM Tasks] Error creando tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}