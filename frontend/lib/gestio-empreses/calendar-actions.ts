// lib/gestio-empreses/calendar-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export type EventType = 'CALL' | 'MEETING' | 'FOLLOW_UP' | 'DEMO' | 'OTHER'

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  type: EventType
  startDate: Date
  endDate: Date | null
  allDay: boolean
  location: string | null
  leadId: string | null
  companyId: string | null
  completed: boolean
  createdById: string
  lead?: {
    id: string
    companyName: string
  } | null
  company?: {
    id: string
    name: string
  } | null
}

/**
 * Obtenir esdeveniments del calendari
 */
export async function getCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Utilitzem els leads existents per simular esdeveniments de calendari
  const leads = await prismaClient.companyLead.findMany({
    where: {
      assignedToId: userId,
      nextFollowUpDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      nextFollowUpDate: true,
      status: true,
      priority: true,
    },
    orderBy: { nextFollowUpDate: 'asc' },
  })

  // Convertim els leads en esdeveniments de calendari
  const events = leads.map((lead) => ({
    id: `lead-${lead.id}`,
    title: `Seguiment: ${lead.companyName}`,
    description: `Contacte amb ${lead.contactName}`,
    type: 'FOLLOW_UP' as EventType,
    startDate: lead.nextFollowUpDate || new Date(),
    endDate: null,
    allDay: false,
    location: null,
    leadId: lead.id,
    companyId: null,
    completed: false,
    createdById: userId,
    lead: {
      id: lead.id,
      companyName: lead.companyName,
    },
    company: null,
  }))

  return events
}

/**
 * Obtenir esdeveniments d'avui
 */
export async function getTodayEvents(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return getCalendarEvents(userId, today, tomorrow)
}

/**
 * Obtenir esdeveniments de la setmana
 */
export async function getWeekEvents(userId: string, weekStart?: Date) {
  const start = weekStart || getStartOfWeek(new Date())
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return getCalendarEvents(userId, start, end)
}

/**
 * Obtenir esdeveniments del mes
 */
export async function getMonthEvents(userId: string, year: number, month: number) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59)

  return getCalendarEvents(userId, start, end)
}

/**
 * Crear nou esdeveniment (simulat amb task de lead)
 */
export async function createCalendarEvent(
  data: {
    title: string
    description?: string
    type: EventType
    startDate: Date
    endDate?: Date
    allDay?: boolean
    location?: string
    leadId?: string
    companyId?: string
    participantIds?: string[]
  },
  createdById: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Si té leadId, creem una tasca de lead
  if (data.leadId) {
    const task = await prismaClient.leadTask.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.startDate,
        priority: 'MEDIUM',
        status: 'PENDING',
        leadId: data.leadId,
        userId: createdById,
      },
    })

    // Actualitzem la data de seguiment del lead
    await prismaClient.companyLead.update({
      where: { id: data.leadId },
      data: {
        nextFollowUpDate: data.startDate,
      },
    })

    revalidatePath('/gestio/agenda')
    return {
      id: `task-${task.id}`,
      title: data.title,
      description: data.description,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      allDay: data.allDay || false,
      location: data.location,
      leadId: data.leadId,
      companyId: data.companyId,
      completed: false,
      createdById,
    }
  }

  // Per altres tipus d'esdeveniments, només simulem la resposta
  revalidatePath('/gestio/agenda')

  return {
    id: `event-${Date.now()}`,
    title: data.title,
    description: data.description,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
    allDay: data.allDay || false,
    location: data.location,
    leadId: data.leadId,
    companyId: data.companyId,
    completed: false,
    createdById,
  }
}

/**
 * Actualitzar esdeveniment
 */
export async function updateCalendarEvent(
  eventId: string,
  data: {
    title?: string
    description?: string
    type?: EventType
    startDate?: Date
    endDate?: Date
    allDay?: boolean
    location?: string
    completed?: boolean
  },
  userId: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Si és un esdeveniment de lead (comença amb 'lead-')
  if (eventId.startsWith('lead-')) {
    const leadId = eventId.replace('lead-', '')

    if (data.startDate) {
      await prismaClient.companyLead.update({
        where: { id: leadId },
        data: {
          nextFollowUpDate: data.startDate,
        },
      })
    }
  }

  // Si és una tasca (comença amb 'task-')
  if (eventId.startsWith('task-')) {
    const taskId = eventId.replace('task-', '')

    await prismaClient.leadTask.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.startDate,
        status: data.completed ? 'COMPLETED' : 'PENDING',
        completedAt: data.completed ? new Date() : null,
      },
    })
  }

  revalidatePath('/gestio/agenda')

  return {
    id: eventId,
    ...data,
  }
}

/**
 * Eliminar esdeveniment
 */
export async function deleteCalendarEvent(eventId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Si és una tasca (comença amb 'task-')
  if (eventId.startsWith('task-')) {
    const taskId = eventId.replace('task-', '')

    await prismaClient.leadTask.delete({
      where: { id: taskId },
    })
  }

  revalidatePath('/gestio/agenda')
}

/**
 * Marcar esdeveniment com completat
 */
export async function completeCalendarEvent(
  eventId: string,
  userId: string,
  notes?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  // Si és una tasca (comença amb 'task-')
  if (eventId.startsWith('task-')) {
    const taskId = eventId.replace('task-', '')

    const task = await prismaClient.leadTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        lead: true,
      },
    })

    // Crear activitat en el lead
    if (task.leadId) {
      await prismaClient.leadActivity.create({
        data: {
          leadId: task.leadId,
          userId,
          type: 'COMPLETED_TASK',
          description: `Tasca completada: ${task.title}${notes ? ` - ${notes}` : ''}`,
        },
      })
    }

    revalidatePath('/gestio/agenda')
    return task
  }

  revalidatePath('/gestio/agenda')
  return null
}

/**
 * Obtenir propers esdeveniments
 */
export async function getUpcomingEvents(userId: string, limit = 5) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const events = await getCalendarEvents(userId, now, nextWeek)

  return events
    .filter(event => !event.completed)
    .slice(0, limit)
}

/**
 * Estadístiques del calendari
 */
export async function getCalendarStats(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [todayTasks, weekTasks, monthTasks, completedThisMonth] = await Promise.all([
    // Tasques d'avui
    prismaClient.leadTask.count({
      where: {
        userId,
        dueDate: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lt: new Date(now.setHours(23, 59, 59, 999)),
        },
      },
    }),
    // Tasques aquesta setmana
    prismaClient.leadTask.count({
      where: {
        userId,
        dueDate: {
          gte: getStartOfWeek(new Date()),
          lt: getEndOfWeek(new Date()),
        },
      },
    }),
    // Tasques aquest mes
    prismaClient.leadTask.count({
      where: {
        userId,
        dueDate: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    // Completades aquest mes
    prismaClient.leadTask.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ])

  return {
    today: todayTasks,
    thisWeek: weekTasks,
    thisMonth: monthTasks,
    completedThisMonth,
  }
}

// Helpers
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}