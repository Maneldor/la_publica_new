import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener eventos de una fecha
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    
    if (!dateStr) {
      return NextResponse.json({ error: 'Data requerida' }, { status: 400 })
    }

    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)

    const events = await prisma.agendaEvent.findMany({
      where: {
        userId: session.user.id,
        date: date
      },
      orderBy: { time: 'asc' }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error obteniendo eventos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear evento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date, time, title, description } = body

    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)

    const event = await prisma.agendaEvent.create({
      data: {
        userId: session.user.id,
        date: eventDate,
        time,
        title,
        description
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creando evento:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}