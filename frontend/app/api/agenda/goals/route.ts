import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener objetivo y tareas de una fecha
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

    let goal = await prisma.agendaGoal.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: date
        }
      },
      include: {
        tasks: {
          orderBy: { position: 'asc' }
        }
      }
    })

    // Si no existe objetivo para esta fecha, crear uno vacío
    if (!goal) {
      goal = await prisma.agendaGoal.create({
        data: {
          userId: session.user.id,
          date: date,
          text: ''
        },
        include: { tasks: true }
      })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error obteniendo objetivo:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar texto del objetivo
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date, text } = body

    const goalDate = new Date(date)
    goalDate.setHours(0, 0, 0, 0)

    const goal = await prisma.agendaGoal.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: goalDate
        }
      },
      update: { text },
      create: {
        userId: session.user.id,
        date: goalDate,
        text
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error actualizando objetivo:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}