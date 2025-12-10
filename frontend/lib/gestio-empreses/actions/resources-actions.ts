// actions/resources-actions.ts - Server Actions para gestión de recursos comerciales

'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  CreateResourceDTO,
  UpdateResourceDTO,
  ResourceFilterDTO,
  ResourceResponse,
  CommercialResource,
  ResourceStats,
  ExtractedResource,
  LeadData
} from '../types/resources'
import {
  generatePlaceholderConfig,
  processContentWithPlaceholders
} from '../utils/placeholder-utils'

const prisma = new PrismaClient()

// Validación de schemas con Zod
const createResourceSchema = z.object({
  slug: z.string().min(1, 'Slug requerido'),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  type: z.enum(['SPEECH', 'EMAIL_TEMPLATE', 'DOCUMENT', 'GUIDE', 'VIDEO', 'CHECKLIST']),
  phase: z.enum(['NEW', 'CONTACTED', 'NEGOTIATION', 'QUALIFIED', 'PENDING_CRM', 'CRM_APPROVED', 'PENDING_ADMIN', 'WON', 'LOST', 'GENERAL']),
  category: z.enum(['PROSPECTION', 'PRESENTATION', 'NEGOTIATION', 'CLOSING', 'FOLLOWUP', 'TRAINING', 'LEGAL', 'ADMINISTRATIVE']),
  content: z.any(),
  placeholders: z.array(z.any()).optional(),
  tags: z.array(z.string()),
  accessRoles: z.array(z.enum(['ADMIN', 'CRM_MANAGER', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE', 'GESTOR_ESTANDARD'])),
  version: z.string().optional()
})

// Crear nuevo recurso
export async function createResource(
  data: CreateResourceDTO,
  userId: string
): Promise<ResourceResponse<CommercialResource>> {
  try {
    // Validar datos de entrada
    const validatedData = createResourceSchema.parse(data)

    // Verificar que el slug no existe
    const existingResource = await prisma.commercialResource.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingResource) {
      return {
        success: false,
        error: 'Ya existe un recurso con este slug'
      }
    }

    // Crear el recurso
    const resource = await prisma.commercialResource.create({
      data: {
        slug: validatedData.slug,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type as any,
        phase: validatedData.phase as any,
        category: validatedData.category as any,
        content: validatedData.content,
        placeholders: validatedData.placeholders || [],
        tags: validatedData.tags,
        accessRoles: validatedData.accessRoles as any[],
        isActive: true,
        version: validatedData.version || '1.0',
        createdById: userId,
        updatedById: userId
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      }
    })

    revalidatePath('/gestio/eines')

    return {
      success: true,
      data: resource as CommercialResource,
      message: 'Recurso creado exitosamente'
    }

  } catch (error) {
    console.error('Error creating resource:', error)
    return {
      success: false,
      error: error instanceof z.ZodError
        ? `Datos inválidos: ${error.errors.map(e => e.message).join(', ')}`
        : 'Error al crear el recurso'
    }
  }
}

// Obtener todos los recursos con filtros
export async function getResources(
  filters?: ResourceFilterDTO,
  userId?: string,
  userRole?: string
): Promise<ResourceResponse<CommercialResource[]>> {
  try {
    console.log('DEBUG: getResources called with:', { filters, userId, userRole })
    const whereClause: any = { isActive: filters?.isActive ?? true }

    // Aplicar filtros
    if (filters?.type) {
      whereClause.type = filters.type
    }

    if (filters?.phase) {
      whereClause.phase = filters.phase
    }

    if (filters?.category) {
      whereClause.category = filters.category
    }

    if (filters?.tags && filters.tags.length > 0) {
      whereClause.tags = {
        hassome: filters.tags
      }
    }

    if (filters?.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hassome: [filters.search] } }
      ]
    }

    // Filtrar por roles de acceso si se proporciona el rol del usuario
    if (userRole && !['ADMIN', 'CRM_MANAGER'].includes(userRole)) {
      whereClause.accessRoles = {
        has: userRole
      }
    }

    const resources = await prisma.commercialResource.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { title: 'asc' }
      ]
    })

    console.log('DEBUG: getResources found:', resources.length, 'resources')
    console.log('DEBUG: Resources:', resources.map(r => ({ id: r.id, title: r.title, type: r.type })))

    return {
      success: true,
      data: resources as CommercialResource[]
    }

  } catch (error) {
    console.error('Error fetching resources:', error)
    return {
      success: false,
      error: 'Error al obtener los recursos'
    }
  }
}

// Obtener un recurso por ID
export async function getResourceById(
  id: string,
  userRole?: string
): Promise<ResourceResponse<CommercialResource>> {
  try {
    const resource = await prisma.commercialResource.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      }
    })

    if (!resource) {
      return {
        success: false,
        error: 'Recurso no encontrado'
      }
    }

    // Verificar permisos de acceso
    if (userRole && !['ADMIN', 'CRM_MANAGER'].includes(userRole)) {
      if (!resource.accessRoles.includes(userRole as any)) {
        return {
          success: false,
          error: 'No tienes permisos para acceder a este recurso'
        }
      }
    }

    return {
      success: true,
      data: resource as CommercialResource
    }

  } catch (error) {
    console.error('Error fetching resource:', error)
    return {
      success: false,
      error: 'Error al obtener el recurso'
    }
  }
}

