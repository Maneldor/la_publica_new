import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

// GET - Listar todos los extras (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const categoria = url.searchParams.get('categoria');

    const where: any = {};
    if (categoria) {
      where.categoria = categoria;
    }

    // Obtener todos los extras de la base de datos ordenados por categoría y orden
    const extras = await prismaClient.extra.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    });

    return NextResponse.json({
      extras,
      total: extras.length,
      categorias: Array.from(new Set(extras.map(e => e.category)))
    });

  } catch (error) {
    console.error('Error al obtener extras:', error);
    return NextResponse.json(
      { error: 'Error al obtener extras' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo extra
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();

    // Validar campos requeridos
    if (!data.nombre || !data.categoria || data.precio === undefined) {
      return NextResponse.json(
        { error: 'Falten camps obligatoris' },
        { status: 400 }
      );
    }

    // Obtener el próximo número de orden para la categoría
    const maxOrden = await prismaClient.extra.aggregate({
      where: { category: data.categoria },
      _max: { order: true }
    });

    const nextOrden = (maxOrden._max?.order || 0) + 1;

    // Crear nuevo extra en la base de datos
    const nuevoExtra = await prismaClient.extra.create({
      data: {
        name: data.nombre,
        description: data.descripcion || '',
        category: data.categoria,
        basePrice: parseFloat(data.precio),
        details: data.limites ? data.limites : null,
        active: data.activo !== false, // Por defecto true
        order: data.orden || nextOrden,
        slug: data.nombre.toLowerCase().replace(/\s+/g, '-'), // Generar slug automático
        priceType: 'FIXED' as any, // Tipo por defecto
        featured: false,
        requiresApproval: false
      }
    });

    return NextResponse.json(nuevoExtra, { status: 201 });

  } catch (error) {
    console.error('Error al crear extra:', error);
    return NextResponse.json(
      { error: 'Error al crear extra' },
      { status: 500 }
    );
  }
}
