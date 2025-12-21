import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

/**
 * GET /api/contacts
 * Obtenir contactes (connexions acceptades) del usuari
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Obtenir connexions acceptades
    const connections = await prismaClient.userConnection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            isOnline: true,
            lastSeenAt: true,
            profile: {
              select: {
                position: true,
                department: true,
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            nick: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            isOnline: true,
            lastSeenAt: true,
            profile: {
              select: {
                position: true,
                department: true,
              }
            }
          }
        }
      }
    })

    // Extreure l'altre usuari de cada connexió
    let contacts = connections.map(conn => {
      const contact = conn.senderId === session.user.id ? conn.receiver : conn.sender
      const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.name || contact.nick || 'Usuari'

      return {
        id: contact.id,
        nick: contact.nick,
        name: fullName,
        firstName: contact.firstName,
        lastName: contact.lastName,
        image: contact.image,
        isOnline: contact.isOnline,
        lastSeenAt: contact.lastSeenAt,
        position: contact.profile?.position,
        department: contact.profile?.department,
        connectionId: conn.id,
        connectedAt: conn.acceptedAt || conn.createdAt,
      }
    })

    // Filtrar per cerca si s'especifica
    if (search) {
      const searchLower = search.toLowerCase()
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.nick?.toLowerCase().includes(searchLower) ||
        c.position?.toLowerCase().includes(searchLower) ||
        c.department?.toLowerCase().includes(searchLower)
      )
    }

    // Ordenar: en línia primer, després per nom
    contacts.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error obtenint contactes:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
