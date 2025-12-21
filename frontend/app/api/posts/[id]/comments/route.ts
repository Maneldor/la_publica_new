import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// GET - Obtenir comentaris d'un post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: postId } = await params

  try {
    const comments = await prismaClient.postComment.findMany({
      where: {
        postId,
        parentId: null // Només comentaris principals
      },
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
        },
        replies: {
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
        }
      }
    })

    // Formatar resposta
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      likesCount: comment.likesCount,
      author: {
        id: comment.author.id,
        nick: comment.author.nick,
        name: `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || comment.author.nick,
        image: comment.author.image,
      },
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        likesCount: reply.likesCount,
        author: {
          id: reply.author.id,
          nick: reply.author.nick,
          name: `${reply.author.firstName || ''} ${reply.author.lastName || ''}`.trim() || reply.author.nick,
          image: reply.author.image,
        }
      }))
    }))

    return NextResponse.json(formattedComments)
  } catch (error) {
    console.error('Error obtenint comentaris:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear comentari
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: postId } = await params

  try {
    const body = await request.json()
    const { content, parentId } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'El contingut és obligatori' }, { status: 400 })
    }

    // Verificar que el post existeix
    const post = await prismaClient.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post no trobat' }, { status: 404 })
    }

    // Si parentId, verificar que el comentari pare existeix
    if (parentId) {
      const parentComment = await prismaClient.postComment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true }
      })

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json({ error: 'Comentari pare no vàlid' }, { status: 400 })
      }
    }

    // Crear comentari i actualitzar comptador
    const [comment] = await prismaClient.$transaction([
      prismaClient.postComment.create({
        data: {
          content: content.trim(),
          postId,
          authorId: session.user.id,
          parentId: parentId || null,
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
          }
        }
      }),
      prismaClient.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      })
    ])

    // TODO: Notificar l'autor del post si no és el mateix usuari

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      likesCount: 0,
      author: {
        id: comment.author.id,
        nick: comment.author.nick,
        name: `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || comment.author.nick,
        image: comment.author.image,
      },
      replies: []
    }, { status: 201 })
  } catch (error) {
    console.error('Error creant comentari:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
