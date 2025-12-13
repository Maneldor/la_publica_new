import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    validateData,
    sanitizeString,
    sanitizeObject,
    errorResponse,
    successResponse,
    logSecurityEvent,
    getClientIP,
    checkRateLimit,
    type ValidationRule,
} from '@/lib/api-security'
import { logAudit } from '@/lib/audit'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'] as const

// =====================
// GET - Llistar avisos
// =====================
export async function GET(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notices-get-${ip}`, 60, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        const { searchParams } = new URL(req.url)
        const search = sanitizeString(searchParams.get('search') || '')
        const type = searchParams.get('type')
        const audience = searchParams.get('audience')
        const status = searchParams.get('status') // active, inactive, scheduled, expired
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

        // Construir filtre
        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (type && ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MAINTENANCE', 'ANNOUNCEMENT'].includes(type)) {
            where.type = type
        }

        if (audience && ['ALL', 'USERS', 'COMPANIES', 'ADMINS', 'GESTORS'].includes(audience)) {
            where.audience = audience
        }

        // Filtre per estat
        const now = new Date()
        if (status === 'active') {
            where.isActive = true
            where.startDate = { lte: now }
            where.OR = [
                { endDate: null },
                { endDate: { gte: now } },
            ]
        } else if (status === 'inactive') {
            where.isActive = false
        } else if (status === 'scheduled') {
            where.isActive = true
            where.startDate = { gt: now }
        } else if (status === 'expired') {
            where.endDate = { lt: now }
        }

        const total = await prisma.platformNotice.count({ where })

        const notices = await prisma.platformNotice.findMany({
            where,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { dismissals: true },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
        })

        return successResponse({
            notices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })

    } catch (error) {
        console.error('Error llistant avisos:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// POST - Crear avís
// =====================
export async function POST(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notices-post-${ip}`, 20, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
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
            { field: 'title', type: 'string', required: true, minLength: 3, maxLength: 200 },
            { field: 'message', type: 'string', required: true, minLength: 10, maxLength: 2000 },
            { field: 'type', type: 'string', required: true },
            { field: 'position', type: 'string' },
            { field: 'audience', type: 'string' },
            { field: 'ctaText', type: 'string', maxLength: 50 },
            { field: 'ctaUrl', type: 'string', maxLength: 500 },
            { field: 'icon', type: 'string', maxLength: 50 },
            { field: 'priority', type: 'number', min: 0, max: 100 },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        // Validar enums
        const validTypes = ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MAINTENANCE', 'ANNOUNCEMENT']
        if (!validTypes.includes(body.type)) {
            return errorResponse('Tipus d\'avís invàlid', 400, 'INVALID_TYPE')
        }

        const validPositions = ['TOP_BANNER', 'BOTTOM_BANNER', 'MODAL', 'TOAST']
        if (body.position && !validPositions.includes(body.position)) {
            return errorResponse('Posició invàlida', 400, 'INVALID_POSITION')
        }

        const validAudiences = ['ALL', 'USERS', 'COMPANIES', 'ADMINS', 'GESTORS']
        if (body.audience && !validAudiences.includes(body.audience)) {
            return errorResponse('Audiència invàlida', 400, 'INVALID_AUDIENCE')
        }

        // Crear avís
        const notice = await prisma.platformNotice.create({
            data: {
                title: body.title.trim(),
                message: body.message.trim(),
                type: body.type,
                position: body.position || 'TOP_BANNER',
                audience: body.audience || 'ALL',
                ctaText: body.ctaText?.trim() || null,
                ctaUrl: body.ctaUrl?.trim() || null,
                icon: body.icon || null,
                startDate: body.startDate ? new Date(body.startDate) : new Date(),
                endDate: body.endDate ? new Date(body.endDate) : null,
                dismissible: body.dismissible ?? true,
                persistent: body.persistent ?? false,
                priority: body.priority || 0,
                isActive: body.isActive ?? true,
                createdById: auth.user?.id,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        // Registrar log
        await logAudit({
            action: 'CREATE',
            category: 'SYSTEM',
            entity: 'PlatformNotice',
            entityId: notice.id,
            entityName: notice.title,
            userId: auth.user?.id,
            userEmail: auth.user?.email,
            userRole: auth.user?.role,
            ipAddress: ip,
        })

        return successResponse(notice, 201)

    } catch (error) {
        console.error('Error creant avís:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