// Obtener recurso por slug
export async function getResourceBySlug(
  slug: string,
  userRole?: string
): Promise<ResourceResponse<CommercialResource>> {
  try {
    const resource = await prisma.commercialResource.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      }
    })

    if (!resource) {
      return {
        success: false,
        error: 'Recurso no encontrado'
      }
    }

    // Verificar permisos de acceso
    if (userRole && !['ADMIN', 'CRM_MANAGER'].includes(userRole)) {
      if (!resource.accessRoles.includes(userRole as any)) {
        return {
          success: false,
          error: 'No tienes permisos para acceder a este recurso'
        }
      }
    }

    return {
      success: true,
      data: resource as CommercialResource
    }

  } catch (error) {
    console.error('Error fetching resource by slug:', error)
    return {
      success: false,
      error: 'Error al obtener el recurso'
    }
  }
}

// Actualizar recurso
export async function updateResource(
  data: UpdateResourceDTO,
  userId: string
): Promise<ResourceResponse<CommercialResource>> {
  try {
    const { id, ...updateData } = data

    // Verificar que el recurso existe
    const existingResource = await prisma.commercialResource.findUnique({
      where: { id }
    })

    if (!existingResource) {
      return {
        success: false,
        error: 'Recurso no encontrado'
      }
    }

    // Verificar slug único si se está actualizando
    if (updateData.slug && updateData.slug !== existingResource.slug) {
      const slugExists = await prisma.commercialResource.findUnique({
        where: { slug: updateData.slug }
      })

      if (slugExists) {
        return {
          success: false,
          error: 'Ya existe un recurso con este slug'
        }
      }
    }

    // Actualizar el recurso
    const updatedResource = await prisma.commercialResource.update({
      where: { id },
      data: {
        ...updateData,
        updatedById: userId,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      }
    })

    revalidatePath('/gestio/eines')

    return {
      success: true,
      data: updatedResource as CommercialResource,
      message: 'Recurso actualizado exitosamente'
    }

  } catch (error) {
    console.error('Error updating resource:', error)
    return {
      success: false,
      error: 'Error al actualizar el recurso'
    }
  }
}

// Eliminar recurso (soft delete)
export async function deleteResource(
  id: string,
  userId: string
): Promise<ResourceResponse<void>> {
  try {
    const resource = await prisma.commercialResource.findUnique({
      where: { id }
    })

    if (!resource) {
      return {
        success: false,
        error: 'Recurso no encontrado'
      }
    }

    // Soft delete - marcar como inactivo
    await prisma.commercialResource.update({
      where: { id },
      data: {
        isActive: false,
        updatedById: userId,
        updatedAt: new Date()
      }
    })

    revalidatePath('/gestio/eines')

    return {
      success: true,
      message: 'Recurso eliminado exitosamente'
    }

  } catch (error) {
    console.error('Error deleting resource:', error)
    return {
      success: false,
      error: 'Error al eliminar el recurso'
    }
  }
}

// Extraer contenido con placeholders para un lead específico
export async function extractResourceContent(
  resourceId: string,
  leadId: string,
  userId: string,
  userName?: string,
  customValues?: Record<string, any>
): Promise<ResourceResponse<ExtractedResource>> {
  try {
    // Obtener el recurso
    const resource = await prisma.commercialResource.findUnique({
      where: { id: resourceId },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      }
    })

    if (!resource) {
      return {
        success: false,
        error: 'Recurso no encontrado'
      }
    }

    // Obtener datos del lead
    const lead = await prisma.companyLead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: {
          select: { id: true, name: true }
        }
      }
    })

    if (!lead) {
      return {
        success: false,
        error: 'Lead no encontrado'
      }
    }

    // Convertir lead a formato requerido
    const leadData: LeadData = {
      id: lead.id,
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      estimatedRevenue: lead.estimatedRevenue,
      priority: lead.priority,
      status: lead.status,
      assignedTo: lead.assignedTo,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    }

    // Generar configuración de placeholders
    const placeholderConfig = generatePlaceholderConfig(
      leadData,
      userId,
      userName,
      customValues
    )

    // Procesar contenido según el tipo de recurso
    let contentToProcess = ''

    switch (resource.type) {
      case 'SPEECH':
        contentToProcess = (resource.content as any).script || ''
        break
      case 'EMAIL_TEMPLATE':
        const emailContent = resource.content as any
        contentToProcess = `${emailContent.subject}\n\n${emailContent.body}`
        break
      case 'DOCUMENT':
        contentToProcess = (resource.content as any).content || ''
        break
      case 'GUIDE':
        const guideContent = resource.content as any
        contentToProcess = guideContent.steps
          ?.map((step: any) => `${step.title}: ${step.description}`)
          .join('\n\n') || ''
        break
      case 'CHECKLIST':
        const checklistContent = resource.content as any
        contentToProcess = checklistContent.items
          ?.map((item: any) => `☐ ${item.label}: ${item.description}`)
          .join('\n') || ''
        break
      default:
        contentToProcess = JSON.stringify(resource.content)
    }

    // Procesar placeholders
    const preview = processContentWithPlaceholders(contentToProcess, placeholderConfig)

    // Registrar uso del recurso
    await prisma.resourceUsage.create({
      data: {
        resourceId: resource.id,
        leadId: lead.id,
        userId: userId,
        extractedContent: preview.processedContent,
        placeholderValues: {
          ...placeholderConfig.systemValues,
          ...placeholderConfig.companyValues,
          ...placeholderConfig.contactValues,
          ...placeholderConfig.customValues
        },
        usageContext: `Extraído desde pipeline - Fase: ${lead.status}`
      }
    })

    const extractedResource: ExtractedResource = {
      resource: resource as CommercialResource,
      extractedContent: preview.processedContent,
      placeholderValues: {
        ...placeholderConfig.systemValues,
        ...placeholderConfig.companyValues,
        ...placeholderConfig.contactValues,
        ...placeholderConfig.customValues
      }
    }

    return {
      success: true,
      data: extractedResource,
      message: 'Contenido extraído exitosamente'
    }

  } catch (error) {
    console.error('Error extracting resource content:', error)
    return {
      success: false,
      error: 'Error al extraer el contenido del recurso'
    }
  }
}

