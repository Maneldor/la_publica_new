import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Abrir una cápsula (si es el momento)
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

    const capsule = await prisma.agendaTimeCapsule.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!capsule) {
      return NextResponse.json({ error: 'Càpsula no trobada' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (capsule.openDate > today && !capsule.isOpened) {
      return NextResponse.json({
        error: 'Encara no és el moment d\'obrir aquesta càpsula',
        openDate: capsule.openDate
      }, { status: 403 })
    }

    // Marcar como abierta si no lo está
    if (!capsule.isOpened) {
      await prisma.agendaTimeCapsule.update({
        where: { id },
        data: {
          isOpened: true,
          openedAt: new Date()
        }
      })
    }

    return NextResponse.json(capsule)
  } catch (error) {
    console.error('Error obteniendo cápsula:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar cápsula
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

    const capsule = await prisma.agendaTimeCapsule.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!capsule) {
      return NextResponse.json({ error: 'Càpsula no trobada' }, { status: 404 })
    }

    await prisma.agendaTimeCapsule.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando cápsula:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
