import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener visualizaciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const achieved = searchParams.get('achieved')

    const visualizations = await prisma.agendaVisualization.findMany({
      where: {
        userId: session.user.id,
        ...(category && { category }),
        ...(achieved !== null && { isAchieved: achieved === 'true' })
      },
      orderBy: [
        { isAchieved: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(visualizations)
  } catch (error) {
    console.error('Error obteniendo visualizaciones:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear visualización
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, imageUrl } = body

    if (!title) {
      return NextResponse.json({ error: 'Títol requerit' }, { status: 400 })
    }

    const visualization = await prisma.agendaVisualization.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        imageUrl
      }
    })

    return NextResponse.json(visualization)
  } catch (error) {
    console.error('Error creando visualización:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
