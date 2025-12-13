import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
    isValidCuid,
    errorResponse,
    successResponse,
    getClientIP,
    checkRateLimit,
} from '@/lib/api-security'

// =====================
// POST - Tancar un avís
// =====================
export async function POST(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`notices-dismiss-${ip}`, 30, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Requereix autenticació
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return errorResponse('No autenticat', 401, 'UNAUTHORIZED')
        }

        let body: any
        try {
            body = await req.json()
        } catch (e) {
            return errorResponse('Format JSON invàlid', 400, 'INVALID_JSON')
        }

        const { noticeId } = body

        if (!noticeId || !isValidCuid(noticeId)) {
            return errorResponse('ID d\'avís invàlid', 400, 'INVALID_ID')
        }

        // Verificar que l'avís existeix i és dismissible
        const notice = await prisma.platformNotice.findUnique({
            where: { id: noticeId },
            select: { id: true, dismissible: true },
        })

        if (!notice) {
            return errorResponse('Avís no trobat', 404, 'NOT_FOUND')
        }

        if (!notice.dismissible) {
            return errorResponse('Aquest avís no es pot tancar', 400, 'NOT_DISMISSIBLE')
        }

        // Crear o actualitzar dismissal
        await prisma.noticeDismissal.upsert({
            where: {
                noticeId_userId: {
                    noticeId,
                    userId: session.user.id,
                },
            },
            create: {
                noticeId,
                userId: session.user.id,
            },
            update: {
                dismissedAt: new Date(),
            },
        })

        return successResponse({ success: true, message: 'Avís tancat' })

    } catch (error) {
        console.error('Error tancant avís:', error)
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
