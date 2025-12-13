import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    validateData,
    sanitizeObject,
    isValidCuid,
    errorResponse,
    successResponse,
    logSecurityEvent,
    getClientIP,
    checkRateLimit,
    type ValidationRule,
} from '@/lib/api-security'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT'] as const

// =====================
// GET - Obtenir campanya
// =====================
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaign-get-${ip}`, 60, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { recipients: true, events: true },
                },
            },
        })

        if (!campaign) {
            return errorResponse('Campanya no trobada', 404, 'NOT_FOUND')
        }

        return successResponse(campaign)

    } catch (error) {
        console.error('Error obtenint campanya:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/gestio/campaigns/${params.id}`,
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PUT - Actualitzar campanya
// =====================
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaign-put-${ip}`, 30, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        // Verificar existència
        const existing = await prisma.campaign.findUnique({ where: { id } })
        if (!existing) {
            return errorResponse('Campanya no trobada', 404, 'NOT_FOUND')
        }

        // No permetre editar campanyes completades o cancel·lades
        if (['COMPLETED', 'CANCELLED'].includes(existing.status)) {
            return errorResponse('No es pot editar una campanya completada o cancel·lada', 400, 'INVALID_STATUS')
        }

        let body: any
        try {
            body = await req.json()
            body = sanitizeObject(body)
        } catch (e) {
            return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
        }

        // Validació
        const validationRules: ValidationRule[] = [
            { field: 'name', type: 'string', minLength: 3, maxLength: 200 },
            { field: 'description', type: 'string', maxLength: 1000 },
            { field: 'subject', type: 'string', maxLength: 200 },
            { field: 'content', type: 'string', maxLength: 50000 },
            { field: 'contentPlain', type: 'string', maxLength: 10000 },
            { field: 'ctaText', type: 'string', maxLength: 100 },
            { field: 'ctaUrl', type: 'string', maxLength: 500 },
            { field: 'imageUrl', type: 'string', maxLength: 500 },
            { field: 'priority', type: 'number', min: 0, max: 100 },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        // Actualitzar
        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                name: body.name?.trim() || existing.name,
                description: body.description !== undefined ? body.description?.trim() || null : existing.description,
                subject: body.subject !== undefined ? body.subject?.trim() || null : existing.subject,
                content: body.content !== undefined ? body.content : existing.content,
                contentPlain: body.contentPlain !== undefined ? body.contentPlain?.trim() || null : existing.contentPlain,
                ctaText: body.ctaText !== undefined ? body.ctaText?.trim() || null : existing.ctaText,
                ctaUrl: body.ctaUrl !== undefined ? body.ctaUrl?.trim() || null : existing.ctaUrl,
                imageUrl: body.imageUrl !== undefined ? body.imageUrl?.trim() || null : existing.imageUrl,
                segmentationType: body.segmentationType || existing.segmentationType,
                segmentationData: body.segmentationData !== undefined ? body.segmentationData : existing.segmentationData,
                scheduledAt: body.scheduledAt !== undefined ? (body.scheduledAt ? new Date(body.scheduledAt) : null) : existing.scheduledAt,
                startDate: body.startDate !== undefined ? (body.startDate ? new Date(body.startDate) : null) : existing.startDate,
                endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : existing.endDate,
                isRecurring: body.isRecurring !== undefined ? body.isRecurring : existing.isRecurring,
                recurringRule: body.recurringRule !== undefined ? body.recurringRule : existing.recurringRule,
                priority: body.priority !== undefined ? body.priority : existing.priority,
                settings: body.settings !== undefined ? body.settings : existing.settings,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        console.log(`[AUDIT] Campanya actualitzada: ${id} per usuari ${auth.user?.id}`)

        return successResponse(campaign)

    } catch (error) {
        console.error('Error actualitzant campanya:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/gestio/campaigns/${params.id}`,
            method: 'PUT',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PATCH - Canviar estat
// =====================
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaign-patch-${ip}`, 30, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        const existing = await prisma.campaign.findUnique({ where: { id } })
        if (!existing) {
            return errorResponse('Campanya no trobada', 404, 'NOT_FOUND')
        }

        let body: any
        try {
            body = await req.json()
        } catch (e) {
            return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
        }

        const { status } = body

        // Validar transicions d'estat
        const validTransitions: Record<string, string[]> = {
            DRAFT: ['SCHEDULED', 'ACTIVE', 'CANCELLED'],
            SCHEDULED: ['DRAFT', 'ACTIVE', 'CANCELLED'],
            ACTIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'],
            PAUSED: ['ACTIVE', 'CANCELLED'],
            COMPLETED: [],
            CANCELLED: [],
        }

        if (!status || !validTransitions[existing.status]?.includes(status)) {
            return errorResponse(`No es pot canviar de ${existing.status} a ${status}`, 400, 'INVALID_TRANSITION')
        }

        const campaign = await prisma.campaign.update({
            where: { id },
            data: { status },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        console.log(`[AUDIT] Campanya ${id} canviada a ${status} per usuari ${auth.user?.id}`)

        return successResponse(campaign)

    } catch (error) {
        console.error('Error canviant estat campanya:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/gestio/campaigns/${params.id}`,
            method: 'PATCH',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// DELETE - Eliminar campanya
// =====================
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaign-delete-${ip}`, 10, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Només SUPER_ADMIN i ADMIN poden eliminar
        const auth = await checkAuth(req, ['SUPER_ADMIN', 'ADMIN'])
        if (!auth.success) {
            return auth.error!
        }

        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: { _count: { select: { recipients: true } } },
        })

        if (!campaign) {
            return errorResponse('Campanya no trobada', 404, 'NOT_FOUND')
        }

        // No permetre eliminar campanyes actives o completades amb destinataris
        if (['ACTIVE', 'COMPLETED'].includes(campaign.status) && campaign._count.recipients > 0) {
            return errorResponse('No es pot eliminar una campanya activa o completada amb destinataris', 400, 'HAS_RECIPIENTS')
        }

        await prisma.campaign.delete({ where: { id } })

        console.log(`[AUDIT] Campanya eliminada: ${id} per usuari ${auth.user?.id}`)

        return successResponse({ success: true, message: 'Campanya eliminada' })

    } catch (error) {
        console.error('Error eliminant campanya:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/gestio/campaigns/${params.id}`,
            method: 'DELETE',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
