import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener cápsulas del tiempo
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const showOpened = searchParams.get('opened') === 'true'
    const checkReady = searchParams.get('ready') === 'true'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const capsules = await prisma.agendaTimeCapsule.findMany({
      where: {
        userId: session.user.id,
        ...(checkReady && {
          isOpened: false,
          openDate: { lte: today }
        }),
        ...(!checkReady && showOpened !== undefined && { isOpened: showOpened })
      },
      orderBy: { openDate: 'asc' }
    })

    return NextResponse.json(capsules)
  } catch (error) {
    console.error('Error obteniendo cápsulas:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear cápsula del tiempo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { message, openDate } = body

    if (!message || !openDate) {
      return NextResponse.json({ error: 'Missatge i data requerits' }, { status: 400 })
    }

    const capsuleOpenDate = new Date(openDate)
    capsuleOpenDate.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (capsuleOpenDate <= today) {
      return NextResponse.json({ error: 'La data ha de ser futura' }, { status: 400 })
    }

    const capsule = await prisma.agendaTimeCapsule.create({
      data: {
        userId: session.user.id,
        message,
        openDate: capsuleOpenDate
      }
    })

    return NextResponse.json(capsule)
  } catch (error) {
    console.error('Error creando cápsula:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
