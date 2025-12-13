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

// =====================
// GET - Obtenir un scope
// =====================
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`scope-get-${ip}`, 60, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació
        const auth = await checkAuth(req)
        if (!auth.success) {
            return auth.error!
        }

        // Validar ID
        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        // Obtenir scope
        const scope = await prisma.categoryScope.findUnique({
            where: { id },
            include: {
                components: {
                    include: {
                        component: true,
                    },
                },
                categories: {
                    orderBy: [
                        { order: 'asc' },
                        { name: 'asc' },
                    ],
                },
                _count: {
                    select: { categories: true },
                },
            },
        })

        if (!scope) {
            return errorResponse('Tipus de categoria no trobat', 404, 'NOT_FOUND')
        }

        return successResponse({
            ...scope,
            components: scope.components.map(sc => sc.component),
        })

    } catch (error) {
        console.error('Error obtenint scope:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/admin/category-scopes/${params.id}`,
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PUT - Actualitzar scope
// =====================
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`scope-put-${ip}`, 30, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació i autorització
        const auth = await checkAuth(req, ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'])
        if (!auth.success) {
            return auth.error!
        }

        // Validar ID
        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        // Verificar existència
        const existingScope = await prisma.categoryScope.findUnique({
            where: { id },
            include: { components: true },
        })

        if (!existingScope) {
            return errorResponse('Tipus de categoria no trobat', 404, 'NOT_FOUND')
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
            { field: 'label', type: 'string', required: true, minLength: 2, maxLength: 100 },
            { field: 'description', type: 'string', maxLength: 500 },
            { field: 'icon', type: 'string', maxLength: 50 },
            { field: 'color', type: 'string', maxLength: 20 },
            { field: 'isActive', type: 'boolean' },
            { field: 'componentIds', type: 'array', minLength: 1 },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        const { label, description, icon, color, isActive, componentIds } = body

        // No permetre canviar nom de scopes del sistema
        if (existingScope.isSystem && label !== existingScope.label) {
            return errorResponse('No es pot canviar el nom d\'un tipus de sistema', 400, 'SYSTEM_SCOPE')
        }

        // Verificar components si s'han passat
        if (componentIds && componentIds.length > 0) {
            const components = await prisma.systemComponent.findMany({
                where: {
                    id: { in: componentIds },
                    supportsCategorization: true,
                    isActive: true,
                },
            })

            if (components.length !== componentIds.length) {
                return errorResponse('Alguns components no són vàlids', 400, 'INVALID_COMPONENTS')
            }
        }

        // Actualitzar (transacció)
        const updatedScope = await prisma.$transaction(async (tx) => {
            // Actualitzar scope
            const scope = await tx.categoryScope.update({
                where: { id },
                data: {
                    label,
                    description: description || null,
                    icon: icon || existingScope.icon,
                    color: color || existingScope.color,
                    isActive: isActive ?? existingScope.isActive,
                },
            })

            // Actualitzar components si s'han passat
            if (componentIds && componentIds.length > 0) {
                // Eliminar relacions actuals
                await tx.categoryScopeComponent.deleteMany({
                    where: { scopeId: id },
                })

                // Crear noves relacions
                await tx.categoryScopeComponent.createMany({
                    data: componentIds.map((componentId: string) => ({
                        scopeId: id,
                        componentId,
                    })),
                })
            }

            return scope
        })

        // Obtenir scope actualitzat complet
        const fullScope = await prisma.categoryScope.findUnique({
            where: { id },
            include: {
                components: {
                    include: {
                        component: {
                            select: { id: true, code: true, name: true, icon: true, color: true },
                        },
                    },
                },
                _count: { select: { categories: true } },
            },
        })

        console.log(`[AUDIT] Scope actualitzat: ${id} per usuari ${auth.user?.id}`)

        return successResponse(fullScope)

    } catch (error) {
        console.error('Error actualitzant scope:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/admin/category-scopes/${params.id}`,
            method: 'PUT',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// DELETE - Eliminar scope
// =====================
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`scope-delete-${ip}`, 10, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Només SUPER_ADMIN i ADMIN
        const auth = await checkAuth(req, ['SUPER_ADMIN', 'ADMIN'])
        if (!auth.success) {
            return auth.error!
        }

        // Validar ID
        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        // Verificar existència
        const scope = await prisma.categoryScope.findUnique({
            where: { id },
            include: {
                _count: { select: { categories: true } },
            },
        })

        if (!scope) {
            return errorResponse('Tipus de categoria no trobat', 404, 'NOT_FOUND')
        }

        // No permetre eliminar scopes del sistema
        if (scope.isSystem) {
            return errorResponse('No es pot eliminar un tipus de sistema', 400, 'SYSTEM_SCOPE')
        }

        // No permetre eliminar si té categories
        if (scope._count.categories > 0) {
            return errorResponse(
                `No es pot eliminar: té ${scope._count.categories} categories. Elimina-les primer.`,
                400,
                'HAS_CATEGORIES'
            )
        }

        // Eliminar
        await prisma.categoryScope.delete({ where: { id } })

        console.log(`[AUDIT] Scope eliminat: ${id} (${scope.label}) per usuari ${auth.user?.id}`)

        return successResponse({ success: true, message: 'Tipus de categoria eliminat' })

    } catch (error) {
        console.error('Error eliminant scope:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/admin/category-scopes/${params.id}`,
            method: 'DELETE',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
