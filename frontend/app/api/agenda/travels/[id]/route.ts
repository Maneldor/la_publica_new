import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Actualizar viaje
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

    const travel = await prisma.agendaTravel.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!travel) {
      return NextResponse.json({ error: 'Viatge no trobat' }, { status: 404 })
    }

    const updated = await prisma.agendaTravel.update({
      where: { id },
      data: body
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando viaje:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar viaje
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

    const travel = await prisma.agendaTravel.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!travel) {
      return NextResponse.json({ error: 'Viatge no trobat' }, { status: 404 })
    }

    await prisma.agendaTravel.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando viaje:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
