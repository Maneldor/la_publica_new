import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPublicForums, getCategories } from '@/lib/services/forumService'

// GET - Llistar fòrums públics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    const [forums, categories] = await Promise.all([
      getPublicForums(session?.user?.id || '', userGroupIds),
      getCategories()
    ])

    return NextResponse.json({ forums, categories })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
