import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// SEGURIDAD: Schema de validación para parámetros de consulta
const QueryParamsSchema = z.object({
  page: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : 1)
    .refine(val => val >= 1, 'La página ha de ser major o igual a 1'),

  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : 10)
    .refine(val => val >= 1 && val <= 50, 'El límit ha de ser entre 1 i 50'),

  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
    .optional(),

  search: z.string()
    .max(200, 'La cerca no pot superar 200 caràcters')
    .optional(),

  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status'])
    .optional()
    .default('createdAt'),

  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de consulta sin autenticación');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol COMPANY
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      include: {
        ownedCompany: true
      }
    });

    if (!user || user.role !== 'COMPANY') {
      console.warn(`[SECURITY] Usuario ${user?.email} intentó consultar sin ser empresa`);
      return NextResponse.json(
        { success: false, error: 'Només les empreses poden consultar solicituds' },
        { status: 403 }
      );
    }

    // SEGURIDAD: Verificar que está vinculado a empresa
    if (!user.ownedCompanyId || !user.ownedCompany) {
      console.error(`[SECURITY] Usuario ${user.email} sin empresa vinculada`);
      return NextResponse.json(
        { success: false, error: 'No tens empresa vinculada' },
        { status: 403 }
      );
    }

    // SEGURIDAD: Validar parámetros de consulta
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validationResult = QueryParamsSchema.safeParse(queryParams);

    if (!validationResult.success) {
      console.warn(`[VALIDATION] Parámetros inválidos de ${user.email}:`, validationResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Paràmetres de consulta invàlids',
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { page, limit, status, search, sortBy, sortOrder } = validationResult.data;

    // Construir filtros de consulta
    const where: any = {
      requesterId: user.id // SEGURIDAD: Solo sus propias solicitudes
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      // Búsqueda en título y descripción
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Ejecutar consulta con conteo total
    const [requests, totalCount] = await Promise.all([
      prismaClient.groupOfferRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
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
                  email: true
                }
              }
            }
          },
          // Incluir configuraciones relacionadas si existen
          _count: {
            select: {
              GroupParticipant: true
            }
          }
        }
      }),
      prismaClient.groupOfferRequest.count({ where })
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Logging
    console.log(`[SUCCESS] Consulta de solicitudes: Usuario ${user.email}, ${requests.length} resultados`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    return NextResponse.json(
      {
        success: true,
        data: requests.map(request => ({
          id: request.id,
          title: request.title,
          description: request.description,
          category: request.category,
          location: request.location,
          minParticipants: request.minParticipants,
          maxParticipants: request.maxParticipants,
          targetPrice: request.targetPrice,
          status: request.status,
          contactEmail: request.contactEmail,
          contactPhone: request.contactPhone,
          tags: request.tags,
          priority: request.priority,
          participantCount: request._count.GroupParticipant,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          requester: request.requester
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        },
        filters: {
          status,
          search,
          sortBy,
          sortOrder
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[ERROR] Error consultando solicitudes:', error);

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
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}