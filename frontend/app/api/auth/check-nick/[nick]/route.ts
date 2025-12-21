import { NextRequest, NextResponse } from 'next/server'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/auth/check-nick/[nick]
 * Verifica si un nick está disponible
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { nick: string } }
) {
  try {
    const nick = params.nick

    if (!nick || nick.length < 3) {
      return NextResponse.json({
        available: false,
        error: 'Nick massa curt (mínim 3 caràcters)'
      })
    }

    const existingUser = await prismaClient.user.findUnique({
      where: { nick },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingUser,
      nick
    })
  } catch (error) {
    console.error('Error verificant nick:', error)
    return NextResponse.json({
      available: true,
      error: 'Error verificant nick'
    })
  }
}
