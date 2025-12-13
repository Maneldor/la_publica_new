import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    validateData,
    sanitizeObject,
    generateSecureSlug,
    isValidCuid,
    errorResponse,
    successResponse,
    logSecurityEvent,
    getClientIP,
    checkRateLimit,
    type ValidationRule,
} from '@/lib/api-security'

// =====================
// GET - Obtenir una categoria
// =====================
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`category-get-${ip}`, 60, 60000)
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

        // Obtenir categoria
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                scope: {
                    select: { id: true, name: true, label: true, color: true },
                },
                parent: {
                    select: { id: true, name: true, slug: true },
                },
                children: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                    select: { id: true, name: true, slug: true, icon: true, color: true },
                },
            },
        })

        if (!category) {
            return errorResponse('Categoria no trobada', 404, 'NOT_FOUND')
        }

        return successResponse(category)

    } catch (error) {
        console.error('Error obtenint categoria:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/admin/categories/${params.id}`,
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PUT - Actualitzar categoria
// =====================
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`category-put-${ip}`, 30, 60000)
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
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        })

        if (!existingCategory) {
            return errorResponse('Categoria no trobada', 404, 'NOT_FOUND')
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
                field: 'name',
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ0-9\s\-&']+$/,
                customMessage: 'El nom només pot contenir lletres, números, espais i guions'
            },
            { field: 'description', type: 'string', maxLength: 500 },
            { field: 'icon', type: 'string', maxLength: 50 },
            { field: 'color', type: 'string', maxLength: 20 },
            { field: 'image', type: 'string', maxLength: 500 },
            { field: 'isActive', type: 'boolean' },
            { field: 'isFeatured', type: 'boolean' },
            { field: 'parentId', type: 'string' },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        const { name, description, icon, color, image, isActive, isFeatured, parentId } = body

        // Generar nou slug si el nom canvia
        let slug = existingCategory.slug
        if (name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
            slug = generateSecureSlug(name)
            if (!slug) {
                return errorResponse('No s\'ha pogut generar un slug vàlid', 400, 'INVALID_SLUG')
            }

            // Comprovar duplicat
            const duplicate = await prisma.category.findFirst({
                where: {
                    scopeId: existingCategory.scopeId,
                    id: { not: id },
                    OR: [
                        { name: { equals: name.trim(), mode: 'insensitive' } },
                        { slug },
                    ],
                },
            })

            if (duplicate) {
                return errorResponse('Ja existeix una categoria amb aquest nom', 409, 'DUPLICATE')
            }
        }

        // Verificar parent si s'ha passat i és diferent
        if (parentId !== undefined && parentId !== existingCategory.parentId) {
            if (parentId) {
                if (!isValidCuid(parentId)) {
                    return errorResponse('parentId invàlid', 400, 'INVALID_PARENT_ID')
                }

                // No permetre ser pare de si mateix
                if (parentId === id) {
                    return errorResponse('Una categoria no pot ser el seu propi pare', 400, 'SELF_PARENT')
                }

                const parent = await prisma.category.findFirst({
                    where: { id: parentId, scopeId: existingCategory.scopeId },
                })

                if (!parent) {
                    return errorResponse('Categoria pare no trobada', 404, 'PARENT_NOT_FOUND')
                }
            }
        }

        // Actualitzar
        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                name: name.trim(),
                slug,
                description: description?.trim() || null,
                icon: icon || null,
                color: color || 'slate',
                image: image || null,
                isActive: isActive ?? existingCategory.isActive,
                isFeatured: isFeatured ?? existingCategory.isFeatured,
                parentId: parentId !== undefined ? (parentId || null) : existingCategory.parentId,
            },
            include: {
                scope: {
                    select: { id: true, name: true, label: true },
                },
                parent: {
                    select: { id: true, name: true },
                },
            },
        })

        console.log(`[AUDIT] Categoria actualitzada: ${id} per usuari ${auth.user?.id}`)

        return successResponse(updatedCategory)

    } catch (error) {
        console.error('Error actualitzant categoria:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/admin/categories/${params.id}`,
            method: 'PUT',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PATCH - Canviar estat/destacar
// =====================
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`category-patch-${ip}`, 30, 60000)
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
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        })

        if (!existingCategory) {
            return errorResponse('Categoria no trobada', 404, 'NOT_FOUND')
        }

        // Obtenir body
        let body: any
        try {
            body = await req.json()
        } catch (e) {
            return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
        }

        const { isActive, isFeatured } = body

        // Validar
        const updateData: any = {}

        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive
        }

        if (typeof isFeatured === 'boolean') {
            updateData.isFeatured = isFeatured
        }

        if (Object.keys(updateData).length === 0) {
            return errorResponse('No hi ha camps vàlids per actualitzar', 400, 'NO_FIELDS')
        }

        // Actualitzar
        const updatedCategory = await prisma.category.update({
            where: { id },
            data: updateData,
            include: {
                scope: {
                    select: { id: true, name: true, label: true },
                },
            },
        })

        console.log(`[AUDIT] Categoria ${id} actualitzada (PATCH) per usuari ${auth.user?.id}`)

        return successResponse(updatedCategory)

    } catch (error) {
        console.error('Error actualitzant categoria:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/admin/categories/${params.id}`,
            method: 'PATCH',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// DELETE - Eliminar categoria
// =====================
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`category-delete-${ip}`, 10, 60000)
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
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: { select: { children: true } },
            },
        })

        if (!category) {
            return errorResponse('Categoria no trobada', 404, 'NOT_FOUND')
        }

        // Verificar si té fills
        if (category._count.children > 0) {
            return errorResponse(
                `No es pot eliminar: té ${category._count.children} subcategories. Elimina-les primer.`,
                400,
                'HAS_CHILDREN'
            )
        }

        // TODO: Verificar si té entitats associades (ofertes, empreses, etc.)
        // Això dependrà de les relacions que s'afegeixin més endavant

        // Eliminar
        await prisma.category.delete({ where: { id } })

        console.log(`[AUDIT] Categoria eliminada: ${id} (${category.name}) per usuari ${auth.user?.id}`)

        return successResponse({ success: true, message: 'Categoria eliminada' })

    } catch (error) {
        console.error('Error eliminant categoria:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/admin/categories/${params.id}`,
            method: 'DELETE',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
