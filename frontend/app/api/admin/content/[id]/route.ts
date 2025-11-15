import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/content/[id]
 * Obtiene un post específico (temporalmente deshabilitado)
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

    return NextResponse.json(
      { error: 'Funcionalidad temporalmente deshabilitada', message: 'Se requiere implementar el modelo Post/Blog en Prisma' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error al obtener post:', error);
    return NextResponse.json(
      { error: 'Funcionalidad temporalmente deshabilitada', details: 'No se encontró modelo de blog en el schema' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/content/[id]
 * Actualiza un post específico (temporalmente deshabilitado)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Función temporalmente deshabilitada', message: 'Se requiere implementar el modelo Post/Blog en Prisma' },
    { status: 501 }
  );
}

/**
 * DELETE /api/admin/content/[id]
 * Elimina un post específico (temporalmente deshabilitado)
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

    return NextResponse.json(
      { error: 'Función temporalmente deshabilitada', message: 'Se requiere implementar el modelo Post/Blog en Prisma' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error al eliminar post:', error);
    return NextResponse.json(
      { error: 'Funcionalidad temporalmente deshabilitada', details: 'No se encontró modelo de blog en el schema' },
      { status: 500 }
    );
  }
}