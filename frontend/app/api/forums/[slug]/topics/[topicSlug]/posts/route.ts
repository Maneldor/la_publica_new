import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTopicPosts, createPost, togglePostLike } from '@/lib/services/forumService'

// GET - Llistar respostes del tema
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; topicSlug: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { slug, topicSlug } = await params

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

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const result = await getTopicPosts(topic.id, page, limit)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear resposta o acció
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
      select: { id: true, isLocked: true, forum: { select: { isLocked: true } } }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Tema no trobat' }, { status: 404 })
    }

    // Acció: Like a un post
    if (body.action === 'like' && body.postId) {
      const result = await togglePostLike(body.postId, session.user.id)
      return NextResponse.json(result)
    }

    // Crear resposta
    if (topic.isLocked || topic.forum.isLocked) {
      return NextResponse.json({ error: 'El tema està bloquejat' }, { status: 403 })
    }

    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'El contingut és obligatori' }, { status: 400 })
    }

    const post = await createPost({
      topicId: topic.id,
      content: body.content,
      parentId: body.parentId,
      authorId: session.user.id
    })

    return NextResponse.json({ post }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
