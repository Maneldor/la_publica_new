// lib/gestio-empreses/company-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getGestioSession } from './auth-helpers'

/**
 * Obtenir empreses gestionades
 */
export async function getManagedCompanies(
  gestorId: string | null,
  filters?: {
    status?: string
    planTier?: string
    search?: string
  }
) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const where: any = {}

  // Si és gestor normal, només les seves
  if (gestorId) {
    where.accountManagerId = gestorId
  }

  // Filtres
  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.planTier) {
    where.currentPlanTier = filters.planTier
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { cif: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const companies = await prismaClient.company.findMany({
    where,
    include: {
      accountManager: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: {
          teamMembers: true,
          offers: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return companies
}

/**
 * Obtenir detall d'una empresa
 */
export async function getCompanyDetail(companyId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const company = await prismaClient.company.findUnique({
    where: { id: companyId },
    include: {
      accountManager: {
        select: { id: true, name: true, email: true },
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          userType: true,
          isActive: true,
          createdAt: true,
        },
      },
      offers: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      },
      originalLead: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          convertedAt: true,
        },
      },
    },
  })

  return company
}

/**
 * Obtenir activitat recent d'una empresa
 */
export async function getCompanyActivity(companyId: string) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Com no tenim taula d'activitats d'empresa, simulem amb ofertes i membres
  const [recentOffers, recentMembers] = await Promise.all([
    prismaClient.offer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    }),
    prismaClient.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
  ])

  // Combinar i simular activitats
  const activities = [
    ...recentOffers.map(offer => ({
      id: `offer-${offer.id}`,
      type: 'OFFER_CREATED' as const,
      description: `Oferta creada: ${offer.title}`,
      createdAt: offer.createdAt,
      createdBy: offer.createdBy,
      metadata: { offerId: offer.id },
    })),
    ...recentMembers.map(member => ({
      id: `member-${member.id}`,
      type: 'MEMBER_ADDED' as const,
      description: `Nou membre: ${member.name}`,
      createdAt: member.createdAt,
      createdBy: { name: 'Sistema', email: 'system@lapublica.cat' },
      metadata: { userId: member.id },
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return activities.slice(0, 20)
}

/**
 * Afegir nota/activitat a una empresa
 */
export async function addCompanyNote(
  companyId: string,
  note: string
) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  // Com no tenim taula d'activitats, simulem guardant com a comentari intern
  // En una implementació real, crearies l'activitat a la taula corresponent

  revalidatePath(`/gestio/empreses/${companyId}`)

  return {
    id: `note-${Date.now()}`,
    type: 'NOTE',
    description: note,
    createdAt: new Date(),
    createdBy: { name: session.userName, email: session.userEmail },
  }
}

/**
 * Estadístiques d'empreses
 */
export async function getCompanyStats(gestorId: string | null) {
  const session = await getGestioSession()
  if (!session) {
    throw new Error('Usuario no autenticado')
  }

  const where = gestorId ? { accountManagerId: gestorId } : {}

  const [total, active, pending, byPlan] = await Promise.all([
    prismaClient.company.count({ where }),
    prismaClient.company.count({ where: { ...where, status: 'APPROVED' } }),
    prismaClient.company.count({ where: { ...where, status: 'PENDING' } }),
    prismaClient.company.groupBy({
      by: ['currentPlanTier'],
      where,
      _count: { id: true },
    }),
  ])

  return {
    total,
    active,
    pending,
    byPlan: byPlan.map((p) => ({
      tier: p.currentPlanTier || 'Sense pla',
      count: p._count.id,
    })),
  }
}