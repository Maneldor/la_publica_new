import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/announcements/[id]/sold
 * Marcar un anuncio como vendido
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Obtener usuario actual
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Buscar el anuncio
    const anuncio = await prismaClient.anuncio.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ],
        deletedAt: null,
      }
    })

    if (!anuncio) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el propietario
    if (anuncio.authorId !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este anuncio' },
        { status: 403 }
      )
    }

    // Marcar como vendido
    const updatedAnuncio = await prismaClient.anuncio.update({
      where: { id: anuncio.id },
      data: { status: 'SOLD' }
    })

    return NextResponse.json({
      success: true,
      data: updatedAnuncio,
      message: 'Anuncio marcado como vendido'
    })

  } catch (error) {
    console.error('Error al marcar anuncio como vendido:', error)
    return NextResponse.json(
      { error: 'Error al actualizar anuncio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
