import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { checkAdForFraud, recordFraudAlerts } from '@/lib/services/adFraudDetection'
import { calculateExpirationDate } from '@/lib/services/adExpirationService'

/**
 * GET /api/announcements
 * Obtiene lista de anuncios públicos (usuarios autenticados)
 * Solo muestra anuncios con status 'ACTIVE' o 'PUBLISHED'
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autoritzat. Cal iniciar sessió.' },
        { status: 401 }
      )
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    // Construir filtros - solo anuncios publicados (no expirados)
    const where: any = {
      deletedAt: null,
      status: 'PUBLISHED',
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
    }

    if (type && type !== 'all') {
      where.type = type.toUpperCase()
    }

    // Obtener anuncios con paginación
    const [anuncios, total] = await Promise.all([
      prismaClient.anuncio.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          type: true,
          priority: true,
          status: true,
          audience: true,
          publishAt: true,
          expiresAt: true,
          imageUrl: true,
          attachmentUrl: true,
          externalUrl: true,
          tags: true,
          isSticky: true,
          allowComments: true,
          slug: true,
          views: true,
          reactions: true,
          commentsCount: true,
          sharesCount: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          community: {
            select: {
              id: true,
              nombre: true,
            }
          },
          _count: {
            select: {
              comments: true,
            }
          }
        },
        orderBy: [
          { isSticky: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.anuncio.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: anuncios,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error al obtenir anuncis:', error)
    return NextResponse.json(
      { error: 'Error al obtenir anuncis', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/announcements
 * Crear un nuevo anuncio (usuarios autenticados)
 * Los anuncios creados por usuarios normales van a status 'PENDING' para moderación
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autoritzat. Cal iniciar sessió.' },
        { status: 401 }
      )
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true, userType: true, adWarningCount: true, adBlockedUntil: true, isAdBanned: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuari no trobat' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Si es admin, el anuncio se publica directamente
    // Si es usuario normal, va a pending para moderación
    const isAdmin = user.role === 'ADMIN' || user.userType === 'ADMIN'

    // Verificar frau abans de crear l'anunci (només per usuaris no-admin)
    if (!isAdmin) {
      const fraudCheck = await checkAdForFraud(
        user.id,
        body.title,
        body.content || '',
        {
          externalUrl: body.externalUrl,
          price: body.metadata?.price,
          category: body.metadata?.category
        }
      )

      // Si l'usuari està bloquejat, rebutjar
      if (fraudCheck.shouldBlock && fraudCheck.blockReason) {
        return NextResponse.json(
          {
            error: 'No pots publicar anuncis',
            details: fraudCheck.blockReason,
            blocked: true
          },
          { status: 403 }
        )
      }

      // Si hi ha alertes però no bloqueig, crear l'anunci però registrar les alertes
      if (fraudCheck.alerts.length > 0) {
        // Les alertes es registraran després de crear l'anunci
        // Guardem les alertes per processar-les després
        (body as any)._fraudAlerts = fraudCheck
      }
    }

    const initialStatus = isAdmin ? (body.status || 'PUBLISHED') : 'PENDING'

    // Normalitzar tipus i audiència a majúscules
    const anuncioType = (body.type || 'GENERAL').toUpperCase()
    const anuncioAudience = (body.audience || 'ALL').toUpperCase()

    // Calcular dates d'expiració si es publica directament
    const now = new Date()
    const shouldSetExpiration = initialStatus === 'PUBLISHED'

    // Crear anuncio
    const nuevoAnuncio = await prismaClient.anuncio.create({
      data: {
        title: body.title,
        content: body.content || '',
        summary: body.summary || '',
        type: anuncioType,
        priority: body.priority || 0,
        status: initialStatus,
        audience: anuncioAudience,
        targetCommunities: body.targetCommunities || [],
        targetRoles: body.targetRoles || [],
        publishAt: body.publishAt ? new Date(body.publishAt) : (shouldSetExpiration ? now : null),
        publishedAt: shouldSetExpiration ? now : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : (shouldSetExpiration ? calculateExpirationDate(now) : null),
        sendNotification: body.sendNotification || false,
        notificationChannels: body.notificationChannels || [],
        imageUrl: body.imageUrl || null,
        attachmentUrl: body.attachmentUrl || null,
        externalUrl: body.externalUrl || null,
        tags: body.tags || [],
        isSticky: body.isSticky || false,
        allowComments: body.allowComments !== false,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        community: {
          select: {
            id: true,
            nombre: true,
          }
        }
      }
    })

    // Registrar alertes de frau si n'hi ha
    if ((body as any)._fraudAlerts) {
      const fraudCheck = (body as any)._fraudAlerts
      try {
        await recordFraudAlerts(
          user.id,
          nuevoAnuncio.id,
          fraudCheck.alerts,
          false, // No bloquejar (ja hem passat la verificació inicial)
          undefined,
          false
        )
        console.log(`[FRAUD] Registrades ${fraudCheck.alerts.length} alertes per anunci ${nuevoAnuncio.id}`)
      } catch (fraudError) {
        console.error('Error registrant alertes de frau:', fraudError)
      }
    }

    // Si l'anunci va a PENDING, notificar als moderadors (ADMIN_GESTIO i CRM_CONTINGUT)
    if (initialStatus === 'PENDING') {
      try {
        // Obtenir moderadors (ADMIN_GESTIO i CRM_CONTINGUT)
        const moderators = await prismaClient.user.findMany({
          where: {
            role: { in: ['ADMIN_GESTIO', 'CRM_CONTINGUT'] },
            deletedAt: null,
          },
          select: { id: true }
        })

        // Missatge amb avís de frau si hi ha alertes
        const hasFraudAlerts = (body as any)._fraudAlerts?.alerts?.length > 0
        const alertSuffix = hasFraudAlerts ? ' ⚠️ Alertes de frau detectades' : ''

        // Crear notificacions per tots els moderadors
        if (moderators.length > 0) {
          await prismaClient.notification.createMany({
            data: moderators.map(mod => ({
              userId: mod.id,
              type: hasFraudAlerts ? 'ALERT' : 'INFO',
              title: `Nou anunci pendent de moderació${alertSuffix}`,
              message: `L'usuari ${session.user?.name || 'Usuari'} ha creat un nou anunci: "${body.title}"`,
              actionUrl: '/gestio/contingut/anuncis',
              isRead: false,
            }))
          })
        }
      } catch (notifError) {
        // No fallar si les notificacions fallen
        console.error('Error creant notificacions per moderadors:', notifError)
      }
    }

    return NextResponse.json({
      success: true,
      data: nuevoAnuncio,
      message: isAdmin
        ? 'Anunci creat i publicat correctament'
        : 'Anunci creat correctament. Pendent de moderació.'
    })

  } catch (error) {
    console.error('Error al crear anunci:', error)
    return NextResponse.json(
      { error: 'Error al crear anunci', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    )
  }
}
