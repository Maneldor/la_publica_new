import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getBlogPostsForAdmin,
  getPublishedBlogPosts,
  createBlogPost,
  getBlogStats
} from '@/lib/services/blogService'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

// GET - Llistar posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'

    // Verificar si és admin
    if (isAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })

      if (!user || !ADMIN_ROLES.includes(user.role)) {
        return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
      }

      const filters = {
        status: searchParams.get('status') as any,
        categoryId: searchParams.get('category') || undefined,
        search: searchParams.get('search') || undefined,
        isPinned: searchParams.get('pinned') === 'true' ? true : undefined,
        isFeatured: searchParams.get('featured') === 'true' ? true : undefined
      }

      const [posts, stats] = await Promise.all([
        getBlogPostsForAdmin(filters),
        getBlogStats()
      ])

      return NextResponse.json({ posts, stats })
    }

    // Vista d'empleat
    const userWithGroups = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        groupMemberships: {
          select: { groupId: true }
        }
      }
    })

    const result = await getPublishedBlogPosts(session.user.id, {
      categoryId: searchParams.get('category') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      userGroupIds: userWithGroups?.groupMemberships.map(g => g.groupId) || []
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error obtenint posts:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear post
export async function POST(request: NextRequest) {
  try {
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

    const post = await createBlogPost({
      ...body,
      authorId: session.user.id
    })

    return NextResponse.json({ post }, { status: 201 })

  } catch (error) {
    console.error('Error creant post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
