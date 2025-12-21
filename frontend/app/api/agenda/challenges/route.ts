import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener retos activos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const challenges = await prisma.agendaChallenge.findMany({
      where: {
        userId: session.user.id,
        ...(activeOnly && { isActive: true, isCompleted: false })
      },
      include: {
        logs: {
          orderBy: { day: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(challenges)
  } catch (error) {
    console.error('Error obteniendo retos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo reto de 21 días
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: 'Títol requerit' }, { status: 400 })
    }

    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 20) // 21 días (día 0 al día 20)

    const challenge = await prisma.agendaChallenge.create({
      data: {
        userId: session.user.id,
        title,
        description,
        startDate,
        endDate,
        isActive: true,
        logs: {
          create: Array.from({ length: 21 }, (_, i) => {
            const logDate = new Date(startDate)
            logDate.setDate(logDate.getDate() + i)
            return {
              day: i + 1,
              date: logDate,
              completed: false
            }
          })
        }
      },
      include: {
        logs: true
      }
    })

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Error creando reto:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
