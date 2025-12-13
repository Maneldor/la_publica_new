// lib/gestio-empreses/task-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

/**
 * Obtenir tasques de l'usuari
 */
export async function getUserTasks(
  userId: string,
  filters?: {
    status?: TaskStatus
    priority?: TaskPriority
    leadId?: string
    companyId?: string
  },
  page: number = 1,
  limit: number = 50
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const where: any = {
    OR: [
      { assignedToId: userId },
      { createdById: userId },
    ],
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.priority) {
    where.priority = filters.priority
  }

  if (filters?.leadId) {
    where.leadId = filters.leadId
  }

  if (filters?.companyId) {
    where.companyId = filters.companyId
  }

  const skip = (page - 1) * limit

  const [tasks, total] = await Promise.all([
    prismaClient.task.findMany({
      where,
      include: {
        lead: {
          select: { id: true, companyName: true },
        },
        company: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit
    }),
    prismaClient.task.count({ where })
  ])

  return {
    tasks,
    metadata: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Obtenir tasques pendents
 */
export async function getPendingTasks(userId: string) {
  return getUserTasks(userId, { status: 'PENDING' })
}

/**
 * Obtenir tasques per avui
 */
export async function getTodayTasks(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tasks = await prismaClient.task.findMany({
    where: {
      OR: [
        { assignedToId: userId },
        { createdById: userId },
      ],
      status: { not: 'COMPLETED' },
      dueDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      lead: { select: { id: true, companyName: true } },
      company: { select: { id: true, name: true } },
    },
    orderBy: { priority: 'desc' },
  })

  return tasks
}

/**
 * Obtenir tasques endarrerides
 */
export async function getOverdueTasks(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()

  const tasks = await prismaClient.task.findMany({
    where: {
      OR: [
        { assignedToId: userId },
        { createdById: userId },
      ],
      status: { not: 'COMPLETED' },
      dueDate: { lt: now },
    },
    include: {
      lead: { select: { id: true, companyName: true } },
      company: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  })

  return tasks
}

/**
 * Crear nova tasca
 */
export async function createTask(
  data: {
    title: string
    description?: string
    priority: TaskPriority
    dueDate?: Date
    leadId?: string
    companyId?: string
    assignedToId?: string
  },
  createdById: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const task = await prismaClient.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'PENDING',
      type: 'OTHER',
      category: 'ADMIN',
      dueDate: data.dueDate,
      leadId: data.leadId,
      companyId: data.companyId,
      assignedToId: data.assignedToId || createdById,
      createdById,
    },
    include: {
      lead: { select: { id: true, companyName: true } },
      company: { select: { id: true, name: true } },
    },
  })

  // Si la tasca és d'un lead, crear activitat
  if (data.leadId) {
    await prismaClient.leadActivity.create({
      data: {
        leadId: data.leadId,
        userId: createdById,
        type: 'TASK_CREATED',
        description: `Tasca creada: ${data.title}`,
        metadata: { taskId: task.id },
      },
    })
  }

  revalidatePath('/gestio/tasques')
  if (data.leadId) revalidatePath(`/gestio/leads/${data.leadId}`)

  return task
}

/**
 * Actualitzar tasca
 */
export async function updateTask(
  taskId: string,
  data: {
    title?: string
    description?: string
    priority?: TaskPriority
    status?: TaskStatus
    dueDate?: Date | null
  },
  userId: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const task = await prismaClient.task.update({
    where: { id: taskId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })

  revalidatePath('/gestio/tasques')

  return task
}

/**
 * Completar tasca
 */
export async function completeTask(taskId: string, userId: string, notes?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const task = await prismaClient.task.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
    include: {
      lead: true,
    },
  })

  // Si la tasca és d'un lead, crear activitat
  if (task.leadId) {
    await prismaClient.leadActivity.create({
      data: {
        leadId: task.leadId,
        userId,
        type: 'TASK_COMPLETED',
        description: `Tasca completada: ${task.title}${notes ? ` - ${notes}` : ''}`,
        metadata: { taskId: task.id },
      },
    })
  }

  revalidatePath('/gestio/tasques')

  return task
}

/**
 * Eliminar tasca
 */
export async function deleteTask(taskId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  await prismaClient.task.delete({
    where: { id: taskId },
  })

  revalidatePath('/gestio/tasques')
}

/**
 * Estadístiques de tasques
 */
