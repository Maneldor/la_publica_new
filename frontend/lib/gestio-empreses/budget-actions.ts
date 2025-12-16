// lib/gestio-empreses/budget-actions.ts
'use server'

import { prismaClient as prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { ROLE_GROUPS } from '@/lib/gestio-empreses/permissions'


// ============================================
// TIPUS I INTERFACES
// ============================================

export interface BudgetStats {
  total: number
  pending: number
  approved: number
  rejected: number
  draft: number
  sent: number
  expiring: number
  totalAmount: number
  pendingAmount: number
  approvedAmount: number
}

export interface BudgetItem {
  id: string
  number: string
  client: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  createdAt: Date
  dueDate?: Date
  description?: string
  gestorId: string
  gestorName: string
  items: BudgetLineItem[]
}

export interface BudgetLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface BudgetFilters {
  status?: string
  gestor?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  search?: string
}

// ============================================
// FUNCIONS PRINCIPALS
// ============================================

/**
 * Obté les estadístiques dels pressupostos
 */
export async function getBudgetStats(): Promise<BudgetStats> {
  try {
    const [
      total,
      pending,
      approved,
      rejected,
      draft,
      sent,
      totalAmountResult,
      pendingAmountResult,
      approvedAmountResult
    ] = await Promise.all([
      prisma.budget.count(),
      prisma.budget.count({ where: { status: 'SENT' } }),
      prisma.budget.count({ where: { status: 'APPROVED' } }),
      prisma.budget.count({ where: { status: 'REJECTED' } }),
      prisma.budget.count({ where: { status: 'DRAFT' } }),
      prisma.budget.count({ where: { status: 'SENT' } }),
      prisma.budget.aggregate({ _sum: { total: true } }),
      prisma.budget.aggregate({ where: { status: 'SENT' }, _sum: { total: true } }),
      prisma.budget.aggregate({ where: { status: 'APPROVED' }, _sum: { total: true } })
    ])

    // Calcular pressupostos que vencen en 7 dies
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const expiring = await prisma.budget.count({
      where: {
        validUntil: { lte: sevenDaysFromNow, gt: new Date() },
        status: { in: ['DRAFT', 'SENT'] }
      }
    })

    return {
      total,
      pending,
      approved,
      rejected,
      draft,
      sent,
      expiring,
      totalAmount: Number(totalAmountResult._sum.total || 0),
      pendingAmount: Number(pendingAmountResult._sum.total || 0),
      approvedAmount: Number(approvedAmountResult._sum.total || 0)
    }
  } catch (error) {
    console.error('Error fetching budget stats:', error)
    throw new Error('Error al obtenir les estadístiques dels pressupostos')
  }
}

/**
 * Obté la llista de pressupostos amb filtres
 */
export async function getBudgets(filters: BudgetFilters = {}): Promise<BudgetItem[]> {
  try {
    // Construir where clause
    const where: Prisma.BudgetWhereInput = {}

    // Aplicar filtres d'estat
    if (filters.status && filters.status !== 'all') {
      // Mapeig d'estats de la UI als de la BD
      const statusMap: Record<string, string> = {
        'pending': 'SENT',
        'approved': 'APPROVED',
        'rejected': 'REJECTED',
        'draft': 'DRAFT'
      }
      where.status = statusMap[filters.status] || filters.status
    }

    // Filtrar per gestor
    if (filters.gestor && filters.gestor !== 'all') {
      where.createdBy = filters.gestor
    }

    // Cerca per text
    if (filters.search) {
      where.OR = [
        { budgetNumber: { contains: filters.search, mode: 'insensitive' } },
        { clientName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Filtres d'import
    if (filters.minAmount || filters.maxAmount) {
      where.total = {}
      if (filters.minAmount) {
        where.total.gte = new Prisma.Decimal(filters.minAmount)
      }
      if (filters.maxAmount) {
        where.total.lte = new Prisma.Decimal(filters.maxAmount)
      }
    }

    // Filtres de data
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo)
        endDate.setHours(23, 59, 59, 999) // Final del dia
        where.createdAt.lte = endDate
      }
    }

    // Query principal
    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      include: {
        company: {
          select: { id: true, name: true }
        },
        items: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            subtotal: true
          }
        }
      }
    })

    // Transformar a format de la UI
    const budgetItems: BudgetItem[] = budgets.map(budget => {
      // Mapeig d'estats de BD a UI
      const statusMap: Record<string, 'pending' | 'approved' | 'rejected' | 'draft'> = {
        'SENT': 'pending',
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        'DRAFT': 'draft',
        'EXPIRED': 'rejected', // Tractar expirats com rebutjats a la UI
        'CONVERTED': 'approved' // Tractar convertits com aprovats a la UI
      }

      return {
        id: budget.id,
        number: budget.budgetNumber,
        client: budget.clientName || 'Sense nom',
        amount: Number(budget.total),
        status: statusMap[budget.status] || 'draft',
        createdAt: budget.createdAt,
        dueDate: budget.validUntil,
        description: budget.description || undefined,
        gestorId: budget.createdBy || '',
        gestorName: 'Gestor', // Simplificat - el camp createdBy és un ID string
        items: budget.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.subtotal)
        }))
      }
    })

    return budgetItems
  } catch (error) {
    console.error('Error fetching budgets:', error)
    throw new Error('Error al obtenir els pressupostos')
  }
}

