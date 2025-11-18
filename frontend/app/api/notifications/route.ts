import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/notifications - Obtener notificaciones del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`📱 [Notifications] Loading for user ${session.user.id} - unreadOnly: ${unreadOnly}, limit: ${limit}`);

    // Construir filtros
    const where: any = {
      userId: session.user.id
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Obtener notificaciones y contador de no leídas en paralelo
    const [notifications, unreadCount, totalCount] = await Promise.all([
      prismaClient.notification.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prismaClient.notification.count({
        where: {
          userId: session.user.id,
          isRead: false
        }
      }),
      prismaClient.notification.count({
        where: {
          userId: session.user.id
        }
      })
    ]);

    // Formatear notificaciones
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      metadata: notification.metadata,
      sender: notification.sender ? {
        id: notification.sender.id,
        name: notification.sender.name,
        image: notification.sender.image
      } : null,
      // Helper para URL de acción desde metadata
      actionUrl: notification.metadata?.actionUrl || null
    }));

    console.log(`✅ [Notifications] Found ${notifications.length} notifications, ${unreadCount} unread`);

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      pagination: {
        total: totalCount,
        unread: unreadCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount
      }
    });

  } catch (error) {
    console.error('❌ [Notifications] Error fetching:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cargar notificaciones',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications - Crear nueva notificación (solo para testing/admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo admins pueden crear notificaciones manualmente
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Sin permisos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, type, title, message, priority = 'NORMAL', metadata } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos: userId, type, title, message' },
        { status: 400 }
      );
    }

    const notification = await prismaClient.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
        metadata,
        senderId: session.user.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    console.log(`📱 [Notifications] Created notification ${notification.id} for user ${userId}`);

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
        sender: notification.sender
      }
    });

  } catch (error) {
    console.error('❌ [Notifications] Error creating:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear notificación',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}