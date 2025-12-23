import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/announcements/favorites
 * Obtenir els IDs dels anuncis favorits de l'usuari actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ favoriteIds: [] })
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ favoriteIds: [] })
    }

    // Obtenir tots els favorits de l'usuari
    const favorites = await prismaClient.anuncioFavorite.findMany({
      where: { userId: user.id },
      select: { anuncioId: true },
      orderBy: { createdAt: 'desc' }
    })

    const favoriteIds = favorites.map(f => f.anuncioId)

    return NextResponse.json({
      success: true,
      favoriteIds,
      count: favoriteIds.length
    })

  } catch (error) {
    console.error('Error obtenint favorits:', error)
    return NextResponse.json({ favoriteIds: [] })
  }
}
