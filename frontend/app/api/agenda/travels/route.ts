import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener viajes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const travels = await prisma.agendaTravel.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status })
      },
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json(travels)
  } catch (error) {
    console.error('Error obteniendo viajes:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Añadir viaje
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { destination, country, status = 'dream', notes } = body

    if (!destination) {
      return NextResponse.json({ error: 'Destinació requerida' }, { status: 400 })
    }

    const travel = await prisma.agendaTravel.create({
      data: {
        userId: session.user.id,
        destination,
        country,
        status,
        notes
      }
    })

    return NextResponse.json(travel)
  } catch (error) {
    console.error('Error creando viaje:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
