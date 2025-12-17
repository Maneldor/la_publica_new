import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener hábitos de una fecha
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

    // Calculate week range for the given date
    const currentDay = date.getDay()
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - (currentDay === 0 ? 6 : currentDay - 1))
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const habits = await prisma.agendaHabit.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        logs: {
          where: { 
            date: {
              gte: startOfWeek,
              lte: endOfWeek
            }
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error obteniendo hábitos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear hábito
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { name, emoji } = body

    // Get the next position
    const lastHabit = await prisma.agendaHabit.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { position: 'desc' }
    })
    
    const nextPosition = (lastHabit?.position ?? -1) + 1

    const habit = await prisma.agendaHabit.create({
      data: {
        userId: session.user.id,
        name,
        emoji,
        isActive: true,
        position: nextPosition
      }
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error creando hábito:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}