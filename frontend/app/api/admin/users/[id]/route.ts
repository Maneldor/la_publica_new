import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { createAuditLog, getRequestInfo } from '@/lib/auditLog';

/**
 * GET /api/admin/users/[id]
 * Obtiene detalles de un usuario
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true }
    });

    if (!adminUser || adminUser.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado. Solo administradores.' }, { status: 403 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        userType: true,
        isActive: true,
        isEmailVerified: true,
        communityId: true,
        cargo: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 });
    }

    // Obtener estadísticas reales
    const [leadsCount, logsCount] = await Promise.all([
      prismaClient.companyLead.count({ where: { assignedToId: params.id } }).catch(() => 0),
      prismaClient.auditLog.count({ where: { userId: params.id } }).catch(() => 0),
    ]);

    // Obtener actividad reciente
    const recentActivity = await prismaClient.auditLog.findMany({
      where: { userId: params.id },
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: {
        id: true,
        action: true,
        description: true,
        timestamp: true,
      }
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          leadsAssignats: leadsCount,
          tasquesCompletades: 0, // TODO: Implementar cuando exista tabla de tareas
          empresesGestionades: 0, // TODO: Implementar cuando se defina relación
          logsActivitat: logsCount,
        },
        recentActivity: recentActivity.map(a => ({
          id: a.id,
          action: a.action,
          description: a.description || a.action,
          createdAt: a.timestamp.toISOString(),
        })),
      }
    });

  } catch (error) {
    console.error('Error obtenint usuari:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Actualiza estado de usuario (activar/desactivar)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true }
    });

    if (!adminUser || adminUser.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive debe ser boolean' }, { status: 400 });
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: params.id },
      data: { isActive },
      select: { id: true, isActive: true, email: true, name: true }
    });

    // Registrar en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entity: 'USER',
      entityId: params.id,
      entityName: updatedUser.name || updatedUser.email,
      description: `User ${isActive ? 'activated' : 'deactivated'}: ${updatedUser.email}`,
      severity: 'WARNING',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      message: isActive ? 'Usuari activat correctament' : 'Usuari desactivat correctament',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualitzant usuari:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users/[id]
 * Actualiza datos completos de usuario
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true }
    });

    if (!adminUser || adminUser.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { name, role, userType, cargo, isActive } = body;

    // Validación básica
    if (!role || !userType) {
      return NextResponse.json({ error: 'Role y userType son obligatorios' }, { status: 400 });
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: params.id },
      data: {
        name: name || null,
        role: role,
        userType: userType,
        cargo: cargo || null,
        isActive: isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        cargo: true,
        isActive: true,
      }
    });

    // Registrar en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'USER_UPDATED',
      entity: 'USER',
      entityId: params.id,
      entityName: updatedUser.name || updatedUser.email,
      description: `User updated: ${updatedUser.email}`,
      metadata: {
        updatedFields: { name, role, userType, cargo, isActive }
      },
      severity: 'INFO',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      message: 'Usuari actualitzat correctament',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualitzant usuari:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

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