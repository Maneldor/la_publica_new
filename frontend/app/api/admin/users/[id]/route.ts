import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { createAuditLog, getRequestInfo } from '@/lib/auditLog';

/**
 * DELETE /api/admin/users/[id]
 * Elimina un usuario
 */
export async function DELETE(
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

    // Verificar que el usuario existe
    const user = await prismaClient.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir que el admin se elimine a sí mismo
    if (user.email === session.user.email) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Eliminar el usuario
    await prismaClient.user.delete({
      where: { id: params.id }
    });

    // Registrar en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'USER_DELETED',
      entity: 'USER',
      entityId: params.id,
      entityName: user.name || user.email,
      description: `Deleted user: ${user.email}`,
      metadata: {
        userEmail: user.email,
        userName: user.name,
        userRole: user.role
      },
      severity: 'WARNING',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}