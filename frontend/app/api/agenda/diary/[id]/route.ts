import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener una entrada
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

    const entry = await prisma.agendaDiary.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entrada no trobada' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error obteniendo entrada:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar entrada
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

    const entry = await prisma.agendaDiary.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entrada no trobada' }, { status: 404 })
    }

    const updated = await prisma.agendaDiary.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content && { content: body.content }),
        ...(body.mood !== undefined && { mood: body.mood }),
        ...(body.tags && { tags: body.tags })
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando entrada:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar entrada
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

    const entry = await prisma.agendaDiary.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entrada no trobada' }, { status: 404 })
    }

    await prisma.agendaDiary.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando entrada:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
