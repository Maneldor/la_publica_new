import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper para actualizar evento
async function updateEvent(request: NextRequest, eventId: string) {
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

  // Build update data only with provided fields
  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (date !== undefined) {
    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)
    updateData.date = eventDate
  }
  if (time !== undefined) updateData.time = time
  if (startTime !== undefined) {
    updateData.startTime = startTime
    updateData.time = startTime // Keep legacy field in sync
  }
  if (endTime !== undefined) updateData.endTime = endTime
  if (allDay !== undefined) updateData.allDay = allDay
  if (category !== undefined) updateData.category = category
  if (location !== undefined) updateData.location = location
  if (reminder !== undefined) {
    // Convertir boolean a string para la BD
    updateData.reminder = typeof reminder === 'boolean'
      ? (reminder ? '15min' : 'none')
      : reminder
  }
  if (repeat !== undefined) updateData.repeat = repeat
  if (notification !== undefined) updateData.notification = notification

  await prisma.agendaEvent.updateMany({
    where: {
      id: eventId,
      userId: session.user.id
    },
    data: updateData
  })

  // Fetch and return the updated event
  const updatedEvent = await prisma.agendaEvent.findUnique({
    where: { id: eventId }
  })

  if (!updatedEvent) {
    return NextResponse.json({ error: 'No trobat' }, { status: 404 })
  }

  // Formatear respuesta
  const formattedEvent = {
    ...updatedEvent,
    date: updatedEvent.date.toISOString(),
    reminder: updatedEvent.reminder !== 'none' && updatedEvent.reminder !== null
  }

  return NextResponse.json(formattedEvent)
}

// PATCH - Actualizar evento
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await updateEvent(request, params.id)
  } catch (error) {
    console.error('Error actualizando evento:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar evento (alias de PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await updateEvent(request, params.id)
  } catch (error) {
    console.error('Error actualizando evento:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    await prisma.agendaEvent.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando evento:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}