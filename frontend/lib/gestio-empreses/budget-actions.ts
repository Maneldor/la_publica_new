// lib/gestio-empreses/budget-actions.ts
'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

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
    // Simulació de dades - en una implementació real faríeu queries a la BD
    const budgets = await getMockBudgets()

    // Calcular pressupostos que vencen en els propers 7 dies
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const expiring = budgets.filter(b =>
      b.dueDate &&
      new Date(b.dueDate) <= sevenDaysFromNow &&
      new Date(b.dueDate) > new Date() &&
      (b.status === 'pending' || b.status === 'draft')
    ).length

    const stats: BudgetStats = {
      total: budgets.length,
      pending: budgets.filter(b => b.status === 'pending').length,
      approved: budgets.filter(b => b.status === 'approved').length,
      rejected: budgets.filter(b => b.status === 'rejected').length,
      draft: budgets.filter(b => b.status === 'draft').length,
      sent: budgets.filter(b => b.status === 'pending').length, // Pending = Sent in this context
      expiring,
      totalAmount: budgets.reduce((sum, b) => sum + b.amount, 0),
      pendingAmount: budgets
        .filter(b => b.status === 'pending')
        .reduce((sum, b) => sum + b.amount, 0),
      approvedAmount: budgets
        .filter(b => b.status === 'approved')
        .reduce((sum, b) => sum + b.amount, 0)
    }

    return stats
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
    let budgets = await getMockBudgets()

    // Aplicar filtres
    if (filters.status && filters.status !== 'all') {
      budgets = budgets.filter(b => b.status === filters.status)
    }

    if (filters.gestor && filters.gestor !== 'all') {
      budgets = budgets.filter(b => b.gestorId === filters.gestor)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      budgets = budgets.filter(b =>
        b.number.toLowerCase().includes(search) ||
        b.client.toLowerCase().includes(search) ||
        b.description?.toLowerCase().includes(search)
      )
    }

    if (filters.minAmount) {
      budgets = budgets.filter(b => b.amount >= filters.minAmount!)
    }

    if (filters.maxAmount) {
      budgets = budgets.filter(b => b.amount <= filters.maxAmount!)
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom)
      budgets = budgets.filter(b => b.createdAt >= dateFrom)
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      budgets = budgets.filter(b => b.createdAt <= dateTo)
    }

    // Ordenar per data de creació (més recent primer)
    budgets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return budgets
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
    const budgets = await getMockBudgets()
    return budgets.find(b => b.id === id) || null
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
    // En una implementació real, es faria un query a la BD per obtenir els gestors
    return [
      { id: 'gestor-1', name: 'Anna García' },
      { id: 'gestor-2', name: 'Marc Puig' },
      { id: 'gestor-3', name: 'Laura Martí' },
      { id: 'gestor-4', name: 'Jordi Vila' },
    ]
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
    // En una implementació real, es faria un query a la BD
    return [
      {
        id: 'company-1',
        name: 'Empresa Catalana SL',
        cif: 'B12345678',
        email: 'info@empresacatalana.cat',
        phone: '+34 93 123 45 67',
        address: 'Carrer Major 123',
        city: 'Barcelona',
        postalCode: '08001'
      },
      {
        id: 'company-2',
        name: 'Innovació Tech BCN',
        cif: 'B87654321',
        email: 'contacte@innovaciotech.com',
        phone: '+34 93 987 65 43',
        address: 'Avinguda Diagonal 456',
        city: 'Barcelona',
        postalCode: '08008'
      },
      {
        id: 'company-3',
        name: 'Consultoría Digital',
        cif: 'B11223344',
        email: 'hello@consultoriadigital.es',
        phone: '+34 93 112 23 34',
        address: 'Plaça Catalunya 10',
        city: 'Barcelona',
        postalCode: '08002'
      },
      {
        id: 'company-4',
        name: 'Fundació Emprenedoria',
        cif: 'G55667788',
        email: 'info@fundacioemprenedoria.org',
        phone: '+34 93 556 67 78',
        address: 'Passeig de Gràcia 89',
        city: 'Barcelona',
        postalCode: '08007'
      },
      {
        id: 'company-5',
        name: 'StartUp Analytics',
        cif: 'B99887766',
        email: 'contact@startupanalytics.io',
        phone: '+34 93 998 87 76',
        address: 'Carrer Aragó 234',
        city: 'Barcelona',
        postalCode: '08011'
      },
      {
        id: 'company-6',
        name: 'Cooperativa Agrària',
        cif: 'F44556677',
        email: 'administracio@coopagraria.cat',
        phone: '+34 973 445 566',
        address: 'Carrer de la Pau 15',
        city: 'Lleida',
        postalCode: '25001'
      }
    ]
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
// FUNCIONS D'UTILITAT I MOCK DATA
// ============================================

/**
 * Genera dades mock per als pressupostos
 */
