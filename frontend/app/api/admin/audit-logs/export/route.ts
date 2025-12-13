import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    sanitizeString,
    errorResponse,
    getClientIP,
    checkRateLimit,
} from '@/lib/api-security'
import { logAudit } from '@/lib/audit'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

// =====================
// GET - Exportar logs a CSV
// =====================
export async function GET(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`audit-export-${ip}`, 5, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        // Paràmetres
        const { searchParams } = new URL(req.url)
        const dateFrom = searchParams.get('dateFrom')
        const dateTo = searchParams.get('dateTo')
        const category = searchParams.get('category')
        const level = searchParams.get('level')
        const maxRecords = Math.min(parseInt(searchParams.get('limit') || '10000'), 50000)

        // Construir filtre
        const where: any = {}

        if (dateFrom || dateTo) {
            where.timestamp = {}
            if (dateFrom) {
                where.timestamp.gte = new Date(dateFrom)
            }
            if (dateTo) {
                const endDate = new Date(dateTo)
                endDate.setDate(endDate.getDate() + 1)
                where.timestamp.lt = endDate
            }
        }

        if (category) {
            where.category = category.toUpperCase()
        }

        if (level) {
            where.level = level.toUpperCase()
        }

        // Obtenir logs
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: maxRecords,
        })

        // Generar CSV
        const headers = [
            'Data/Hora',
            'Nivell',
            'Categoria',
            'Acció',
            'Usuari',
            'Email',
            'Rol',
            'Entitat',
            'ID Entitat',
            'Nom Entitat',
            'Descripció',
            'Èxit',
            'Error',
            'IP',
            'Path',
        ]

        const rows = logs.map(log => [
            new Date(log.timestamp).toISOString(),
            log.level,
            log.category,
            log.action,
            log.userId || '',
            log.userEmail || '',
            log.userRole || '',
            log.entity || '',
            log.entityId || '',
            log.entityName || '',
            (log.description || '').replace(/"/g, '""'),
            log.success ? 'Sí' : 'No',
            (log.errorMessage || '').replace(/"/g, '""'),
            log.ipAddress || '',
            log.requestPath || '',
        ])

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n')

        // Registrar exportació
        await logAudit({
            action: 'EXPORT',
            category: 'SYSTEM',
            userId: auth.user?.id,
            userEmail: auth.user?.email,
            description: `Exportats ${logs.length} logs d'auditoria`,
            metadata: { count: logs.length, filters: { dateFrom, dateTo, category, level } },
            ipAddress: ip,
        })

        // Retornar CSV
        const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })

    } catch (error) {
        console.error('Error exportant logs:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
