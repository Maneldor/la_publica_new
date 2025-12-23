import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/groups/[id]/posts
 * Obtenir posts del grup
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params

  try {
    // Verificar que l'usuari és membre del grup
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Has de ser membre per veure el feed' },
        { status: 403 }
      )
    }

    // Verificar que el grup té feed activat
    const group = await prismaClient.group.findUnique({
      where: { id: groupId },
      select: { enableFeed: true, name: true }
    })

    if (!group) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    if (!group.enableFeed) {
      return NextResponse.json(
        { error: 'Aquest grup no té feed activat' },
        { status: 400 }
      )
    }

    // Obtenir paràmetres de paginació
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Obtenir posts del grup
    const posts = await prismaClient.post.findMany({
      where: {
        groupId,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
        authorId: true,
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

    // Processar posts
    const processedPosts = postsToReturn.map(post => ({
      id: post.id,
      content: post.content,
      type: post.type,
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
      },
      isLiked: post.likes.length > 0,
      isOwn: post.authorId === session.user.id,
    }))

    return NextResponse.json({
      posts: processedPosts,
      nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null,
      hasMore,
    })

  } catch (error) {
    console.error('Error fetching group posts:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/groups/[id]/posts
 * Crear un post al grup
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id: groupId } = await params

  try {
    // Verificar que l'usuari és membre del grup
    const membership = await prismaClient.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Has de ser membre per publicar' },
        { status: 403 }
      )
    }

    // Verificar grup i permisos
    const group = await prismaClient.group.findUnique({
      where: { id: groupId },
      select: {
        enableFeed: true,
        postPermission: true,
        name: true,
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Grup no trobat' }, { status: 404 })
    }

    if (!group.enableFeed) {
      return NextResponse.json(
        { error: 'Aquest grup no té feed activat' },
        { status: 400 }
      )
    }

    // Verificar permisos de publicació
    if (group.postPermission === 'ADMINS_ONLY' && membership.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Només els administradors poden publicar' },
        { status: 403 }
      )
    }

    if (group.postPermission === 'MODS_AND_ADMINS' && membership.role === 'MEMBER') {
      return NextResponse.json(
        { error: 'Només els moderadors i administradors poden publicar' },
        { status: 403 }
      )
    }

    // Obtenir dades del post
    const body = await request.json()
    const { content, type = 'TEXT', attachments = [] } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'El contingut és obligatori' },
        { status: 400 }
      )
    }

    // Crear post
    const post = await prismaClient.post.create({
      data: {
        content: content.trim(),
        type,
        visibility: 'GROUP',
        authorId: session.user.id,
        groupId,
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

    // Incrementar comptador de posts del grup
    await prismaClient.group.update({
      where: { id: groupId },
      data: {
        postsCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      id: post.id,
      content: post.content,
      type: post.type,
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
      stats: { likes: 0, comments: 0 },
      isLiked: false,
      isOwn: true,
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating group post:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
