import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getPostsForManagement,
  getPostStats,
  createOfficialPost
} from '@/lib/services/postManagementService'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO', 'COMMUNITY_MANAGER']

// GET - Llistar posts per gestió
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    const filters = {
      status: searchParams.get('status') as any,
      moderationStatus: (searchParams.get('moderationStatus') || searchParams.get('moderation')) as any,
      type: searchParams.get('type') as any,
      isOfficial: searchParams.get('isOfficial') === 'true' || searchParams.get('official') === 'true' ? true :
                  searchParams.get('isOfficial') === 'false' || searchParams.get('official') === 'false' ? false : undefined,
      isPinned: searchParams.get('isPinned') === 'true' || searchParams.get('pinned') === 'true' ? true : undefined,
      isFeatured: searchParams.get('isFeatured') === 'true' || searchParams.get('featured') === 'true' ? true : undefined,
      hasReports: searchParams.get('hasReports') === 'true' || searchParams.get('reported') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [postsData, stats] = await Promise.all([
      getPostsForManagement(filters, page, limit),
      getPostStats()
    ])

    return NextResponse.json({ ...postsData, stats })

  } catch (error) {
    console.error('Error obtenint posts:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear post oficial
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

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: 'El contingut és obligatori' },
        { status: 400 }
      )
    }

    // Validar enquesta si s'ha proporcionat
    if (body.poll) {
      if (!body.poll.question?.trim()) {
        return NextResponse.json(
          { error: 'La pregunta de l\'enquesta és obligatòria' },
          { status: 400 }
        )
      }
      if (!body.poll.options || body.poll.options.length < 2) {
        return NextResponse.json(
          { error: 'L\'enquesta ha de tenir almenys 2 opcions' },
          { status: 400 }
        )
      }
    }

    const post = await createOfficialPost({
      ...body,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      pinnedUntil: body.pinnedUntil ? new Date(body.pinnedUntil) : undefined,
      poll: body.poll ? {
        ...body.poll,
        endsAt: body.poll.endsAt ? new Date(body.poll.endsAt) : undefined
      } : undefined,
      authorId: session.user.id
    })

    return NextResponse.json({ post }, { status: 201 })

  } catch (error) {
    console.error('Error creant post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
