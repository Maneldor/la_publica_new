import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/logs - Obtener logs de auditoría con filtros
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Filtros
    const action = searchParams.get('action') || undefined;
    const entity = searchParams.get('entity') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const search = searchParams.get('search') || '';

    // Paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Fechas
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Construir where
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = userId;
    }

    if (severity) {
      where.severity = severity;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { entityName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    console.log('📊 [Admin Logs] Query:', { where, page, limit });

    const [logs, total, stats] = await Promise.all([
      prismaClient.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prismaClient.auditLog.count({ where }),
      prismaClient.auditLog.groupBy({
        by: ['severity'],
        _count: true,
        where
      })
    ]);

    const severityStats = stats.reduce((acc, item) => {
      acc[item.severity] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Obtener estadísticas adicionales
    const [actionStats, entityStats, recentActivity] = await Promise.all([
      prismaClient.auditLog.groupBy({
        by: ['action'],
        _count: true,
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
          }
        },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),
      prismaClient.auditLog.groupBy({
        by: ['entity'],
        _count: true,
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
          }
        },
        orderBy: { _count: { entity: 'desc' } },
        take: 10
      }),
      prismaClient.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      })
    ]);

    console.log(`✅ [Admin Logs] Found ${logs.length} logs (${total} total)`);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + logs.length < total
      },
      stats: {
        bySeverity: severityStats,
        byAction: actionStats.reduce((acc, item) => {
          acc[item.action] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byEntity: entityStats.reduce((acc, item) => {
          acc[item.entity] = item._count;
          return acc;
        }, {} as Record<string, number>),
        recentActivity: {
          last24h: recentActivity
        }
      },
      meta: {
        queryTime: Date.now(),
        filters: {
          action,
          entity,
          userId,
          severity,
          search,
          dateFrom,
          dateTo
        }
      }
    });

  } catch (error) {
    console.error('❌ [Admin Logs] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al carregar logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/logs - Crear audit log manual (para testing)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Només SUPER_ADMIN pot crear logs manuals' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, entity, entityId, entityName, description, severity, metadata } = body;

    if (!action || !entity || !description) {
      return NextResponse.json(
        { success: false, error: 'action, entity i description són obligatoris' },
        { status: 400 }
      );
    }

    const log = await prismaClient.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || 'Manual Entry',
        userEmail: session.user.email || 'manual@lapublica.es',
        userRole: session.user.role,

        action,
        entity,
        entityId,
        entityName,
        description,

        severity: severity || 'INFO',
        success: true,
        metadata: metadata || null,

        ipAddress: request.headers.get('x-forwarded-for') || 'manual',
        userAgent: request.headers.get('user-agent') || 'manual'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log('📝 [Admin Logs] Manual log created:', log.id);

    return NextResponse.json({
      success: true,
      message: 'Log creat correctament',
      log
    });

  } catch (error) {
    console.error('❌ [Admin Logs] Error creating manual log:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear log manual',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}