async function getMockBudgets(): Promise<BudgetItem[]> {
  const gestors = await getGestors()

  return [
    {
      id: 'budget-1',
      number: 'PRS-2024-001',
      client: 'Empresa Catalana SL',
      amount: 15750,
      status: 'pending',
      createdAt: new Date('2024-03-15'),
      dueDate: new Date('2024-04-15'),
      description: 'Sistema de gestió d\'inventari personalitzat',
      gestorId: 'gestor-1',
      gestorName: 'Anna García',
      items: [
        {
          id: 'item-1',
          description: 'Desenvolupament aplicació web',
          quantity: 80,
          unitPrice: 125,
          total: 10000
        },
        {
          id: 'item-2',
          description: 'Base de dades i configuració',
          quantity: 30,
          unitPrice: 95,
          total: 2850
        },
        {
          id: 'item-3',
          description: 'Formació i documentació',
          quantity: 20,
          unitPrice: 145,
          total: 2900
        }
      ]
    },
    {
      id: 'budget-2',
      number: 'PRS-2024-002',
      client: 'Innovació Tech BCN',
      amount: 22350,
      status: 'approved',
      createdAt: new Date('2024-03-12'),
      dueDate: new Date('2024-05-01'),
      description: 'Plataforma e-commerce amb integració ERP',
      gestorId: 'gestor-2',
      gestorName: 'Marc Puig',
      items: [
        {
          id: 'item-4',
          description: 'Desenvolupament frontend React',
          quantity: 60,
          unitPrice: 135,
          total: 8100
        },
        {
          id: 'item-5',
          description: 'API Backend i integracions',
          quantity: 45,
          unitPrice: 155,
          total: 6975
        },
        {
          id: 'item-6',
          description: 'Testing i deployment',
          quantity: 25,
          unitPrice: 115,
          total: 2875
        },
        {
          id: 'item-7',
          description: 'Manteniment 6 mesos',
          quantity: 6,
          unitPrice: 750,
          total: 4500
        }
      ]
    },
    {
      id: 'budget-3',
      number: 'PRS-2024-003',
      client: 'Consultoría Digital',
      amount: 8900,
      status: 'rejected',
      createdAt: new Date('2024-03-10'),
      description: 'App mòbil per gestió de clients',
      gestorId: 'gestor-3',
      gestorName: 'Laura Martí',
      items: [
        {
          id: 'item-8',
          description: 'Disseny UX/UI',
          quantity: 25,
          unitPrice: 120,
          total: 3000
        },
        {
          id: 'item-9',
          description: 'Desenvolupament React Native',
          quantity: 40,
          unitPrice: 145,
          total: 5800
        },
        {
          id: 'item-10',
          description: 'Testing i publicació stores',
          quantity: 10,
          unitPrice: 110,
          total: 1100
        }
      ]
    },
    {
      id: 'budget-4',
      number: 'PRS-2024-004',
      client: 'Fundació Emprenedoria',
      amount: 32500,
      status: 'pending',
      createdAt: new Date('2024-03-08'),
      dueDate: new Date('2024-06-30'),
      description: 'Portal web institutional amb gestor de continguts',
      gestorId: 'gestor-1',
      gestorName: 'Anna García',
      items: [
        {
          id: 'item-11',
          description: 'Disseny web responsive',
          quantity: 40,
          unitPrice: 125,
          total: 5000
        },
        {
          id: 'item-12',
          description: 'CMS personalitzat',
          quantity: 80,
          unitPrice: 165,
          total: 13200
        },
        {
          id: 'item-13',
          description: 'Integració sistemes existents',
          quantity: 30,
          unitPrice: 185,
          total: 5550
        },
        {
          id: 'item-14',
          description: 'Migració de contingut',
          quantity: 35,
          unitPrice: 95,
          total: 3325
        },
        {
          id: 'item-15',
          description: 'Formació administradors',
          quantity: 20,
          unitPrice: 135,
          total: 2700
        },
        {
          id: 'item-16',
          description: 'Suport post-llançament',
          quantity: 15,
          unitPrice: 185,
          total: 2775
        }
      ]
    },
    {
      id: 'budget-5',
      number: 'PRS-2024-005',
      client: 'StartUp Analytics',
      amount: 18750,
      status: 'approved',
      createdAt: new Date('2024-03-05'),
      dueDate: new Date('2024-05-15'),
      description: 'Dashboard d\'analytics i reporting automatitzat',
      gestorId: 'gestor-4',
      gestorName: 'Jordi Vila',
      items: [
        {
          id: 'item-17',
          description: 'Frontend Dashboard React',
          quantity: 50,
          unitPrice: 145,
          total: 7250
        },
        {
          id: 'item-18',
          description: 'APIs de dades i ETL',
          quantity: 45,
          unitPrice: 165,
          total: 7425
        },
        {
          id: 'item-19',
          description: 'Visualitzacions i gràfics',
          quantity: 25,
          unitPrice: 125,
          total: 3125
        },
        {
          id: 'item-20',
          description: 'Testing i optimització',
          quantity: 15,
          unitPrice: 130,
          total: 1950
        }
      ]
    },
    {
      id: 'budget-6',
      number: 'PRS-2024-006',
      client: 'Cooperativa Agrària',
      amount: 12400,
      status: 'draft',
      createdAt: new Date('2024-03-03'),
      description: 'Sistema de gestió de cooperatives rurals',
      gestorId: 'gestor-2',
      gestorName: 'Marc Puig',
      items: [
        {
          id: 'item-21',
          description: 'Anàlisi de requeriments',
          quantity: 20,
          unitPrice: 115,
          total: 2300
        },
        {
          id: 'item-22',
          description: 'Desenvolupament web application',
          quantity: 60,
          unitPrice: 135,
          total: 8100
        },
        {
          id: 'item-23',
          description: 'Integració sistemes comptables',
          quantity: 20,
          unitPrice: 155,
          total: 3100
        }
      ]
    }
  ]
}