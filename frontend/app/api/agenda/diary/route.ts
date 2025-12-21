import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener entradas del diario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '30')

    if (dateStr) {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)

      const entries = await prisma.agendaDiary.findMany({
        where: {
          userId: session.user.id,
          date
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(entries)
    }

    // Obtener últimas entradas
    const entries = await prisma.agendaDiary.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error obteniendo diario:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear entrada de diario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date, title, content, mood, tags = [] } = body

    if (!content) {
      return NextResponse.json({ error: 'Contingut requerit' }, { status: 400 })
    }

    const entryDate = date ? new Date(date) : new Date()
    entryDate.setHours(0, 0, 0, 0)

    const entry = await prisma.agendaDiary.create({
      data: {
        userId: session.user.id,
        date: entryDate,
        title,
        content,
        mood,
        tags
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creando entrada de diario:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
