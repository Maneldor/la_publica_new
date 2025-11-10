import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const extras = await prisma.featureExtra.findMany({
      where,
      orderBy: [
        { categoria: 'asc' },
        { orden: 'asc' }
      ]
    });

    return NextResponse.json({
      extras,
      total: extras.length,
      categorias: [...new Set(extras.map(e => e.categoria))]
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
    const maxOrden = await prisma.featureExtra.aggregate({
      where: { categoria: data.categoria },
      _max: { orden: true }
    });

    const nextOrden = (maxOrden._max.orden || 0) + 1;

    // Crear nuevo extra en la base de datos
    const nuevoExtra = await prisma.featureExtra.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        categoria: data.categoria,
        precio: parseFloat(data.precio),
        limitesJSON: data.limites ? JSON.stringify(data.limites) : null,
        activo: data.activo !== false, // Por defecto true
        orden: data.orden || nextOrden
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
