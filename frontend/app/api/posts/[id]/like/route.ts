import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

// POST - Toggle like
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
    // Verificar que el post existeix
    const post = await prismaClient.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, likesCount: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post no trobat' }, { status: 404 })
    }

    // Verificar si ja té like
    const existingLike = await prismaClient.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id
        }
      }
    })

    if (existingLike) {
      // Treure like
      await prismaClient.$transaction([
        prismaClient.postLike.delete({
          where: { id: existingLike.id }
        }),
        prismaClient.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        })
      ])

      return NextResponse.json({ liked: false, likesCount: post.likesCount - 1 })
    } else {
      // Afegir like
      await prismaClient.$transaction([
        prismaClient.postLike.create({
          data: {
            postId,
            userId: session.user.id
          }
        }),
        prismaClient.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        })
      ])

      // TODO: Crear notificació si post.authorId !== session.user.id

      return NextResponse.json({ liked: true, likesCount: post.likesCount + 1 })
    }
  } catch (error) {
    console.error('Error amb like:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
