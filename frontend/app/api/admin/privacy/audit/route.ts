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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')

    const where = role && role !== 'all' ? { changedByRole: role } : {}

    const [logs, total] = await Promise.all([
      prismaClient.privacyAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.privacyAuditLog.count({ where })
    ])

    // Obtenir info dels usuaris
    const userIds = [...new Set([
      ...logs.map(l => l.userId).filter(id => id && id !== 'SYSTEM'),
      ...logs.map(l => l.changedById).filter(id => id && id !== 'SYSTEM')
    ])]

    const users = await prismaClient.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, nick: true }
    })
    const usersMap = new Map(users.map(u => [u.id, u]))

    const logsWithUsers = logs.map(log => ({
      ...log,
      user: log.userId !== 'SYSTEM' ? usersMap.get(log.userId) : null,
      changedBy: log.changedById !== 'SYSTEM' ? usersMap.get(log.changedById) : null
    }))

    return NextResponse.json({
      logs: logsWithUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error obtenint logs:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
