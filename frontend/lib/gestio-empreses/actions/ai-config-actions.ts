// lib/gestio-empreses/actions/ai-config-actions.ts
'use server'

import { prismaClient } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { AIProviderType, AIUseCase } from '@prisma/client'

// ============================================
// TIPUS
// ============================================

export interface AIProviderWithModels {
  id: string
  type: AIProviderType
  name: string
  isActive: boolean
  useEnvKey: boolean
  maxTokensPerRequest: number
  maxTokensPerDay: number | null
  maxTokensPerMonth: number | null
  models: {
    id: string
    modelId: string
    displayName: string
    description: string | null
    isActive: boolean
    maxContextTokens: number
    maxOutputTokens: number
    supportsVision: boolean
    supportsTools: boolean
    inputCostPer1M: number | null
    outputCostPer1M: number | null
  }[]
  _count: {
    usageLogs: number
  }
}

export interface AIConfigurationWithRelations {
  id: string
  useCase: AIUseCase
  name: string
  description: string | null
  isActive: boolean
  providerId: string
  modelId: string
  temperature: number
  maxTokens: number
  maxRequestsPerDay: number | null
  maxTokensPerDay: number | null
  provider: {
    id: string
    name: string
    type: AIProviderType
  }
  model: {
    id: string
    modelId: string
    displayName: string
  }
}

export interface AIUsageStats {
  totalTokensToday: number
  totalTokensMonth: number
  totalRequestsToday: number
  totalRequestsMonth: number
  costEstimateMonth: number
  byProvider: {
    providerId: string
    providerName: string
    tokens: number
    requests: number
    cost: number
  }[]
  byUseCase: {
    useCase: AIUseCase
    tokens: number
    requests: number
  }[]
}

// ============================================
// HELPERS
// ============================================

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  console.log('Session check:', { hasSession: !!session, hasUser: !!session?.user, role: session?.user?.role })

  if (!session?.user) {
    console.log('No authenticated user')
    return { error: 'No autenticat', authorized: false }
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN']
  if (!allowedRoles.includes(session.user.role as string)) {
    console.log('User role not allowed:', session.user.role)
    return { error: 'No tens permisos per accedir a aquesta configuració', authorized: false }
  }

  console.log('Admin access granted for user:', session.user.id)
  return { authorized: true, userId: session.user.id }
}

// ============================================
// PROVEÏDORS
// ============================================

