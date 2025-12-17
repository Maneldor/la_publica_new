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

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO']
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

export async function createAIConfiguration(data: {
  useCase: string
  name: string
  description?: string
  icon?: string
  color?: string
  providerId: string
  modelId: string
  temperature?: number
  maxTokens?: number
  maxRequestsPerDay?: number | null
  maxTokensPerDay?: number | null
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    const config = await prismaClient.aIConfiguration.create({
      data: {
        useCase: data.useCase as any,
        name: data.name,
        description: data.description || null,
        icon: data.icon || 'Sparkles',
        color: data.color || 'purple',
        providerId: data.providerId,
        modelId: data.modelId,
        temperature: data.temperature || 0.7,
        maxTokens: data.maxTokens || 2000,
        maxRequestsPerDay: data.maxRequestsPerDay || null,
        maxTokensPerDay: data.maxTokensPerDay || null,
        isActive: true,
        updatedBy: access.userId
      },
      include: {
        provider: true,
        model: true
      }
    })

    revalidatePath('/gestio/admin/configuracio-ia')
    return { success: true, data: config }
  } catch (error) {
    console.error('Error creant configuració:', error)
    return { success: false, error: 'Error creant configuració' }
  }
}

export async function deleteAIConfiguration(configId: string): Promise<{ success: boolean; error?: string }> {
  const access = await checkAdminAccess()
  if (!access.authorized) {
    return { success: false, error: access.error }
  }

  try {
    // No permetre eliminar LEADS o CONTENT (són els casos d'ús principals)
    const config = await prismaClient.aIConfiguration.findUnique({
      where: { id: configId }
    })

    if (config && (config.useCase === 'LEADS' || config.useCase === 'CONTENT')) {
      return { success: false, error: 'No es pot eliminar una configuració principal' }
    }

    await prismaClient.aIConfiguration.delete({
      where: { id: configId }
    })

    revalidatePath('/gestio/admin/configuracio-ia')
    return { success: true }
  } catch (error) {
    console.error('Error eliminant configuració:', error)
    return { success: false, error: 'Error eliminant configuració' }
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

// ============================================
// SEED PROVEÏDORS I QUOTES
// ============================================

export async function seedAIProvidersAndQuotas(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { success: false, error: 'No autenticat' }
    }

    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO']
    if (!adminRoles.includes(session.user.role as string)) {
      return { success: false, error: 'No autoritzat' }
    }

    // =====================
    // 1. PROVEÏDORS
    // =====================
    const providers = [
      {
        type: 'ANTHROPIC' as const,
        name: 'Anthropic (Claude)',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 8192,
        maxTokensPerDay: 1000000,
        maxTokensPerMonth: 10000000,
        models: [
          {
            modelId: 'claude-sonnet-4-20250514',
            displayName: 'Claude Sonnet 4',
            description: 'Model avançat equilibrat',
            isActive: true,
            maxContextTokens: 200000,
            maxOutputTokens: 8192,
            supportsVision: true,
            supportsTools: true,
            inputCostPer1M: 3.0,
            outputCostPer1M: 15.0
          },
          {
            modelId: 'claude-3-5-haiku-20241022',
            displayName: 'Claude 3.5 Haiku',
            description: 'Model ràpid i econòmic',
            isActive: true,
            maxContextTokens: 200000,
            maxOutputTokens: 8192,
            supportsVision: true,
            supportsTools: true,
            inputCostPer1M: 0.8,
            outputCostPer1M: 4.0
          }
        ]
      },
      {
        type: 'OPENAI' as const,
        name: 'OpenAI (GPT)',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 4096,
        maxTokensPerDay: 1000000,
        maxTokensPerMonth: 10000000,
        models: [
          {
            modelId: 'gpt-4o',
            displayName: 'GPT-4o',
            description: 'Model multimodal avançat',
            isActive: true,
            maxContextTokens: 128000,
            maxOutputTokens: 4096,
            supportsVision: true,
            supportsTools: true,
            inputCostPer1M: 5.0,
            outputCostPer1M: 15.0
          },
          {
            modelId: 'gpt-4o-mini',
            displayName: 'GPT-4o Mini',
            description: 'Model econòmic i ràpid',
            isActive: true,
            maxContextTokens: 128000,
            maxOutputTokens: 16384,
            supportsVision: true,
            supportsTools: true,
            inputCostPer1M: 0.15,
            outputCostPer1M: 0.6
          }
        ]
      },
      {
        type: 'GEMINI' as const,
        name: 'Google (Gemini)',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 8192,
        maxTokensPerDay: 1000000,
        maxTokensPerMonth: 10000000,
        models: [
          {
            modelId: 'gemini-1.5-pro',
            displayName: 'Gemini 1.5 Pro',
            description: 'Model amb context ultra llarg',
            isActive: true,
            maxContextTokens: 1000000,
            maxOutputTokens: 8192,
            supportsVision: true,
            supportsTools: true,
            inputCostPer1M: 3.5,
            outputCostPer1M: 10.5
          },
          {
            modelId: 'gemini-1.5-flash',
            displayName: 'Gemini 1.5 Flash',
            description: 'Model molt ràpid i econòmic',
            isActive: true,
            maxContextTokens: 1000000,
            maxOutputTokens: 8192,
            supportsVision: true,
            supportsTools: true,
            inputCostPer1M: 0.075,
            outputCostPer1M: 0.3
          }
        ]
      },
      {
        type: 'DEEPSEEK' as const,
        name: 'DeepSeek',
        isActive: true,
        useEnvKey: true,
        maxTokensPerRequest: 8192,
        maxTokensPerDay: 2000000,
        maxTokensPerMonth: 20000000,
        models: [
          {
            modelId: 'deepseek-chat',
            displayName: 'DeepSeek Chat',
            description: 'Model general ultra econòmic',
            isActive: true,
            maxContextTokens: 64000,
            maxOutputTokens: 8192,
            supportsVision: false,
            supportsTools: true,
            inputCostPer1M: 0.14,
            outputCostPer1M: 0.28
          },
          {
            modelId: 'deepseek-reasoner',
            displayName: 'DeepSeek Reasoner',
            description: 'Model de raonament avançat',
            isActive: true,
            maxContextTokens: 64000,
            maxOutputTokens: 8192,
            supportsVision: false,
            supportsTools: true,
            inputCostPer1M: 0.55,
            outputCostPer1M: 2.19
          }
        ]
      }
    ]

    let createdProviders = 0
    let createdModels = 0

    for (const providerData of providers) {
      const { models, ...providerInfo } = providerData

      try {
        const provider = await prismaClient.aIProvider.upsert({
          where: { type: providerInfo.type },
          update: {
            name: providerInfo.name,
            isActive: providerInfo.isActive,
            maxTokensPerRequest: providerInfo.maxTokensPerRequest,
            maxTokensPerDay: providerInfo.maxTokensPerDay,
            maxTokensPerMonth: providerInfo.maxTokensPerMonth
          },
          create: providerInfo
        })
        createdProviders++

        for (const modelData of models) {
          try {
            await prismaClient.aIModel.upsert({
              where: {
                providerId_modelId: {
                  providerId: provider.id,
                  modelId: modelData.modelId
                }
              },
              update: modelData,
              create: {
                ...modelData,
                providerId: provider.id
              }
            })
            createdModels++
          } catch (modelError) {
            console.warn(`No s'ha pogut crear model ${modelData.modelId}:`, modelError)
          }
        }
      } catch (providerError) {
        console.warn(`No s'ha pogut crear proveïdor ${providerInfo.type}:`, providerError)
        // Continuar amb els altres proveïdors
      }
    }

    // =====================
    // 2. CONFIGURACIONS CASOS D'ÚS
    // =====================
    const anthropicProvider = await prismaClient.aIProvider.findUnique({
      where: { type: 'ANTHROPIC' },
      include: { models: true }
    })

    if (anthropicProvider && anthropicProvider.models.length > 0) {
      const sonnetModel = anthropicProvider.models.find(m => m.modelId.includes('sonnet')) || anthropicProvider.models[0]

      await prismaClient.aIConfiguration.upsert({
        where: { useCase: 'LEADS' },
        update: { providerId: anthropicProvider.id, modelId: sonnetModel.id },
        create: {
          useCase: 'LEADS',
          name: 'Generació de Leads',
          description: 'Cerca i qualificació automàtica de leads potencials',
          isActive: true,
          providerId: anthropicProvider.id,
          modelId: sonnetModel.id,
          temperature: 0.7,
          maxTokens: 4096,
          maxRequestsPerDay: 500,
          maxTokensPerDay: 1000000
        }
      })

      await prismaClient.aIConfiguration.upsert({
        where: { useCase: 'CONTENT' },
        update: { providerId: anthropicProvider.id, modelId: sonnetModel.id },
        create: {
          useCase: 'CONTENT',
          name: 'Generació de Contingut',
          description: 'Creació de contingut de màrqueting i comunicació',
          isActive: true,
          providerId: anthropicProvider.id,
          modelId: sonnetModel.id,
          temperature: 0.8,
          maxTokens: 8192,
          maxRequestsPerDay: 200,
          maxTokensPerDay: 500000
        }
      })
    }

    // =====================
    // 3. QUOTES PER ROL
    // =====================
    const allModels = ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022', 'gpt-4o', 'gpt-4o-mini', 'gemini-1.5-pro', 'gemini-1.5-flash', 'deepseek-chat', 'deepseek-reasoner']
    const economicModels = ['claude-3-5-haiku-20241022', 'gpt-4o-mini', 'gemini-1.5-flash', 'deepseek-chat']
    const allProviders = ['ANTHROPIC', 'OPENAI', 'GEMINI', 'DEEPSEEK']

    const roleQuotas = [
      {
        role: 'SUPER_ADMIN' as const,
        allowedProviders: allProviders,
        allowedModels: allModels,
        defaultProvider: 'ANTHROPIC' as const,
        maxLeadsPerDay: null,
        maxLeadsPerMonth: null,
        maxTokensPerDay: null,
        maxTokensPerMonth: null,
        creditsPerMonth: 9999,
        canUseAdvancedModels: true,
        canUseVision: true,
        canUseTools: true,
        priorityLevel: 2,
        maxCostPerDay: null,
        maxCostPerMonth: null
      },
      {
        role: 'ADMIN' as const,
        allowedProviders: allProviders,
        allowedModels: allModels,
        defaultProvider: 'ANTHROPIC' as const,
        maxLeadsPerDay: 100,
        maxLeadsPerMonth: 2000,
        maxTokensPerDay: 500000,
        maxTokensPerMonth: 10000000,
        creditsPerMonth: 500,
        canUseAdvancedModels: true,
        canUseVision: true,
        canUseTools: true,
        priorityLevel: 2,
        maxCostPerDay: 50.0,
        maxCostPerMonth: 500.0
      },
      {
        role: 'ADMIN_GESTIO' as const,
        allowedProviders: allProviders,
        allowedModels: allModels,
        defaultProvider: 'DEEPSEEK' as const,
        maxLeadsPerDay: 50,
        maxLeadsPerMonth: 1000,
        maxTokensPerDay: 250000,
        maxTokensPerMonth: 5000000,
        creditsPerMonth: 200,
        canUseAdvancedModels: true,
        canUseVision: true,
        canUseTools: true,
        priorityLevel: 1,
        maxCostPerDay: 25.0,
        maxCostPerMonth: 250.0
      },
      {
        role: 'CRM_COMERCIAL' as const,
        allowedProviders: ['DEEPSEEK', 'GEMINI'],
        allowedModels: economicModels,
        defaultProvider: 'DEEPSEEK' as const,
        maxLeadsPerDay: 30,
        maxLeadsPerMonth: 500,
        maxTokensPerDay: 100000,
        maxTokensPerMonth: 2000000,
        creditsPerMonth: 100,
        canUseAdvancedModels: false,
        canUseVision: false,
        canUseTools: true,
        priorityLevel: 0,
        maxCostPerDay: 10.0,
        maxCostPerMonth: 100.0
      },
      {
        role: 'CRM_CONTINGUT' as const,
        allowedProviders: ['DEEPSEEK', 'ANTHROPIC'],
        allowedModels: [...economicModels, 'claude-sonnet-4-20250514'],
        defaultProvider: 'DEEPSEEK' as const,
        maxLeadsPerDay: 10,
        maxLeadsPerMonth: 200,
        maxTokensPerDay: 150000,
        maxTokensPerMonth: 3000000,
        creditsPerMonth: 150,
        canUseAdvancedModels: true,
        canUseVision: false,
        canUseTools: true,
        priorityLevel: 0,
        maxCostPerDay: 15.0,
        maxCostPerMonth: 150.0
      },
      {
        role: 'GESTOR_ESTANDARD' as const,
        allowedProviders: ['DEEPSEEK'],
        allowedModels: ['deepseek-chat'],
        defaultProvider: 'DEEPSEEK' as const,
        maxLeadsPerDay: 10,
        maxLeadsPerMonth: 100,
        maxTokensPerDay: 50000,
        maxTokensPerMonth: 500000,
        creditsPerMonth: 50,
        canUseAdvancedModels: false,
        canUseVision: false,
        canUseTools: false,
        priorityLevel: 0,
        maxCostPerDay: 5.0,
        maxCostPerMonth: 25.0
      },
      {
        role: 'GESTOR_ESTRATEGIC' as const,
        allowedProviders: ['DEEPSEEK', 'GEMINI'],
        allowedModels: economicModels,
        defaultProvider: 'DEEPSEEK' as const,
        maxLeadsPerDay: 20,
        maxLeadsPerMonth: 300,
        maxTokensPerDay: 100000,
        maxTokensPerMonth: 1500000,
        creditsPerMonth: 100,
        canUseAdvancedModels: false,
        canUseVision: false,
        canUseTools: true,
        priorityLevel: 0,
        maxCostPerDay: 10.0,
        maxCostPerMonth: 75.0
      },
      {
        role: 'GESTOR_ENTERPRISE' as const,
        allowedProviders: ['DEEPSEEK', 'ANTHROPIC', 'GEMINI'],
        allowedModels: [...economicModels, 'claude-sonnet-4-20250514'],
        defaultProvider: 'DEEPSEEK' as const,
        maxLeadsPerDay: 50,
        maxLeadsPerMonth: 500,
        maxTokensPerDay: 200000,
        maxTokensPerMonth: 3000000,
        creditsPerMonth: 200,
        canUseAdvancedModels: true,
        canUseVision: false,
        canUseTools: true,
        priorityLevel: 1,
        maxCostPerDay: 20.0,
        maxCostPerMonth: 150.0
      }
    ]

    let createdQuotas = 0

    // Verificar que el model AIRoleQuota existeix
    if (!prismaClient.aIRoleQuota) {
      console.warn('Model AIRoleQuota no disponible. Reinicia el servidor després de npx prisma generate.')
    } else {
      for (const quota of roleQuotas) {
        try {
          await prismaClient.aIRoleQuota.upsert({
            where: { role: quota.role },
            update: {
              allowedProviders: quota.allowedProviders,
              allowedModels: quota.allowedModels,
              defaultProvider: quota.defaultProvider,
              maxLeadsPerDay: quota.maxLeadsPerDay,
              maxLeadsPerMonth: quota.maxLeadsPerMonth,
              maxTokensPerDay: quota.maxTokensPerDay,
              maxTokensPerMonth: quota.maxTokensPerMonth,
              creditsPerMonth: quota.creditsPerMonth,
              canUseAdvancedModels: quota.canUseAdvancedModels,
              canUseVision: quota.canUseVision,
              canUseTools: quota.canUseTools,
              priorityLevel: quota.priorityLevel,
              maxCostPerDay: quota.maxCostPerDay,
              maxCostPerMonth: quota.maxCostPerMonth
            },
            create: {
              ...quota,
              isActive: true,
              creditsUsed: 0
            }
          })
          createdQuotas++
        } catch (quotaError) {
          console.warn(`No s'ha pogut crear quota per ${quota.role}:`, quotaError)
        }
      }
    }

    revalidatePath('/gestio/admin/configuracio-ia')

    return {
      success: true,
      message: `✅ Creat: ${createdProviders} proveïdors, ${createdModels} models, ${createdQuotas} quotes per rol`
    }
  } catch (error) {
    console.error('Error seeding AI config:', error)
    return { success: false, error: 'Error creant configuració d\'IA: ' + (error as Error).message }
  }
}

