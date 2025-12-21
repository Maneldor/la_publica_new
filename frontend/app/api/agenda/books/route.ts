import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener libros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const books = await prisma.agendaBook.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status })
      },
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error obteniendo libros:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Añadir libro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { title, author, status = 'to_read', totalPages } = body

    if (!title) {
      return NextResponse.json({ error: 'Títol requerit' }, { status: 400 })
    }

    const book = await prisma.agendaBook.create({
      data: {
        userId: session.user.id,
        title,
        author,
        status,
        totalPages,
        currentPage: 0,
        ...(status === 'reading' && { startDate: new Date() })
      }
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error creando libro:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
