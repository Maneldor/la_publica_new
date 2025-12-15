import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    validateData,
    sanitizeString,
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
// GET - Llistar categories
// =====================
export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`categories-get-${ip}`, 60, 60000)
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
        const scopeId = searchParams.get('scopeId')
        const scopeName = searchParams.get('scope')
        const search = sanitizeString(searchParams.get('search') || '')
        const status = searchParams.get('status')
        const featured = searchParams.get('featured')

        // Construir filtre
        const where: any = {}

        // Filtre per scope (obligatori o per nom)
        if (scopeId) {
            if (!scopeId || scopeId.length < 3) {
                return errorResponse('scopeId invàlid', 400, 'INVALID_SCOPE_ID')
            }
            where.scopeId = scopeId
        } else if (scopeName) {
            const scope = await prisma.categoryScope.findUnique({
                where: { name: scopeName },
            })
            if (!scope) {
                return errorResponse('Scope no trobat', 404, 'SCOPE_NOT_FOUND')
            }
            where.scopeId = scope.id
        }

        // Cerca
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Estat
        if (status === 'active') {
            where.isActive = true
        } else if (status === 'inactive') {
            where.isActive = false
        }

        // Destacades
        if (featured === 'true') {
            where.isFeatured = true
        }

        // Obtenir categories
        const categories = await prisma.category.findMany({
            where,
            include: {
                scope: {
                    select: {
                        id: true,
                        name: true,
                        label: true,
                        color: true,
                    },
                },
                parent: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { children: true },
                },
            },
            orderBy: [
                { order: 'asc' },
                { name: 'asc' },
            ],
        })

        return successResponse(categories)

    } catch (error) {
        console.error('Error llistant categories:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/categories',
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// POST - Crear categoria
// =====================
export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`categories-post-${ip}`, 20, 60000)
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
            { field: 'scopeId', type: 'string', required: true },
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

        const { scopeId, name, description, icon, color, image, isActive, isFeatured, parentId } = body

        // Verificar scope
        if (!scopeId || scopeId.length < 3) {
            return errorResponse('scopeId invàlid', 400, 'INVALID_SCOPE_ID')
        }

        const scope = await prisma.categoryScope.findUnique({
            where: { id: scopeId },
        })

        if (!scope) {
            return errorResponse('Tipus de categoria no trobat', 404, 'SCOPE_NOT_FOUND')
        }

        // Generar slug
        const slug = generateSecureSlug(name)
        if (!slug) {
            return errorResponse('No s\'ha pogut generar un slug vàlid', 400, 'INVALID_SLUG')
        }

        // Comprovar duplicat dins del scope
        const existing = await prisma.category.findFirst({
            where: {
                scopeId,
                OR: [
                    { name: { equals: name.trim(), mode: 'insensitive' } },
                    { slug },
                ],
            },
        })

        if (existing) {
            return errorResponse('Ja existeix una categoria amb aquest nom en aquest tipus', 409, 'DUPLICATE')
        }

        // Verificar parent si s'ha passat
        if (parentId) {
            if (!parentId || parentId.length < 3) {
                return errorResponse('parentId invàlid', 400, 'INVALID_PARENT_ID')
            }

            const parent = await prisma.category.findFirst({
                where: { id: parentId, scopeId },
            })

            if (!parent) {
                return errorResponse('Categoria pare no trobada en aquest tipus', 404, 'PARENT_NOT_FOUND')
            }
        }

        // Obtenir ordre màxim
        const maxOrder = await prisma.category.aggregate({
            where: { scopeId, parentId: parentId || null },
            _max: { order: true },
        })

        // Crear categoria
        const category = await prisma.category.create({
            data: {
                scopeId,
                name: name.trim(),
                slug,
                description: description?.trim() || null,
                icon: icon || null,
                color: color || 'slate',
                image: image || null,
                order: (maxOrder._max.order || 0) + 1,
                isActive: isActive ?? true,
                isFeatured: isFeatured ?? false,
                parentId: parentId || null,
                createdById: auth.user?.id,
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

        console.log(`[AUDIT] Categoria creada: ${category.id} per usuari ${auth.user?.id}`)

        return successResponse(category, 201)

    } catch (error) {
        console.error('Error creant categoria:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/categories',
            method: 'POST',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// PUT - Reordenar categories
// =====================
export async function PUT(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`categories-put-${ip}`, 30, 60000)
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

        if (orderedIds.length > 200) {
            return errorResponse('Massa elements', 400, 'TOO_MANY_ITEMS')
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
                prisma.category.update({
                    where: { id },
                    data: { order: index },
                })
            )
        )

        console.log(`[AUDIT] Categories reordenades per usuari ${auth.user?.id}`)

        return successResponse({ success: true, message: 'Ordre actualitzat' })

    } catch (error) {
        console.error('Error reordenant categories:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/admin/categories',
            method: 'PUT',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
