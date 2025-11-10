import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar planes (endpoint público)
export async function GET(request: NextRequest) {
  try {
    // Devolver solo planes activos y visibles para páginas públicas
    const planesPublicos = await prisma.planConfig.findMany({
      where: {
        activo: true,
        visible: true
      },
      orderBy: { orden: 'asc' }
    });

    return NextResponse.json(planesPublicos);

  } catch (error) {
    console.error('Error al obtener planes:', error);
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    );
  }
}