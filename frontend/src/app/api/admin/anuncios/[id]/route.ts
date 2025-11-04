import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { Permission } from '@/lib/permissions';
import { updateAnnouncementSchema } from '@/lib/validations/anuncios';
import { z } from 'zod';

// Mapeo de enums entre Zod y Prisma
const mapAnnouncementType = (type?: string) => {
  if (!type) return undefined;
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
  return mapping[type];
};

const mapAudienceType = (audience?: string) => {
  if (!audience) return undefined;
  const mapping: Record<string, string> = {
    'all': 'ALL',
    'employees': 'EMPLOYEES',
    'companies': 'COMPANIES',
    'specific': 'SPECIFIC',
    'community': 'COMMUNITY'
  };
  return mapping[audience];
};

const mapNotificationChannel = (channels?: string[]) => {
  if (!channels) return undefined;
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
  if (!status) return undefined;
  const mapping: Record<string, string> = {
    'draft': 'DRAFT',
    'pending': 'PENDING',
    'published': 'PUBLISHED',
    'archived': 'ARCHIVED',
    'expired': 'EXPIRED'
  };
  return mapping[status];
};

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/anuncios/[id] - Obtener un anuncio específico
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Buscar anuncio
    const anuncio = await prisma.anuncio.findUnique({
      where: {
        id: params.id,
        deletedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        community: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        comments: {
          where: {
            deletedAt: null,
            status: 'APPROVED'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        metrics: true,
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    if (!anuncio) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso al anuncio (por comunidad)
    if (
      session.user.role !== 'SUPER_ADMIN' &&
      anuncio.communityId &&
      anuncio.communityId !== session.user.communityId
    ) {
      return NextResponse.json({ error: 'Sin acceso a este anuncio' }, { status: 403 });
    }

    // Incrementar contador de vistas
    await prisma.anuncio.update({
      where: { id: params.id },
      data: {
        views: { increment: 1 }
      }
    });

    return NextResponse.json(anuncio);

  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// PATCH /api/admin/anuncios/[id] - Actualizar un anuncio
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    if (!hasPermission(session.user, Permission.UPDATE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: 'Sin permisos para actualizar anuncios' }, { status: 403 });
    }

    // Verificar que el anuncio existe y obtener datos actuales
    const anuncioActual = await prisma.anuncio.findUnique({
      where: {
        id: params.id,
        deletedAt: null
      }
    });

    if (!anuncioActual) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso al anuncio
    if (
      session.user.role !== 'SUPER_ADMIN' &&
      session.user.role !== 'ADMIN' &&
      anuncioActual.authorId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Sin permisos para editar este anuncio' }, { status: 403 });
    }

    // Parsear y validar datos
    const body = await request.json();
    const validatedData = updateAnnouncementSchema.parse({
      ...body,
      id: params.id
    });

    // Preparar datos de actualización
    const updateData: any = {};

    // Actualizar solo los campos proporcionados
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.content !== undefined) updateData.content = validatedData.content;
    if (validatedData.summary !== undefined) updateData.summary = validatedData.summary;
    if (validatedData.type !== undefined) updateData.type = mapAnnouncementType(validatedData.type);
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.status !== undefined) updateData.status = mapStatus(validatedData.status);
    if (validatedData.audience !== undefined) updateData.audience = mapAudienceType(validatedData.audience);
    if (validatedData.targetCommunities !== undefined) updateData.targetCommunities = validatedData.targetCommunities;
    if (validatedData.targetRoles !== undefined) updateData.targetRoles = validatedData.targetRoles;
    if (validatedData.publishAt !== undefined) updateData.publishAt = validatedData.publishAt ? new Date(validatedData.publishAt) : null;
    if (validatedData.expiresAt !== undefined) updateData.expiresAt = validatedData.expiresAt ? new Date(validatedData.expiresAt) : null;
    if (validatedData.sendNotification !== undefined) updateData.sendNotification = validatedData.sendNotification;
    if (validatedData.notificationChannels !== undefined) updateData.notificationChannels = mapNotificationChannel(validatedData.notificationChannels);
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl;
    if (validatedData.attachmentUrl !== undefined) updateData.attachmentUrl = validatedData.attachmentUrl;
    if (validatedData.externalUrl !== undefined) updateData.externalUrl = validatedData.externalUrl;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.isSticky !== undefined) updateData.isSticky = validatedData.isSticky;
    if (validatedData.allowComments !== undefined) updateData.allowComments = validatedData.allowComments;

    // Si se actualiza el título, regenerar slug
    if (validatedData.title) {
      updateData.slug = validatedData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Actualizar anuncio
    const anuncio = await prisma.anuncio.update({
      where: { id: params.id },
      data: updateData,
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

    // Si el estado cambió a publicado y se debe enviar notificación
    if (
      validatedData.status === 'published' &&
      anuncioActual.status !== 'PUBLISHED' &&
      anuncio.sendNotification
    ) {
      // TODO: Implementar sistema de notificaciones
      console.log('Enviar notificación para anuncio publicado:', anuncio.id);
    }

    return NextResponse.json(anuncio);

  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Datos de actualización inválidos',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// DELETE /api/admin/anuncios/[id] - Eliminar un anuncio (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos
    if (!hasPermission(session.user, Permission.DELETE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: 'Sin permisos para eliminar anuncios' }, { status: 403 });
    }

    // Verificar que el anuncio existe
    const anuncio = await prisma.anuncio.findUnique({
      where: {
        id: params.id,
        deletedAt: null
      }
    });

    if (!anuncio) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso al anuncio
    if (
      session.user.role !== 'SUPER_ADMIN' &&
      session.user.role !== 'ADMIN' &&
      anuncio.authorId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Sin permisos para eliminar este anuncio' }, { status: 403 });
    }

    // Soft delete
    await prisma.anuncio.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        status: 'ARCHIVED'
      }
    });

    return NextResponse.json({ message: 'Anuncio eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}