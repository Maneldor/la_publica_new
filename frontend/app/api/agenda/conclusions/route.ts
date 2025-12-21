import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener conclusiones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const type = searchParams.get('type') || 'daily'

    if (!dateStr) {
      // Devolver las últimas conclusiones
      const conclusions = await prisma.agendaConclusion.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: { date: 'desc' },
        take: 10
      })
      return NextResponse.json(conclusions)
    }

    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)

    let conclusion = await prisma.agendaConclusion.findUnique({
      where: {
        userId_date_type: {
          userId: session.user.id,
          date,
          type
        }
      }
    })

    if (!conclusion) {
      conclusion = await prisma.agendaConclusion.create({
        data: {
          userId: session.user.id,
          date,
          type
        }
      })
    }

    return NextResponse.json(conclusion)
  } catch (error) {
    console.error('Error obteniendo conclusiones:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Guardar conclusiones
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date, type = 'daily', whatWentWell, whatToImprove, lessonsLearned } = body

    const conclusionDate = new Date(date)
    conclusionDate.setHours(0, 0, 0, 0)

    const conclusion = await prisma.agendaConclusion.upsert({
      where: {
        userId_date_type: {
          userId: session.user.id,
          date: conclusionDate,
          type
        }
      },
      update: {
        whatWentWell,
        whatToImprove,
        lessonsLearned
      },
      create: {
        userId: session.user.id,
        date: conclusionDate,
        type,
        whatWentWell,
        whatToImprove,
        lessonsLearned
      }
    })

    return NextResponse.json(conclusion)
  } catch (error) {
    console.error('Error guardando conclusiones:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