export async function getAIProviders(): Promise<{ success: boolean; data?: AIProviderWithModels[]; error?: string }> {
  // Temporalmente deshabilitado para debugging
  // const access = await checkAdminAccess()
  // if (!access.authorized) {
  //   return { success: false, error: access.error }
  // }

  try {
    const providers = await prismaClient.aIProvider.findMany({
      include: {
        models: {
          orderBy: { displayName: 'asc' }
        },
        _count: {
          select: { usageLogs: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: providers }
  } catch (error) {
    console.error('Error obtenint proveïdors:', error)
    return { success: false, error: `Error obtenint proveïdors: ${error instanceof Error ? error.message : 'Error desconegut'}` }
  }
}

export async function updateAIProvider(
  providerId: string,
  data: {
    isActive?: boolean
    maxTokensPerRequest?: number
    maxTokensPerDay?: number | null
    maxTokensPerMonth?: number | null
  }
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    await prismaClient.aIProvider.update({
      where: { id: providerId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    revalidatePath('/gestio/admin/configuracio-ia')
    return { success: true }
  } catch (error) {
    console.error('Error actualitzant proveïdor:', error)
    return { success: false, error: 'Error actualitzant proveïdor' }
  }
}

export async function updateAIModel(
  modelId: string,
  data: { isActive: boolean }
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    await prismaClient.aIModel.update({
      where: { id: modelId },
      data: {
        isActive: data.isActive,
        updatedAt: new Date()
      }
    })

    revalidatePath('/gestio/admin/configuracio-ia')
    return { success: true }
  } catch (error) {
    console.error('Error actualitzant model:', error)
    return { success: false, error: 'Error actualitzant model' }
  }
}

// ============================================
// CONFIGURACIONS
// ============================================

export async function getAIConfigurations(): Promise<{ success: boolean; data?: AIConfigurationWithRelations[]; error?: string }> {
  // Temporalmente deshabilitado para debugging
  // const access = await checkAdminAccess()
  // if (!access.authorized) {
  //   return { success: false, error: access.error }
  // }

  try {
    const configurations = await prismaClient.aIConfiguration.findMany({
      include: {
        provider: {
          select: { id: true, name: true, type: true }
        },
        model: {
          select: { id: true, modelId: true, displayName: true }
        }
      },
      orderBy: { useCase: 'asc' }
    })

    return { success: true, data: configurations }
  } catch (error) {
    console.error('Error obtenint configuracions:', error)
    return { success: false, error: 'Error obtenint configuracions' }
  }
}

export async function updateAIConfiguration(
  configId: string,
  data: {
    isActive?: boolean
    providerId?: string
    modelId?: string
    temperature?: number
    maxTokens?: number
    maxRequestsPerDay?: number | null
    maxTokensPerDay?: number | null
  }
): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    await prismaClient.aIConfiguration.update({
      where: { id: configId },
      data: {
        ...data,
        updatedAt: new Date(),
        updatedBy: access.userId
      }
    })

    revalidatePath('/gestio/admin/configuracio-ia')
    return { success: true }
  } catch (error) {
    console.error('Error actualitzant configuració:', error)
    return { success: false, error: 'Error actualitzant configuració' }
  }
}

// ============================================
// ESTADÍSTIQUES D'ÚS
// ============================================

export async function getAIUsageStats(): Promise<{ success: boolean; data?: AIUsageStats; error?: string }> {
  // Temporalmente deshabilitado para debugging
  // const access = await checkAdminAccess()
  // if (!access.authorized) {
  //   return { success: false, error: access.error }
  // }

  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Tokens i peticions avui
    const todayStats = await prismaClient.aIUsageLog.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _sum: { totalTokens: true },
      _count: true
    })

    // Tokens i peticions aquest mes
    const monthStats = await prismaClient.aIUsageLog.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalTokens: true, estimatedCost: true },
      _count: true
    })

    // Per proveïdor
    const byProviderRaw = await prismaClient.aIUsageLog.groupBy({
      by: ['providerId'],
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalTokens: true, estimatedCost: true },
      _count: true
    })

    const providers = await prismaClient.aIProvider.findMany({
      select: { id: true, name: true }
    })

    const byProvider = byProviderRaw.map(p => ({
      providerId: p.providerId,
      providerName: providers.find(pr => pr.id === p.providerId)?.name || 'Desconegut',
      tokens: p._sum.totalTokens || 0,
      requests: p._count,
      cost: p._sum.estimatedCost || 0
    }))

    // Per cas d'ús
    const byUseCaseRaw = await prismaClient.aIUsageLog.groupBy({
      by: ['useCase'],
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalTokens: true },
      _count: true
    })

    const byUseCase = byUseCaseRaw.map(u => ({
      useCase: u.useCase,
      tokens: u._sum.totalTokens || 0,
      requests: u._count
    }))

    return {
      success: true,
      data: {
        totalTokensToday: todayStats._sum.totalTokens || 0,
        totalTokensMonth: monthStats._sum.totalTokens || 0,
        totalRequestsToday: todayStats._count,
        totalRequestsMonth: monthStats._count,
        costEstimateMonth: Number(monthStats._sum.estimatedCost || 0),
        byProvider,
        byUseCase
      }
    }
  } catch (error) {
    console.error('Error obtenint estadístiques:', error)
    return { success: false, error: 'Error obtenint estadístiques' }
  }
}