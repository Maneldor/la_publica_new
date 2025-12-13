import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    sanitizeString,
    isValidCuid,
    errorResponse,
    successResponse,
    getClientIP,
    checkRateLimit,
} from '@/lib/api-security'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

// =====================
// GET - Llistar logs
// =====================
export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`audit-logs-get-${ip}`, 60, 60000)
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
        const userId = searchParams.get('userId')
        const action = searchParams.get('action')
        const category = searchParams.get('category')
        const entity = searchParams.get('entity')
        const level = searchParams.get('level')
        const success = searchParams.get('success')
        const dateFrom = searchParams.get('dateFrom')
        const dateTo = searchParams.get('dateTo')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

        // Construir filtre
        const where: any = {}

        // Cerca general
        if (search) {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { userEmail: { contains: search, mode: 'insensitive' } },
                { entityName: { contains: search, mode: 'insensitive' } },
                { entityId: { contains: search, mode: 'insensitive' } },
                { errorMessage: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Filtres específics
        if (userId && isValidCuid(userId)) {
            where.userId = userId
        }

        if (action) {
            where.action = action.toUpperCase()
        }

        if (category) {
            where.category = category.toUpperCase()
        }

        if (entity) {
            where.entity = entity
        }

        if (level && ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].includes(level.toUpperCase())) {
            where.level = level.toUpperCase()
        }

        if (success !== null && success !== '') {
            where.success = success === 'true'
        }

        // Filtre de dates
        if (dateFrom || dateTo) {
            where.timestamp = {}
            if (dateFrom) {
                where.timestamp.gte = new Date(dateFrom)
            }
            if (dateTo) {
                // Afegir 1 dia per incloure tot el dia final
                const endDate = new Date(dateTo)
                endDate.setDate(endDate.getDate() + 1)
                where.timestamp.lt = endDate
            }
        }

        // Comptar total
        const total = await prisma.auditLog.count({ where })

        // Obtenir logs
        const logs = await prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return successResponse({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })

    } catch (error) {
        console.error('Error llistant logs:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
