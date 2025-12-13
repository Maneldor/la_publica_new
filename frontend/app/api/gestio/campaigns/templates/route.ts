import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    validateData,
    sanitizeObject,
    errorResponse,
    successResponse,
    logSecurityEvent,
    getClientIP,
    checkRateLimit,
    type ValidationRule,
} from '@/lib/api-security'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT'] as const

// =====================
// GET - Llistar plantilles
// =====================
export async function GET(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`templates-get-${ip}`, 60, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type')

        const where: any = { isActive: true }
        if (type && ['EMAIL', 'PUSH', 'SMS', 'BANNER', 'FEATURED', 'ANNOUNCEMENT'].includes(type)) {
            where.type = type
        }

        const templates = await prisma.campaignTemplate.findMany({
            where,
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' },
            ],
        })

        return successResponse(templates)

    } catch (error) {
        console.error('Error llistant plantilles:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// POST - Crear plantilla
// =====================
export async function POST(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`templates-post-${ip}`, 20, 60000)
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

        const validationRules: ValidationRule[] = [
            { field: 'name', type: 'string', required: true, minLength: 3, maxLength: 200 },
            { field: 'type', type: 'string', required: true },
            { field: 'content', type: 'string', required: true, maxLength: 50000 },
            { field: 'subject', type: 'string', maxLength: 200 },
            { field: 'description', type: 'string', maxLength: 500 },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        const template = await prisma.campaignTemplate.create({
            data: {
                name: body.name.trim(),
                description: body.description?.trim() || null,
                type: body.type,
                subject: body.subject?.trim() || null,
                content: body.content,
                contentPlain: body.contentPlain?.trim() || null,
                isActive: true,
                isDefault: body.isDefault || false,
                createdById: auth.user?.id,
            },
        })

        console.log(`[AUDIT] Plantilla creada: ${template.id} per usuari ${auth.user?.id}`)

        return successResponse(template, 201)

    } catch (error) {
        console.error('Error creant plantilla:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
