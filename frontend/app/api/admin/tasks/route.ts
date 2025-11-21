import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaskStatus, TaskPriority, TaskType, TaskCategory } from '@prisma/client';

// GET /api/admin/tasks - Listar tareas con filtros avanzados
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // FILTROS
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;
    const type = searchParams.get('type') as TaskType | null;
    const category = searchParams.get('category') as TaskCategory | null;
    const assignedToId = searchParams.get('assignedToId');
    const leadId = searchParams.get('leadId');
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');
    const overdue = searchParams.get('overdue') === 'true';
    const hasSubtasks = searchParams.get('hasSubtasks') === 'true';
    const isRecurring = searchParams.get('isRecurring') === 'true';

    // PAGINACIÓN
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // ORDENAMIENTO
    const sortBy = searchParams.get('sortBy') || 'autoScore';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // CONSTRUIR WHERE CLAUSE
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (category) where.category = category;
    if (assignedToId) where.assignedToId = assignedToId;
    if (leadId) where.leadId = leadId;
    if (companyId) where.companyId = companyId;
    if (isRecurring) where.isRecurring = true;

    // Filtro de búsqueda por texto
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    // Filtro de atrasadas
    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'COMPLETED' };
    }

    // Filtro de con subtareas
    if (hasSubtasks) {
      where.subtasks = { some: {} };
    }

    // EJECUTAR QUERY
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, image: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          lead: {
            select: { id: true, companyName: true, status: true },
          },
          company: {
            select: { id: true, name: true },
          },
          subtasks: {
            select: { id: true, status: true },
          },
          comments: {
            select: { id: true },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
              subtasks: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/tasks - Crear nueva tarea
export async function POST(request: NextRequest) {
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
      priority,
      category,
      assignedToId,
      leadId,
      companyId,
      dueDate,
      startDate,
      estimatedMinutes,
      reminderDate,
      isRecurring,
      recurrenceRule,
      tags,
      customFields,
    } = body;

    // VALIDACIONES
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: 'El tipo de tarea es obligatorio' }, { status: 400 });
    }

    if (!priority) {
      return NextResponse.json({ error: 'La prioridad es obligatoria' }, { status: 400 });
    }

    if (!assignedToId) {
      return NextResponse.json({ error: 'Debe asignar la tarea a un usuario' }, { status: 400 });
    }

    // CALCULAR SCORES
    const { recalculateTaskScores } = await import('@/lib/tasks/taskScoring');
    const scores = recalculateTaskScores({
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'PENDING',
      estimatedMinutes,
      leadId,
      companyId,
    });

    // CREAR TAREA
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        type,
        status: 'PENDING',
        priority,
        category,
        assignedToId,
        createdById: session.user.id,
        leadId,
        companyId,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        estimatedMinutes,
        reminderDate: reminderDate ? new Date(reminderDate) : null,
        isRecurring: isRecurring || false,
        recurrenceRule,
        tags: tags || [],
        customFields,
        ...scores,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        lead: true,
        company: true,
      },
    });

    // REGISTRAR ACTIVIDAD
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: session.user.id,
        action: 'CREATED',
        description: `Tarea "${task.title}" creada`,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear tarea', details: error.message },
      { status: 500 }
    );
  }
}