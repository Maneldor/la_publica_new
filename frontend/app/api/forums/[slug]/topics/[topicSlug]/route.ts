import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTopicBySlug, toggleTopicLike, toggleBookmark } from '@/lib/services/forumService'

// GET - Detall del tema
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; topicSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { slug, topicSlug } = await params

    const topic = await getTopicBySlug(slug, topicSlug, session?.user?.id)

    if (!topic) {
      return NextResponse.json({ error: 'Tema no trobat' }, { status: 404 })
    }

    return NextResponse.json({ topic })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Accions (like, bookmark)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; topicSlug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { slug, topicSlug } = await params
    const body = await request.json()

    // Obtenir el tema
    const topic = await prisma.forumTopic.findFirst({
      where: {
        slug: topicSlug,
        forum: { slug },
        status: 'PUBLISHED'
      },
      select: { id: true }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Tema no trobat' }, { status: 404 })
    }

    if (body.action === 'like') {
      const result = await toggleTopicLike(topic.id, session.user.id)
      return NextResponse.json(result)
    }

    if (body.action === 'bookmark') {
      const result = await toggleBookmark(topic.id, session.user.id)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Acció no vàlida' }, { status: 400 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
