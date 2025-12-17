// lib/gestio-empreses/leads-actions.ts
'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function getLeadsAction(filters: {
  status?: string
  priority?: string
  source?: string
  assignedTo?: string
} = {}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      throw new Error('No autoritzat')
    }

    // Construir filtre
    const where: any = {}

    // Si l'usuari és un gestor, només veure els seus leads
    // ADMIN_GESTIO pot veure tots els leads per defecte
    if (['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'].includes(session.user.role)) {
      where.assignedToId = session.user.id
    }

    // Aplicar filtres
    if (filters.status) where.status = filters.status
    if (filters.priority) where.priority = filters.priority
    if (filters.source) where.source = filters.source
    if (filters.assignedTo) where.assignedToId = filters.assignedTo

    console.log('✅ Server Action getLeads: About to query with where:', where)

    // Obtenir leads
    const leads = await prismaClient.companyLead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`✅ Server Action getLeads: Found ${leads.length} leads`)

    // Formatar leads per al frontend
    const formattedLeads = leads.map((lead) => ({
      id: lead.id,
      company: lead.companyName,
      contact: lead.contactName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status,
      stage: lead.stage || 'NOU',
      priority: lead.priority || 'MEDIUM',
      source: lead.source,
      sector: lead.sector || '',
      value: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : 0,
      assignedTo: lead.assignedToId || '',
      gestorName: lead.assignedTo?.name || '',
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      description: lead.notes || '',
      score: lead.score,
      tags: lead.tags || [],
    }))

    return { leads: formattedLeads, success: true }
  } catch (error) {
    console.error('❌ Error en Server Action getLeads:', error)
    return { leads: [], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function getUnassignedLeadsAction(filters: {
  status?: string
  priority?: string
  source?: string
} = {}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      throw new Error('No autoritzat')
    }

    // Construir filtre només per leads sense assignar
    const where: any = {
      assignedToId: null
    }

    // Aplicar filtres
    if (filters.status) where.status = filters.status
    if (filters.priority) where.priority = filters.priority
    if (filters.source) where.source = filters.source

    console.log('✅ Server Action getUnassignedLeads: About to query with where:', where)

    // Obtenir leads sense assignar
    const leads = await prismaClient.companyLead.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`✅ Server Action getUnassignedLeads: Found ${leads.length} unassigned leads`)

    // Formatar leads per al frontend
    const formattedLeads = leads.map((lead) => ({
      id: lead.id,
      company: lead.companyName,
      contact: lead.contactName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status,
      stage: lead.stage || 'NOU',
      priority: lead.priority || 'MEDIUM',
      source: lead.source,
      sector: lead.sector || '',
      value: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : 0,
      assignedTo: lead.assignedToId || '',
      gestorName: '',
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      description: lead.notes || '',
      score: lead.score,
      tags: lead.tags || [],
    }))

    return { leads: formattedLeads, success: true }
  } catch (error) {
    console.error('❌ Error en Server Action getUnassignedLeads:', error)
    return { leads: [], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function getAssignedLeadsAction(filters: {
  status?: string
  priority?: string
  source?: string
  assignedTo?: string
} = {}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      throw new Error('No autoritzat')
    }

    // Construir filtre per leads assignats
    const where: any = {
      assignedToId: {
        not: null
      }
    }

    // Aplicar filtres
    if (filters.status) where.status = filters.status
    if (filters.priority) where.priority = filters.priority
    if (filters.source) where.source = filters.source
    if (filters.assignedTo) where.assignedToId = filters.assignedTo

    console.log('✅ Server Action getAssignedLeads: About to query with where:', where)

    // Obtenir tots els leads assignats
    const leads = await prismaClient.companyLead.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`✅ Server Action getAssignedLeads: Found ${leads.length} assigned leads`)

    // Formatar leads per al frontend
    const formattedLeads = leads.map((lead) => ({
      id: lead.id,
      company: lead.companyName,
      contact: lead.contactName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status,
      stage: lead.stage || 'NOU',
      priority: lead.priority || 'MEDIUM',
      source: lead.source,
      sector: lead.sector || '',
      value: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : 0,
      assignedTo: lead.assignedToId || '',
      gestorName: lead.assignedTo?.name || '',
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      description: lead.notes || '',
      score: lead.score,
      tags: lead.tags || [],
    }))

    return { leads: formattedLeads, success: true }
  } catch (error) {
    console.error('❌ Error en Server Action getAssignedLeads:', error)
    return { leads: [], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Formatear nombre de gestor según rol
 */
function formatGestorName(role: string, name: string | null, email: string): string {
  const roleLabels: Record<string, string> = {
    'GESTOR_ESTANDARD': 'Gestor Estàndard',
    'GESTOR_ESTRATEGIC': 'Gestor Estratègic',
    'GESTOR_ENTERPRISE': 'Gestor Enterprise',
    'CRM_COMERCIAL': 'CRM Comercial'
  }

  return roleLabels[role] || email
}

export async function getGestorsAction() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      throw new Error('No autoritzat')
    }

    // Obtener todos los gestores comerciales + CRM
    const gestors = await prismaClient.user.findMany({
      where: {
        role: {
          in: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'CRM_COMERCIAL']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`✅ Server Action getGestors: Found ${gestors.length} gestors`)

    // Filtrar para mostrar solo un usuario por rol (el primero)
    const seenRoles = new Set<string>()
    const uniqueGestors = gestors.filter(gestor => {
      if (seenRoles.has(gestor.role)) {
        return false
      }
      seenRoles.add(gestor.role)
      return true
    })

    // Formatear nombres según rol
    const formattedGestors = uniqueGestors.map(gestor => ({
      id: gestor.id,
      name: formatGestorName(gestor.role, gestor.name, gestor.email),
      email: gestor.email,
      role: gestor.role
    }))

    return { gestors: formattedGestors, success: true }
  } catch (error) {
    console.error('❌ Error en Server Action getGestors:', error)
    return { gestors: [], success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}