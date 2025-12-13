import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    errorResponse,
    successResponse,
    getClientIP,
    checkRateLimit,
} from '@/lib/api-security'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

// =====================
// GET - Estadístiques de logs
// =====================
export async function GET(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`audit-stats-${ip}`, 30, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        // Paràmetres
        const { searchParams } = new URL(req.url)
        const days = parseInt(searchParams.get('days') || '7')
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        // Total logs
        const totalLogs = await prisma.auditLog.count()

        // Logs per nivell (últims X dies)
        const logsByLevel = await prisma.auditLog.groupBy({
            by: ['level'],
            where: { timestamp: { gte: startDate } },
            _count: true,
        })

        // Logs per categoria (últims X dies)
        const logsByCategory = await prisma.auditLog.groupBy({
            by: ['category'],
            where: { timestamp: { gte: startDate } },
            _count: true,
            orderBy: { _count: { category: 'desc' } },
            take: 10,
        })

        // Logs per acció (últims X dies)
        const logsByAction = await prisma.auditLog.groupBy({
            by: ['action'],
            where: { timestamp: { gte: startDate } },
            _count: true,
            orderBy: { _count: { action: 'desc' } },
            take: 10,
        })

        // Errors recents
        const recentErrors = await prisma.auditLog.count({
            where: {
                timestamp: { gte: startDate },
                level: { in: ['ERROR', 'CRITICAL'] },
            },
        })

        // Logins fallits
        const failedLogins = await prisma.auditLog.count({
            where: {
                timestamp: { gte: startDate },
                action: 'LOGIN_FAILED',
            },
        })

        // Usuaris més actius
        const topUsers = await prisma.auditLog.groupBy({
            by: ['userId', 'userEmail'],
            where: {
                timestamp: { gte: startDate },
                userId: { not: null },
            },
            _count: true,
            orderBy: { _count: { userId: 'desc' } },
            take: 5,
        })

        // Activitat per dia
        const activityByDay = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM audit_logs
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    ` as { date: Date; count: bigint }[]

        return successResponse({
            period: `${days} dies`,
            totalLogs,
            recentErrors,
            failedLogins,
            byLevel: logsByLevel.reduce((acc, item) => {
                acc[item.level] = item._count
                return acc
            }, {} as Record<string, number>),
            byCategory: logsByCategory.map(item => ({
                category: item.category,
                count: item._count,
            })),
            byAction: logsByAction.map(item => ({
                action: item.action,
                count: item._count,
            })),
            topUsers: topUsers.map(item => ({
                userId: item.userId,
                email: item.userEmail,
                count: item._count,
            })),
            activityByDay: activityByDay.map(item => ({
                date: item.date,
                count: Number(item.count),
            })),
        })

    } catch (error) {
        console.error('Error obtenint estadístiques:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
