import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/groups/[id]
 * Obtiene un grupo específico (solo admin)
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

    // Obtener grupo específico
    const comunidad = await prismaClient.comunidad.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activa: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            anuncios: true,
          }
        }
      }
    });

    if (!comunidad) {
      return NextResponse.json(
        { error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    // Formatear respuesta
    const formattedGroup = {
      id: parseInt(comunidad.id),
      name: comunidad.nombre,
      description: comunidad.descripcion || '',
      category: 'General',
      visibility: comunidad.activa ? 'PUBLIC' : 'PRIVATE',
      imageUrl: undefined,
      memberCount: comunidad._count?.anuncios || 0,
      createdAt: comunidad.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedGroup
    });

  } catch (error) {
    console.error('Error al obtener grupo:', error);
    return NextResponse.json(
      { error: 'Error al obtener grupo', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/groups/[id]
 * Actualiza un grupo específico (solo admin)
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
      select: { role: true, userType: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.userType !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, category, visibility, imageUrl } = body;

    // Actualizar grupo
    const updatedComunidad = await prismaClient.comunidad.update({
      where: { id: params.id },
      data: {
        nombre: name,
        descripcion: description,
        activa: visibility === 'PUBLIC',
      }
    });

    // Formatear respuesta
    const formattedGroup = {
      id: parseInt(updatedComunidad.id),
      name: updatedComunidad.nombre,
      description: updatedComunidad.descripcion || '',
      category: 'General',
      visibility: updatedComunidad.activa ? 'PUBLIC' : 'PRIVATE',
      imageUrl: undefined,
      memberCount: 0,
      createdAt: updatedComunidad.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedGroup,
      message: 'Grupo actualizado correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar grupo', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/groups/[id]
 * Elimina un grupo específico (solo admin)
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

    // Verificar si el grupo tiene anuncios asociados
    const comunidadConAnuncios = await prismaClient.comunidad.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            anuncios: true
          }
        }
      }
    });

    if (!comunidadConAnuncios) {
      return NextResponse.json(
        { error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    if (comunidadConAnuncios._count.anuncios > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un grupo que tiene anuncios asociados' },
        { status: 400 }
      );
    }

    // Eliminar grupo
    await prismaClient.comunidad.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Grupo eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar grupo', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}