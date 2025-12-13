import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    validateData,
    sanitizeObject,
    isValidCuid,
    errorResponse,
    successResponse,
    getClientIP,
    checkRateLimit,
    type ValidationRule,
} from '@/lib/api-security'
import { logAudit } from '@/lib/audit'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'] as const

// =====================
// GET - Obtenir avís
// =====================
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notice-get-${ip}`, 60, 60000)
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

        const notice = await prisma.platformNotice.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { dismissals: true },
                },
            },
        })

        if (!notice) {
            return errorResponse('Avís no trobat', 404, 'NOT_FOUND')
        }

        return successResponse(notice)

    } catch (error) {
        console.error('Error obtenint avís:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PUT - Actualitzar avís
// =====================
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notice-put-${ip}`, 30, 60000)
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

        const existing = await prisma.platformNotice.findUnique({ where: { id } })
        if (!existing) {
            return errorResponse('Avís no trobat', 404, 'NOT_FOUND')
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
            { field: 'title', type: 'string', minLength: 3, maxLength: 200 },
            { field: 'message', type: 'string', minLength: 10, maxLength: 2000 },
            { field: 'ctaText', type: 'string', maxLength: 50 },
            { field: 'ctaUrl', type: 'string', maxLength: 500 },
            { field: 'icon', type: 'string', maxLength: 50 },
            { field: 'priority', type: 'number', min: 0, max: 100 },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        // Validar enums si es proporcionen
        if (body.type) {
            const validTypes = ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MAINTENANCE', 'ANNOUNCEMENT']
            if (!validTypes.includes(body.type)) {
                return errorResponse('Tipus d\'avís invàlid', 400, 'INVALID_TYPE')
            }
        }

        if (body.position) {
            const validPositions = ['TOP_BANNER', 'BOTTOM_BANNER', 'MODAL', 'TOAST']
            if (!validPositions.includes(body.position)) {
                return errorResponse('Posició invàlida', 400, 'INVALID_POSITION')
            }
        }

        if (body.audience) {
            const validAudiences = ['ALL', 'USERS', 'COMPANIES', 'ADMINS', 'GESTORS']
            if (!validAudiences.includes(body.audience)) {
                return errorResponse('Audiència invàlida', 400, 'INVALID_AUDIENCE')
            }
        }

        // Actualitzar
        const notice = await prisma.platformNotice.update({
            where: { id },
            data: {
                title: body.title?.trim() || existing.title,
                message: body.message?.trim() || existing.message,
                type: body.type || existing.type,
                position: body.position || existing.position,
                audience: body.audience || existing.audience,
                ctaText: body.ctaText !== undefined ? body.ctaText?.trim() || null : existing.ctaText,
                ctaUrl: body.ctaUrl !== undefined ? body.ctaUrl?.trim() || null : existing.ctaUrl,
                icon: body.icon !== undefined ? body.icon || null : existing.icon,
                startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
                endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : existing.endDate,
                dismissible: body.dismissible !== undefined ? body.dismissible : existing.dismissible,
                persistent: body.persistent !== undefined ? body.persistent : existing.persistent,
                priority: body.priority !== undefined ? body.priority : existing.priority,
                isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        // Registrar log
        await logAudit({
            action: 'UPDATE',
            category: 'SYSTEM',
            entity: 'PlatformNotice',
            entityId: notice.id,
            entityName: notice.title,
            userId: auth.user?.id,
            userEmail: auth.user?.email,
            userRole: auth.user?.role,
            changes: { before: existing, after: notice },
            ipAddress: ip,
        })

        return successResponse(notice)

    } catch (error) {
        console.error('Error actualitzant avís:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PATCH - Toggle actiu
// =====================
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notice-patch-${ip}`, 30, 60000)
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

        const existing = await prisma.platformNotice.findUnique({ where: { id } })
        if (!existing) {
            return errorResponse('Avís no trobat', 404, 'NOT_FOUND')
        }

        let body: any
        try {
            body = await req.json()
        } catch (e) {
            return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
        }

        const { isActive } = body

        const notice = await prisma.platformNotice.update({
            where: { id },
            data: { isActive: isActive !== undefined ? isActive : !existing.isActive },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        // Registrar log
        await logAudit({
            action: notice.isActive ? 'ACTIVATE' : 'DEACTIVATE',
            category: 'SYSTEM',
            entity: 'PlatformNotice',
            entityId: notice.id,
            entityName: notice.title,
            userId: auth.user?.id,
            userEmail: auth.user?.email,
            userRole: auth.user?.role,
            ipAddress: ip,
        })

        return successResponse(notice)

    } catch (error) {
        console.error('Error canviant estat:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// DELETE - Eliminar avís
// =====================
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notice-delete-${ip}`, 10, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, ['SUPER_ADMIN', 'ADMIN'])
        if (!auth.success) {
            return auth.error!
        }

        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        const notice = await prisma.platformNotice.findUnique({ where: { id } })
        if (!notice) {
            return errorResponse('Avís no trobat', 404, 'NOT_FOUND')
        }

        await prisma.platformNotice.delete({ where: { id } })

        // Registrar log
        await logAudit({
            action: 'DELETE',
            category: 'SYSTEM',
            entity: 'PlatformNotice',
            entityId: id,
            entityName: notice.title,
            userId: auth.user?.id,
            userEmail: auth.user?.email,
            userRole: auth.user?.role,
            ipAddress: ip,
        })

        return successResponse({ success: true, message: 'Avís eliminat' })

    } catch (error) {
        console.error('Error eliminant avís:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
