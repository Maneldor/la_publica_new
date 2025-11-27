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
      include: { ownedCompany: true, memberCompany: true }
    });

    const company = user?.ownedCompany || user?.memberCompany;
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const categoria = url.searchParams.get('categoria');

    const where: any = {
      active: true // Solo mostrar extras activos
    };

    if (categoria) {
      where.category = categoria;
    }

    // Obtener todos los extras activos
    const extras = await prisma.extra.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    });

    // TODO: Implementar relación entre Company y Extra cuando esté disponible
    // Por ahora, todos los extras se muestran como no contratados
    const extrasContratadosIds = new Set<string>();

    // Agregar indicador de contratación a cada extra
    const extrasConEstado = extras.map((extra: any) => ({
      ...extra,
      contratado: extrasContratadosIds.has(extra.id)
    }));

    return NextResponse.json({
      extras: extrasConEstado,
      total: extrasConEstado.length,
      categorias: Array.from(new Set(extras.map((e: any) => e.category))),
      totalContratados: extrasContratadosIds.size
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