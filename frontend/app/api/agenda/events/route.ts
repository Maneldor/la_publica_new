import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener eventos (todos o filtrados por fecha)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    // Si no hay fecha, retornar todos los eventos del usuario
    const whereClause: { userId: string; date?: Date } = {
      userId: session.user.id
    }

    if (dateStr) {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      whereClause.date = date
    }

    const events = await prisma.agendaEvent.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    })

    // Formatear para el frontend (reminder como boolean)
    const formattedEvents = events.map(event => ({
      ...event,
      date: event.date.toISOString(),
      reminder: event.reminder !== 'none' && event.reminder !== null
    }))

    return NextResponse.json(formattedEvents)
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
    const {
      date,
      time,
      title,
      description,
      startTime,
      endTime,
      allDay,
      category,
      location,
      reminder,
      repeat,
      notification
    } = body

    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)

    // Convertir reminder boolean a string para la BD
    const reminderValue = typeof reminder === 'boolean'
      ? (reminder ? '15min' : 'none')
      : (reminder || 'none')

    const event = await prisma.agendaEvent.create({
      data: {
        userId: session.user.id,
        date: eventDate,
        time: time || startTime || '00:00',
        startTime: startTime || time || null,
        endTime: endTime || null,
        allDay: allDay || false,
        title,
        description: description || null,
        category: category || 'personal',
        location: location || null,
        reminder: reminderValue,
        repeat: repeat || 'none',
        notification: notification || 'none'
      }
    })

    // Formatear respuesta
    const formattedEvent = {
      ...event,
      date: event.date.toISOString(),
      reminder: event.reminder !== 'none' && event.reminder !== null
    }

    return NextResponse.json(formattedEvent)
  } catch (error) {
    console.error('Error creando evento:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}