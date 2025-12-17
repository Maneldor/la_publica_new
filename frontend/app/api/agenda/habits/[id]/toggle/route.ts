import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Toggle hábito para una fecha específica
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date } = body

    const habitDate = new Date(date)
    habitDate.setHours(0, 0, 0, 0)

    // Verificar que el hábito pertenece al usuario
    const habit = await prisma.agendaHabit.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!habit) {
      return NextResponse.json({ error: 'Hàbit no trobat' }, { status: 404 })
    }

    // Verificar si ya existe un log para esta fecha
    const existingLog = await prisma.agendaHabitLog.findUnique({
      where: {
        habitId_date: {
          habitId: params.id,
          date: habitDate
        }
      }
    })

    if (existingLog) {
      // Si existe, eliminarlo (toggle off)
      await prisma.agendaHabitLog.delete({
        where: { id: existingLog.id }
      })
      return NextResponse.json({ completed: false })
    } else {
      // Si no existe, crearlo (toggle on)
      await prisma.agendaHabitLog.create({
        data: {
          habitId: params.id,
          date: habitDate,
          completed: true
        }
      })
      return NextResponse.json({ completed: true })
    }
  } catch (error) {
    console.error('Error toggling hábito:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}