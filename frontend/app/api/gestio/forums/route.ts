import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getForumsForAdmin,
  getForumStats,
  createForum,
  getCategories
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

// GET - Llistar fòrums i estadístiques
export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      categoryId: searchParams.get('category') || undefined,
      visibility: searchParams.get('visibility') as any,
      isActive: searchParams.get('active') === 'true' ? true :
                searchParams.get('active') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined
    }

    const [forums, stats, categories] = await Promise.all([
      getForumsForAdmin(filters),
      getForumStats(),
      getCategories()
    ])

    return NextResponse.json({ forums, stats, categories })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear fòrum
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'El nom és obligatori' }, { status: 400 })
    }

    const forum = await createForum({
      ...body,
      createdById: auth.userId
    })

    return NextResponse.json({ forum }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
