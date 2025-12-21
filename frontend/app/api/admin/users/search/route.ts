import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (q.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const users = await prismaClient.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nick: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        name: true,
        nick: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
