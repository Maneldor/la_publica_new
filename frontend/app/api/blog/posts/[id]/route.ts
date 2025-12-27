import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getBlogPostBySlug,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  togglePinPost,
  toggleFeaturePost
} from '@/lib/services/blogService'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

// GET - Obtenir post per ID o slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Intentar buscar per slug primer
    let post = await getBlogPostBySlug(id, userId)

    // Si no es troba, buscar per ID
    if (!post) {
      post = await getBlogPostById(id)
    }

    if (!post) {
      return NextResponse.json({ error: 'Post no trobat' }, { status: 404 })
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error obtenint post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// PATCH - Actualitzar post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const body = await request.json()

    // Accions especials
    if (body.action === 'pin') {
      const post = await togglePinPost(id, body.isPinned, body.pinnedUntil)
      return NextResponse.json({ post })
    }

    if (body.action === 'feature') {
      const post = await toggleFeaturePost(id, body.isFeatured)
      return NextResponse.json({ post })
    }

    // Actualització general
    const post = await updateBlogPost({
      id,
      ...body
    })

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error actualitzant post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    await deleteBlogPost(id)

    return NextResponse.json({ message: 'Post eliminat' })

  } catch (error) {
    console.error('Error eliminant post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
