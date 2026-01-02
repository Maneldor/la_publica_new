import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AVAILABLE_MODULES } from '@/lib/constants/modules'

// GET - Obtenir mòduls activats de l'usuari
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const preferences = await prisma.userModulePreference.findMany({
      where: {
        userId: session.user.id,
        enabled: true,
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('[API] Error obtenint mòduls:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Activar/desactivar un mòdul
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { moduleId, enabled } = await request.json()

    // Validar que el mòdul existeix
    const moduleExists = AVAILABLE_MODULES.some(m => m.id === moduleId)
    if (!moduleExists) {
      return NextResponse.json({ error: 'Mòdul no vàlid' }, { status: 400 })
    }

    if (enabled) {
      // Activar mòdul: calcular el nou ordre (després de l'últim activat)
      const lastModule = await prisma.userModulePreference.findFirst({
        where: { userId: session.user.id, enabled: true },
        orderBy: { order: 'desc' },
      })
      const newOrder = lastModule ? lastModule.order + 1 : 0

      // Upsert: crear o actualitzar
      const preference = await prisma.userModulePreference.upsert({
        where: {
          userId_moduleId: {
            userId: session.user.id,
            moduleId,
          },
        },
        update: {
          enabled: true,
          order: newOrder,
        },
        create: {
          userId: session.user.id,
          moduleId,
          enabled: true,
          order: newOrder,
        },
      })

      return NextResponse.json(preference)
    } else {
      // Desactivar mòdul
      const preference = await prisma.userModulePreference.upsert({
        where: {
          userId_moduleId: {
            userId: session.user.id,
            moduleId,
          },
        },
        update: {
          enabled: false,
        },
        create: {
          userId: session.user.id,
          moduleId,
          enabled: false,
          order: 0,
        },
      })

      return NextResponse.json(preference)
    }
  } catch (error) {
    console.error('[API] Error actualitzant mòdul:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
