import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Listar presupuestos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener query params para filtros
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const empresaId = searchParams.get('empresaId');
    const search = searchParams.get('search');

    let queryString = '';
    const params = [];
    if (estado) params.push(`estado=${estado}`);
    if (empresaId) params.push(`empresaId=${empresaId}`);
    if (search) params.push(`search=${search}`);
    if (params.length > 0) queryString = `?${params.join('&')}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/presupuestos${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener presupuestos');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    return NextResponse.json(
      { error: 'Error al obtener presupuestos' },
      { status: 500 }
    );
  }
}

// POST - Crear presupuesto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/presupuestos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    return NextResponse.json(
      { error: 'Error al crear presupuesto' },
      { status: 500 }
    );
  }
}