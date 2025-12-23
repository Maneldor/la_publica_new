import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener reflexión de una fecha
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

    const reflection = await prisma.agendaReflection.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: date
        }
      }
    })

    // Si no existe reflexión para esta fecha, devolver formato esperado por frontend
    if (!reflection) {
      return NextResponse.json({
        mood: null,
        text: ''
      })
    }

    return NextResponse.json({
      mood: reflection.mood || null,
      text: reflection.text || ''
    })
  } catch (error) {
    console.error('Error obteniendo reflexión:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Actualizar reflexión
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { date, mood, text } = body

    const reflectionDate = new Date(date)
    reflectionDate.setHours(0, 0, 0, 0)

    const reflection = await prisma.agendaReflection.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: reflectionDate
        }
      },
      update: { mood, text },
      create: {
        userId: session.user.id,
        date: reflectionDate,
        mood,
        text
      }
    })

    return NextResponse.json({
      mood,
      text
    })
  } catch (error) {
    console.error('Error actualizando reflexión:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}