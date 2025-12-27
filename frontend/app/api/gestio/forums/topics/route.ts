import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTopicsForAdmin, createTopicAdmin } from '@/lib/services/forumService'

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

// GET - Llistar temes per gestió
export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      forumId: searchParams.get('forum') || undefined,
      status: searchParams.get('status') as any,
      isPinned: searchParams.get('pinned') === 'true' ? true : undefined,
      isFeatured: searchParams.get('featured') === 'true' ? true : undefined,
      isLocked: searchParams.get('locked') === 'true' ? true : undefined,
      moderationStatus: searchParams.get('moderation') as any,
      hasReports: searchParams.get('reported') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const result = await getTopicsForAdmin(filters, page, limit)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear tema (admin)
export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()

    if (!body.forumId || !body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: 'Falten camps obligatoris' }, { status: 400 })
    }

    const topic = await createTopicAdmin({
      ...body,
      authorId: auth.userId
    })

    return NextResponse.json({ topic }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
