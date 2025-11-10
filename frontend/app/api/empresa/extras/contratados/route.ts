import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener extras contratados de la empresa
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

    // Obtener extras contratados
    const extrasContratados = await prisma.empresaExtra.findMany({
      where: {
        empresaId: user.company.id
      },
      include: {
        featureExtra: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(extrasContratados);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener extras contratados' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}