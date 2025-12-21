import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener un reto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id } = await params

    const challenge = await prisma.agendaChallenge.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        logs: {
          orderBy: { day: 'asc' }
        }
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Repte no trobat' }, { status: 404 })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Error obteniendo reto:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar un reto o marcar un día
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verificar que el reto pertenece al usuario
    const challenge = await prisma.agendaChallenge.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: { logs: true }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Repte no trobat' }, { status: 404 })
    }

    // Si se está marcando un día
    if (body.day !== undefined && body.completed !== undefined) {
      await prisma.agendaChallengeLog.updateMany({
        where: {
          challengeId: id,
          day: body.day
        },
        data: {
          completed: body.completed,
          notes: body.notes
        }
      })

      // Verificar si se completaron los 21 días
      const logs = await prisma.agendaChallengeLog.findMany({
        where: { challengeId: id }
      })

      const allCompleted = logs.every(log => log.completed)
      if (allCompleted) {
        await prisma.agendaChallenge.update({
          where: { id },
          data: {
            isCompleted: true,
            completedAt: new Date()
          }
        })
      }
    }

    // Si se está actualizando el reto
    if (body.title || body.description !== undefined || body.isActive !== undefined) {
      await prisma.agendaChallenge.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.isActive !== undefined && { isActive: body.isActive })
        }
      })
    }

    const updated = await prisma.agendaChallenge.findUnique({
      where: { id },
      include: { logs: { orderBy: { day: 'asc' } } }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando reto:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar un reto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id } = await params

    const challenge = await prisma.agendaChallenge.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Repte no trobat' }, { status: 404 })
    }

    await prisma.agendaChallenge.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando reto:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