/**
 * Obté un pressupost per ID
 */
export async function getBudgetById(id: string): Promise<BudgetItem | null> {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true }
        },
        items: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            subtotal: true
          }
        }
      }
    })

    if (!budget) {
      return null
    }

    // Mapeig d'estats de BD a UI
    const statusMap: Record<string, 'pending' | 'approved' | 'rejected' | 'draft'> = {
      'SENT': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'DRAFT': 'draft',
      'EXPIRED': 'rejected',
      'CONVERTED': 'approved'
    }

    return {
      id: budget.id,
      number: budget.budgetNumber,
      client: budget.clientName || 'Sense nom',
      amount: Number(budget.total),
      status: statusMap[budget.status] || 'draft',
      createdAt: budget.createdAt,
      dueDate: budget.validUntil,
      description: budget.description || undefined,
      gestorId: budget.createdBy || '',
      gestorName: 'Gestor', // Simplificat - el camp createdBy és un ID string
      items: budget.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.subtotal)
      }))
    }
  } catch (error) {
    console.error('Error fetching budget:', error)
    throw new Error('Error al obtenir el pressupost')
  }
}

/**
 * Crea un nou pressupost
 */
export async function createBudget(data: {
  client?: string
  companyId?: string
  description?: string
  dueDate?: string
  items?: Omit<BudgetLineItem, 'id'>[]
  lines?: {
    itemType: string
    planId?: string
    extraId?: string
    description: string
    quantity: number
    unitPrice: number
    billingCycle?: string
    subtotal: number
  }[]
  validUntilDays?: number
  notes?: string
  gestorId?: string
}): Promise<BudgetItem> {
  try {
    // Convert wizard lines to budget items if provided
    let budgetItems: Omit<BudgetLineItem, 'id'>[] = []

    if (data.lines) {
      budgetItems = data.lines.map(line => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        total: line.subtotal
      }))
    } else if (data.items) {
      budgetItems = data.items
    }

    const amount = budgetItems.reduce((sum, item) => sum + item.total, 0)
    const budgetNumber = `PRS-${Date.now()}`

    // Calculate due date based on validUntilDays
    let dueDate: Date | undefined
    if (data.validUntilDays) {
      dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + data.validUntilDays)
    } else if (data.dueDate) {
      dueDate = new Date(data.dueDate)
    }

    const newBudget: BudgetItem = {
      id: `budget-${Date.now()}`,
      number: budgetNumber,
      client: data.client || 'Client des del wizard',
      amount,
      status: 'draft',
      createdAt: new Date(),
      dueDate,
      description: data.description || data.notes,
      gestorId: data.gestorId || 'gestor-1',
      gestorName: 'Mock Gestor', // En real es faria un query per obtenir el nom
      items: budgetItems.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`
      }))
    }

    // En una implementació real, es guardaria a la BD
    console.log('Creating budget:', newBudget)

    revalidatePath('/gestio/pressupostos')
    revalidatePath('/gestio/admin/pressupostos')
    return newBudget
  } catch (error) {
    console.error('Error creating budget:', error)
    throw new Error('Error al crear el pressupost')
  }
}

/**
 * Actualitza l'estat d'un pressupost
 */
export async function updateBudgetStatus(
  budgetId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  try {
    // En una implementació real, es faria un update a la BD
    console.log(`Updating budget ${budgetId} status to ${status}`)

    revalidatePath('/gestio/pressupostos')
    revalidatePath(`/gestio/pressupostos/${budgetId}`)
  } catch (error) {
    console.error('Error updating budget status:', error)
    throw new Error('Error al actualitzar l\'estat del pressupost')
  }
}

/**
 * Elimina un pressupost
 */
export async function deleteBudget(budgetId: string): Promise<void> {
  try {
    // En una implementació real, es faria un delete a la BD
    console.log(`Deleting budget ${budgetId}`)

    revalidatePath('/gestio/pressupostos')
  } catch (error) {
    console.error('Error deleting budget:', error)
    throw new Error('Error al eliminar el pressupost')
  }
}

/**
 * Operacions en bloc per pressupostos seleccionats
 */
export async function bulkUpdateBudgets(
  budgetIds: string[],
  action: 'approve' | 'reject' | 'delete'
): Promise<void> {
  try {
    for (const budgetId of budgetIds) {
      switch (action) {
        case 'approve':
          await updateBudgetStatus(budgetId, 'approved')
          break
        case 'reject':
          await updateBudgetStatus(budgetId, 'rejected')
          break
        case 'delete':
          await deleteBudget(budgetId)
          break
      }
    }

    revalidatePath('/gestio/pressupostos')
  } catch (error) {
    console.error('Error in bulk operation:', error)
    throw new Error('Error en l\'operació en bloc')
  }
}

/**
 * Obté la llista de gestors per als filtres
 */
export async function getGestors(): Promise<{ id: string; name: string }[]> {
  try {
    const gestors = await prisma.user.findMany({
      where: {
        role: {
          in: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.GESTORS]
        },
        isActive: true
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return gestors.map(gestor => ({
      id: gestor.id,
      name: gestor.name || 'Sense nom'
    }))
  } catch (error) {
    console.error('Error fetching gestors:', error)
    throw new Error('Error al obtenir els gestors')
  }
}

/**
 * Obté les empreses per al selector del wizard
 */
export async function getCompaniesForSelect(): Promise<{
  id: string
  name: string
  cif: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
}[]> {
  try {
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        name: true,
        cif: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 100 // Limitar per rendiment
    })

    return companies.map(company => ({
      id: company.id,
      name: company.name,
      cif: company.cif || '',
      email: company.email,
      phone: company.phone || undefined,
      address: company.address || undefined,
      city: company.city || undefined,
      postalCode: company.postalCode || undefined
    }))
  } catch (error) {
    console.error('Error fetching companies:', error)
    throw new Error('Error al obtenir les empreses')
  }
}

/**
 * Obté els plans disponibles per al wizard
 */
export async function getPlansForSelect(): Promise<{
  id: string
  nombre: string
  nombreCorto: string
  precioMensual: number
  precioAnual: number
  icono?: string
}[]> {
  try {
    // En una implementació real, es faria un query a la BD
    return [
      {
        id: 'plan-basic',
        nombre: 'Plan Básico',
        nombreCorto: 'Básico',
        precioMensual: 29.99,
        precioAnual: 299.99,
        icono: 'package'
      },
      {
        id: 'plan-professional',
        nombre: 'Plan Professional',
        nombreCorto: 'Pro',
        precioMensual: 59.99,
        precioAnual: 599.99,
        icono: 'star'
      },
      {
        id: 'plan-enterprise',
        nombre: 'Plan Enterprise',
        nombreCorto: 'Enterprise',
        precioMensual: 99.99,
        precioAnual: 999.99,
        icono: 'building'
      },
      {
        id: 'plan-premium',
        nombre: 'Plan Premium',
        nombreCorto: 'Premium',
        precioMensual: 149.99,
        precioAnual: 1499.99,
        icono: 'crown'
      }
    ]
  } catch (error) {
    console.error('Error fetching plans:', error)
    throw new Error('Error al obtenir els plans')
  }
}

/**
 * Obté els serveis extra disponibles per al wizard
 */
export async function getExtrasForSelect(): Promise<{
  id: string
  name: string
  basePrice: number
  category: string
}[]> {
  try {
    // En una implementació real, es faria un query a la BD
    return [
      {
        id: 'extra-domain',
        name: 'Domini personalitzat',
        basePrice: 15.99,
        category: 'Domini'
      },
      {
        id: 'extra-ssl',
        name: 'Certificat SSL Premium',
        basePrice: 49.99,
        category: 'Seguretat'
      },
      {
        id: 'extra-backup',
        name: 'Còpia de seguretat automàtica',
        basePrice: 25.99,
        category: 'Backup'
      },
      {
        id: 'extra-analytics',
        name: 'Analytics avançats',
        basePrice: 39.99,
        category: 'Analytics'
      },
      {
        id: 'extra-support',
        name: 'Suport prioritari 24/7',
        basePrice: 79.99,
        category: 'Suport'
      },
      {
        id: 'extra-cdn',
        name: 'CDN Global',
        basePrice: 19.99,
        category: 'Rendiment'
      },
      {
        id: 'extra-email',
        name: 'Comptes email corporatius (10)',
        basePrice: 29.99,
        category: 'Email'
      },
      {
        id: 'extra-storage',
        name: 'Emmagatzematge addicional (100GB)',
        basePrice: 9.99,
        category: 'Emmagatzematge'
      }
    ]
  } catch (error) {
    console.error('Error fetching extras:', error)
    throw new Error('Error al obtenir els serveis extra')
  }
}

// ============================================
// FUNCIONS D'UTILITAT I SEEDING
// ============================================

/**
 * Genera pressupostos d'exemple per testing (només ADMIN)
 */
export async function seedBudgetExamples(): Promise<{ created: number; message: string }> {
  try {
    // Obtenir una empresa existent
    const company = await prisma.company.findFirst({ where: { isActive: true } })
    if (!company) {
      return { created: 0, message: 'No hi ha empreses actives. Crea una empresa primer.' }
    }

    // Obtenir un gestor existent
    const gestor = await prisma.user.findFirst({
      where: {
        role: { in: [...ROLE_GROUPS.ADMINS, ...ROLE_GROUPS.GESTORS] },
        isActive: true
      }
    })

    // Eliminar pressupostos d'exemple anteriors
    await prisma.budget.deleteMany({
      where: { budgetNumber: { startsWith: 'EXEMPLE-' } }
    })

    const exampleBudgets = [
      {
        budgetNumber: 'EXEMPLE-2024-001',
        clientName: 'Empresa Catalana SL',
        clientEmail: 'info@empresacatalana.cat',
        clientPhone: '+34 93 123 45 67',
        clientNIF: 'B12345678',
        notes: 'Sistema de gestió d\'inventari personalitzat',
        status: 'SENT' as const,
        subtotal: new Prisma.Decimal(13016.53),
        taxRate: new Prisma.Decimal(21),
        taxAmount: new Prisma.Decimal(2733.47),
        total: new Prisma.Decimal(15750),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: gestor?.id || null,
        company: { connect: { id: company.id } },
        items: {
          create: [
            { order: 1, itemType: 'CUSTOM' as const, description: 'Desenvolupament aplicació web', quantity: new Prisma.Decimal(80), unitPrice: new Prisma.Decimal(125), subtotal: new Prisma.Decimal(10000) },
            { order: 2, itemType: 'CUSTOM' as const, description: 'Base de dades i configuració', quantity: new Prisma.Decimal(30), unitPrice: new Prisma.Decimal(95), subtotal: new Prisma.Decimal(2850) },
            { order: 3, itemType: 'CUSTOM' as const, description: 'Formació i documentació', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(166.53), subtotal: new Prisma.Decimal(166.53) }
          ]
        }
      },
      {
        budgetNumber: 'EXEMPLE-2024-002',
        clientName: 'Innovació Tech BCN',
        clientEmail: 'contacte@innovaciotech.com',
        clientNIF: 'B87654321',
        notes: 'Plataforma e-commerce amb integració ERP',
        status: 'APPROVED' as const,
        subtotal: new Prisma.Decimal(22000),
        taxRate: new Prisma.Decimal(21),
        taxAmount: new Prisma.Decimal(4620),
        total: new Prisma.Decimal(26620),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(),
        createdBy: gestor?.id || null,
        company: { connect: { id: company.id } },
        items: {
          create: [
            { order: 1, itemType: 'CUSTOM' as const, description: 'Desenvolupament frontend React', quantity: new Prisma.Decimal(60), unitPrice: new Prisma.Decimal(135), subtotal: new Prisma.Decimal(8100) },
            { order: 2, itemType: 'CUSTOM' as const, description: 'API Backend i integracions', quantity: new Prisma.Decimal(45), unitPrice: new Prisma.Decimal(155), subtotal: new Prisma.Decimal(6975) },
            { order: 3, itemType: 'CUSTOM' as const, description: 'Testing i deployment', quantity: new Prisma.Decimal(25), unitPrice: new Prisma.Decimal(115), subtotal: new Prisma.Decimal(2875) },
            { order: 4, itemType: 'CUSTOM' as const, description: 'Manteniment 6 mesos', quantity: new Prisma.Decimal(6), unitPrice: new Prisma.Decimal(675), subtotal: new Prisma.Decimal(4050) }
          ]
        }
      },
      {
        budgetNumber: 'EXEMPLE-2024-003',
        clientName: 'Consultoría Digital',
        clientEmail: 'hello@consultoriadigital.es',
        clientNIF: 'B11223344',
        notes: 'App mòbil - Rebutjat per pressupost',
        status: 'REJECTED' as const,
        subtotal: new Prisma.Decimal(8900),
        taxRate: new Prisma.Decimal(21),
        taxAmount: new Prisma.Decimal(1869),
        total: new Prisma.Decimal(10769),
        validUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        rejectedAt: new Date(),
        createdBy: gestor?.id || null,
        company: { connect: { id: company.id } },
        items: {
          create: [
            { order: 1, itemType: 'CUSTOM' as const, description: 'Disseny UX/UI', quantity: new Prisma.Decimal(25), unitPrice: new Prisma.Decimal(120), subtotal: new Prisma.Decimal(3000) },
            { order: 2, itemType: 'CUSTOM' as const, description: 'Desenvolupament React Native', quantity: new Prisma.Decimal(40), unitPrice: new Prisma.Decimal(145), subtotal: new Prisma.Decimal(5800) },
            { order: 3, itemType: 'CUSTOM' as const, description: 'Testing', quantity: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(100), subtotal: new Prisma.Decimal(100) }
          ]
        }
      },
      {
        budgetNumber: 'EXEMPLE-2024-004',
        clientName: 'StartUp Analytics',
        clientEmail: 'contact@startupanalytics.io',
        clientNIF: 'B99887766',
        notes: 'Dashboard d\'analytics - Esborrany',
        status: 'DRAFT' as const,
        subtotal: new Prisma.Decimal(12400),
        taxRate: new Prisma.Decimal(21),
        taxAmount: new Prisma.Decimal(2604),
        total: new Prisma.Decimal(15004),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdBy: gestor?.id || null,
        company: { connect: { id: company.id } },
        items: {
          create: [
            { order: 1, itemType: 'CUSTOM' as const, description: 'Anàlisi de requeriments', quantity: new Prisma.Decimal(20), unitPrice: new Prisma.Decimal(115), subtotal: new Prisma.Decimal(2300) },
            { order: 2, itemType: 'CUSTOM' as const, description: 'Desenvolupament dashboard', quantity: new Prisma.Decimal(60), unitPrice: new Prisma.Decimal(135), subtotal: new Prisma.Decimal(8100) },
            { order: 3, itemType: 'CUSTOM' as const, description: 'Integració APIs', quantity: new Prisma.Decimal(20), unitPrice: new Prisma.Decimal(100), subtotal: new Prisma.Decimal(2000) }
          ]
        }
      }
    ]

    let created = 0
    for (const budgetData of exampleBudgets) {
      await prisma.budget.create({ data: budgetData })
      created++
    }

    revalidatePath('/gestio/admin/pressupostos')
    return { created, message: `S'han creat ${created} pressupostos d'exemple correctament.` }
  } catch (error) {
    console.error('Error seeding budget examples:', error)
    throw new Error('Error al generar pressupostos d\'exemple')
  }
}

