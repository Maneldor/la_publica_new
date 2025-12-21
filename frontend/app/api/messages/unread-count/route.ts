import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/messages/unread-count
 * Obtenir el nombre total de missatges no llegits de l'usuari
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const userId = session.user.id

    // Comptar missatges no llegits en totes les converses on l'usuari és participant
    const count = await prismaClient.message.count({
      where: {
        conversation: {
          ConversationParticipants: {
            some: { B: userId }
          }
        },
        senderId: { not: userId },
        isRead: false
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error comptant missatges:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
