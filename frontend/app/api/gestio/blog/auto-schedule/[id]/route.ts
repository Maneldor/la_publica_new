import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  toggleSchedulePause,
  runManualGeneration,
  getScheduleStats
} from '@/lib/services/blogAutoScheduleService'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

async function checkAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'No autoritzat', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return { error: 'Accés denegat', status: 403 }
  }

  return { userId: session.user.id }
}

// GET - Detall amb estadístiques
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const data = await getScheduleStats(id)

    if (!data.schedule) {
      return NextResponse.json({ error: 'Programació no trobada' }, { status: 404 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar o accions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Acció: Pausar/Reprendre
    if (body.action === 'toggle_pause') {
      const schedule = await toggleSchedulePause(id, auth.userId)
      return NextResponse.json({ schedule })
    }

    // Acció: Executar manualment
    if (body.action === 'run_now') {
      const result = await runManualGeneration(id)
      return NextResponse.json(result)
    }

    // Actualització normal
    const { action, ...updateData } = body
    const schedule = await prisma.blogAutoSchedule.update({
      where: { id },
      data: updateData,
      include: {
        fixedTopics: true,
        dynamicTopics: { where: { status: 'PENDING' } },
        defaultCategory: true
      }
    })

    return NextResponse.json({ schedule })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    await prisma.blogAutoSchedule.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Programació eliminada' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
