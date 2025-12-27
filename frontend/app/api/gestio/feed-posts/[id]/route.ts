import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  moderatePost,
  togglePinPost,
  toggleFeaturePost,
  updatePost,
  deletePost
} from '@/lib/services/postManagementService'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO', 'COMMUNITY_MANAGER']

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

// GET - Detall del post
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

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, nick: true, image: true, role: true } },
        group: { select: { id: true, name: true } },
        attachments: true,
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
              include: {
                _count: { select: { votes: true } }
              }
            }
          }
        },
        pinnedBy: { select: { id: true, name: true } },
        moderatedBy: { select: { id: true, name: true } },
        reports: {
          include: {
            reporter: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { likes: true, comments: true, shares: true, reports: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post no trobat' }, { status: 404 })
    }

    return NextResponse.json({ post })

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

    // Acció: Moderar
    if (body.action === 'moderate') {
      const post = await moderatePost(
        id,
        auth.userId,
        body.moderationStatus,
        body.moderationNote
      )
      return NextResponse.json({ post })
    }

    // Acció: Fixar
    if (body.action === 'pin') {
      const post = await togglePinPost(
        id,
        auth.userId,
        body.isPinned,
        body.pinnedUntil ? new Date(body.pinnedUntil) : undefined
      )
      return NextResponse.json({ post })
    }

    // Acció: Destacar
    if (body.action === 'feature') {
      const post = await toggleFeaturePost(id, body.isFeatured)
      return NextResponse.json({ post })
    }

    // Actualització general
    const { action, ...updateData } = body
    const post = await updatePost(id, {
      ...updateData,
      scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : updateData.scheduledAt
    })

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar post
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

    await deletePost(id)

    return NextResponse.json({ message: 'Post eliminat' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
