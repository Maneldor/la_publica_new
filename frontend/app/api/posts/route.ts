import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// GET - Obtenir feed de posts
export async function GET(request: NextRequest) {
  console.log('[Posts API] GET request received')

  const session = await getServerSession(authOptions)
  console.log('[Posts API] Session:', JSON.stringify({
    hasUser: !!session?.user,
    userId: session?.user?.id,
    email: session?.user?.email
  }))

  if (!session?.user?.id) {
    console.log('[Posts API] No authorized - missing user.id')
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    console.log('[Posts API] Fetching posts for user:', session.user.id)
    // Obtenir IDs de connexions de l'usuari
    const connections = await prismaClient.userConnection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      select: {
        senderId: true,
        receiverId: true,
      }
    })

    const connectionIds = connections.map(c =>
      c.senderId === session.user.id ? c.receiverId : c.senderId
    )

    // Construir query - posts públics, propis, o de connexions
    const orConditions: any[] = [
      // Posts públics
      { visibility: 'PUBLIC' },
      // Posts propis
      { authorId: session.user.id },
    ]

    // Afegir condició de connexions només si n'hi ha
    if (connectionIds.length > 0) {
      orConditions.push({
        AND: [
          { authorId: { in: connectionIds } },
          { visibility: { in: ['PUBLIC', 'CONNECTIONS'] } }
        ]
      })
    }

    const where = { OR: orConditions }
    console.log('[Posts API] Query where:', JSON.stringify(where))

    const posts = await prismaClient.post.findMany({
      where,
      take: limit + 1, // +1 per saber si hi ha més
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        type: true,
        visibility: true,
        authorId: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            image: true,
            profile: {
              select: {
                position: true,
                department: true,
              }
            }
          }
        },
        attachments: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          }
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      }
    })

    // Verificar si hi ha més pàgines
    const hasMore = posts.length > limit
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts

    // Formatar resposta
    const formattedPosts = postsToReturn.map(post => ({
      id: post.id,
      content: post.content,
      type: post.type,
      visibility: post.visibility,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        nick: post.author.nick,
        name: `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || post.author.nick,
        image: post.author.image,
        position: post.author.profile?.position,
        department: post.author.profile?.department,
      },
      attachments: post.attachments,
      stats: {
        likes: post._count.likes,
        comments: post._count.comments,
        shares: post._count.shares,
      },
      isLiked: post.likes.length > 0,
      isOwn: post.authorId === session.user.id,
    }))

    return NextResponse.json({
      posts: formattedPosts,
      nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null,
      hasMore,
    })
  } catch (error) {
    console.error('Error obtenint posts:', error)
    // Retornar més detalls de l'error en desenvolupament
    const errorMessage = error instanceof Error ? error.message : 'Error desconegut'
    return NextResponse.json({
      error: 'Error del servidor',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

// POST - Crear nou post
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, type = 'TEXT', visibility = 'PUBLIC', attachments = [] } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'El contingut és obligatori' }, { status: 400 })
    }

    // Crear post
    const post = await prismaClient.post.create({
      data: {
        content: content.trim(),
        type,
        visibility,
        authorId: session.user.id,
        attachments: {
          create: attachments.map((att: any) => ({
            type: att.type,
            url: att.url,
            filename: att.filename,
            filesize: att.filesize,
            mimeType: att.mimeType,
            width: att.width,
            height: att.height,
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            image: true,
            profile: {
              select: {
                position: true,
                department: true,
              }
            }
          }
        },
        attachments: true,
      }
    })

    return NextResponse.json({
      id: post.id,
      content: post.content,
      type: post.type,
      visibility: post.visibility,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        nick: post.author.nick,
        name: `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || post.author.nick,
        image: post.author.image,
        position: post.author.profile?.position,
        department: post.author.profile?.department,
      },
      attachments: post.attachments,
      stats: { likes: 0, comments: 0, shares: 0 },
      isLiked: false,
      isOwn: true,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creant post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
