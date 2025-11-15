import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/content
 * Obtiene lista de contenido/posts de blog (temporalmente deshabilitado)
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

    // Verificar si existe usuario admin
    // Como no hay modelo de blog en el schema, devolvemos una respuesta temporal
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Funcionalidad de blog temporalmente deshabilitada',
      info: 'No se encontró modelo de blog en el schema. Se requiere implementar el modelo Post/Blog en Prisma.'
    });

  } catch (error) {
    console.error('Error al obtener contenido:', error);
    return NextResponse.json(
      { error: 'Funcionalidad temporalmente deshabilitada', details: 'No se encontró modelo de blog en el schema' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/content
 * Crea nuevo contenido/post (temporalmente deshabilitado)
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Función temporalmente deshabilitada', message: 'Se requiere implementar el modelo Post/Blog en Prisma' },
    { status: 501 }
  );
}