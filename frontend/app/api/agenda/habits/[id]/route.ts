import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Actualizar hábito
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
    const { name, emoji } = body

    const habit = await prisma.agendaHabit.updateMany({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: { name, emoji }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error actualizando hábito:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar hábito (marcar como inactivo)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    await prisma.agendaHabit.updateMany({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando hábito:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}