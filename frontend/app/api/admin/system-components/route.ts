import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    sanitizeString,
    errorResponse,
    successResponse,
    logSecurityEvent,
    getClientIP,
    checkRateLimit,
} from '@/lib/api-security'

// =====================
// GET - Llistar components del sistema
// =====================
export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`components-get-${ip}`, 60, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació
        const auth = await checkAuth(req)
        if (!auth.success) {
            return auth.error!
        }

        // Paràmetres
        const { searchParams } = new URL(req.url)
        const onlyWithCategories = searchParams.get('categorizable') === 'true'
        const includeInactive = searchParams.get('includeInactive') === 'true'

        // Construir filtre
        const where: any = {}

        if (onlyWithCategories) {
            where.supportsCategorization = true
        }

        if (!includeInactive) {
            where.isActive = true
        }

        // Obtenir components
        const components = await prisma.systemComponent.findMany({
            where,
            include: {
                categoryScopes: {
                    include: {
                        scope: {
                            include: {
                                _count: {
                                    select: { categories: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { isCore: 'desc' },
                { name: 'asc' },
            ],
        })

        // Transformar resposta
        const result = components.map(comp => ({
            ...comp,
            scopesCount: comp.categoryScopes.length,
            categoriesCount: comp.categoryScopes.reduce(
                (sum, sc) => sum + (sc.scope._count?.categories || 0),
                0
            ),
        }))

        return successResponse(result)

    } catch (error) {
        console.error('Error llistant components:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/system-components',
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// POST - Registrar nou component (només per sistema/development)
// =====================
export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`components-post-${ip}`, 10, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Només SUPER_ADMIN pot crear components
        const auth = await checkAuth(req, ['SUPER_ADMIN'])
        if (!auth.success) {
            return auth.error!
        }

        // Obtenir body
        let body: any
        try {
            body = await req.json()
        } catch (e) {
            return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
        }

        const { code, name, namePlural, description, icon, color, supportsCategorization } = body

        // Validacions
        if (!code || typeof code !== 'string' || code.length < 2 || code.length > 50) {
            return errorResponse('Codi invàlid (2-50 caràcters)', 400, 'VALIDATION_ERROR')
        }

        if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
            return errorResponse('Nom invàlid (2-100 caràcters)', 400, 'VALIDATION_ERROR')
        }

        // Formatar codi
        const formattedCode = sanitizeString(code).toUpperCase().replace(/[^A-Z0-9_]/g, '_')

        // Comprovar duplicat
        const existing = await prisma.systemComponent.findUnique({
            where: { code: formattedCode },
        })

        if (existing) {
            return errorResponse('Ja existeix un component amb aquest codi', 409, 'DUPLICATE')
        }

        // Crear component
        const component = await prisma.systemComponent.create({
            data: {
                code: formattedCode,
                name: sanitizeString(name),
                namePlural: sanitizeString(namePlural || name),
                description: description ? sanitizeString(description) : null,
                icon: icon || 'Box',
                color: color || 'slate',
                supportsCategorization: supportsCategorization ?? true,
                isCore: false,
                isActive: true,
            },
        })

        console.log(`[AUDIT] Component creat: ${component.code} per usuari ${auth.user?.id}`)

        return successResponse(component, 201)

    } catch (error) {
        console.error('Error creant component:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/system-components',
            method: 'POST',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
