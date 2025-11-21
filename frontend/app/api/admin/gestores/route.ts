import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // SEGURIDAD: Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    // SEGURIDAD: Verificar rol ADMIN
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
    });

    if (!user || user.role !== 'ADMIN') {
      console.warn(`[SECURITY] Usuario ${user?.email} intentó listar gestores sin permisos`);
      return NextResponse.json(
        { success: false, error: 'Accés denegat' },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios ADMIN activos (actuando como gestores)
    // Ya que no tenemos rol GESTOR_EMPRESES, usamos ADMIN
    const gestores = await prismaClient.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Para cada gestor, contar cuántas solicitudes tienen asignadas
    // (revisando reviewedBy como indicador de asignación)
    const gestoresWithCounts = await Promise.all(
      gestores.map(async (gestor) => {
        const assignedCount = await prismaClient.groupOfferRequest.count({
          where: {
            reviewedBy: gestor.id,
            status: 'APPROVED' // Consideramos APPROVED como "asignado"
          }
        });

        // Extraer información de asignaciones de internalNotes
        const assignedRequests = await prismaClient.groupOfferRequest.findMany({
          where: {
            reviewedBy: gestor.id,
            internalNotes: {
              contains: `ASSIGNAT A: ${gestor.name}`
            }
          },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          take: 5, // Últimas 5 asignaciones
          orderBy: {
            reviewedAt: 'desc'
          }
        });

        return {
          id: gestor.id,
          name: gestor.name,
          email: gestor.email,
          assignedRequestsCount: assignedRequests.length,
          recentAssignments: assignedRequests.map(req => ({
            id: req.id,
            title: req.title,
            status: req.status,
            assignedAt: req.createdAt
          })),
          createdAt: gestor.createdAt,
          isActive: gestor.isActive
        };
      })
    );

    console.log(`[ADMIN_ACCESS] ${user.email} listó gestores disponibles`);

    return NextResponse.json({
      success: true,
      data: gestoresWithCounts,
      totalGestores: gestoresWithCounts.length,
      message: gestoresWithCounts.length > 0
        ? `${gestoresWithCounts.length} gestores disponibles`
        : 'No hay gestores disponibles'
    });

  } catch (error) {
    console.error('[ERROR] Error listando gestores:', error);

    return NextResponse.json(
      { success: false, error: 'Error intern del servidor' },
      { status: 500 }
    );
  }
}

// SEGURIDAD: Bloquear otros métodos HTTP
export async function POST() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Mètode no permès' }, { status: 405 });
}