// lib/gestio-empreses/empreses-list-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export interface EmpresaListItem {
  id: string
  name: string
  cif: string | null
  email: string
  phone: string | null
  isActive: boolean
  status: string
  createdAt: string
  publishedAt: string | null
  sector: string | null
  accountManager: { id: string; name: string } | null
  planName: string | null
  classification: 'per_assignar' | 'en_gestio' | 'publicada' | 'renovada' | 'cancellada'
}

export interface EmpresesListData {
  stats: {
    total: number
    perAssignar: number
    enGestio: number
    publicades: number
    renovades: number
    cancellades: number
  }
  empreses: EmpresaListItem[]
}

export async function getEmpresesList(
  userId: string,
  role: string
): Promise<EmpresesListData> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autoritzat')

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // Filtro base según rol
  const whereBase: any = {}

  if (role.includes('GESTOR') && !role.includes('ADMIN')) {
    // Gestores solo ven sus empresas asignadas
    whereBase.accountManagerId = userId
  } else if (role.includes('CRM')) {
    // CRM ve empresas de sus gestores subordinados + las suyas + las no asignadas
    const gestors = await prismaClient.user.findMany({
      where: { supervisorId: userId },
      select: { id: true }
    })
    const gestorIds = gestors.map(g => g.id)
    whereBase.OR = [
      { accountManagerId: userId },
      { accountManagerId: { in: gestorIds } },
      { accountManagerId: null } // Incluir empresas sin gestor asignado
    ]
  }
  // ADMIN, SUPER_ADMIN, ADMIN_GESTIO ven todas (sin filtro)

  // Obtener todas las empresas
  const empreses = await prismaClient.company.findMany({
    where: whereBase,
    include: {
      accountManager: { select: { id: true, name: true } },
      currentPlan: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Clasificar empresas según assignació i estat
  const classified: EmpresaListItem[] = empreses.map(emp => {
    let classification: 'per_assignar' | 'en_gestio' | 'publicada' | 'renovada' | 'cancellada' = 'per_assignar'

    // 1. Empresas canceladas/inactivas (prioritat màxima)
    if (!emp.isActive || emp.status === 'INACTIVE' || emp.status === 'SUSPENDED' || emp.status === 'REJECTED') {
      classification = 'cancellada'
    }
    // 2. Empresas publicades (status = PUBLISHED)
    else if (emp.status === 'PUBLISHED') {
      // Les publicades que tenen més d'1 any es consideren renovades
      if (emp.createdAt < oneYearAgo) {
        classification = 'renovada'
      } else {
        classification = 'publicada'
      }
    }
    // 3. Empresas en gestió (tenen gestor assignat, no publicades)
    else if (emp.accountManagerId) {
      classification = 'en_gestio'
    }
    // 4. Empresas per assignar (sense gestor, no publicades)
    else {
      classification = 'per_assignar'
    }

    return {
      id: emp.id,
      name: emp.name,
      cif: emp.cif,
      email: emp.email,
      phone: emp.phone,
      isActive: emp.isActive,
      status: emp.status,
      createdAt: emp.createdAt.toISOString(),
      publishedAt: emp.approvedAt?.toISOString() || null,
      sector: emp.sector,
      accountManager: emp.accountManager ? {
        id: emp.accountManager.id,
        name: emp.accountManager.name || 'Sense nom'
      } : null,
      planName: emp.currentPlan?.name || null,
      classification,
    }
  })

  // Calcular stats
  const stats = {
    total: classified.length,
    perAssignar: classified.filter(e => e.classification === 'per_assignar').length,
    enGestio: classified.filter(e => e.classification === 'en_gestio').length,
    publicades: classified.filter(e => e.classification === 'publicada').length,
    renovades: classified.filter(e => e.classification === 'renovada').length,
    cancellades: classified.filter(e => e.classification === 'cancellada').length,
  }

  return { stats, empreses: classified }
}
