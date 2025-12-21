import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener agradecimientos de una fecha
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr) {
      // Si no hay fecha, devolver los últimos 7 días
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const gratitudes = await prisma.agendaGratitude.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: weekAgo,
            lte: today
          }
        },
        orderBy: { date: 'desc' }
      })

      return NextResponse.json(gratitudes)
    }

    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)

    let gratitude = await prisma.agendaGratitude.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date
        }
      }
    })

    // Si no existe, crear uno vacío
    if (!gratitude) {
      gratitude = await prisma.agendaGratitude.create({
        data: {
          userId: session.user.id,
          date
        }
      })
    }

    return NextResponse.json(gratitude)
  } catch (error) {
    console.error('Error obteniendo agradecimientos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST/PATCH - Guardar agradecimientos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date, item1, item2, item3 } = body

    const gratitudeDate = new Date(date)
    gratitudeDate.setHours(0, 0, 0, 0)

    const gratitude = await prisma.agendaGratitude.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: gratitudeDate
        }
      },
      update: {
        item1,
        item2,
        item3
      },
      create: {
        userId: session.user.id,
        date: gratitudeDate,
        item1,
        item2,
        item3
      }
    })

    return NextResponse.json(gratitude)
  } catch (error) {
    console.error('Error guardando agradecimientos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
