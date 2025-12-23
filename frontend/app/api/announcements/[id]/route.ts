import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/announcements/[id]
 * Obtenir detall d'un anunci publicat (usuaris autenticats)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autoritzat. Cal iniciar sessió.' },
        { status: 401 }
      )
    }

    const { id } = await params

    console.log('🔍 [API] Buscant anunci amb ID/slug:', id)

    // Buscar per ID o per slug - sense restriccions de status per usuaris autenticats
    const anunci = await prismaClient.anuncio.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ],
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nick: true,
            email: true,
            image: true,
            createdAt: true,
          }
        },
        community: {
          select: {
            id: true,
            nombre: true,
          }
        },
      }
    })

    if (!anunci) {
      return NextResponse.json(
        { error: 'Anunci no trobat' },
        { status: 404 }
      )
    }

    // Incrementar comptador de vistes
    await prismaClient.anuncio.update({
      where: { id: anunci.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: anunci
    })

  } catch (error) {
    console.error('Error al obtenir anunci:', error)
    return NextResponse.json(
      { error: 'Error al obtenir anunci', details: error instanceof Error ? error.message : 'Error desconegut' },
      { status: 500 }
    )
  }
}
