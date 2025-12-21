import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener un libro
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

    const book = await prisma.agendaBook.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Llibre no trobat' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error obteniendo libro:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar libro
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

    const book = await prisma.agendaBook.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Llibre no trobat' }, { status: 404 })
    }

    // Gestionar cambios de estado
    const updateData: Record<string, unknown> = { ...body }

    if (body.status === 'reading' && book.status !== 'reading') {
      updateData.startDate = new Date()
    }

    if (body.status === 'completed' && book.status !== 'completed') {
      updateData.finishDate = new Date()
      if (book.totalPages) {
        updateData.currentPage = book.totalPages
      }
    }

    const updated = await prisma.agendaBook.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando libro:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar libro
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

    const book = await prisma.agendaBook.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!book) {
      return NextResponse.json({ error: 'Llibre no trobat' }, { status: 404 })
    }

    await prisma.agendaBook.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando libro:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
