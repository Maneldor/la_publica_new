import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, startOfDay, endOfDay } from 'date-fns'

// GET - Get events for the next 7 days
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const today = startOfDay(new Date())
    const weekEnd = endOfDay(addDays(today, 7))

    const events = await prisma.agendaEvent.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lte: weekEnd,
        },
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
      take: 20,
    })

    // Format events with date as ISO string for client
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      time: event.time || event.startTime || null,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      category: event.category,
      location: event.location,
      reminder: event.reminder !== 'none' && event.reminder !== null,
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Error obteniendo eventos de la semana:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
