import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { toggleAutoRenew } from '@/lib/services/adExpirationService'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/announcements/[id]/auto-renew
 * Activa/desactiva l'auto-renovació d'un anunci
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
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Camp "enabled" requerit (boolean)' },
        { status: 400 }
      )
    }

    const result = await toggleAutoRenew(id, user.id, enabled)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      autoRenew: enabled
    })

  } catch (error) {
    console.error('Error canviant auto-renovació:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/announcements/[id]/auto-renew
 * Obtenir l'estat d'auto-renovació d'un anunci
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const anuncio = await prismaClient.anuncio.findUnique({
      where: { id },
      select: {
        autoRenew: true,
        expiresAt: true,
        renewalCount: true,
        lastRenewalAt: true
      }
    })

    if (!anuncio) {
      return NextResponse.json({ error: 'Anunci no trobat' }, { status: 404 })
    }

    return NextResponse.json({
      autoRenew: anuncio.autoRenew,
      expiresAt: anuncio.expiresAt,
      renewalCount: anuncio.renewalCount,
      lastRenewalAt: anuncio.lastRenewalAt
    })

  } catch (error) {
    console.error('Error obtenint auto-renovació:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
