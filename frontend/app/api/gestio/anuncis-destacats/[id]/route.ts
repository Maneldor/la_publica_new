import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import {
  getFeaturedAdById,
  updateFeaturedAd,
  deleteFeaturedAd,
  getAdAnalytics
} from '@/lib/services/featuredAdsService'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_MANAGER', 'CRM_VENDES', 'CRM_CONTINGUT']

interface RouteParams {
  params: Promise<{ id: string }>
}

async function checkAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'No autoritzat', status: 401 }
  }

  const user = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true }
  })

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return { error: 'Accés denegat', status: 403 }
  }

  return { userId: user.id }
}

/**
 * GET /api/gestio/anuncis-destacats/[id]
 * Obtenir detall amb analytics
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    const anunci = await getFeaturedAdById(id)

    if (!anunci) {
      return NextResponse.json({ error: 'Anunci no trobat' }, { status: 404 })
    }

    const analytics = await getAdAnalytics(id, 30)

    return NextResponse.json({ anunci, analytics })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/gestio/anuncis-destacats/[id]
 * Actualitzar anunci
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Convertir dates si venen com a string
    if (body.startsAt && typeof body.startsAt === 'string') {
      body.startsAt = new Date(body.startsAt)
    }

    const anunci = await updateFeaturedAd(id, body)

    return NextResponse.json({ anunci })

  } catch (error) {
    console.error('Error actualitzant:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/gestio/anuncis-destacats/[id]
 * Eliminar anunci
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    await deleteFeaturedAd(id)

    return NextResponse.json({ message: 'Anunci eliminat correctament' })

  } catch (error) {
    console.error('Error eliminant:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
