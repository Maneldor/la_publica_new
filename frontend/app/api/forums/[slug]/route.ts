import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getForumBySlug, getForumTopics } from '@/lib/services/forumService'

// GET - Detall del fòrum i temes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const { slug } = await params

    let userGroupIds: string[] = []

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          groupMemberships: {
            select: { groupId: true },
            where: { group: { isActive: true } }
          }
        }
      })
      userGroupIds = user?.groupMemberships.map(g => g.groupId) || []
    }

    const forum = await getForumBySlug(slug, session?.user?.id, userGroupIds)

    if (!forum) {
      return NextResponse.json({ error: 'Fòrum no trobat' }, { status: 404 })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const topics = await getForumTopics(forum.id, session?.user?.id, page, limit)

    return NextResponse.json({ forum, ...topics })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
