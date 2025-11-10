import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '20');
    const estado = searchParams.get('estado') || '';
    const busqueda = searchParams.get('busqueda') || '';
    const fechaDesde = searchParams.get('fechaDesde') || '';
    const fechaHasta = searchParams.get('fechaHasta') || '';

    const skip = (pagina - 1) * limite;

    // Construir filtros
    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (busqueda) {
      where.OR = [
        { numeroFactura: { contains: busqueda, mode: 'insensitive' } },
        { empresaNombre: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    if (fechaDesde || fechaHasta) {
      where.fechaEmision = {};
      if (fechaDesde) {
        where.fechaEmision.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaEmision.lte = new Date(fechaHasta);
      }
    }

    // Obtener facturas
    const [facturas, total] = await Promise.all([
      prismaClient.factura.findMany({
        where,
        skip,
        take: limite,
        orderBy: {
          fechaCreacion: 'desc'
        },
        include: {
          company: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prismaClient.factura.count({ where })
    ]);

    return NextResponse.json({
      facturas,
      total,
      pagina,
      limite
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}