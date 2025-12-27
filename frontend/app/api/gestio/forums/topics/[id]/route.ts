import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  updateTopic,
  deleteTopic,
  togglePinTopic,
  toggleFeatureTopic,
  toggleLockTopic,
  moderateTopic,
  getTopicById
} from '@/lib/services/forumService'

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

// GET - Detall del tema
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
    const topic = await getTopicById(id)

    if (!topic) {
      return NextResponse.json({ error: 'Tema no trobat' }, { status: 404 })
    }

    return NextResponse.json({ topic })

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

    // Acció: Fixar
    if (body.action === 'pin') {
      const topic = await togglePinTopic(id, auth.userId, body.isPinned)
      return NextResponse.json({ topic })
    }

    // Acció: Destacar
    if (body.action === 'feature') {
      const topic = await toggleFeatureTopic(id, body.isFeatured)
      return NextResponse.json({ topic })
    }

    // Acció: Bloquejar
    if (body.action === 'lock') {
      const topic = await toggleLockTopic(id, auth.userId, body.isLocked, body.reason)
      return NextResponse.json({ topic })
    }

    // Acció: Moderar
    if (body.action === 'moderate') {
      const topic = await moderateTopic(id, auth.userId, body.moderationStatus, body.moderationNote)
      return NextResponse.json({ topic })
    }

    // Actualització general
    const topic = await updateTopic(id, body)
    return NextResponse.json({ topic })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar tema
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
    await deleteTopic(id)
    return NextResponse.json({ message: 'Tema eliminat' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
