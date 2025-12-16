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

// Rols permesos per gestionar campanyes
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT'] as const

// =====================
// GET - Llistar campanyes
// =====================
export async function GET(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaigns-get-${ip}`, 60, 60000)
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
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

        // Construir filtre
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (type && ['EMAIL', 'PUSH', 'SMS', 'BANNER', 'FEATURED', 'ANNOUNCEMENT'].includes(type)) {
            where.type = type
        }

        if (status && ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(status)) {
            where.status = status
        }

        // Comptar total
        const total = await prisma.campaign.count({ where })

        // Obtenir campanyes
        const campaigns = await prisma.campaign.findMany({
            where,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { recipients: true, events: true },
                },
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
        })

        return successResponse({
            campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })

    } catch (error) {
        console.error('Error llistant campanyes:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/gestio/campaigns',
            method: 'GET',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// POST - Crear campanya
// =====================
export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(req)
        const rateCheck = checkRateLimit(`campaigns-post-${ip}`, 20, 60000)
        if (!rateCheck.allowed) {
            return errorResponse('Massa peticions', 429, 'RATE_LIMIT')
        }

        // Autenticació i autorització
        const auth = await checkAuth(req, [...ALLOWED_ROLES])
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

        // Si és una petició de seed
        if (body.action === 'seed') {
            return await seedExampleCampaigns(auth.user!.id)
        }

        // Validació
        const validationRules: ValidationRule[] = [
            { field: 'name', type: 'string', required: true, minLength: 3, maxLength: 200 },
            { field: 'type', type: 'string', required: true },
            { field: 'description', type: 'string', maxLength: 1000 },
            { field: 'subject', type: 'string', maxLength: 200 },
            { field: 'content', type: 'string', maxLength: 50000 },
            { field: 'contentPlain', type: 'string', maxLength: 10000 },
            { field: 'ctaText', type: 'string', maxLength: 100 },
            { field: 'ctaUrl', type: 'string', maxLength: 500 },
            { field: 'imageUrl', type: 'string', maxLength: 500 },
            { field: 'segmentationType', type: 'string' },
            { field: 'priority', type: 'number', min: 0, max: 100 },
        ]

        const validation = validateData(body, validationRules)
        if (!validation.valid) {
            return errorResponse('Dades invàlides', 400, 'VALIDATION_ERROR', validation.errors)
        }

        // Validar tipus
        const validTypes = ['EMAIL', 'PUSH', 'SMS', 'BANNER', 'FEATURED', 'ANNOUNCEMENT']
        if (!validTypes.includes(body.type)) {
            return errorResponse('Tipus de campanya invàlid', 400, 'INVALID_TYPE')
        }

        // Generar slug
        const slug = generateSecureSlug(body.name)
        if (!slug) {
            return errorResponse('No s\'ha pogut generar un identificador vàlid', 400, 'INVALID_SLUG')
        }

        // Comprovar duplicat
        const existing = await prisma.campaign.findUnique({ where: { slug } })
        if (existing) {
            return errorResponse('Ja existeix una campanya amb aquest nom', 409, 'DUPLICATE')
        }

        // Crear campanya
        const campaign = await prisma.campaign.create({
            data: {
                name: body.name.trim(),
                slug,
                description: body.description?.trim() || null,
                type: body.type,
                status: 'DRAFT',
                subject: body.subject?.trim() || null,
                content: body.content || null,
                contentPlain: body.contentPlain?.trim() || null,
                ctaText: body.ctaText?.trim() || null,
                ctaUrl: body.ctaUrl?.trim() || null,
                imageUrl: body.imageUrl?.trim() || null,
                segmentationType: body.segmentationType || 'ALL',
                segmentationData: body.segmentationData || null,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                isRecurring: body.isRecurring || false,
                recurringRule: body.recurringRule || null,
                priority: body.priority || 0,
                settings: body.settings || null,
                createdById: auth.user?.id,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        console.log(`[AUDIT] Campanya creada: ${campaign.id} per usuari ${auth.user?.id}`)

        return successResponse(campaign, 201)

    } catch (error) {
        console.error('Error creant campanya:', error)
        await logSecurityEvent({
            type: 'API_ERROR',
            path: '/api/gestio/campaigns',
            method: 'POST',
            details: error instanceof Error ? error.message : 'Unknown error',
        })
        return errorResponse('Error del servidor', 500, 'INTERNAL_ERROR')
    }
}

// =====================
// SEED - Crear campanyes d'exemple
// =====================
async function seedExampleCampaigns(userId: string) {
    try {
        // Eliminar campanyes d'exemple anteriors
        await prisma.campaign.deleteMany({
            where: { slug: { startsWith: 'exemple-' } }
        })

        const now = new Date()
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const exampleCampaigns = [
            {
                name: 'Benvinguda nous usuaris',
                slug: 'exemple-benvinguda',
                description: 'Email automàtic de benvinguda per a nous usuaris registrats',
                type: 'EMAIL' as const,
                status: 'ACTIVE' as const,
                subject: 'Benvingut/da a La Pública! 🎉',
                content: '<h1>Benvingut/da!</h1><p>Gràcies per unir-te a La Pública. Descobreix totes les ofertes exclusives disponibles per a tu.</p>',
                ctaText: 'Veure ofertes',
                ctaUrl: '/ofertes',
                segmentationType: 'ALL' as const,
                priority: 10,
                totalRecipients: 150,
                sent: 150,
                delivered: 148,
                opened: 89,
                clicked: 45,
                converted: 12,
                createdById: userId
            },
            {
                name: 'Promoció Black Friday',
                slug: 'exemple-black-friday',
                description: 'Campanya promocional per Black Friday amb descomptes especials',
                type: 'EMAIL' as const,
                status: 'SCHEDULED' as const,
                subject: '🔥 Black Friday: Fins a 50% de descompte!',
                content: '<h1>Black Friday a La Pública</h1><p>Aprofita els millors descomptes de l\'any en serveis per a funcionaris.</p>',
                ctaText: 'Veure descomptes',
                ctaUrl: '/ofertes?tag=black-friday',
                scheduledAt: nextWeek,
                segmentationType: 'ALL' as const,
                priority: 20,
                totalRecipients: 0,
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                converted: 0,
                createdById: userId
            },
            {
                name: 'Newsletter setmanal',
                slug: 'exemple-newsletter',
                description: 'Newsletter amb les novetats i ofertes de la setmana',
                type: 'EMAIL' as const,
                status: 'COMPLETED' as const,
                subject: '📰 Les millors ofertes d\'aquesta setmana',
                content: '<h1>Newsletter setmanal</h1><p>Descobreix les noves ofertes i promocions disponibles.</p>',
                ctaText: 'Llegir més',
                ctaUrl: '/blog',
                startDate: lastWeek,
                endDate: now,
                segmentationType: 'SUBSCRIPTION' as const,
                priority: 5,
                totalRecipients: 500,
                sent: 500,
                delivered: 485,
                opened: 210,
                clicked: 78,
                converted: 23,
                createdById: userId
            },
            {
                name: 'Enquesta satisfacció',
                slug: 'exemple-enquesta',
                description: 'Enquesta de satisfacció per millorar els serveis',
                type: 'EMAIL' as const,
                status: 'DRAFT' as const,
                subject: '📊 La teva opinió ens importa',
                content: '<h1>Com ha estat la teva experiència?</h1><p>Ajuda\'ns a millorar completant aquesta breu enquesta.</p>',
                ctaText: 'Respondre enquesta',
                ctaUrl: '/enquesta',
                segmentationType: 'BEHAVIOR' as const,
                priority: 3,
                totalRecipients: 0,
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                converted: 0,
                createdById: userId
            },
            {
                name: 'Notificació noves ofertes',
                slug: 'exemple-push-ofertes',
                description: 'Notificació push per alertar de noves ofertes',
                type: 'PUSH' as const,
                status: 'ACTIVE' as const,
                subject: 'Nova oferta disponible! 🎁',
                content: 'Tens una nova oferta exclusiva esperant-te. No te la perdis!',
                ctaText: 'Veure oferta',
                ctaUrl: '/ofertes/nova',
                segmentationType: 'ALL' as const,
                priority: 15,
                totalRecipients: 320,
                sent: 320,
                delivered: 310,
                opened: 180,
                clicked: 95,
                converted: 28,
                createdById: userId
            },
            {
                name: 'Banner promocional hivern',
                slug: 'exemple-banner-hivern',
                description: 'Banner destacat per la campanya d\'hivern',
                type: 'BANNER' as const,
                status: 'ACTIVE' as const,
                subject: 'Ofertes d\'hivern',
                content: 'Descomptes exclusius en serveis de temporada',
                imageUrl: '/images/banners/hivern-2024.jpg',
                ctaText: 'Descobrir',
                ctaUrl: '/ofertes?temporada=hivern',
                startDate: now,
                endDate: nextWeek,
                segmentationType: 'ALL' as const,
                priority: 25,
                totalRecipients: 0,
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                converted: 0,
                createdById: userId
            }
        ]

        let created = 0
        for (const campaignData of exampleCampaigns) {
            await prisma.campaign.create({ data: campaignData })
            created++
        }

        return successResponse({
            message: `S'han creat ${created} campanyes d'exemple correctament.`,
            created
        })
    } catch (error) {
        console.error('Error seeding campaigns:', error)
        return errorResponse('Error creant campanyes d\'exemple', 500)
    }
}
