import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Schema de validación para query parameters
const QuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['reviewedAt', 'priority', 'empresa', 'createdAt']).default('reviewedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Función helper para convertir prioridad numérica a string
function mapPriorityToString(priority: number): string {
  if (priority >= 8) return 'HIGH';
  if (priority >= 5) return 'MEDIUM';
  return 'LOW';
}

// Función helper para filtrar por prioridad string
function mapPriorityStringToNumber(priorityFilter: string): { gte?: number; lte?: number } {
  switch (priorityFilter) {
    case 'HIGH': return { gte: 8 };
    case 'MEDIUM': return { gte: 5, lte: 7 };
    case 'LOW': return { lte: 4 };
    default: return {};
  }
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de acceso sin autenticación a mis-solicitudes');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol ADMIN (gestores son ADMIN)
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    if (!user || user.role !== 'ADMIN') {
      console.warn(`[SECURITY] Usuario ${user?.email} intentó acceder a solicitudes sin permisos de gestor`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat. Només per gestors.' },
        { status: 403 }
      );
    }

    // Parsear y validar query parameters
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const validationResult = QuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      console.warn(`[VALIDATION] Parámetros inválidos en mis-solicitudes:`, validationResult.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Paràmetres de cerca invàlids',
          details: validationResult.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const filters = validationResult.data;

    // Construir filtros de búsqueda
    const whereClause: any = {
      reviewedBy: session.user.id, // Solo las asignadas a este gestor
    };

    // Filtro por status
    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Filtro por prioridad (convertir string a rango numérico)
    if (filters.priority) {
      const priorityRange = mapPriorityStringToNumber(filters.priority);
      if (Object.keys(priorityRange).length > 0) {
        whereClause.priority = priorityRange;
      }
    }

    // Filtros por fecha (usando reviewedAt como fecha de asignación)
    if (filters.dateFrom || filters.dateTo) {
      whereClause.reviewedAt = {};
      if (filters.dateFrom) {
        whereClause.reviewedAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereClause.reviewedAt.lte = new Date(filters.dateTo);
      }
    }

    // Filtro de búsqueda por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      whereClause.OR = [
        {
          requester: {
            ownedCompany: {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          category: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    switch (filters.sortBy) {
      case 'reviewedAt':
        orderBy.reviewedAt = filters.sortOrder;
        break;
      case 'priority':
        orderBy.priority = filters.sortOrder;
        break;
      case 'empresa':
        orderBy.requester = {
          ownedCompany: {
            name: filters.sortOrder
          }
        };
        break;
      case 'createdAt':
        orderBy.createdAt = filters.sortOrder;
        break;
      default:
        orderBy.reviewedAt = 'desc';
    }

    // Calcular skip para paginación
    const skip = (filters.page - 1) * filters.limit;

    // Consultar solicitudes con incluir empresa y gestor
    const [solicitudes, totalCount] = await Promise.all([
      prismaClient.groupOfferRequest.findMany({
        where: whereClause,
        include: {
          requester: {
            include: {
              ownedCompany: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  logo: true,
                  description: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: filters.limit
      }),
      prismaClient.groupOfferRequest.count({
        where: whereClause
      })
    ]);

    // Calcular estadísticas para el gestor
    const [statsByStatus, statsByPriority] = await Promise.all([
      prismaClient.groupOfferRequest.groupBy({
        by: ['status'],
        where: { reviewedBy: session.user.id },
        _count: { status: true }
      }),
      prismaClient.groupOfferRequest.findMany({
        where: { reviewedBy: session.user.id },
        select: { priority: true }
      })
    ]);

    // Procesar estadísticas de prioridad (convertir números a strings)
    const priorityStats = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    statsByPriority.forEach(item => {
      const priorityString = mapPriorityToString(item.priority);
      priorityStats[priorityString as keyof typeof priorityStats]++;
    });

    // Formatear estadísticas de estado
    const statusStats = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0
    };

    statsByStatus.forEach(stat => {
      statusStats[stat.status as keyof typeof statusStats] = stat._count.status;
    });

    // Formatear respuesta
    const solicitudesFormateadas = solicitudes.map(solicitud => {
      const enriched = solicitud as typeof solicitud & {
        requester: {
          email: string | null;
          ownedCompany?: {
            id: string | null;
            name: string | null;
            email: string | null;
            logo: string | null;
            description: string | null;
          } | null;
        };
      };

      return {
        id: solicitud.id,
        empresaId: solicitud.requesterId,
        empresa: {
          id: enriched.requester.ownedCompany?.id || null,
          name: enriched.requester.ownedCompany?.name || 'Sense empresa',
          email: enriched.requester.ownedCompany?.email || enriched.requester.email,
          logo: enriched.requester.ownedCompany?.logo || null,
          description: enriched.requester.ownedCompany?.description || null
        },
        title: solicitud.title,
        category: solicitud.category,
        estimatedParticipants: solicitud.minParticipants,
        targetPrice: solicitud.targetPrice,
        additionalRequirements: solicitud.description,
        status: solicitud.status,
        priority: mapPriorityToString(solicitud.priority),
        assignedAt: solicitud.reviewedAt?.toISOString() || null,
        internalNotes: solicitud.internalNotes,
        createdAt: solicitud.createdAt.toISOString(),
        updatedAt: solicitud.updatedAt.toISOString()
      };
    });

    const totalPages = Math.ceil(totalCount / filters.limit);

    // AUDIT LOG para consulta de solicitudes
    await prismaClient.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'GESTOR_ACCESS: Consulta solicitudes',
        message: `${user.email} consultó sus solicitudes asignadas`,
        priority: 'LOW',
        userId: user.id,
        isRead: true,
        metadata: JSON.stringify({
          action: 'LIST_ASSIGNED_REQUESTS',
          filters: {
            status: filters.status,
            priority: filters.priority,
            search: filters.search,
            page: filters.page,
            limit: filters.limit
          },
          totalResults: totalCount,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }
    });

    console.log(`[GESTOR_SUCCESS] ${user.email} listó solicitudes asignadas - ${totalCount} resultados`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        solicitudes: solicitudesFormateadas,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: totalCount,
          totalPages
        },
        stats: {
          total: totalCount,
          porEstado: statusStats,
          porPrioridad: priorityStats
        }
      }
    });

  } catch (error) {
    console.error('[ERROR] Error listando solicitudes de gestor:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error intern del servidor. Intenta-ho més tard.'
      },
      { status: 500 }
    );
  }
}

// SEGURIDAD: Bloquear otros métodos HTTP
export async function POST() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès. Usa GET per consultar.' }, { status: 405 });
}