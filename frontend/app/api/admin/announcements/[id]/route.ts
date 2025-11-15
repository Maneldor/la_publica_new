import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/announcements/[id]
 * Obtiene un anuncio específico (solo admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Obtener anuncio específico
    const anuncio = await prismaClient.anuncio.findUnique({
      where: {
        id: params.id,
        deletedAt: null
      },
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
      }
    });

    if (!anuncio) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: anuncio
    });

  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    return NextResponse.json(
      { error: 'Error al obtener anuncio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/announcements/[id]
 * Actualiza un anuncio específico (solo admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Actualizar anuncio
    const updatedAnuncio = await prismaClient.anuncio.update({
      where: {
        id: params.id,
        deletedAt: null
      },
      data: {
        ...body,
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
      data: updatedAnuncio
    });

  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    return NextResponse.json(
      { error: 'Error al actualizar anuncio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * Elimina un anuncio específico (solo admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Eliminar anuncio (soft delete)
    await prismaClient.anuncio.update({
      where: {
        id: params.id,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Anuncio eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    return NextResponse.json(
      { error: 'Error al eliminar anuncio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}