// ============================================
// OBTENIR MODELS PERMESOS PER L'USUARI
// ============================================

export interface UserAIConfig {
  allowedModels: {
    id: string
    modelId: string
    displayName: string
    description: string | null
    provider: {
      type: string
      name: string
    }
    inputCostPer1M: number | null
    outputCostPer1M: number | null
  }[]
  quota: {
    maxLeadsPerDay: number | null
    maxLeadsPerMonth: number | null
    creditsPerMonth: number
    creditsUsed: number
    canUseAdvancedModels: boolean
  } | null
  defaultModelId: string | null
}

export async function getUserAIConfig(userId: string): Promise<{ success: boolean; data?: UserAIConfig; error?: string }> {
  try {
    // Obtenir usuari i rol
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return { success: false, error: 'Usuari no trobat' }
    }

    // Obtenir quota del rol
    const roleQuota = await prismaClient.aIRoleQuota.findUnique({
      where: { role: user.role }
    })

    // Si no té quota, usar configuració per defecte
    const allowedModelIds = roleQuota?.allowedModels as string[] || []
    const allowedProviderTypes = roleQuota?.allowedProviders as string[] || []

    // Obtenir tots els models actius
    const allModels = await prismaClient.aIModel.findMany({
      where: { isActive: true },
      include: {
        provider: {
          select: {
            id: true,
            type: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { provider: { type: 'asc' } },
        { displayName: 'asc' }
      ]
    })

    // Filtrar models segons permisos
    let filteredModels = allModels.filter(model => {
      // Verificar que el proveïdor està actiu
      if (!model.provider.isActive) return false

      // Si no hi ha restriccions, permetre tot
      if (allowedModelIds.length === 0 && allowedProviderTypes.length === 0) {
        return true
      }

      // Verificar si el model està a la llista permesa
      const modelAllowed = allowedModelIds.length === 0 || allowedModelIds.includes(model.modelId)
      const providerAllowed = allowedProviderTypes.length === 0 || allowedProviderTypes.includes(model.provider.type)

      return modelAllowed && providerAllowed
    })

    // Si canUseAdvancedModels és false, filtrar models cars
    if (roleQuota && !roleQuota.canUseAdvancedModels) {
      const advancedModels = ['claude-sonnet-4-20250514', 'gpt-4o', 'gemini-1.5-pro', 'deepseek-reasoner']
      filteredModels = filteredModels.filter(m => !advancedModels.includes(m.modelId))
    }

    const formattedModels = filteredModels.map(model => ({
      id: model.id,
      modelId: model.modelId,
      displayName: model.displayName,
      description: model.description,
      provider: {
        type: model.provider.type,
        name: model.provider.name
      },
      inputCostPer1M: model.inputCostPer1M,
      outputCostPer1M: model.outputCostPer1M
    }))

    return {
      success: true,
      data: {
        allowedModels: formattedModels,
        quota: roleQuota ? {
          maxLeadsPerDay: roleQuota.maxLeadsPerDay,
          maxLeadsPerMonth: roleQuota.maxLeadsPerMonth,
          creditsPerMonth: roleQuota.creditsPerMonth,
          creditsUsed: roleQuota.creditsUsed,
          canUseAdvancedModels: roleQuota.canUseAdvancedModels
        } : null,
        defaultModelId: roleQuota?.defaultModelId || formattedModels[0]?.modelId || null
      }
    }
  } catch (error) {
    console.error('Error getting user AI config:', error)
    return { success: false, error: 'Error obtenint configuració d\'IA' }
  }
}

// ============================================
// OBTENIR CONFIGURACIÓ DE LEADS
// ============================================

export interface LeadsAIConfig {
  modelId: string
  modelDisplayName: string
  providerName: string
  providerType: string
  temperature: number
  maxTokens: number
}

export async function getLeadsAIConfig(): Promise<{ success: boolean; data?: LeadsAIConfig; error?: string }> {
  try {
    // Obtenir configuració per al cas d'ús LEADS
    const config = await prismaClient.aIConfiguration.findUnique({
      where: { useCase: 'LEADS' },
      include: {
        model: {
          select: {
            modelId: true,
            displayName: true
          }
        },
        provider: {
          select: {
            name: true,
            type: true
          }
        }
      }
    })

    if (!config || !config.isActive) {
      return { success: false, error: 'No hi ha configuració de LEADS activa' }
    }

    return {
      success: true,
      data: {
        modelId: config.model.modelId,
        modelDisplayName: config.model.displayName,
        providerName: config.provider.name,
        providerType: config.provider.type,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      }
    }
  } catch (error) {
    console.error('Error getting leads AI config:', error)
    return { success: false, error: 'Error obtenint configuració de LEADS' }
  }
}