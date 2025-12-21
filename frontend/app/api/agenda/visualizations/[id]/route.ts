import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Actualizar visualización
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

    const visualization = await prisma.agendaVisualization.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!visualization) {
      return NextResponse.json({ error: 'Visualització no trobada' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { ...body }

    // Si se marca como lograda
    if (body.isAchieved === true && !visualization.isAchieved) {
      updateData.achievedAt = new Date()
    }

    const updated = await prisma.agendaVisualization.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando visualización:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar visualización
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

    const visualization = await prisma.agendaVisualization.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!visualization) {
      return NextResponse.json({ error: 'Visualització no trobada' }, { status: 404 })
    }

    await prisma.agendaVisualization.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando visualización:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
