import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/crm/leads - Lista con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Parámetros de filtrado
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source');
    const scoreGrade = searchParams.get('scoreGrade');
    const sector = searchParams.get('sector');
    const search = searchParams.get('search');

    // Paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Ordenamiento
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log(`🔍 [CRM Leads] Loading leads for user: ${session.user.email}`);

    // Construcción de filtros
    const where: Prisma.CompanyLeadWhereInput = {
      assignedToId: userId,
    };

    if (status) {
      where.status = status as any;
    }

    if (priority) {
      where.priority = priority as any;
    }

    if (source) {
      where.source = source as any;
    }

    if (scoreGrade) {
      where.scoreGrade = scoreGrade;
    }

    if (sector) {
      where.sector = sector;
    }

    // Búsqueda por texto
    if (search && search.trim() !== '') {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cif: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Consulta principal
    const [leads, total] = await Promise.all([
      prismaClient.companyLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              createdAt: true,
              type: true,
            },
          },
          tasks: {
            where: {
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
            orderBy: { dueDate: 'asc' },
            take: 1,
          },
        },
      }),
      prismaClient.companyLead.count({ where }),
    ]);

    // Estadísticas por estado (para vista Kanban)
    const statusCounts = await prismaClient.companyLead.groupBy({
      by: ['status'],
      where: {
        assignedToId: userId,
      },
      _count: true,
    });

    const statusStats = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📊 [CRM Leads] Found ${total} leads, returning ${leads.length} results`);

    return NextResponse.json({
      success: true,
      data: {
        leads: leads.map(lead => ({
          id: lead.id,
          companyName: lead.companyName,
          cif: lead.cif,
          sector: lead.sector,
          source: lead.source.toLowerCase(),
          priority: lead.priority.toLowerCase(),
          status: lead.status.toLowerCase(),
          estimatedValue: lead.estimatedRevenue ? Number(lead.estimatedRevenue) : undefined,
          assignedToId: lead.assignedToId,
          assignedTo: lead.assignedTo ? {
            id: lead.assignedTo.id,
            email: lead.assignedTo.email
          } : undefined,
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt.toISOString(),
          contacts: [], // TODO: Agregar contactos cuando se cree el modelo
          _count: {
            contacts: 0, // TODO: Contar contactos reales
            interactions: lead.interactions.length
          }
        })),
        total,
        hasMore: (page * limit) < total,
        // También incluir paginación para compatibilidad con dashboard
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statusStats,
      },
    });
  } catch (error) {
    console.error('❌ [CRM Leads] Error obteniendo leads:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads - Crear nuevo lead
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'COMPANY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    console.log(`📝 [CRM Leads] Creating new lead: ${body.companyName}`);

    // Validación básica
    if (!body.companyName || !body.contactName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Falten camps obligatoris',
          details: 'companyName, contactName i email són obligatoris'
        },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Email invàlid' },
        { status: 400 }
      );
    }

    // Verificar si ya existe lead con mismo CIF o email
    if (body.cif) {
      const existingLead = await prismaClient.companyLead.findFirst({
        where: {
          OR: [
            { cif: body.cif },
            { email: body.email },
          ],
        },
      });

      if (existingLead) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ja existeix un lead amb aquest CIF o email',
            existingLeadId: existingLead.id
          },
          { status: 409 }
        );
      }
    }

    // Crear lead
    const lead = await prismaClient.companyLead.create({
      data: {
        companyName: body.companyName,
        cif: body.cif || null,
        sector: body.sector || null,
        contactName: body.contactName,
        contactRole: body.contactRole || null,
        email: body.email,
        phone: body.phone || null,
        website: body.website || null,
        companySize: body.companySize || null,
        estimatedRevenue: body.estimatedRevenue || null,
        currentPlatforms: body.currentPlatforms || null,
        competitorOffers: body.competitorOffers || null,
        discountTypes: body.discountTypes || null,
        status: body.status || 'NEW',
        priority: body.priority || 'MEDIUM',
        score: body.score || null,
        scoreGrade: body.scoreGrade || null,
        source: body.source || 'MANUAL',
        assignedToId: userId,
        tags: body.tags || [],
        notes: body.notes || null,
        internalNotes: body.internalNotes || null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Registrar actividad
    await prismaClient.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: userId,
        type: 'LEAD_CREATED',
        description: `Lead creat manualment per ${session.user.name}`,
        metadata: {
          source: body.source || 'MANUAL',
        },
      },
    });

    console.log(`✅ [CRM Leads] Lead created successfully: ${lead.id}`);

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead creat correctament',
    });
  } catch (error) {
    console.error('❌ [CRM Leads] Error creando lead:', error);
    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}