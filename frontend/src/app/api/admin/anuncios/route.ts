import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { Permission } from '@/lib/permissions';
import { createAnnouncementSchema, announcementFiltersSchema } from '@/lib/validations/anuncios';
import { z } from 'zod';

// Mapeo de enums entre Zod y Prisma
const mapAnnouncementType = (type: string) => {
  const mapping: Record<string, string> = {
    'general': 'GENERAL',
    'urgent': 'URGENT',
    'event': 'EVENT',
    'maintenance': 'MAINTENANCE',
    'news': 'NEWS',
    'alert': 'ALERT',
    'promotion': 'PROMOTION',
    'regulation': 'REGULATION'
  };
  return mapping[type] || 'GENERAL';
};

const mapAudienceType = (audience: string) => {
  const mapping: Record<string, string> = {
    'all': 'ALL',
    'employees': 'EMPLOYEES',
    'companies': 'COMPANIES',
    'specific': 'SPECIFIC',
    'community': 'COMMUNITY'
  };
  return mapping[audience] || 'ALL';
};

const mapNotificationChannel = (channels?: string[]) => {
  if (!channels) return [];
  const mapping: Record<string, string> = {
    'platform': 'PLATFORM',
    'email': 'EMAIL',
    'sms': 'SMS',
    'push': 'PUSH',
    'all_channels': 'ALL_CHANNELS'
  };
  return channels.map(ch => mapping[ch] || 'PLATFORM');
};

const mapStatus = (status?: string) => {
  const mapping: Record<string, string> = {
    'draft': 'DRAFT',
    'pending': 'PENDING',
    'published': 'PUBLISHED',
    'archived': 'ARCHIVED',
    'expired': 'EXPIRED'
  };
  return mapping[status || 'draft'] || 'DRAFT';
};

// GET /api/admin/anuncios - Listar anuncios con filtros
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    if (!hasPermission(session.user, Permission.READ_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: 'Sin permisos para ver anuncios' }, { status: 403 });
    }

    // Parsear query params
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') ? parseInt(searchParams.get('priority')!) : undefined,
      audience: searchParams.get('audience') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      communityId: searchParams.get('communityId') || undefined,
      isSticky: searchParams.get('isSticky') === 'true' ? true : searchParams.get('isSticky') === 'false' ? false : undefined,
      allowComments: searchParams.get('allowComments') === 'true' ? true : searchParams.get('allowComments') === 'false' ? false : undefined,
      publishedFrom: searchParams.get('publishedFrom') || undefined,
      publishedTo: searchParams.get('publishedTo') || undefined,
    };

    // Validar filtros
    const validatedFilters = announcementFiltersSchema.parse(filters);

    // Construir query
    const where: any = {
      deletedAt: null // Excluir eliminados
    };

    // Aplicar filtro por comunidad si el usuario no es SUPER_ADMIN
    if (session.user.role !== 'SUPER_ADMIN' && session.user.communityId) {
      where.communityId = session.user.communityId;
    } else if (validatedFilters.communityId) {
      where.communityId = validatedFilters.communityId;
    }

    // Aplicar búsqueda
    if (validatedFilters.search) {
      where.OR = [
        { title: { contains: validatedFilters.search, mode: 'insensitive' } },
        { content: { contains: validatedFilters.search, mode: 'insensitive' } },
        { summary: { contains: validatedFilters.search, mode: 'insensitive' } }
      ];
    }

    // Aplicar filtros específicos
    if (validatedFilters.type) {
      where.type = mapAnnouncementType(validatedFilters.type);
    }

    if (validatedFilters.status) {
      where.status = mapStatus(validatedFilters.status);
    }

    if (validatedFilters.priority !== undefined) {
      where.priority = validatedFilters.priority;
    }

    if (validatedFilters.audience) {
      where.audience = mapAudienceType(validatedFilters.audience);
    }

    if (validatedFilters.authorId) {
      where.authorId = validatedFilters.authorId;
    }

    if (validatedFilters.isSticky !== undefined) {
      where.isSticky = validatedFilters.isSticky;
    }

    if (validatedFilters.allowComments !== undefined) {
      where.allowComments = validatedFilters.allowComments;
    }

    // Filtros de fecha
    if (validatedFilters.publishedFrom || validatedFilters.publishedTo) {
      where.publishAt = {};
      if (validatedFilters.publishedFrom) {
        where.publishAt.gte = new Date(validatedFilters.publishedFrom);
      }
      if (validatedFilters.publishedTo) {
        where.publishAt.lte = new Date(validatedFilters.publishedTo);
      }
    }

    // Paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Consultar anuncios
    const [anuncios, total] = await Promise.all([
      prisma.anuncio.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isSticky: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          community: {
            select: {
              id: true,
              nombre: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        }
      }),
      prisma.anuncio.count({ where })
    ]);

    return NextResponse.json({
      data: anuncios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Datos de filtrado inválidos',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// POST /api/admin/anuncios - Crear nuevo anuncio
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    if (!hasPermission(session.user, Permission.CREATE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: 'Sin permisos para crear anuncios' }, { status: 403 });
    }

    // Parsear y validar datos
    const body = await request.json();
    const validatedData = createAnnouncementSchema.parse({
      ...body,
      authorId: session.user.id
    });

    // Generar slug
    const slug = validatedData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Crear anuncio
    const anuncio = await prisma.anuncio.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        summary: validatedData.summary,
        type: mapAnnouncementType(validatedData.type),
        priority: validatedData.priority,
        status: 'DRAFT',
        audience: mapAudienceType(validatedData.audience),
        targetCommunities: validatedData.targetCommunities || [],
        targetRoles: validatedData.targetRoles || [],
        publishAt: validatedData.publishAt ? new Date(validatedData.publishAt) : null,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        sendNotification: validatedData.sendNotification,
        notificationChannels: mapNotificationChannel(validatedData.notificationChannels),
        imageUrl: validatedData.imageUrl,
        attachmentUrl: validatedData.attachmentUrl,
        externalUrl: validatedData.externalUrl,
        tags: validatedData.tags || [],
        isSticky: validatedData.isSticky,
        allowComments: validatedData.allowComments,
        slug,
        communityId: session.user.communityId,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        community: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    // Si se debe enviar notificación inmediata
    if (validatedData.sendNotification && validatedData.status === 'published') {
      // TODO: Implementar sistema de notificaciones
      console.log('Enviar notificación para anuncio:', anuncio.id);
    }

    return NextResponse.json(anuncio, { status: 201 });

  } catch (error) {
    console.error('Error al crear anuncio:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Datos de anuncio inválidos',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}