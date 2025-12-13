import { NextRequest } from 'next/server'
import { prismaClient as prisma } from '@/lib/prisma'
import {
    checkAuth,
    isValidCuid,
    errorResponse,
    successResponse,
    logSecurityEvent,
    getClientIP,
    checkRateLimit,
} from '@/lib/api-security'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT'] as const

// =====================
// POST - Iniciar enviament
// =====================
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaign-send-${ip}`, 5, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        const auth = await checkAuth(req, [...ALLOWED_ROLES])
        if (!auth.success) {
            return auth.error!
        }

        const { id } = params
        if (!id || !isValidCuid(id)) {
            return errorResponse('ID invàlid', 400, 'INVALID_ID')
        }

        const campaign = await prisma.campaign.findUnique({ where: { id } })

        if (!campaign) {
            return errorResponse('Campanya no trobada', 404, 'NOT_FOUND')
        }

        // Validar que es pot enviar
        if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
            return errorResponse(`No es pot enviar una campanya amb estat ${campaign.status}`, 400, 'INVALID_STATUS')
        }

        // Validar contingut mínim
        if (!campaign.content && !campaign.subject) {
            return errorResponse('La campanya necessita contingut o assumpte', 400, 'MISSING_CONTENT')
        }

        // Obtenir destinataris segons segmentació
        let recipientUsers: { id: string; email: string | null }[] = []

        switch (campaign.segmentationType) {
            case 'ALL':
                recipientUsers = await prisma.user.findMany({
                    where: { isActive: true, role: 'USER' },
                    select: { id: true, email: true },
                    take: 10000, // Límit de seguretat
                })
                break

            case 'CUSTOM':
                // IDs personalitzats a segmentationData
                const customIds = (campaign.segmentationData as any)?.userIds || []
                if (customIds.length > 0) {
                    recipientUsers = await prisma.user.findMany({
                        where: { id: { in: customIds }, isActive: true },
                        select: { id: true, email: true },
                    })
                }
                break

            // TODO: Implementar altres tipus de segmentació
            default:
                recipientUsers = await prisma.user.findMany({
                    where: { isActive: true, role: 'USER' },
                    select: { id: true, email: true },
                    take: 1000,
                })
        }

        if (recipientUsers.length === 0) {
            return errorResponse('No hi ha destinataris per aquesta segmentació', 400, 'NO_RECIPIENTS')
        }

        // Crear recipients i actualitzar campanya
        await prisma.$transaction(async (tx) => {
            // Eliminar recipients anteriors (si n'hi ha)
            await tx.campaignRecipient.deleteMany({ where: { campaignId: id } })

            // Crear nous recipients
            await tx.campaignRecipient.createMany({
                data: recipientUsers.map(user => ({
                    campaignId: id,
                    userId: user.id,
                    email: user.email,
                    status: 'pending',
                })),
            })

            // Actualitzar campanya
            await tx.campaign.update({
                where: { id },
                data: {
                    status: 'ACTIVE',
                    totalRecipients: recipientUsers.length,
                },
            })
        })

        // TODO: Aquí s'iniciaria el procés d'enviament real
        // (cues, workers, enviament d'emails/push/sms, etc.)

        console.log(`[AUDIT] Campanya ${id} iniciada amb ${recipientUsers.length} destinataris per usuari ${auth.user?.id}`)

        return successResponse({
            success: true,
            message: 'Campanya iniciada',
            recipientsCount: recipientUsers.length,
        })

    } catch (error) {
        console.error('Error enviant campanya:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: `/api/gestio/campaigns/${params.id}/send`,
            method: 'POST',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}
