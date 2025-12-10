'use server'

import { prismaClient } from '@/lib/prisma'

export interface LeadTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  type: string
  dueDate: string | null
  completedAt: string | null
  assignedTo: {
    name: string | null
    email: string | null
  } | null
}

/**
 * Obtenir les tasques associades a un lead
 */
export async function getTasksByLeadId(leadId: string): Promise<{
  success: boolean
  tasks: LeadTask[]
  error?: string
}> {
  try {
    console.log('📋 Obtenint tasques per lead:', leadId)

    const tasks = await prismaClient.task.findMany({
      where: {
        leadId: leadId
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        type: true,
        dueDate: true,
        completedAt: true,
        assignedTo: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },  // PENDING primer
        { dueDate: 'asc' }
      ]
    })

    // Serialitzar dates
    const serializedTasks: LeadTask[] = tasks.map(task => ({
      ...task,
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null
    }))

    console.log('✅ Trobades', serializedTasks.length, 'tasques')
    return { success: true, tasks: serializedTasks }
  } catch (error) {
    console.error('❌ Error obtenint tasques:', error)
    return { success: false, tasks: [], error: 'Error obtenint tasques' }
  }
}

/**
 * Comptar tasques pendents d'un lead
 */
export async function countPendingTasksByLeadId(leadId: string): Promise<number> {
  try {
    const count = await prismaClient.task.count({
      where: {
        leadId: leadId,
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    })
    return count
  } catch (error) {
    console.error('Error comptant tasques:', error)
    return 0
  }
}

/**
 * Marcar tasca com a completada
 */
export async function completeTask(taskId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await prismaClient.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error completant tasca:', error)
    return { success: false, error: 'Error completant tasca' }
  }
}

export interface CreateTaskForLeadParams {
  leadId: string
  title: string
  description?: string
  type: string
  priority: string
  dueDate?: Date
  assignedToId: string
  createdById: string
}

/**
 * Crear una tasca vinculada a un lead
 */
export async function createTaskForLead(params: CreateTaskForLeadParams): Promise<{
  success: boolean
  task?: LeadTask
  error?: string
}> {
  try {
    console.log('📝 Creant tasca per lead:', params.leadId)

    const task = await prismaClient.task.create({
      data: {
        title: params.title,
        description: params.description || null,
        type: params.type as any,  // Adaptar al vostre enum TaskType
        priority: params.priority as any,  // Adaptar al vostre enum TaskPriority
        status: 'PENDING',
        leadId: params.leadId,
        assignedToId: params.assignedToId,
        createdById: params.createdById,
        dueDate: params.dueDate || null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        type: true,
        dueDate: true,
        completedAt: true,
        assignedTo: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const serializedTask: LeadTask = {
      ...task,
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null
    }

    console.log('✅ Tasca creada:', task.id)
    return { success: true, task: serializedTask }
  } catch (error) {
    console.error('❌ Error creant tasca:', error)
    return { success: false, error: 'Error creant tasca' }
  }
}

/**
 * Obtenir tipus de tasques disponibles
 */
export async function getTaskTypes(): Promise<string[]> {
  // Adaptar segons els vostres tipus de tasques
  return [
    'LEAD_VERIFICATION',
    'CONTACT_CALL',
    'CONTACT_EMAIL',
    'DOCUMENT_REQUEST',
    'PROPOSAL_CREATION',
    'FOLLOW_UP',
    'MEETING',
    'OTHER'
  ]
}

/**
 * Obtenir gestors disponibles per assignar
 */
export async function getAvailableAssignees(): Promise<Array<{ id: string; name: string; email: string }>> {
  try {
    const users = await prismaClient.user.findMany({
      where: {
        isActive: true,
        role: {
          in: [
            'GESTOR_ESTANDARD',
            'GESTOR_ESTRATEGIC',
            'GESTOR_ENTERPRISE',
            'CRM_COMERCIAL',
            'CRM_CONTINGUT',
            'ADMIN',
            'SUPER_ADMIN'
          ]
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    return users.map(u => ({
      id: u.id,
      name: u.name || u.email,
      email: u.email
    }))
  } catch (error) {
    console.error('Error obtenint assignees:', error)
    return []
  }
}