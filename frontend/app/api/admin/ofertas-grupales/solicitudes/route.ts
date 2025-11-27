import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Schema de validación para query params
const QuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  companyId: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status', 'targetPrice', 'minParticipants']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de acceso admin sin autenticación');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol ADMIN
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
      console.warn(`[SECURITY] Usuario ${user?.email} intentó acceder a admin sin permisos`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat. Només per administradors.' },
        { status: 403 }
      );
    }

    // LOGGING: Acceso admin
    console.log(`[ADMIN_ACCESS] ${user.email} accediendo a todas las solicitudes`);

    // Parsear y validar query params
    const { searchParams } = new URL(req.url);
    const queryParams = {
      status: searchParams.get('status') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validationResult = QuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paràmetres de consulta invàlids',
          details: validationResult.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { status, companyId, search, page, limit, sortBy, sortOrder } = validationResult.data;
    const skip = (page - 1) * limit;

    // Construir filtro
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.requesterId = companyId; // requesterId es el ID del usuario empresa
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { requester: {
          ownedCompany: {
            name: { contains: search, mode: 'insensitive' }
          }
        }},
      ];
    }

    // Obtener solicitudes con paginación
    const [requests, total, stats] = await Promise.all([
      prismaClient.groupOfferRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              ownedCompany: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  status: true,
                  cif: true,
                  address: true
                }
              }
            }
          },
          groupOffer: {
            include: {
              _count: {
                select: {
                  participants: true
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prismaClient.groupOfferRequest.count({ where }),
      // Estadísticas generales
      prismaClient.groupOfferRequest.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    const pages = Math.ceil(total / limit);

    // Construir estadísticas
    const statistics = {
      total,
      byStatus: stats.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      // Estadísticas adicionales para admin
      pendingCount: stats.find(s => s.status === 'PENDING')?._count || 0,
      approvedCount: stats.find(s => s.status === 'APPROVED')?._count || 0,
      rejectedCount: stats.find(s => s.status === 'REJECTED')?._count || 0,
    };

    // Logging
    console.log(`[ADMIN_SUCCESS] ${user.email} listó ${requests.length} solicitudes de ${total} totales`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        requests: requests.map(req => ({
          // Información básica de la solicitud
          id: req.id,
          title: req.title,
          description: req.description,
          category: req.category,
          location: req.location,
          minParticipants: req.minParticipants,
          maxParticipants: req.maxParticipants,
          targetPrice: req.targetPrice,
          status: req.status,

          // Información de contacto
          contactEmail: req.contactEmail,
          contactPhone: req.contactPhone,

          // Metadatos
          tags: req.tags,
          priority: req.priority,
          internalNotes: req.internalNotes,

          // Contadores
          participantCount: req.groupOffer?._count?.participants || 0,

          // Información de la empresa solicitante
          requester: req.requester,
          company: req.requester.ownedCompany,

          // Timestamps
          createdAt: req.createdAt,
          updatedAt: req.updatedAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1
        },
        statistics,
        filters: {
          status,
          companyId,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('[ERROR] Error listando solicitudes admin:', error);

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
  return NextResponse.json({ error: 'Mètode no permès. Usa endpoints específics per crear/actualitzar.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}