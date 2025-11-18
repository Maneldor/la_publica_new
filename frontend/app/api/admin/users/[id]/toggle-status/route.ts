import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { createAuditLog, getRequestInfo } from '@/lib/auditLog';

/**
 * PATCH /api/admin/users/[id]/toggle-status
 * Activa/desactiva un usuario
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true }
    });

    if (!adminUser || adminUser.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Obtener el usuario actual
    const user = await prismaClient.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Cambiar el estado activo/inactivo
    const updatedUser = await prismaClient.user.update({
      where: { id: params.id },
      data: {
        isActive: !user.isActive,
        updatedAt: new Date()
      }
    });

    // Registrar en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    const action = updatedUser.isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED';

    await createAuditLog({
      action,
      entity: 'USER',
      entityId: updatedUser.id,
      entityName: updatedUser.name || updatedUser.email,
      description: `${updatedUser.isActive ? 'Reactivated' : 'Suspended'} user: ${updatedUser.email}`,
      metadata: {
        previousState: user.isActive,
        newState: updatedUser.isActive
      },
      severity: updatedUser.isActive ? 'INFO' : 'WARNING',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        isActive: updatedUser.isActive
      }
    });

  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    return NextResponse.json(
      { error: 'Error al cambiar estado del usuario' },
      { status: 500 }
    );
  }
}