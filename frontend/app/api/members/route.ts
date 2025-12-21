import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/members
 * Llistar membres amb paginació, cerca i filtres
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const location = searchParams.get('location') || ''
    const tab = searchParams.get('tab') || 'all' // all, active, new, connections
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Base where clause - excloure l'usuari actual i només empleats públics
    const baseWhere: any = {
      id: { not: session.user.id },
      isActive: true,
      userType: 'EMPLOYEE', // Solo empleados públicos (no CRM, Gestores, Empresas, etc.)
    }

    // Cerca per nom, càrrec o departament
    if (search) {
      baseWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { nick: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { cargo: { contains: search, mode: 'insensitive' } },
        { profile: { position: { contains: search, mode: 'insensitive' } } },
        { profile: { department: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Filtre per departament
    if (department) {
      baseWhere.profile = {
        ...baseWhere.profile,
        department: { contains: department, mode: 'insensitive' }
      }
    }

    // Filtre per ubicació
    if (location) {
      baseWhere.profile = {
        ...baseWhere.profile,
        city: { contains: location, mode: 'insensitive' }
      }
    }

    // Filtres per tab
    if (tab === 'active') {
      // Actius aquest mes (amb lastSeenAt recent o isOnline)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      baseWhere.OR = [
        { isOnline: true },
        { lastSeenAt: { gte: oneMonthAgo } },
        { lastLogin: { gte: oneMonthAgo } }
      ]
    } else if (tab === 'new') {
      // Nous (registrats últims 30 dies)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      baseWhere.createdAt = { gte: thirtyDaysAgo }
    } else if (tab === 'connections') {
      // Només connexions acceptades amb l'usuari actual
      baseWhere.OR = [
        {
          connectionsSent: {
            some: {
              receiverId: session.user.id,
              status: 'ACCEPTED'
            }
          }
        },
        {
          connectionsReceived: {
            some: {
              senderId: session.user.id,
              status: 'ACCEPTED'
            }
          }
        }
      ]
    }

    // Obtenir membres amb paginació
    const [members, total] = await Promise.all([
      prismaClient.user.findMany({
        where: baseWhere,
        select: {
          id: true,
          nick: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          coverColor: true,
          administration: true,
          cargo: true,
          isOnline: true,
          lastSeenAt: true,
          lastLogin: true,
          createdAt: true,
          profile: {
            select: {
              headline: true,
              bio: true,
              position: true,
              department: true,
              city: true,
              organization: true,
            }
          },
          // Obtenir estat de connexió amb l'usuari actual
          connectionsSent: {
            where: { receiverId: session.user.id },
            select: { id: true, status: true, createdAt: true, expiresAt: true }
          },
          connectionsReceived: {
            where: { senderId: session.user.id },
            select: { id: true, status: true, createdAt: true, expiresAt: true }
          },
          // Comptar connexions acceptades (total de l'usuari)
          _count: {
            select: {
              connectionsSent: { where: { status: 'ACCEPTED' } },
              connectionsReceived: { where: { status: 'ACCEPTED' } }
            }
          }
        },
        orderBy: [
          { isOnline: 'desc' },
          { lastSeenAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prismaClient.user.count({ where: baseWhere })
    ])

    // Comptar connexions mútues per a cada membre
    const mutualConnectionsCounts = await Promise.all(
      members.map(async (member) => {
        // Connexions de l'usuari actual
        const myConnections = await prismaClient.userConnection.findMany({
          where: {
            OR: [
              { senderId: session.user.id, status: 'ACCEPTED' },
              { receiverId: session.user.id, status: 'ACCEPTED' }
            ]
          },
          select: {
            senderId: true,
            receiverId: true
          }
        })

        const myConnectionIds = new Set(
          myConnections.map(c =>
            c.senderId === session.user.id ? c.receiverId : c.senderId
          )
        )

        // Connexions del membre
        const memberConnections = await prismaClient.userConnection.findMany({
          where: {
            OR: [
              { senderId: member.id, status: 'ACCEPTED' },
              { receiverId: member.id, status: 'ACCEPTED' }
            ]
          },
          select: {
            senderId: true,
            receiverId: true
          }
        })

        const memberConnectionIds = new Set(
          memberConnections.map(c =>
            c.senderId === member.id ? c.receiverId : c.senderId
          )
        )

        // Calcular intersecció
        let mutualCount = 0
        myConnectionIds.forEach(id => {
          if (memberConnectionIds.has(id)) mutualCount++
        })

        return { memberId: member.id, mutualCount }
      })
    )

    const mutualMap = new Map(mutualConnectionsCounts.map(m => [m.memberId, m.mutualCount]))

    // Formatejar resposta amb estat de connexió
    const formattedMembers = members.map(member => {
      // Determinar estat de connexió amb l'usuari actual
      let connectionStatus = 'none'
      let connectionId: string | null = null
      let isIncoming = false
      let expiresAt: Date | null = null

      // connectionsSent: jo (receiver) <-- ell (sender) => incoming request
      const incomingConnection = member.connectionsSent[0]
      // connectionsReceived: jo (sender) --> ell (receiver) => outgoing request
      const outgoingConnection = member.connectionsReceived[0]

      if (outgoingConnection) {
        connectionStatus = outgoingConnection.status.toLowerCase()
        connectionId = outgoingConnection.id
        isIncoming = false
        expiresAt = outgoingConnection.expiresAt
      } else if (incomingConnection) {
        connectionStatus = incomingConnection.status.toLowerCase()
        connectionId = incomingConnection.id
        isIncoming = true
        expiresAt = incomingConnection.expiresAt
      }

      // Formatejar lastActive
      let lastActive = ''
      const lastSeen = member.lastSeenAt || member.lastLogin
      if (lastSeen) {
        const now = new Date()
        const diff = now.getTime() - new Date(lastSeen).getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 60) {
          lastActive = `fa ${minutes} min`
        } else if (hours < 24) {
          lastActive = `fa ${hours} ${hours === 1 ? 'hora' : 'hores'}`
        } else if (days === 1) {
          lastActive = 'ahir'
        } else if (days < 7) {
          lastActive = `fa ${days} dies`
        } else {
          lastActive = `fa ${Math.floor(days / 7)} setm.`
        }
      }

      const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.name || member.nick || 'Usuari'

      return {
        id: member.id,
        username: member.nick || member.id,
        name: fullName,
        firstName: member.firstName,
        lastName: member.lastName,
        avatar: member.image || '',
        coverImage: '',
        coverColor: member.coverColor,
        role: member.profile?.position || member.cargo || '',
        department: member.profile?.department || '',
        headline: member.profile?.headline || '',
        bio: member.profile?.bio || '',
        location: member.profile?.city || '',
        organization: member.profile?.organization || '',
        administration: member.administration || 'LOCAL',
        isOnline: member.isOnline,
        lastActive,
        createdAt: member.createdAt,
        mutualConnections: mutualMap.get(member.id) || 0,
        totalConnections: member._count.connectionsSent + member._count.connectionsReceived,
        connectionStatus,
        connectionId,
        isIncoming,
        expiresAt,
        isConnected: connectionStatus === 'accepted',
      }
    })

    return NextResponse.json({
      members: formattedMembers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + members.length < total
      }
    })
  } catch (error) {
    console.error('Error obtenint membres:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
