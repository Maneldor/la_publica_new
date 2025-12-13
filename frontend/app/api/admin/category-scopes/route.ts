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

// =====================
// GET - Llistar scopes (tipus de categories)
// =====================
export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`scopes-get-${ip}`, 60, 60000)
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
        const includeInactive = searchParams.get('includeInactive') === 'true'
        const componentCode = searchParams.get('component')

        // Construir filtre
        const where: any = {}

        if (!includeInactive) {
            where.isActive = true
        }

        if (componentCode) {
            where.components = {
                some: {
                    component: {
                        code: componentCode.toUpperCase(),
                    },
                },
            }
        }

        // Obtenir scopes amb categories i components
        // Obtenir scopes amb nombre total de categories i components
        const scopes = await prisma.categoryScope.findMany({
            where,
            include: {
                components: {
                    include: {
                        component: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                namePlural: true,
                                icon: true,
                                color: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { categories: true },
                },
            },
            orderBy: [
                { order: 'asc' },
                { label: 'asc' },
            ],
        })

        // Optimització: Obtenir conteo de categories actives amb groupBy
        // Això evita carregar milers d'IDs de categories només per contar-les
        const activeCounts = await prisma.category.groupBy({
            by: ['scopeId'],
            where: {
                isActive: true,
            },
            _count: {
                id: true,
            },
        })

        // Crear mapa de conteos per accés ràpid
        const activeCountMap = new Map(
            activeCounts.map(c => [c.scopeId, c._count.id])
        )

        // Transformar resposta
        const result = scopes.map(scope => ({
            id: scope.id,
            name: scope.name,
            label: scope.label,
            description: scope.description,
            icon: scope.icon,
            color: scope.color,
            order: scope.order,
            isSystem: scope.isSystem,
            isActive: scope.isActive,
            createdAt: scope.createdAt,
            updatedAt: scope.updatedAt,
            components: scope.components.map(sc => sc.component),
            categoriesCount: scope._count.categories,
            activeCategoriesCount: activeCountMap.get(scope.id) || 0,
        }))

        return successResponse(result)

    } catch (error) {
        console.error('Error llistant scopes:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/category-scopes',
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// POST - Crear nou scope (tipus de categoria)
// =====================
export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`scopes-post-${ip}`, 20, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació i autorització
        const auth = await checkAuth(req, ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'])
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
            {
                field: 'label',
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 100,
            },
            { field: 'description', type: 'string', maxLength: 500 },
            { field: 'icon', type: 'string', maxLength: 50 },
            { field: 'color', type: 'string', maxLength: 20 },
            {
                field: 'componentIds',
                type: 'array',
                required: true,
                minLength: 1,
                customMessage: 'Has de seleccionar almenys un component',
            },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        const { label, description, icon, color, componentIds } = body

        // Generar nom (slug) únic
        const name = generateSecureSlug(label)

        if (!name) {
            return errorResponse('No s\'ha pogut generar un identificador vàlid', 400, 'INVALID_NAME')
        }

        // Comprovar duplicat
        const existing = await prisma.categoryScope.findUnique({
            where: { name },
        })

        if (existing) {
            return errorResponse('Ja existeix un tipus de categoria amb aquest nom', 409, 'DUPLICATE')
        }

        // Verificar que els components existeixen
        const components = await prisma.systemComponent.findMany({
            where: {
                id: { in: componentIds },
                supportsCategorization: true,
                isActive: true,
            },
        })

        if (components.length !== componentIds.length) {
            return errorResponse('Alguns components no són vàlids o no suporten categories', 400, 'INVALID_COMPONENTS')
        }

        // Obtenir ordre màxim
        const maxOrder = await prisma.categoryScope.aggregate({
            _max: { order: true },
        })

        // Crear scope amb components (transacció)
        const scope = await prisma.$transaction(async (tx) => {
            // Crear scope
            const newScope = await tx.categoryScope.create({
                data: {
                    name,
                    label,
                    description: description || null,
                    icon: icon || 'Folder',
                    color: color || 'slate',
                    order: (maxOrder._max.order || 0) + 1,
                    isSystem: false,
                    isActive: true,
                    createdById: auth.user?.id,
                },
            })

            // Associar components
            await tx.categoryScopeComponent.createMany({
                data: componentIds.map((componentId: string) => ({
                    scopeId: newScope.id,
                    componentId,
                })),
            })

            return newScope
        })

        // Obtenir scope complet
        const fullScope = await prisma.categoryScope.findUnique({
            where: { id: scope.id },
            include: {
                components: {
                    include: {
                        component: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                icon: true,
                                color: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { categories: true },
                },
            },
        })

        console.log(`[AUDIT] Scope creat: ${scope.id} per usuari ${auth.user?.id}`)

        return successResponse(fullScope, 201)

    } catch (error) {
        console.error('Error creant scope:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/category-scopes',
            method: 'POST',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PUT - Reordenar scopes
// =====================
export async function PUT(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`scopes-put-${ip}`, 30, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació i autorització
        const auth = await checkAuth(req, ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'])
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

        const { orderedIds } = body

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return errorResponse('orderedIds ha de ser una llista no buida', 400, 'VALIDATION_ERROR')
        }

        // Validar format IDs
        const idPattern = /^c[a-z0-9]{20,30}$/i
        for (const id of orderedIds) {
            if (typeof id !== 'string' || !idPattern.test(id)) {
                return errorResponse('Format d\'ID invàlid', 400, 'INVALID_ID')
            }
        }

        // Actualitzar ordre
        await prisma.$transaction(
            orderedIds.map((id: string, index: number) =>
                prisma.categoryScope.update({
                    where: { id },
                    data: { order: index },
                })
            )
        )

        console.log(`[AUDIT] Scopes reordenats per usuari ${auth.user?.id}`)

        return successResponse({ success: true, message: 'Ordre actualitzat' })

    } catch (error) {
        console.error('Error reordenant scopes:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/category-scopes',
            method: 'PUT',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
