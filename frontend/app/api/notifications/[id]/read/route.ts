import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * PUT /api/notifications/[id]/read - Marcar notificación como leída
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de notificación requerido' },
        { status: 400 }
      );
    }

    console.log(`📱 [Notifications] Marking as read: ${id} by user ${session.user.id}`);

    // Verificar que la notificación pertenece al usuario
    const notification = await prismaClient.notification.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Si ya está leída, no hacer nada
    if (notification.isRead) {
      return NextResponse.json({
        success: true,
        message: 'Notificación ya estaba marcada como leída'
      });
    }

    // Marcar como leída
    await prismaClient.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    console.log(`✅ [Notifications] Marked as read: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('❌ [Notifications] Error marking as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al marcar notificación como leída',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]/read - Marcar notificación como no leída
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de notificación requerido' },
        { status: 400 }
      );
    }

    console.log(`📱 [Notifications] Marking as unread: ${id} by user ${session.user.id}`);

    // Verificar que la notificación pertenece al usuario
    const notification = await prismaClient.notification.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Marcar como no leída
    await prismaClient.notification.update({
      where: { id },
      data: {
        isRead: false,
        readAt: null
      }
    });

    console.log(`✅ [Notifications] Marked as unread: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Notificación marcada como no leída'
    });

  } catch (error) {
    console.error('❌ [Notifications] Error marking as unread:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al marcar notificación como no leída',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}