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

    // Calcular estadísticas del mes actual
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

    // Calcular estadísticas del año actual
    const inicioAno = new Date(ahora.getFullYear(), 0, 1);
    const finAno = new Date(ahora.getFullYear(), 11, 31);

    // Contar facturas del mes
    const facturasMes = await prismaClient.factura.count({
      where: {
        fechaCreacion: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    // Sumar ingresos del mes (solo facturas pagadas)
    const ingresosMesResult = await prismaClient.factura.aggregate({
      _sum: {
        total: true
      },
      where: {
        fechaCreacion: {
          gte: inicioMes,
          lte: finMes
        },
        estado: 'PAGADA'
      }
    });

    // Sumar pendientes de cobro (facturas emitidas pero no pagadas)
    const pendientesCobroResult = await prismaClient.factura.aggregate({
      _sum: {
        total: true
      },
      where: {
        estado: {
          in: ['EMITIDA', 'VENCIDA']
        }
      }
    });

    // Sumar total anual (todas las facturas pagadas del año)
    const totalAnualResult = await prismaClient.factura.aggregate({
      _sum: {
        total: true
      },
      where: {
        fechaCreacion: {
          gte: inicioAno,
          lte: finAno
        },
        estado: 'PAGADA'
      }
    });

    const estadisticas = {
      facturasMes: facturasMes || 0,
      ingresosMes: ingresosMesResult._sum.total || 0,
      pendientesCobro: pendientesCobroResult._sum.total || 0,
      totalAnual: totalAnualResult._sum.total || 0
    };

    return NextResponse.json(estadisticas);

  } catch (error) {
    console.error('Error obteniendo estadísticas de facturación:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}