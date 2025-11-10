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
    const activasOnly = searchParams.get('activas') === 'true';

    const where = activasOnly ? {
      subscriptionPlan: {
        not: 'STARTER'
      }
    } : {};

    const empresas = await prismaClient.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        nombreFiscal: true,
        cifFiscal: true,
        direccionFiscal: true,
        ciudadFiscal: true,
        cpFiscal: true,
        provinciaFiscal: true,
        subscriptionPlan: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(empresas);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener empresas' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}