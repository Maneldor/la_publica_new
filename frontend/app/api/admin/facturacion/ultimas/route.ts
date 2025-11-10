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

    // Obtener las últimas 10 facturas
    const ultimasFacturas = await prismaClient.factura.findMany({
      take: 10,
      orderBy: {
        fechaCreacion: 'desc'
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });

    // Formatear los datos para el frontend
    const facturasFormateadas = ultimasFacturas.map(factura => ({
      id: factura.id,
      numeroFactura: factura.numeroFactura,
      companyName: factura.company.name,
      total: factura.total,
      estat: factura.estado,
      fechaCreacion: factura.fechaCreacion.toISOString()
    }));

    return NextResponse.json(facturasFormateadas);

  } catch (error) {
    console.error('Error obteniendo últimas facturas:', error);
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