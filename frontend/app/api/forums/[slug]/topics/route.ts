import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTopicAdmin, getForumBySlug } from '@/lib/services/forumService'

// POST - Crear tema (usuari autenticat)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { slug } = await params

    // Obtenir grups de l'usuari
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        groupMemberships: {
          select: { groupId: true },
          where: { group: { isActive: true } }
        }
      }
    })
    const userGroupIds = user?.groupMemberships.map(g => g.groupId) || []

    // Verificar accés al fòrum
    const forum = await getForumBySlug(slug, session.user.id, userGroupIds)

    if (!forum) {
      return NextResponse.json({ error: 'Fòrum no trobat' }, { status: 404 })
    }

    if (forum.isLocked) {
      return NextResponse.json({ error: 'El fòrum està bloquejat' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: 'El títol i contingut són obligatoris' }, { status: 400 })
    }

    // Crear tema
    const topic = await createTopicAdmin({
      forumId: forum.id,
      title: body.title,
      content: body.content,
      tags: body.tags || [],
      authorId: session.user.id,
      poll: body.poll
    })

    return NextResponse.json({ topic }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
