import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * PUT /api/notifications/mark-all-read - Marcar todas las notificaciones como leídas
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log(`📱 [Notifications] Marking all as read for user ${session.user.id}`);

    // Contar notificaciones no leídas antes del update
    const unreadCount = await prismaClient.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    });

    if (unreadCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay notificaciones pendientes por marcar',
        markedCount: 0
      });
    }

    // Marcar todas como leídas
    const result = await prismaClient.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    console.log(`✅ [Notifications] Marked ${result.count} notifications as read for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: `${result.count} notificaciones marcadas como leídas`,
      markedCount: result.count
    });

  } catch (error) {
    console.error('❌ [Notifications] Error marking all as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al marcar todas las notificaciones como leídas',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}