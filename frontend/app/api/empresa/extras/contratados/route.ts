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
      include: { ownedCompany: true, memberCompany: true }
    });

    const company = user?.ownedCompany || user?.memberCompany;
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // TODO: Implementar relación entre Company y Extra cuando esté disponible
    // Por ahora, retornar array vacío
    return NextResponse.json([]);

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