import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * POST /api/conversations/[id]/read
 * Marcar tots els missatges d'una conversa com a llegits
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const userId = session.user.id

    // Verificar que l'usuari és participant
    const isParticipant = await prismaClient.conversationParticipants.findFirst({
      where: {
        A: conversationId,
        B: userId
      }
    })

    if (!isParticipant) {
      return NextResponse.json({ error: 'No tens accés a aquesta conversa' }, { status: 403 })
    }

    // Marcar tots els missatges no llegits d'altres usuaris com a llegits
    const result = await prismaClient.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    })
  } catch (error) {
    console.error('Error marcant com llegit:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
