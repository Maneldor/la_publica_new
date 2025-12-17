import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Actualizar tarea (toggle completed o editar texto)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()

    // Verificar que la tarea pertenece al usuario
    const existingTask = await prisma.agendaTask.findFirst({
      where: { id: params.id },
      include: { goal: true }
    })

    if (!existingTask || existingTask.goal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Tasca no trobada' }, { status: 404 })
    }

    const task = await prisma.agendaTask.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error actualizando tarea:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar tarea
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar que la tarea pertenece al usuario
    const existingTask = await prisma.agendaTask.findFirst({
      where: { id: params.id },
      include: { goal: true }
    })

    if (!existingTask || existingTask.goal.userId !== session.user.id) {
      return NextResponse.json({ error: 'Tasca no trobada' }, { status: 404 })
    }

    await prisma.agendaTask.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando tarea:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}