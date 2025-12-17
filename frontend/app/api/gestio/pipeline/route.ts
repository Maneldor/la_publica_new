// app/api/gestio/pipeline/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface PipelineStats {
  draft: { count: number; amount: number }
  sent: { count: number; amount: number }
  approved: { count: number; amount: number }
  invoiced: { count: number; amount: number }
  paid: { count: number; amount: number }
  overdue: { count: number; amount: number }
  conversionRate: number
}

interface PipelineItem {
  id: string
  type: 'budget' | 'invoice'
  number: string
  company: { name: string }
  clientName: string
  total: number
  date: string
  dueDate?: string
  isOverdue: boolean
  paidPercentage?: number
  status: string
  linkedInvoice?: string
  linkedBudget?: string
}

interface UserPipeline {
  user: {
    id: string
    name: string
    email: string
    role: string
    image?: string
  }
  stats: PipelineStats
  items: PipelineItem[]
}

// Roles que pueden ver equipos
const TEAM_VIEWER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL', 'CRM_CONTINGUT']

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role as string

    // Obtener datos del usuario actual con subordinados
    const currentUser = await prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        subordinates: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    // Obtener mi pipeline
    const myPipeline = await getUserPipeline(userId, {
      id: userId,
      name: currentUser.name || 'Sense nom',
      email: currentUser.email,
      role: currentUser.role,
      image: currentUser.image || undefined
    })

    // Obtener pipelines del equipo si el rol lo permite
    let teamPipelines: UserPipeline[] = []

    if (TEAM_VIEWER_ROLES.includes(userRole)) {
      // Para SUPER_ADMIN y ADMIN, obtener todos los subordinados recursivamente
      if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
        const allSubordinates = await getAllSubordinatesRecursive(userId)
        teamPipelines = await Promise.all(
          allSubordinates.map(sub => getUserPipeline(sub.id, sub))
        )
      } else {
        // Para otros roles, solo subordinados directos
        teamPipelines = await Promise.all(
          currentUser.subordinates.map(sub => getUserPipeline(sub.id, {
            id: sub.id,
            name: sub.name || 'Sense nom',
            email: sub.email,
            role: sub.role,
            image: sub.image || undefined
          }))
        )
      }
    }

    return NextResponse.json({
      myPipeline,
      teamPipelines
    })

  } catch (error) {
    console.error('Error carregant pipeline:', error)
    return NextResponse.json(
      { error: 'Error carregant dades del pipeline' },
      { status: 500 }
    )
  }
}

async function getAllSubordinatesRecursive(userId: string): Promise<{
  id: string
  name: string
  email: string
  role: string
  image?: string
}[]> {
  const result: { id: string; name: string; email: string; role: string; image?: string }[] = []
  const visited = new Set<string>()

  async function collectSubordinates(id: string) {
    if (visited.has(id)) return
    visited.add(id)

    const user = await prismaClient.user.findUnique({
      where: { id },
      include: {
        subordinates: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    })

    if (user) {
      for (const sub of user.subordinates) {
        result.push({
          id: sub.id,
          name: sub.name || 'Sense nom',
          email: sub.email,
          role: sub.role,
          image: sub.image || undefined
        })
        await collectSubordinates(sub.id)
      }
    }
  }

  await collectSubordinates(userId)
  return result
}

async function getUserPipeline(
  userId: string,
  userInfo: { id: string; name: string; email: string; role: string; image?: string }
): Promise<UserPipeline> {
  const now = new Date()

  // Obtener presupuestos del usuario
  const budgets = await prismaClient.budget.findMany({
    where: {
      OR: [
        { createdBy: userId },
        { company: { accountManagerId: userId } }
      ]
    },
    include: {
      company: { select: { name: true } },
      invoice: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Obtener facturas del usuario
  const invoices = await prismaClient.invoice.findMany({
    where: {
      OR: [
        { createdById: userId },
        { company: { accountManagerId: userId } }
      ]
    },
    include: {
      company: { select: { name: true } },
      budgets: { select: { id: true } }
    },
    orderBy: { issueDate: 'desc' }
  })

  // Transformar presupuestos
  const budgetItems: PipelineItem[] = budgets.map(b => {
    const validUntil = b.validUntil ? new Date(b.validUntil) : null
    const isOverdue = validUntil && validUntil < now && !['APPROVED', 'INVOICED'].includes(b.status)

    return {
      id: `budget-${b.id}`,
      type: 'budget' as const,
      number: b.budgetNumber || `PRE-${b.id.slice(-6)}`,
      company: { name: b.company?.name || 'Sense empresa' },
      clientName: b.clientName || '',
      total: Number(b.total) || 0,
      date: b.createdAt.toISOString(),
      dueDate: b.validUntil?.toISOString(),
      isOverdue: isOverdue || false,
      status: b.status === 'INVOICED' ? 'INVOICED' : b.status || 'DRAFT',
      linkedInvoice: b.invoice?.id
    }
  })

  // Transformar facturas
  const invoiceItems: PipelineItem[] = invoices.map(i => {
    const dueDate = i.dueDate ? new Date(i.dueDate) : null
    const totalAmount = Number(i.totalAmount) || 0
    const paidAmount = Number(i.paidAmount) || 0
    const isOverdue = dueDate && dueDate < now && i.status !== 'PAID'

    return {
      id: `invoice-${i.id}`,
      type: 'invoice' as const,
      number: i.invoiceNumber || `FAC-${i.id.slice(-6)}`,
      company: { name: i.company?.name || 'Sense empresa' },
      clientName: i.clientName || '',
      total: totalAmount,
      date: i.issueDate?.toISOString() || i.createdAt.toISOString(),
      dueDate: i.dueDate?.toISOString(),
      isOverdue: isOverdue || false,
      paidPercentage: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
      status: i.status === 'PAID' ? 'PAID' : 'INVOICED',
      linkedBudget: i.budgets?.id
    }
  })

  // Combinar items (evitar duplicados de presupuestos ya facturados)
  const allItems = [
    ...budgetItems.filter(b => b.status !== 'INVOICED'),
    ...invoiceItems
  ]

  // Calcular estadísticas
  const stats: PipelineStats = {
    draft: {
      count: budgetItems.filter(i => i.status === 'DRAFT').length,
      amount: budgetItems.filter(i => i.status === 'DRAFT').reduce((s, i) => s + i.total, 0)
    },
    sent: {
      count: budgetItems.filter(i => i.status === 'SENT').length,
      amount: budgetItems.filter(i => i.status === 'SENT').reduce((s, i) => s + i.total, 0)
    },
    approved: {
      count: budgetItems.filter(i => i.status === 'APPROVED').length,
      amount: budgetItems.filter(i => i.status === 'APPROVED').reduce((s, i) => s + i.total, 0)
    },
    invoiced: {
      count: invoiceItems.filter(i => i.status === 'INVOICED').length,
      amount: invoiceItems.filter(i => i.status === 'INVOICED').reduce((s, i) => s + i.total, 0)
    },
    paid: {
      count: invoiceItems.filter(i => i.status === 'PAID').length,
      amount: invoiceItems.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
    },
    overdue: {
      count: allItems.filter(i => i.isOverdue).length,
      amount: allItems.filter(i => i.isOverdue).reduce((s, i) => s + i.total, 0)
    },
    conversionRate: budgetItems.length > 0
      ? Math.round((budgetItems.filter(b => ['APPROVED', 'INVOICED'].includes(b.status)).length / budgetItems.length) * 100)
      : 0
  }

  return {
    user: userInfo,
    stats,
    items: allItems
  }
}
