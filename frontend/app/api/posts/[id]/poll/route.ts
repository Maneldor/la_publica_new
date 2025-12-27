import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { votePoll, getPollResults } from '@/lib/services/postManagementService'

// GET - Obtenir resultats de l'enquesta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id: postId } = await params

    // Obtenir el poll del post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { poll: true }
    })

    if (!post?.poll) {
      return NextResponse.json({ error: 'Enquesta no trobada' }, { status: 404 })
    }

    const results = await getPollResults(post.poll.id, session.user.id)

    return NextResponse.json({ poll: results })

  } catch (error) {
    console.error('Error obtenint enquesta:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Votar en enquesta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { id: postId } = await params
    const { optionIds } = await request.json()

    if (!optionIds?.length) {
      return NextResponse.json(
        { error: 'Has de seleccionar almenys una opció' },
        { status: 400 }
      )
    }

    // Obtenir el poll del post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { poll: true }
    })

    if (!post?.poll) {
      return NextResponse.json({ error: 'Enquesta no trobada' }, { status: 404 })
    }

    await votePoll(post.poll.id, optionIds, session.user.id)

    const results = await getPollResults(post.poll.id, session.user.id)

    return NextResponse.json({ success: true, poll: results })

  } catch (error) {
    console.error('Error votant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error del servidor' },
      { status: 500 }
    )
  }
}
