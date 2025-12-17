import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuración de módulos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const modules = await prisma.agendaModule.findMany({
      where: { userId: session.user.id },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json(modules)
  } catch (error) {
    console.error('Error obteniendo módulos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualizar visibilidad de módulos
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const body = await request.json()
    const { moduleType, isActive } = body

    // Actualizar un módulo específico
    const updated = await prisma.agendaModule.upsert({
      where: {
        userId_moduleType: {
          userId: session.user.id,
          moduleType: moduleType
        }
      },
      update: { isActive },
      create: {
        userId: session.user.id,
        moduleType: moduleType,
        isActive: isActive,
        position: 0
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error actualizando módulos:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}