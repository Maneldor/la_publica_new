import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/groups
 * Obtiene lista de grupos/comunidades (solo admin)
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

    // Obtener comunidades/grupos
    const comunidades = await prismaClient.comunidad.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear respuesta para compatibilidad con el frontend
    const formattedGroups = comunidades.map(comunidad => ({
      id: parseInt(comunidad.id), // Convertir string a number si es necesario
      name: comunidad.nombre,
      description: comunidad.descripcion || 'Comunidad sin descripción',
      category: 'General', // Campo fijo por ahora
      visibility: comunidad.activa ? 'PUBLIC' : 'PRIVATE', // Usar campo activa como visibilidad
      imageUrl: undefined, // No disponible en el esquema actual
      memberCount: comunidad._count?.anuncios || 0, // Usamos count de anuncios como proxy de miembros
      createdAt: comunidad.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedGroups
    });

  } catch (error) {
    console.error('Error al obtener grupos:', error);
    return NextResponse.json(
      { error: 'Error al obtener grupos', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/groups
 * Crea un nuevo grupo/comunidad (solo admin)
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
    const { name, description, category, visibility, imageUrl } = body;

    // Crear comunidad
    const nuevaComunidad = await prismaClient.comunidad.create({
      data: {
        nombre: name,
        descripcion: description,
        activa: visibility === 'PUBLIC',
      }
    });

    // Formatear respuesta
    const formattedGroup = {
      id: parseInt(nuevaComunidad.id),
      name: nuevaComunidad.nombre,
      description: nuevaComunidad.descripcion || '',
      category: 'General',
      visibility: nuevaComunidad.activa ? 'PUBLIC' : 'PRIVATE',
      imageUrl: undefined,
      memberCount: 0,
      createdAt: nuevaComunidad.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedGroup,
      message: 'Grupo creado correctamente'
    });

  } catch (error) {
    console.error('Error al crear grupo:', error);
    return NextResponse.json(
      { error: 'Error al crear grupo', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}