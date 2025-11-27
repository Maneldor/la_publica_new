import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {

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
    const facturasMes = await prismaClient.invoice.count({
      where: {
        createdAt: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    // Sumar ingresos del mes (solo facturas pagadas)
    const ingresosMesResult = await prismaClient.invoice.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        createdAt: {
          gte: inicioMes,
          lte: finMes
        },
        status: 'PAID'
      }
    });

    // Sumar pendientes de cobro (facturas emitidas pero no pagadas)
    const pendientesCobroResult = await prismaClient.invoice.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: {
          in: ['SENT', 'OVERDUE']
        }
      }
    });

    // Sumar total anual (todas las facturas pagadas del año)
    const totalAnualResult = await prismaClient.invoice.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        createdAt: {
          gte: inicioAno,
          lte: finAno
        },
        status: 'PAID'
      }
    });

    const estadisticas = {
      facturasMes: facturasMes || 0,
      ingresosMes: (ingresosMesResult._sum?.totalAmount || 0) / 100, // Convertir de centavos a euros
      pendientesCobro: (pendientesCobroResult._sum?.totalAmount || 0) / 100, // Convertir de centavos a euros
      totalAnual: (totalAnualResult._sum?.totalAmount || 0) / 100 // Convertir de centavos a euros
    };

    return NextResponse.json(estadisticas);

  } catch (error) {
    console.error('Error obteniendo estadísticas de facturación:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}