import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get user and company data
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: {
          include: {
            currentPlan: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!user?.ownedCompany) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    const company = user.ownedCompany;
    const currentSubscription = company.subscriptions[0];
    const notifications: any[] = [];
    const now = new Date();

    // 0. Obtener notificaciones reales de la base de datos
    const dbNotifications = await prismaClient.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
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

    // Mapear notificaciones de BD al formato esperado
    const mappedDbNotifications = dbNotifications.map(n => ({
      id: n.id,
      type: mapNotificationType(n.type),
      priority: mapPriority(n.priority),
      title: n.title,
      message: n.message,
      actionText: 'Veure',
      actionUrl: n.actionUrl || undefined,
      createdAt: n.createdAt,
      read: n.isRead,
      sender: n.sender
    }));

    notifications.push(...mappedDbNotifications);

    // 1. Check trial ending
    if (currentSubscription?.startDate && currentSubscription?.endDate) {
      const endDate = new Date(currentSubscription.endDate);
      const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // If it's PIONERES plan (trial) and ending soon
      if (company.currentPlan?.tier === 'PIONERES' && daysUntilEnd <= 30 && daysUntilEnd > 0) {
        notifications.push({
          id: 'trial-ending',
          type: 'warning',
          priority: 'high',
          title: 'El teu període de prova acaba aviat',
          message: `Només queden ${daysUntilEnd} dies del teu període de prova gratuït. Actualitza el teu pla per continuar gaudint de tots els beneficis.`,
          actionText: 'Veure plans',
          actionUrl: '/empresa/plans',
          createdAt: now,
          read: false
        });
      } else if (company.currentPlan?.tier === 'PIONERES' && daysUntilEnd <= 0) {
        notifications.push({
          id: 'trial-ended',
          type: 'error',
          priority: 'critical',
          title: 'El teu període de prova ha finalitzat',
          message: 'Actualitza el teu pla per continuar utilitzant totes les funcionalitats de La Pública.',
          actionText: 'Actualitzar pla',
          actionUrl: '/empresa/plans',
          createdAt: now,
          read: false
        });
      }
    }

    // 2. Check limits - getting limits data from API
    const limitsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/empresa/limits`, {
      headers: {
        'Cookie': request.headers.get('Cookie') || ''
      }
    });

    if (limitsResponse.ok) {
      const limitsData = await limitsResponse.json();

      const limitsMap = [
        { key: 'ofertas', data: limitsData.ofertas, label: 'ofertes' },
        { key: 'extras', data: limitsData.extras, label: 'extres' },
        { key: 'empleados', data: limitsData.empleados, label: 'empleats' },
        { key: 'usuaris', data: limitsData.usuaris, label: 'usuaris' }
      ];

      limitsMap.forEach(({ key, data, label }) => {
        if (!data || data.max === 0) return;

        const percentage = (data.used / data.max) * 100;

        if (data.used > data.max) {
          // Exceeded
          notifications.push({
            id: `limit-exceeded-${key}`,
            type: 'error',
            priority: 'high',
            title: `Límit de ${label} superat`,
            message: `Has superat el límit de ${label} (${data.used}/${data.max}). Actualitza el teu pla per augmentar aquest límit.`,
            actionText: 'Veure plans',
            actionUrl: '/empresa/plans',
            createdAt: now,
            read: false
          });
        } else if (percentage >= 80) {
          // Warning (80% or more)
          notifications.push({
            id: `limit-warning-${key}`,
            type: 'warning',
            priority: 'medium',
            title: `A prop del límit de ${label}`,
            message: `Estàs utilitzant el ${Math.round(percentage)}% del teu límit de ${label} (${data.used}/${data.max}).`,
            actionText: 'Veure detalls',
            actionUrl: '/empresa/pla',
            createdAt: now,
            read: false
          });
        }
      });
    }

    // Sort by priority
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      hasWarnings: notifications.some(n => n.type === 'warning'),
      hasErrors: notifications.some(n => n.type === 'error')
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}

// Marcar notificación como leída
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Marcar todas como leídas
      await prismaClient.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
      return NextResponse.json({ success: true, message: 'Totes les notificacions marcades com a llegides' });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notificació requerit' }, { status: 400 });
    }

    // Marcar una específica como leída
    await prismaClient.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marcant notificació:', error);
    return NextResponse.json({ error: 'Error al marcar notificació' }, { status: 500 });
  }
}

// Eliminar notificación
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notificació requerit' }, { status: 400 });
    }

    await prismaClient.notification.delete({
      where: {
        id: notificationId,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminant notificació:', error);
    return NextResponse.json({ error: 'Error al eliminar notificació' }, { status: 500 });
  }
}

// Funciones auxiliares de mapeo
function mapNotificationType(type: string): 'info' | 'success' | 'warning' | 'error' {
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
    'COMPANY_PUBLISHED': 'success',
    'COMPANY_APPROVED': 'success',
    'COMPANY_COMPLETED': 'success',
    'CONNECTION_ACCEPTED': 'success',
    'LEAD_CONVERTED': 'success',
    'COMPANY_REJECTED': 'error',
    'CONNECTION_REJECTED': 'warning',
    'LEAD_EXPIRING': 'warning',
    'LEAD_INACTIVE_REMINDER': 'warning',
    'GENERAL': 'info',
    'NEW_MESSAGE': 'info',
    'CONNECTION_REQUEST': 'info',
    'COMPANY_ASSIGNED': 'info',
    'COMPANY_PENDING': 'info'
  };
  return typeMap[type] || 'info';
}

function mapPriority(priority: string): 'low' | 'medium' | 'high' | 'critical' {
  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'LOW': 'low',
    'NORMAL': 'medium',
    'HIGH': 'high',
    'URGENT': 'critical'
  };
  return priorityMap[priority] || 'medium';
}