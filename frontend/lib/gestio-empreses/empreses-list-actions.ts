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
  sector: string | null
  accountManager: { id: string; name: string } | null
  planName: string | null
  classification: 'nova' | 'renovada' | 'cancellada'
}

export interface EmpresesListData {
  stats: {
    total: number
    noves: number
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
  let whereBase: any = {}

  if (role.includes('GESTOR')) {
    // Gestores solo ven sus empresas asignadas
    whereBase.accountManagerId = userId
  } else if (role.includes('CRM')) {
    // CRM ve empresas de sus gestores subordinados + las suyas
    const gestors = await prismaClient.user.findMany({
      where: { supervisorId: userId },
      select: { id: true }
    })
    const gestorIds = gestors.map(g => g.id)
    whereBase.OR = [
      { accountManagerId: userId },
      { accountManagerId: { in: gestorIds } }
    ]
  }
  // ADMIN, SUPER_ADMIN, ADMIN_GESTIO ven todas

  // Obtener todas las empresas
  const empreses = await prismaClient.company.findMany({
    where: whereBase,
    include: {
      accountManager: { select: { id: true, name: true } },
      currentPlan: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Clasificar empresas
  const classified: EmpresaListItem[] = empreses.map(emp => {
    let classification: 'nova' | 'renovada' | 'cancellada' = 'nova'

    // Empresas canceladas/inactivas
    if (!emp.isActive || emp.status === 'INACTIVE' || emp.status === 'SUSPENDED') {
      classification = 'cancellada'
    }
    // Empresas con más de 1 año (renovadas)
    else if (emp.createdAt < oneYearAgo) {
      classification = 'renovada'
    }
    // El resto son nuevas (menos de 1 año)

    return {
      id: emp.id,
      name: emp.name,
      cif: emp.cif,
      email: emp.email,
      phone: emp.phone,
      isActive: emp.isActive,
      status: emp.status,
      createdAt: emp.createdAt.toISOString(),
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
    noves: classified.filter(e => e.classification === 'nova').length,
    renovades: classified.filter(e => e.classification === 'renovada').length,
    cancellades: classified.filter(e => e.classification === 'cancellada').length,
  }

  return { stats, empreses: classified }
}
