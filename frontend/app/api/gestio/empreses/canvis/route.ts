import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/gestio/empreses/canvis
 * Obte tots els canvis de perfil pendents per revisar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticat' },
        { status: 401 }
      );
    }

    // Verificar permisos
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, userType: true }
    });

    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'];
    if (!allowedRoles.includes(user?.role || '')) {
      return NextResponse.json(
        { error: 'No tens permisos per accedir' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Obtenir canvis pendents
    const [changes, total] = await Promise.all([
      prismaClient.companyProfileChange.findMany({
        where: {
          status: status as any,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              logoUrl: true,
              email: true,
              sector: true,
            }
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          rejectedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.companyProfileChange.count({
        where: { status: status as any }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        changes: changes.map(change => ({
          id: change.id,
          company: change.company,
          type: change.type,
          status: change.status,
          oldValue: change.oldValue,
          newValue: change.newValue,
          description: change.description,
          requestedBy: change.requestedBy,
          reviewedBy: change.approvedBy || change.rejectedBy,
          rejectionReason: change.rejectionReason,
          createdAt: change.createdAt.toISOString(),
          reviewedAt: change.reviewedAt?.toISOString() || null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      }
    });

  } catch (error) {
    console.error('Error obtenint canvis:', error);
    return NextResponse.json(
      { error: 'Error al obtenir els canvis' },
      { status: 500 }
    );
  }
}
