import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

// GET - Get events for a date range
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDateStr = searchParams.get('start')
    const endDateStr = searchParams.get('end')

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Dates requerides (start i end)' }, { status: 400 })
    }

    const startDate = startOfDay(new Date(startDateStr))
    const endDate = endOfDay(new Date(endDateStr))

    const events = await prisma.agendaEvent.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    })

    // Format events with date as ISO string for client
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      time: event.time,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      category: event.category,
      location: event.location,
      reminder: event.reminder,
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Error obtenint esdeveniments per rang:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
