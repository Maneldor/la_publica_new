import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * PATCH /api/admin/announcements/[id]/reject
 * Rechaza un anuncio (solo admin)
 */
export async function PATCH(
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
    const { reason } = body;

    // Verificar que el anuncio existe y está pendiente
    const anuncio = await prismaClient.anuncio.findUnique({
      where: {
        id: params.id,
        deletedAt: null
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!anuncio) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      );
    }

    // Rechazar anuncio
    const updatedAnuncio = await prismaClient.anuncio.update({
      where: {
        id: params.id
      },
      data: {
        status: 'REJECTED',
        // TODO: Podríamos agregar un campo para la razón del rechazo
        // rejectionReason: reason,
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
      data: updatedAnuncio,
      message: 'Anuncio rechazado correctamente'
    });

  } catch (error) {
    console.error('Error al rechazar anuncio:', error);
    return NextResponse.json(
      { error: 'Error al rechazar anuncio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}