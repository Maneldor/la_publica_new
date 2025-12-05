// lib/gestio-empreses/admin-integration.ts
'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * Obtenir empreses pendents d'aprovació per Admin
 */
export async function getPendingAdminApproval() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const companies = await prismaClient.company.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      accountManager: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return companies
}

/**
 * Notificar a Admin que hi ha empreses pendents
 */
export async function notifyAdminPendingCompanies() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const pendingCount = await prismaClient.company.count({
    where: { status: 'PENDING' },
  })

  if (pendingCount > 0) {
    // Crear notificació per Admin
    const admins = await prismaClient.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    })

    for (const admin of admins) {
      // Verificar si ja existeix una notificació similar recent
      const existingNotification = await prismaClient.notification.findFirst({
        where: {
          userId: admin.id,
          type: 'COMPANY_PENDING',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimes 24h
          },
        },
      })

      if (!existingNotification) {
        await prismaClient.notification.create({
          data: {
            userId: admin.id,
            type: 'COMPANY_PENDING',
            title: `${pendingCount} empreses pendents d'aprovació`,
            message: `Hi ha ${pendingCount} empreses convertides des del CRM pendents de revisió i contractació.`,
            metadata: {
              count: pendingCount,
              url: '/admin/empreses?status=PENDING',
            },
            isRead: false,
          },
        })
      }
    }
  }

  return { notified: pendingCount }
}

/**
 * Marcar empresa com a enviada a Admin (des del CRM)
 */
export async function sendCompanyToAdmin(
  companyId: string,
  notes?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const company = await prismaClient.company.update({
    where: { id: companyId },
    data: {
      updatedAt: new Date(),
    },
  })

  // Crear audit log
  await prismaClient.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'COMPANY_SENT_TO_ADMIN',
      entityType: 'COMPANY',
      entityId: companyId,
      details: {
        message: `Empresa enviada a Admin per contractació${notes ? `: ${notes}` : ''}`,
        notes: notes,
      },
    },
  })

  // Notificar Admin
  await notifyAdminPendingCompanies()

  revalidatePath('/gestio/empreses')
  revalidatePath(`/gestio/empreses/${companyId}`)

  return company
}

/**
 * Obtenir resum per al gestor de les seves empreses en procés
 */
export async function getConversionSummary(gestorId: string | null = null) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const where = gestorId ? { accountManagerId: gestorId } : {}

  const [
    pendingAdmin,
    approvedThisMonth,
    rejectedThisMonth,
  ] = await Promise.all([
    // Pendents d'aprovació Admin
    prismaClient.company.count({
      where: { ...where, status: 'PENDING' },
    }),
    // Aprovades aquest mes (PUBLISHED = empresa amb perfil complet)
    prismaClient.company.count({
      where: {
        ...where,
        status: 'PUBLISHED',
        approvedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    // Rebutjades aquest mes
    prismaClient.company.count({
      where: {
        ...where,
        status: 'REJECTED',
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ])

  // Calcular temps mitjà de conversió (empreses publicades)
  const approvedCompanies = await prismaClient.company.findMany({
    where: {
      ...where,
      status: 'PUBLISHED',
      approvedAt: { not: null },
    },
    select: {
      createdAt: true,
      approvedAt: true,
    },
  })

  const avgConversionDays = approvedCompanies.length > 0
    ? Math.round(
        approvedCompanies.reduce((sum, c) => {
          const days = Math.floor(
            (new Date(c.approvedAt!).getTime() - new Date(c.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
          return sum + Math.max(0, days)
        }, 0) / approvedCompanies.length
      )
    : 0

  return {
    pendingAdmin,
    approvedThisMonth,
    rejectedThisMonth,
    avgConversionDays,
  }
}

/**
 * Obtenir històric de conversions
 */
export async function getConversionHistory(gestorId: string | null = null, limit = 10) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('No autoritzat')
  }

  const where = gestorId ? { accountManagerId: gestorId } : {}

  const companies = await prismaClient.company.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      approvedAt: true,
    },
  })

  return companies.map((c) => ({
    companyId: c.id,
    companyName: c.name,
    status: c.status,
    createdAt: c.createdAt,
    approvedAt: c.approvedAt,
    daysToApprove: c.approvedAt
      ? Math.floor(
          (new Date(c.approvedAt).getTime() - new Date(c.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      : null,
  }))
}