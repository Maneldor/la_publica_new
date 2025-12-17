import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Crear tarea
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { goalId, text } = body

    // Verificar que el goal pertenece al usuario
    const goal = await prisma.agendaGoal.findFirst({
      where: { id: goalId, userId: session.user.id }
    })

    if (!goal) {
      return NextResponse.json({ error: 'Objectiu no trobat' }, { status: 404 })
    }

    // Obtener la última posición
    const lastTask = await prisma.agendaTask.findFirst({
      where: { goalId },
      orderBy: { position: 'desc' }
    })

    const task = await prisma.agendaTask.create({
      data: {
        goalId,
        text,
        position: (lastTask?.position ?? -1) + 1
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creando tarea:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}