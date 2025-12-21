import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// GET - Obtenir un post específic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params

  try {
    const post = await prismaClient.post.findUnique({
      where: { id },
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
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                nick: true,
                firstName: true,
                lastName: true,
                image: true,
              }
            }
          }
        },
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

    if (!post) {
      return NextResponse.json({ error: 'Post no trobat' }, { status: 404 })
    }

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
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          nick: comment.author.nick,
          name: `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || comment.author.nick,
          image: comment.author.image,
        }
      })),
      stats: {
        likes: post._count.likes,
        comments: post._count.comments,
        shares: post._count.shares,
      },
      isLiked: post.likes.length > 0,
      isOwn: post.authorId === session.user.id,
    })
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
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params

  try {
    const post = await prismaClient.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post no trobat' }, { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'No tens permís per editar aquest post' }, { status: 403 })
    }

    const body = await request.json()
    const { content, visibility } = body

    const updatedPost = await prismaClient.post.update({
      where: { id },
      data: {
        ...(content && { content: content.trim() }),
        ...(visibility && { visibility }),
      },
      include: {
        author: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            image: true,
          }
        },
        attachments: true,
      }
    })

    return NextResponse.json(updatedPost)
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
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params

  try {
    const post = await prismaClient.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post no trobat' }, { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'No tens permís per eliminar aquest post' }, { status: 403 })
    }

    await prismaClient.post.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminant post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
