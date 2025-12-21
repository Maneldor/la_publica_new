import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener evaluación de áreas de vida
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr) {
      // Devolver las últimas evaluaciones
      const areas = await prisma.agendaLifeArea.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
        take: 12 // Último año si es mensual
      })
      return NextResponse.json(areas)
    }

    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)

    let area = await prisma.agendaLifeArea.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date
        }
      }
    })

    if (!area) {
      // Buscar la última evaluación para usar como base
      const lastArea = await prisma.agendaLifeArea.findFirst({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' }
      })

      area = await prisma.agendaLifeArea.create({
        data: {
          userId: session.user.id,
          date,
          health: lastArea?.health ?? 5,
          relationships: lastArea?.relationships ?? 5,
          career: lastArea?.career ?? 5,
          finances: lastArea?.finances ?? 5,
          growth: lastArea?.growth ?? 5,
          fun: lastArea?.fun ?? 5
        }
      })
    }

    return NextResponse.json(area)
  } catch (error) {
    console.error('Error obteniendo áreas de vida:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Guardar evaluación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date, health, relationships, career, finances, growth, fun, notes } = body

    const areaDate = new Date(date)
    areaDate.setHours(0, 0, 0, 0)

    const area = await prisma.agendaLifeArea.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: areaDate
        }
      },
      update: {
        health,
        relationships,
        career,
        finances,
        growth,
        fun,
        notes
      },
      create: {
        userId: session.user.id,
        date: areaDate,
        health: health ?? 5,
        relationships: relationships ?? 5,
        career: career ?? 5,
        finances: finances ?? 5,
        growth: growth ?? 5,
        fun: fun ?? 5,
        notes
      }
    })

    return NextResponse.json(area)
  } catch (error) {
    console.error('Error guardando áreas de vida:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
