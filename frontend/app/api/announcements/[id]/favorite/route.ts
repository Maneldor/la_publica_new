import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/announcements/[id]/favorite
 * Afegir un anunci als favorits de l'usuari
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: anuncioId } = await params

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

    // Verificar que l'anunci existeix
    const anuncio = await prismaClient.anuncio.findUnique({
      where: { id: anuncioId },
      select: { id: true, title: true }
    })

    if (!anuncio) {
      return NextResponse.json({ error: 'Anunci no trobat' }, { status: 404 })
    }

    // Verificar si ja és favorit
    const existingFavorite = await prismaClient.anuncioFavorite.findUnique({
      where: {
        unique_user_anuncio_favorite: {
          userId: user.id,
          anuncioId: anuncioId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({
        success: true,
        isFavorite: true,
        message: 'Ja és als teus favorits'
      })
    }

    // Crear el favorit
    await prismaClient.anuncioFavorite.create({
      data: {
        userId: user.id,
        anuncioId: anuncioId
      }
    })

    // Incrementar el comptador de reaccions de l'anunci
    await prismaClient.anuncio.update({
      where: { id: anuncioId },
      data: { reactions: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      isFavorite: true,
      message: 'Afegit als favorits'
    })

  } catch (error) {
    console.error('Error afegint favorit:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/announcements/[id]/favorite
 * Eliminar un anunci dels favorits de l'usuari
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: anuncioId } = await params

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

    // Eliminar el favorit
    await prismaClient.anuncioFavorite.deleteMany({
      where: {
        userId: user.id,
        anuncioId: anuncioId
      }
    })

    // Decrementar el comptador de reaccions de l'anunci
    await prismaClient.anuncio.update({
      where: { id: anuncioId },
      data: { reactions: { decrement: 1 } }
    })

    return NextResponse.json({
      success: true,
      isFavorite: false,
      message: 'Eliminat dels favorits'
    })

  } catch (error) {
    console.error('Error eliminant favorit:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * GET /api/announcements/[id]/favorite
 * Comprovar si un anunci és favorit de l'usuari
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: anuncioId } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ isFavorite: false })
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ isFavorite: false })
    }

    const favorite = await prismaClient.anuncioFavorite.findUnique({
      where: {
        unique_user_anuncio_favorite: {
          userId: user.id,
          anuncioId: anuncioId
        }
      }
    })

    return NextResponse.json({
      isFavorite: !!favorite
    })

  } catch (error) {
    console.error('Error comprovant favorit:', error)
    return NextResponse.json({ isFavorite: false })
  }
}
