import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para query parameters
const leadsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20), // Max 50 leads
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']).optional(),
  source: z.enum(['OFFER_REDEMPTION', 'WEBSITE', 'REFERRAL', 'ADVERTISING']).optional(),
  offerId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'status', 'name', 'offer']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeStats: z.string().optional().transform(val => val === 'true')
}).refine(data => {
  return data.page > 0;
}, {
  message: 'Page ha de ser major que 0'
}).refine(data => {
  return data.limit > 0 && data.limit <= 50;
}, {
  message: 'Limit ha de estar entre 1 i 50'
});

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.warn('[SECURITY] Intento de acceso sin autenticación a leads');
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // 2. SEGURIDAD: Verificar que es empresa (tiene ownedCompany)
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        ownedCompany: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    if (!user?.ownedCompany) {
      console.warn(`[SECURITY] Usuario ${user?.email} intentó acceder a leads sin empresa asociada`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat. Només per empreses.' },
        { status: 403 }
      );
    }

    if (!user.ownedCompany.isActive) {
      return NextResponse.json(
        { success: false, error: 'Empresa inactiva. Contacta amb suport.' },
        { status: 403 }
      );
    }

    // 3. Parsear y validar query parameters
    const url = new URL(req.url);
    const queryParams = {
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      status: url.searchParams.get('status'),
      source: url.searchParams.get('source'),
      offerId: url.searchParams.get('offerId'),
      search: url.searchParams.get('search'),
      dateFrom: url.searchParams.get('dateFrom'),
      dateTo: url.searchParams.get('dateTo'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder'),
      includeStats: url.searchParams.get('includeStats')
    };

    const validation = leadsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paràmetres de consulta invàlids',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { page, limit, status, source, offerId, search, dateFrom, dateTo, sortBy, sortOrder, includeStats } = validation.data;

    // 4. Construir filtros para leads
    const leadFilters: any = {
      companyId: user.ownedCompany.id
    };

    if (status) {
      leadFilters.status = status;
    }

    if (source) {
      leadFilters.source = source;
    }

    if (offerId) {
      leadFilters.offerId = offerId;
    }

    if (search) {
      leadFilters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      leadFilters.createdAt = {};
      if (dateFrom) {
        leadFilters.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        leadFilters.createdAt.lte = new Date(dateTo);
      }
    }

    // 5. Configurar ordenamiento
    let orderBy: any = {};
    switch (sortBy) {
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'status':
        orderBy = { status: sortOrder };
        break;
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'offer':
        orderBy = { offer: { title: sortOrder } };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // 6. Obtener leads paginados
    const offset = (page - 1) * limit;

    const [leads, totalLeads] = await Promise.all([
      prismaClient.lead.findMany({
        where: leadFilters,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          offer: {
            select: {
              id: true,
              title: true,
              status: true,
              expiresAt: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prismaClient.lead.count({
        where: leadFilters
      })
    ]);

    // 7. Estadísticas adicionales (opcional)
    let additionalStats = {};
    if (includeStats) {
      const [statusDistribution, sourceDistribution, thisWeekLeads, thisMonthLeads] = await Promise.all([
        // Distribución por estado
        prismaClient.lead.groupBy({
          by: ['status'],
          where: { companyId: user.ownedCompany.id },
          _count: { status: true }
        }),
        // Distribución por fuente
        prismaClient.lead.groupBy({
          by: ['source'],
          where: { companyId: user.ownedCompany.id },
          _count: { source: true }
        }),
        // Leads esta semana
        prismaClient.lead.count({
          where: {
            companyId: user.ownedCompany.id,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }),
        // Leads este mes
        prismaClient.lead.count({
          where: {
            companyId: user.ownedCompany.id,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      const statusStats = {
        NEW: 0,
        CONTACTED: 0,
        CONVERTED: 0,
        CLOSED: 0
      };

      statusDistribution.forEach(stat => {
        statusStats[stat.status as keyof typeof statusStats] = stat._count.status;
      });

      const sourceStats = {};
      sourceDistribution.forEach(stat => {
        sourceStats[stat.source] = stat._count.source;
      });

      additionalStats = {
        statusDistribution: statusStats,
        sourceDistribution: sourceStats,
        thisWeekLeads,
        thisMonthLeads,
        conversionRate: totalLeads > 0 ? ((statusStats.CONVERTED / totalLeads) * 100).toFixed(2) : '0'
      };
    }

    // 8. Formatear leads para respuesta
    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      source: lead.source,
      acceptsMarketing: lead.acceptsMarketing,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
      offer: lead.offer ? {
        id: lead.offer.id,
        title: lead.offer.title,
        status: lead.offer.status,
        expiresAt: lead.offer.expiresAt?.toISOString() || null
      } : null,
      user: lead.user ? {
        id: lead.user.id,
        name: lead.user.name,
        email: lead.user.email
      } : null,
      metadata: lead.metadata || {}
    }));

    // 9. Calcular información de paginación
    const totalPages = Math.ceil(totalLeads / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 10. AUDIT LOG
    await prismaClient.notification.create({
      data: {
        type: 'AUDIT_LOG',
        title: 'EMPRESA_ACCESS: Consulta leads',
        message: `${user.email} consultó leads de empresa ${user.ownedCompany.name} - ${totalLeads} leads encontrados`,
        priority: 'LOW',
        userId: user.id,
        isRead: true,
        metadata: JSON.stringify({
          action: 'VIEW_COMPANY_LEADS',
          companyId: user.ownedCompany.id,
          filters: { status, source, offerId, search, dateFrom, dateTo },
          pagination: { page, limit },
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }
    }).catch(err => console.error('Error creando audit log:', err));

    console.log(`[EMPRESA_LEADS] ${user.email} consultó leads - ${totalLeads} encontrados`);
    console.log(`[PERFORMANCE] Tiempo de respuesta: ${Date.now() - startTime}ms`);

    // 11. Response exitosa
    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: user.ownedCompany.id,
          name: user.ownedCompany.name
        },
        leads: formattedLeads,
        pagination: {
          page,
          limit,
          total: totalLeads,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          status: status || null,
          source: source || null,
          offerId: offerId || null,
          search: search || null,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          sortBy,
          sortOrder
        },
        ...(includeStats && { stats: additionalStats })
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paràmetres invàlids',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('[ERROR] Error obteniendo leads empresa:', error);

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