import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { renewAd } from '@/lib/services/adExpirationService'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/announcements/[id]/renew
 * Renovar un anunci (extendre data d'expiració per 60 dies)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autoritzat. Cal iniciar sessió.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Obtenir usuari actual
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuari no trobat' },
        { status: 404 }
      )
    }

    // Utilitzar el servei centralitzat de renovació
    const result = await renewAd(id, user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      expiresAt: result.expiresAt
    })

  } catch (error) {
    console.error('Error al renovar anunci:', error)
    return NextResponse.json(
      { error: 'Error al renovar anunci', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    )
  }
}
