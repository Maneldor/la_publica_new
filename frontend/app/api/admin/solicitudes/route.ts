import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');

    // Construir query string para backend
    let queryString = '';
    if (estado) {
      queryString = `?estado=${estado}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/solicitudes${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${(session.user as any).backendToken || (session.user as any).apiToken || ''}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error('Error al obtener solicitudes');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}