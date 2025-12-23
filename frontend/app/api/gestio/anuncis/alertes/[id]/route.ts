import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

const AUTHORIZED_ROLES = ['ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT']

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/gestio/anuncis/alertes/[id]
 * Obtenir detalls d'una alerta
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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

    const alert = await prismaClient.adAlert.findUnique({
      where: { id },
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
            createdAt: true,
            _count: {
              select: { anunciosCreados: true }
            }
          }
        },
        anuncio: {
          select: {
            id: true,
            title: true,
            content: true,
            slug: true,
            status: true,
            imageUrl: true,
            externalUrl: true,
            createdAt: true,
          }
        },
        resolvedBy: {
          select: { id: true, name: true, nick: true }
        }
      }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alerta no trobada' }, { status: 404 })
    }

    // Obtenir historial d'alertes de l'usuari
    const userAlertHistory = await prismaClient.adAlert.findMany({
      where: { userId: alert.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        severity: true,
        description: true,
        isResolved: true,
        resolution: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: alert,
      userHistory: userAlertHistory
    })

  } catch (error) {
    console.error('Error obtenint alerta:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/gestio/anuncis/alertes/[id]
 * Actualitzar/Resolver una alerta
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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
    const { action, resolution, blockDays, notes } = body

    // action: 'dismiss' | 'warn' | 'block_temp' | 'block_perm' | 'delete_ad'

    const alert = await prismaClient.adAlert.findUnique({
      where: { id },
      include: { user: true, anuncio: true }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alerta no trobada' }, { status: 404 })
    }

    let userUpdate: any = {}
    let anuncioUpdate: any = null
    let resolutionText = resolution || ''

    switch (action) {
      case 'dismiss':
        // Descartar l'alerta sense acció
        resolutionText = resolution || 'Alerta descartada - Sense infracció'
        break

      case 'warn':
        // Avís a l'usuari (ja s'ha comptat quan es va crear)
        resolutionText = resolution || 'Avís emès a l\'usuari'
        break

      case 'block_temp':
        // Bloqueig temporal
        const days = blockDays || 7
        userUpdate = {
          adBlockedUntil: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          adBlockReason: resolution || `Bloqueig temporal de ${days} dies per infraccions`,
        }
        resolutionText = `Bloqueig temporal: ${days} dies`
        break

      case 'block_perm':
        // Bloqueig permanent
        userUpdate = {
          isAdBanned: true,
          adBlockReason: resolution || 'Bloqueig permanent per infraccions greus',
        }
        resolutionText = 'Bloqueig permanent'
        break

      case 'delete_ad':
        // Eliminar l'anunci associat
        if (alert.anuncioId) {
          anuncioUpdate = {
            status: 'REJECTED',
            deletedAt: new Date(),
          }
          resolutionText = resolution || 'Anunci eliminat'
        }
        break

      case 'unblock':
        // Desbloquejar usuari
        userUpdate = {
          isAdBanned: false,
          adBlockedUntil: null,
          adBlockReason: null,
          adWarningCount: 0,
        }
        resolutionText = 'Usuari desbloquejat'
        break

      default:
        resolutionText = resolution || 'Alerta revisada'
    }

    // Actualitzar l'usuari si cal
    if (Object.keys(userUpdate).length > 0) {
      await prismaClient.user.update({
        where: { id: alert.userId },
        data: userUpdate
      })
    }

    // Actualitzar l'anunci si cal
    if (anuncioUpdate && alert.anuncioId) {
      await prismaClient.anuncio.update({
        where: { id: alert.anuncioId },
        data: anuncioUpdate
      })
    }

    // Marcar l'alerta com a resolta
    const updatedAlert = await prismaClient.adAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedById: user.id,
        resolution: resolutionText,
      },
      include: {
        user: {
          select: { id: true, name: true, nick: true, email: true, isAdBanned: true, adBlockedUntil: true }
        },
        resolvedBy: {
          select: { id: true, name: true, nick: true }
        }
      }
    })

    // Crear notificació a l'usuari afectat si hi ha acció
    if (action !== 'dismiss') {
      try {
        await prismaClient.notification.create({
          data: {
            userId: alert.userId,
            type: action === 'block_perm' || action === 'block_temp' ? 'ALERT' : 'WARNING',
            title: action === 'block_perm' ? 'Compte bloquejat per publicar anuncis' :
                   action === 'block_temp' ? `Compte bloquejat temporalment (${blockDays || 7} dies)` :
                   action === 'delete_ad' ? 'Anunci eliminat' :
                   'Avís sobre els teus anuncis',
            message: resolutionText,
            isRead: false,
          }
        })
      } catch (notifError) {
        console.error('Error creant notificació:', notifError)
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
      message: `Alerta resolta: ${resolutionText}`
    })

  } catch (error) {
    console.error('Error actualitzant alerta:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/gestio/anuncis/alertes/[id]
 * Eliminar una alerta (només admins)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Només els admins poden eliminar alertes' }, { status: 403 })
    }

    await prismaClient.adAlert.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Alerta eliminada'
    })

  } catch (error) {
    console.error('Error eliminant alerta:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
