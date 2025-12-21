import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/users/search
 * Cercar usuaris per nom, nick o email
 * Accessible per qualsevol usuari autenticat
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    const excludeGroupId = searchParams.get('excludeGroup') // Opcional: excloure membres d'un grup

    if (q.length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Condició base de cerca
    const whereClause: Record<string, unknown> = {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { nick: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ],
    }

    // Excloure membres d'un grup si s'especifica
    if (excludeGroupId) {
      whereClause.groupMemberships = {
        none: { groupId: excludeGroupId }
      }
      // També excloure els que ja tenen invitació pendent
      whereClause.groupInvitationsReceived = {
        none: {
          groupId: excludeGroupId,
          status: 'PENDING'
        }
      }
    }

    const users = await prismaClient.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        nick: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    })

    // Formatejar noms
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.nick || 'Usuari',
      nick: user.nick,
      email: user.email,
      image: user.image,
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
