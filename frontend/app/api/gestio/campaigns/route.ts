import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    validateData,
    sanitizeString,
    sanitizeObject,
    generateSecureSlug,
    errorResponse,
    successResponse,
    logSecurityEvent,
    getClientIP,
    checkRateLimit,
    type ValidationRule,
} from '@/lib/api-security'

// Rols permesos per gestionar campanyes
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT'] as const

// =====================
// GET - Llistar campanyes
// =====================
export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaigns-get-${ip}`, 60, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació i autorització
        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        // Paràmetres de cerca
        const { searchParams } = new URL(req.url)
        const search = sanitizeString(searchParams.get('search') || '')
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

        // Construir filtre
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (type && ['EMAIL', 'PUSH', 'SMS', 'BANNER', 'FEATURED', 'ANNOUNCEMENT'].includes(type)) {
            where.type = type
        }

        if (status && ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(status)) {
            where.status = status
        }

        // Comptar total
        const total = await prisma.campaign.count({ where })

        // Obtenir campanyes
        const campaigns = await prisma.campaign.findMany({
            where,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { recipients: true, events: true },
                },
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
        })

        return successResponse({
            campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })

    } catch (error) {
        console.error('Error llistant campanyes:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/gestio/campaigns',
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// POST - Crear campanya
// =====================
export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaigns-post-${ip}`, 20, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació i autorització
        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        // Obtenir i sanititzar body
        let body: any
        try {
            body = await req.json()
            body = sanitizeObject(body)
        } catch (e) {
            return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
        }

        // Validació
        const validationRules: ValidationRule[] = [
            { field: 'name', type: 'string', required: true, minLength: 3, maxLength: 200 },
            { field: 'type', type: 'string', required: true },
            { field: 'description', type: 'string', maxLength: 1000 },
            { field: 'subject', type: 'string', maxLength: 200 },
            { field: 'content', type: 'string', maxLength: 50000 },
            { field: 'contentPlain', type: 'string', maxLength: 10000 },
            { field: 'ctaText', type: 'string', maxLength: 100 },
            { field: 'ctaUrl', type: 'string', maxLength: 500 },
            { field: 'imageUrl', type: 'string', maxLength: 500 },
            { field: 'segmentationType', type: 'string' },
            { field: 'priority', type: 'number', min: 0, max: 100 },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        // Validar tipus
        const validTypes = ['EMAIL', 'PUSH', 'SMS', 'BANNER', 'FEATURED', 'ANNOUNCEMENT']
        if (!validTypes.includes(body.type)) {
            return errorResponse('Tipus de campanya invàlid', 400, 'INVALID_TYPE')
        }

        // Generar slug
        const slug = generateSecureSlug(body.name)
        if (!slug) {
            return errorResponse('No s\'ha pogut generar un identificador vàlid', 400, 'INVALID_SLUG')
        }

        // Comprovar duplicat
        const existing = await prisma.campaign.findUnique({ where: { slug } })
        if (existing) {
            return errorResponse('Ja existeix una campanya amb aquest nom', 409, 'DUPLICATE')
        }

        // Crear campanya
        const campaign = await prisma.campaign.create({
            data: {
                name: body.name.trim(),
                slug,
                description: body.description?.trim() || null,
                type: body.type,
                status: 'DRAFT',
                subject: body.subject?.trim() || null,
                content: body.content || null,
                contentPlain: body.contentPlain?.trim() || null,
                ctaText: body.ctaText?.trim() || null,
                ctaUrl: body.ctaUrl?.trim() || null,
                imageUrl: body.imageUrl?.trim() || null,
                segmentationType: body.segmentationType || 'ALL',
                segmentationData: body.segmentationData || null,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                isRecurring: body.isRecurring || false,
                recurringRule: body.recurringRule || null,
                priority: body.priority || 0,
                settings: body.settings || null,
                createdById: auth.user?.id,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        console.log(`[AUDIT] Campanya creada: ${campaign.id} per usuari ${auth.user?.id}`)

        return successResponse(campaign, 201)

    } catch (error) {
        console.error('Error creant campanya:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/gestio/campaigns',
            method: 'POST',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