// Obtener estadísticas de uso de un recurso
export async function getResourceStats(
  resourceId: string
): Promise<ResourceResponse<ResourceStats>> {
  try {
    const resource = await prisma.commercialResource.findUnique({
      where: { id: resourceId }
    })

    if (!resource) {
      return {
        success: false,
        error: 'Recurso no encontrado'
      }
    }

    const usages = await prisma.resourceUsage.findMany({
      where: { resourceId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true }
        },
        lead: {
          select: { id: true, companyName: true }
        }
      }
    })

    const totalUsages = await prisma.resourceUsage.count({
      where: { resourceId }
    })

    const uniqueUsers = await prisma.resourceUsage.groupBy({
      by: ['userId'],
      where: { resourceId }
    })

    const stats: ResourceStats = {
      resourceId,
      totalUsages,
      uniqueUsers: uniqueUsers.length,
      recentUsages: usages as any[],
      popularPlaceholders: [] // TODO: Implementar análisis de placeholders más usados
    }

    return {
      success: true,
      data: stats
    }

  } catch (error) {
    console.error('Error fetching resource stats:', error)
    return {
      success: false,
      error: 'Error al obtener las estadísticas del recurso'
    }
  }
}

// Obtener recursos por fase del pipeline
export async function getResourcesByPhase(
  phase: string,
  userRole?: string
): Promise<ResourceResponse<CommercialResource[]>> {
  try {
    const whereClause: any = {
      isActive: true,
      OR: [
        { phase: phase },
        { phase: 'GENERAL' } // Incluir recursos generales
      ]
    }

    // Filtrar por roles de acceso
    if (userRole && !['ADMIN', 'CRM_MANAGER'].includes(userRole)) {
      whereClause.accessRoles = {
        has: userRole
      }
    }

    const resources = await prisma.commercialResource.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { type: 'asc' },
        { title: 'asc' }
      ]
    })

    return {
      success: true,
      data: resources as CommercialResource[]
    }

  } catch (error) {
    console.error('Error fetching resources by phase:', error)
    return {
      success: false,
      error: 'Error al obtener los recursos de la fase'
    }
  }
}

// Duplicar recurso
export async function duplicateResource(
  resourceId: string,
  userId: string,
  newSlug?: string,
  newTitle?: string
): Promise<ResourceResponse<CommercialResource>> {
  try {
    const originalResource = await prisma.commercialResource.findUnique({
      where: { id: resourceId }
    })

    if (!originalResource) {
      return {
        success: false,
        error: 'Recurso original no encontrado'
      }
    }

    const slug = newSlug || `${originalResource.slug}-copy-${Date.now()}`
    const title = newTitle || `${originalResource.title} (Copia)`

    // Verificar que el nuevo slug no existe
    const existingSlug = await prisma.commercialResource.findUnique({
      where: { slug }
    })

    if (existingSlug) {
      return {
        success: false,
        error: 'Ya existe un recurso con este slug'
      }
    }

    const duplicatedResource = await prisma.commercialResource.create({
      data: {
        slug,
        title,
        description: originalResource.description,
        type: originalResource.type,
        phase: originalResource.phase,
        category: originalResource.category,
        content: originalResource.content,
        placeholders: originalResource.placeholders,
        tags: originalResource.tags,
        accessRoles: originalResource.accessRoles,
        isActive: true,
        version: '1.0',
        createdById: userId,
        updatedById: userId
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        updatedBy: {
          select: { id: true, name: true }
        }
      }
    })

    revalidatePath('/gestio/eines')

    return {
      success: true,
      data: duplicatedResource as CommercialResource,
      message: 'Recurso duplicado exitosamente'
    }

  } catch (error) {
    console.error('Error duplicating resource:', error)
    return {
      success: false,
      error: 'Error al duplicar el recurso'
    }
  }
}