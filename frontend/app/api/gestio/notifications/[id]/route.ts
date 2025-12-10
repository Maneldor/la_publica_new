// app/api/gestio/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { markAsRead, deleteNotification } from '@/lib/gestio-empreses/notification-actions'

/**
 * PUT - Marcar notificación específica como leída
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    await markAsRead(params.id)

    return NextResponse.json({
      message: 'Notificació marcada com llegida',
      success: true
    })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Error marcant notificació com llegida' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar notificación
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    await deleteNotification(params.id)

    return NextResponse.json({
      message: 'Notificació eliminada',
      success: true
    })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Error eliminant notificació' },
      { status: 500 }
    )
  }
}