export async function getTaskStats(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [pending, inProgress, overdue, completedThisMonth, byPriority] = await Promise.all([
    // Pendents
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: 'PENDING',
      },
    }),
    // En progrés
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: 'IN_PROGRESS',
      },
    }),
    // Endarrerides
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: { not: 'COMPLETED' },
        dueDate: { lt: now },
      },
    }),
    // Completades aquest mes
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    // Per prioritat
    prismaClient.task.groupBy({
      by: ['priority'],
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: { not: 'COMPLETED' },
      },
      _count: { id: true },
    }),
  ])

  return {
    pending,
    inProgress,
    overdue,
    completedThisMonth,
    byPriority: byPriority.map((p) => ({
      priority: p.priority,
      count: p._count.id,
    })),
  }
}

/**
 * Estadístiques avançades de tasques
 */
export async function getAdvancedTaskStats(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [
    total,
    pending,
    inProgress,
    completed,
    overdue,
    completedThisMonth,
    dueToday,
  ] = await Promise.all([
    // Total
    prismaClient.task.count({
      where: { OR: [{ assignedToId: userId }, { createdById: userId }] },
    }),
    // Pendents
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: 'PENDING',
      },
    }),
    // En progrés
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: 'IN_PROGRESS',
      },
    }),
    // Completades
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: 'COMPLETED',
      },
    }),
    // Endarrerides
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: { not: 'COMPLETED' },
        dueDate: { lt: now },
      },
    }),
    // Completades aquest mes
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    // Per avui
    prismaClient.task.count({
      where: {
        OR: [{ assignedToId: userId }, { createdById: userId }],
        status: { not: 'COMPLETED' },
        dueDate: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lt: new Date(now.setHours(23, 59, 59, 999)),
        },
      },
    }),
  ])

  // Calcular taxa de completat
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Calcular temps mitjà (simplificat)
  const completedTasks = await prismaClient.task.findMany({
    where: {
      OR: [{ assignedToId: userId }, { createdById: userId }],
      status: 'COMPLETED',
      completedAt: { not: null },
    },
    select: { createdAt: true, completedAt: true },
    take: 50,
  })

  let avgHours = 0
  if (completedTasks.length > 0) {
    const totalHours = completedTasks.reduce((sum, task) => {
      if (!task.completedAt) return sum
      const hours = (new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60)
      return sum + hours
    }, 0)
    avgHours = Math.round(totalHours / completedTasks.length)
  }

  return {
    total,
    pending,
    inProgress,
    completed,
    overdue,
    completedThisMonth,
    dueToday,
    completionRate,
    avgCompletionHours: avgHours,
    overduePercentage: total > 0 ? Math.round((overdue / total) * 100) : 0,
  }
}

/**
 * Obtenir tasques agrupades per estat (per Kanban)
 */
export async function getTasksByStatus(userId: string) {
  const tasks = await prismaClient.task.findMany({
    where: {
      OR: [{ assignedToId: userId }, { createdById: userId }],
    },
    include: {
      lead: { select: { id: true, companyName: true } },
      company: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  })

  return {
    PENDING: tasks.filter((t) => t.status === 'PENDING'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
    CANCELLED: tasks.filter((t) => t.status === 'CANCELLED'),
  }
}

/**
 * Moure tasca a nou estat (per drag & drop)
 */
export async function moveTaskToStatus(
  taskId: string,
  newStatus: string,
  userId: string
) {
  const updateData: any = {
    status: newStatus,
    updatedAt: new Date(),
  }

  if (newStatus === 'COMPLETED') {
    updateData.completedAt = new Date()
  }

  if (newStatus === 'IN_PROGRESS' || newStatus === 'PENDING') {
    updateData.completedAt = null
  }

  const task = await prismaClient.task.update({
    where: { id: taskId },
    data: updateData,
  })

  revalidatePath('/gestio/tasques')

  return task
}

/**
 * Obtenir tasques per calendari
 */
export async function getTasksForCalendar(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const tasks = await prismaClient.task.findMany({
    where: {
      OR: [{ assignedToId: userId }, { createdById: userId }],
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      lead: { select: { id: true, companyName: true } },
    },
    orderBy: { dueDate: 'asc' },
  })

  return tasks
}

/**
 * Obtenir informació bàsica d'un lead per ID
 */
export async function getLeadBasicInfo(leadId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const lead = await prismaClient.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      companyName: true,
    },
  })

  return lead
}