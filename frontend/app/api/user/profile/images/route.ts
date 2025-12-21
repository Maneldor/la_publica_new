import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * PATCH /api/user/profile/images
 * Actualitza les imatges del perfil de l'usuari actual
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('📸 [Profile Images] PATCH called')
    console.log('📸 [Profile Images] Session:', session?.user?.id ? 'OK' : 'NO SESSION')

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📸 [Profile Images] Body received:', JSON.stringify(body).substring(0, 200))

    const { image, coverImage } = body

    // Construir objecte d'actualització
    const updateData: Record<string, string | null> = {}

    if (image !== undefined) {
      updateData.image = image
    }

    if (coverImage !== undefined) {
      updateData.coverImage = coverImage
    }

    console.log('📸 [Profile Images] Update data:', updateData)

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No s'han proporcionat dades per actualitzar" },
        { status: 400 }
      )
    }

    // Actualitzar usuari
    console.log('📸 [Profile Images] Updating user:', session.user.id)
    const updatedUser = await prismaClient.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        image: true,
        coverImage: true,
      }
    })
    console.log('📸 [Profile Images] User updated:', updatedUser)

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error: any) {
    console.error('📸 [Profile Images] ERROR:', error)
    console.error('📸 [Profile Images] Error message:', error?.message)
    console.error('📸 [Profile Images] Error code:', error?.code)
    console.error('📸 [Profile Images] Error stack:', error?.stack)
    return NextResponse.json({
      error: 'Error del servidor',
      details: error?.message || 'Unknown error',
      code: error?.code
    }, { status: 500 })
  }
}

/**
 * GET /api/user/profile/images
 * Obté les imatges del perfil de l'usuari actual
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        image: true,
        coverImage: true,
        coverColor: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      images: {
        avatar: user.image,
        cover: user.coverImage,
        coverColor: user.coverColor,
      }
    })

  } catch (error) {
    console.error('Error obtenint imatges del perfil:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
