import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { getAlertStats } from '@/lib/services/adFraudDetection'

// Rols autoritzats per gestionar alertes
const AUTHORIZED_ROLES = ['ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT']

/**
 * GET /api/gestio/anuncis/alertes
 * Llistar alertes de frau amb filtres i paginació
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user || !AUTHORIZED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'No tens permisos per accedir a aquesta secció' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'pending', 'resolved', 'all'
    const severity = searchParams.get('severity') // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    const type = searchParams.get('type') // AdAlertType
    const userId = searchParams.get('userId')
    const statsOnly = searchParams.get('stats') === 'true'

    // Si només volem estadístiques
    if (statsOnly) {
      const stats = await getAlertStats()
      return NextResponse.json({ success: true, stats })
    }

    // Construir filtres
    const where: any = {}

    if (status === 'pending') {
      where.isResolved = false
    } else if (status === 'resolved') {
      where.isResolved = true
    }

    if (severity) {
      where.severity = severity
    }

    if (type) {
      where.type = type
    }

    if (userId) {
      where.userId = userId
    }

    // Obtenir alertes amb paginació
    const [alerts, total, stats] = await Promise.all([
      prismaClient.adAlert.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nick: true,
              email: true,
              image: true,
              adWarningCount: true,
              adBlockedUntil: true,
              isAdBanned: true,
            }
          },
          anuncio: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              imageUrl: true,
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              nick: true,
            }
          }
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.adAlert.count({ where }),
      getAlertStats()
    ])

    return NextResponse.json({
      success: true,
      data: alerts,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error obtenint alertes:', error)
    return NextResponse.json(
      { error: 'Error del servidor', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestio/anuncis/alertes
 * Crear una alerta manual (per reportar un usuari)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user || !AUTHORIZED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'No tens permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, anuncioId, type, severity, description, metadata } = body

    if (!userId || !type || !description) {
      return NextResponse.json({ error: 'Falten camps obligatoris' }, { status: 400 })
    }

    const alert = await prismaClient.adAlert.create({
      data: {
        userId,
        anuncioId,
        type,
        severity: severity || 'MEDIUM',
        description,
        metadata,
        actionTaken: 'MANUAL_REVIEW'
      },
      include: {
        user: {
          select: { id: true, name: true, nick: true, email: true }
        },
        anuncio: {
          select: { id: true, title: true }
        }
      }
    })

    // Incrementar comptador d'avisos de l'usuari
    await prismaClient.user.update({
      where: { id: userId },
      data: { adWarningCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alerta creada correctament'
    })

  } catch (error) {
    console.error('Error creant alerta:', error)
    return NextResponse.json(
      { error: 'Error del servidor', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    )
  }
}
