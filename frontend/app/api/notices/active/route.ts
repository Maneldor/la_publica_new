import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
    errorResponse,
    successResponse,
    getClientIP,
    checkRateLimit,
} from '@/lib/api-security'

// =====================
// GET - Obtenir avisos actius per l'usuari actual
// =====================
export async function GET(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notices-active-${ip}`, 60, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Obtenir sessió (opcional - pot ser públic)
        const session = await getServerSession(authOptions)
        const userId = session?.user?.id
        const userRole = session?.user?.role || 'USER'

        const now = new Date()

        // Determinar audiències aplicables
        const audienceFilter: string[] = ['ALL']

        if (userRole === 'USER') {
            audienceFilter.push('USERS')
        } else if (['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'].includes(userRole)) {
            audienceFilter.push('GESTORS', 'COMPANIES')
        } else if (['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(userRole)) {
            audienceFilter.push('ADMINS', 'GESTORS')
        } else if (userRole === 'COMPANY' || userRole === 'COMPANY_ADMIN') {
            audienceFilter.push('COMPANIES')
        }

        // Obtenir avisos actius
        const notices = await prisma.platformNotice.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } },
                ],
                audience: { in: audienceFilter as any },
                // Excloure avisos que l'usuari ja ha tancat (si no són persistents)
                NOT: userId ? {
                    AND: [
                        { persistent: false },
                        { dismissals: { some: { userId } } },
                    ],
                } : undefined,
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
            select: {
                id: true,
                type: true,
                title: true,
                message: true,
                ctaText: true,
                ctaUrl: true,
                position: true,
                icon: true,
                dismissible: true,
                priority: true,
            },
        })

        return successResponse(notices)

    } catch (error) {
        console.error('Error obtenint avisos actius:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
