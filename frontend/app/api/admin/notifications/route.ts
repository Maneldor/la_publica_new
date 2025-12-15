import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { createAuditLog, getRequestInfo } from '@/lib/auditLog';

/**
 * GET /api/admin/notifications
 * Obtiene lista de notificaciones del sistema (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true }
    });

    if (!adminUser || (adminUser.userType !== 'ADMIN' && adminUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado. Solo administradores.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const typeFilter = searchParams.get('type') || '';
    const statusFilter = searchParams.get('status') || '';

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (typeFilter) {
      where.type = typeFilter;
    }
    
    if (statusFilter === 'READ') {
      where.isRead = true;
    } else if (statusFilter === 'sent') {
      where.isRead = false;
    }

    // Obtener notificaciones con paginación
    const [notifications, totalCount] = await Promise.all([
      prismaClient.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prismaClient.notification.count({ where })
    ]);

    // Calcular estadísticas
    const [totalNotifications, pendingNotifications, readNotifications] = await Promise.all([
      prismaClient.notification.count(),
      prismaClient.notification.count({ where: { isRead: false } }),
      prismaClient.notification.count({ where: { isRead: true } })
    ]);

    // Formatear notificaciones para el frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      createdAt: notification.createdAt.toISOString(),
      type: notification.type,
      recipient: notification.user.name || notification.user.email,
      recipientEmail: notification.user.email,
      title: notification.title,
      message: notification.message,
      status: notification.isRead ? 'READ' : 'sent',
      readAt: notification.readAt?.toISOString(),
      priority: notification.priority,
      sender: notification.sender ? {
        name: notification.sender.name || notification.sender.email,
        email: notification.sender.email
      } : null
    }));

    const stats = {
      total: totalNotifications,
      pending: pendingNotifications,
      read: readNotifications,
      errors: 0 // TODO: Implementar conteo de errores si se agrega campo
    };

    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };

    // Registrar acceso en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'OTHER',
      entity: 'NOTIFICATION',
      description: 'Accessed notifications management panel',
      category: 'ADMIN',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      stats,
      pagination
    });

  } catch (error) {
    console.error('Error obtenint notificacions:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Crea y envía una nueva notificación (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true }
    });

    if (!adminUser || (adminUser.userType !== 'ADMIN' && adminUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado. Solo administradores.' }, { status: 403 });
    }

    const body = await request.json();
    const { type, title, message, recipients, role, userId } = body;

    // Validaciones básicas
    if (!type || !title || !message || !recipients) {
      return NextResponse.json(
        { error: 'Campos requeridos: type, title, message, recipients' },
        { status: 400 }
      );
    }

    let recipientUsers: Array<{ id: string, email: string, name: string | null }> = [];

    // Determinar destinatarios según el tipo seleccionado
    switch (recipients) {
      case 'ALL':
        // Obtener todos los usuarios activos
        recipientUsers = await prismaClient.user.findMany({
          where: { isActive: true },
          select: { id: true, email: true, name: true }
        });
        break;

      case 'BY_ROLE':
        if (!role) {
          return NextResponse.json(
            { error: 'Rol requerido para envío por rol' },
            { status: 400 }
          );
        }
        // Obtener usuarios por rol
        recipientUsers = await prismaClient.user.findMany({
          where: { 
            role: role,
            isActive: true 
          },
          select: { id: true, email: true, name: true }
        });
        break;

      case 'SPECIFIC_USER':
        if (!userId) {
          return NextResponse.json(
            { error: 'Usuario requerido para envío específico' },
            { status: 400 }
          );
        }
        // Buscar usuario específico por email o ID
        const specificUser = await prismaClient.user.findFirst({
          where: {
            OR: [
              { email: userId },
              { id: userId },
              { name: { contains: userId, mode: 'insensitive' } }
            ],
            isActive: true
          },
          select: { id: true, email: true, name: true }
        });

        if (specificUser) {
          recipientUsers = [specificUser];
        } else {
          return NextResponse.json(
            { error: 'Usuario no encontrado' },
            { status: 404 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de destinatario no válido' },
          { status: 400 }
        );
    }

    if (recipientUsers.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron destinatarios para esta notificación' },
        { status: 400 }
      );
    }

    // Crear notificaciones reales en la base de datos
    const createdNotifications = await Promise.all(
      recipientUsers.map(user => 
        prismaClient.notification.create({
          data: {
            title,
            message,
            type: type as any, // Mapear a NotificationType enum
            priority: type === 'SYSTEM' ? 'HIGH' : 'NORMAL',
            userId: user.id,
            senderId: session.user.id,
            metadata: {
              adminCreated: true,
              recipientType: recipients,
              targetRole: role,
              targetUser: userId
            }
          }
        })
      )
    );

    const notificationId = createdNotifications[0]?.id || `notif_${Date.now()}`;

    // Registrar en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'OTHER',
      entity: 'NOTIFICATION',
      entityId: notificationId,
      entityName: title,
      description: `Created ${type} notification: "${title}" for ${recipientUsers.length} recipients`,
      metadata: {
        notificationType: type,
        recipientType: recipients,
        recipientCount: recipientUsers.length,
        targetRole: role,
        targetUser: userId
      },
      category: 'ADMIN',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      message: `Notificació enviada a ${recipientUsers.length} destinataris`,
      data: {
        id: notificationId,
        type,
        title,
        recipientCount: recipientUsers.length,
        status: 'SENT'
      }
    });

  } catch (error) {
    console.error('Error creant notificació:', error);
    
    // Registrar error en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'OTHER',
      entity: 'NOTIFICATION',
      description: `Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      category: 'ADMIN',
      level: 'ERROR',
      success: false,
      ipAddress,
      userAgent
    });

    return NextResponse.json(
      { error: 'Error creant notificació' },
      { status: 500 }
    );
  }
}