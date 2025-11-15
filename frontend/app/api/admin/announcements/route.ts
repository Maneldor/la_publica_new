import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/announcements
 * Obtiene lista de anuncios (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, userType: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.userType !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Construir filtros
    const where: any = {
      deletedAt: null // Solo anuncios no eliminados
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Obtener anuncios con paginación
    const [anuncios, total] = await Promise.all([
      prismaClient.anuncio.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          type: true,
          priority: true,
          status: true,
          audience: true,
          targetCommunities: true,
          targetRoles: true,
          publishAt: true,
          expiresAt: true,
          sendNotification: true,
          notificationChannels: true,
          imageUrl: true,
          attachmentUrl: true,
          externalUrl: true,
          tags: true,
          isSticky: true,
          allowComments: true,
          slug: true,
          views: true,
          reactions: true,
          commentsCount: true,
          sharesCount: true,
          communityId: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          community: {
            select: {
              id: true,
              nombre: true,
            }
          },
          _count: {
            select: {
              comments: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.anuncio.count({ where })
    ]);

    // Formatear respuesta
    const formattedAnuncios = anuncios.map(anuncio => ({
      id: anuncio.id,
      title: anuncio.title,
      content: anuncio.content,
      summary: anuncio.summary,
      type: anuncio.type,
      priority: anuncio.priority,
      status: anuncio.status,
      audience: anuncio.audience,
      targetCommunities: anuncio.targetCommunities,
      targetRoles: anuncio.targetRoles,
      publishAt: anuncio.publishAt,
      expiresAt: anuncio.expiresAt,
      sendNotification: anuncio.sendNotification,
      notificationChannels: anuncio.notificationChannels,
      imageUrl: anuncio.imageUrl,
      attachmentUrl: anuncio.attachmentUrl,
      externalUrl: anuncio.externalUrl,
      tags: anuncio.tags,
      isSticky: anuncio.isSticky,
      allowComments: anuncio.allowComments,
      slug: anuncio.slug,
      views: anuncio.views,
      reactions: anuncio.reactions,
      commentsCount: anuncio.commentsCount,
      sharesCount: anuncio.sharesCount,
      communityId: anuncio.communityId,
      authorId: anuncio.authorId,
      createdAt: anuncio.createdAt,
      updatedAt: anuncio.updatedAt,
      deletedAt: anuncio.deletedAt,
      author: anuncio.author,
      community: anuncio.community,
      _count: anuncio._count
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: formattedAnuncios,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    return NextResponse.json(
      { error: 'Error al obtener anuncios', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/announcements
 * Crea un nuevo anuncio (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, userType: true, id: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.userType !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Crear anuncio
    const nuevoAnuncio = await prismaClient.anuncio.create({
      data: {
        ...body,
        authorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        community: {
          select: {
            id: true,
            nombre: true,
          }
        },
        _count: {
          select: {
            comments: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: nuevoAnuncio,
      message: 'Anuncio creado correctamente'
    });

  } catch (error) {
    console.error('Error al crear anuncio:', error);
    return NextResponse.json(
      { error: 'Error al crear anuncio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}