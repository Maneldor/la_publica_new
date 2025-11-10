import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener catálogo de extras para empresa con indicador de contratación
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Buscar empresa del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const categoria = url.searchParams.get('categoria');

    const where: any = {
      activo: true // Solo mostrar extras activos
    };

    if (categoria) {
      where.categoria = categoria;
    }

    // Obtener todos los extras activos
    const extras = await prisma.featureExtra.findMany({
      where,
      orderBy: [
        { categoria: 'asc' },
        { orden: 'asc' }
      ]
    });

    // Obtener los extras contratados por esta empresa
    const extrasContratados = await prisma.empresaExtra.findMany({
      where: {
        empresaId: user.company.id,
        activo: true
      },
      select: {
        featureExtraId: true
      }
    });

    // Crear un Set con los IDs de extras contratados para búsqueda rápida
    const extrasContratadosIds = new Set(
      extrasContratados.map(ec => ec.featureExtraId)
    );

    // Agregar indicador de contratación a cada extra
    const extrasConEstado = extras.map(extra => ({
      ...extra,
      contratado: extrasContratadosIds.has(extra.id)
    }));

    return NextResponse.json({
      extras: extrasConEstado,
      total: extrasConEstado.length,
      categorias: [...new Set(extras.map(e => e.categoria))],
      totalContratados: extrasContratados.length
    });

  } catch (error) {
    console.error('Error al obtener extras:', error);
    return NextResponse.json(
      { error: 'Error al obtener extras' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}