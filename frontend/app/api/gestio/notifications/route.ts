// app/api/gestio/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getUserNotifications,
  getUnreadCount,
  markAllAsRead
} from '@/lib/gestio-empreses/notification-actions'

/**
 * GET - Obtener notificaciones del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const unreadOnly = url.searchParams.get('unread') === 'true'

    const notifications = await getUserNotifications(session.user.id, limit)
    const unreadCount = await getUnreadCount(session.user.id)

    return NextResponse.json({
      notifications: unreadOnly
        ? notifications.filter(n => !n.isRead)
        : notifications,
      unreadCount,
      success: true
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error obtenint notificacions' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Marcar todas las notificaciones como leídas
 */
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    await markAllAsRead(session.user.id)

    return NextResponse.json({
      message: 'Totes les notificacions marcades com llegides',
      success: true
    })

  } catch (error) {
    console.error('Error marking all as read:', error)
    return NextResponse.json(
      { error: 'Error marcant notificacions com llegides' },
      { status: 500 }
    )
  }
}