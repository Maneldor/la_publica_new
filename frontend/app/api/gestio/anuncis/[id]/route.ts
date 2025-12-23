import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'
import { calculateExpirationDate } from '@/lib/services/adExpirationService'

// Rols permesos per moderar anuncis (ADMIN_GESTIO i CRM_CONTINGUT, més superiors)
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO', 'CRM_CONTINGUT']

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/gestio/anuncis/[id]
 * Obtenir detall d'un anunci per moderació
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const { id } = await params

    const anunci = await prismaClient.anuncio.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nick: true,
            email: true,
            image: true,
            createdAt: true,
            _count: {
              select: {
                anuncios: true
              }
            }
          }
        },
      }
    })

    if (!anunci) {
      return NextResponse.json({ error: 'Anunci no trobat' }, { status: 404 })
    }

    return NextResponse.json({ anunci })

  } catch (error) {
    console.error('Error fetching anunci:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/gestio/anuncis/[id]
 * Moderar anunci: aprovar o rebutjar
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, name: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat. Només CRM Contingut pot moderar anuncis.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acció no vàlida. Ha de ser "approve" o "reject"' }, { status: 400 })
    }

    if (action === 'reject' && !rejectionReason?.trim()) {
      return NextResponse.json({ error: 'El motiu del rebuig és obligatori' }, { status: 400 })
    }

    const anunci = await prismaClient.anuncio.findUnique({
      where: { id },
      include: { author: true }
    })

    if (!anunci) {
      return NextResponse.json({ error: 'Anunci no trobat' }, { status: 404 })
    }

    if (anunci.status !== 'PENDING') {
      return NextResponse.json({
        error: `Aquest anunci ja ha estat moderat (status: ${anunci.status})`
      }, { status: 400 })
    }

    // Actualitzar anunci dins una transacció
    const now = new Date()
    const result = await prismaClient.$transaction(async (tx) => {
      // Actualitzar status de l'anunci
      const updatedAnunci = await tx.anuncio.update({
        where: { id },
        data: {
          status: action === 'approve' ? 'PUBLISHED' : 'ARCHIVED',
          publishAt: action === 'approve' ? now : null,
          publishedAt: action === 'approve' ? now : null,
          expiresAt: action === 'approve' ? calculateExpirationDate(now) : null,
          // Reset flags de notificació
          expirationWarning7d: false,
          expirationWarning24h: false,
          // Guardar info de moderació als tags o a un camp adequat
          tags: action === 'reject'
            ? [...(anunci.tags || []), `rejected:${rejectionReason}`]
            : anunci.tags,
        }
      })

      // Crear notificació per l'autor
      await tx.notification.create({
        data: {
          userId: anunci.authorId,
          type: action === 'approve' ? 'SUCCESS' : 'WARNING',
          title: action === 'approve'
            ? 'Anunci aprovat!'
            : 'Anunci no aprovat',
          message: action === 'approve'
            ? `El teu anunci "${anunci.title}" ha estat aprovat i ja és visible per a tothom.`
            : `El teu anunci "${anunci.title}" no ha estat aprovat. Motiu: ${rejectionReason}`,
          actionUrl: `/dashboard/anuncis`,
          isRead: false,
        }
      })

      return updatedAnunci
    })

    return NextResponse.json({
      success: true,
      anunci: result,
      message: action === 'approve'
        ? 'Anunci aprovat i publicat correctament'
        : 'Anunci rebutjat. L\'autor ha estat notificat.',
    })

  } catch (error) {
    console.error('Error moderating anunci:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
