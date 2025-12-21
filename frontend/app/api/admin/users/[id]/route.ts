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
 * Actualiza datos de usuario (campos básicos, perfil, educación, experiencia, etc.)
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

    // Si solo viene isActive, es una actualización simple de estado
    if (Object.keys(body).length === 1 && typeof body.isActive === 'boolean') {
      const updatedUser = await prismaClient.user.update({
        where: { id: params.id },
        data: { isActive: body.isActive },
        select: { id: true, isActive: true, email: true, name: true }
      });

      const { ipAddress, userAgent } = getRequestInfo(request);
      await createAuditLog({
        action: body.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entity: 'USER',
        entityId: params.id,
        entityName: updatedUser.name || updatedUser.email,
        description: `User ${body.isActive ? 'activated' : 'deactivated'}: ${updatedUser.email}`,
        severity: 'WARNING',
        ipAddress,
        userAgent
      });

      return NextResponse.json({
        success: true,
        message: body.isActive ? 'Usuari activat correctament' : 'Usuari desactivat correctament',
        user: updatedUser
      });
    }

    // Actualización completa desde el wizard
    const {
      firstName,
      lastName,
      secondLastName,
      name,
      administration,
      displayPreference,
      image,
      coverImage,
      coverColor,
      profile,
      education,
      experiences,
      skills,
      languages
    } = body;

    // Actualizar datos básicos del usuario
    const userData: Record<string, any> = {};
    if (firstName !== undefined) userData.firstName = firstName;
    if (lastName !== undefined) userData.lastName = lastName;
    if (secondLastName !== undefined) userData.secondLastName = secondLastName;
    if (name !== undefined) userData.name = name;
    if (administration !== undefined) userData.administration = administration;
    if (displayPreference !== undefined) userData.displayPreference = displayPreference;
    if (image !== undefined) userData.image = image;
    if (coverImage !== undefined) userData.coverImage = coverImage;
    if (coverColor !== undefined) userData.coverColor = coverColor;

    // Actualizar usuario
    const updatedUser = await prismaClient.user.update({
      where: { id: params.id },
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        administration: true,
        displayPreference: true,
        image: true,
        coverImage: true,
        coverColor: true,
      }
    });

    // Actualizar perfil si viene
    if (profile) {
      const profileData: Record<string, any> = {};
      if (profile.bio !== undefined) profileData.bio = profile.bio;
      if (profile.headline !== undefined) profileData.headline = profile.headline;
      if (profile.city !== undefined) profileData.city = profile.city;
      if (profile.province !== undefined) profileData.province = profile.province;
      if (profile.organization !== undefined) profileData.organization = profile.organization;
      if (profile.department !== undefined) profileData.department = profile.department;
      if (profile.position !== undefined) profileData.position = profile.position;
      if (profile.phone !== undefined) profileData.phone = profile.phone;

      if (Object.keys(profileData).length > 0) {
        await prismaClient.userProfile.upsert({
          where: { userId: params.id },
          create: { userId: params.id, ...profileData },
          update: profileData
        });
      }
    }

    // Actualizar educación si viene
    if (education && Array.isArray(education)) {
      // Eliminar educación existente y crear nueva
      await prismaClient.userEducation.deleteMany({ where: { userId: params.id } });

      for (let i = 0; i < education.length; i++) {
        const edu = education[i];
        await prismaClient.userEducation.create({
          data: {
            userId: params.id,
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || null,
            startDate: edu.startYear ? new Date(`${edu.startYear}-01-01`) : null,
            endDate: edu.endYear ? new Date(`${edu.endYear}-01-01`) : null,
            isCurrent: edu.current || false,
            position: i,
          }
        });
      }
    }

    // Actualizar experiencias si vienen
    if (experiences && Array.isArray(experiences)) {
      await prismaClient.userExperience.deleteMany({ where: { userId: params.id } });

      for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i];
        await prismaClient.userExperience.create({
          data: {
            userId: params.id,
            organization: exp.organization || '',
            position: exp.position || '',
            department: exp.department || null,
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.current ? null : (exp.endDate ? new Date(exp.endDate) : null),
            isCurrent: exp.current || false,
            description: exp.description || null,
            displayOrder: i,
          }
        });
      }
    }

    // Actualizar skills si vienen
    if (skills && Array.isArray(skills)) {
      await prismaClient.userSkill.deleteMany({ where: { userId: params.id } });

      for (const skill of skills) {
        await prismaClient.userSkill.create({
          data: {
            userId: params.id,
            name: skill.name || '',
            category: skill.category || null,
            level: skill.level ? ['basic', 'intermediate', 'advanced', 'expert'].indexOf(skill.level) + 1 : null,
          }
        });
      }
    }

    // Actualizar idiomas si vienen
    if (languages && Array.isArray(languages)) {
      await prismaClient.userLanguage.deleteMany({ where: { userId: params.id } });

      for (const lang of languages) {
        await prismaClient.userLanguage.create({
          data: {
            userId: params.id,
            language: lang.language || '',
            level: lang.level || 'intermediate',
          }
        });
      }
    }

    // Registrar en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'USER_UPDATED',
      entity: 'USER',
      entityId: params.id,
      entityName: updatedUser.name || updatedUser.email,
      description: `User profile updated: ${updatedUser.email}`,
      metadata: { updatedFields: Object.keys(body) },
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

    // Eliminar datos relacionados y luego el usuario usando transacción
    await prismaClient.$transaction(async (tx) => {
      // Eliminar perfil y datos relacionados
      await tx.userProfile.deleteMany({ where: { userId: params.id } });
      await tx.userEducation.deleteMany({ where: { userId: params.id } });
      await tx.userExperience.deleteMany({ where: { userId: params.id } });
      await tx.userSkill.deleteMany({ where: { userId: params.id } });
      await tx.userLanguage.deleteMany({ where: { userId: params.id } });
      await tx.userSocialLink.deleteMany({ where: { userId: params.id } });

      // Eliminar otras relaciones posibles (ignorar errores si no existen las tablas)
      try { await tx.notification.deleteMany({ where: { userId: params.id } }); } catch {}
      try { await tx.userFavorite.deleteMany({ where: { userId: params.id } }); } catch {}
      try { await tx.agendaEvent.deleteMany({ where: { userId: params.id } }); } catch {}
      try { await tx.agendaGoal.deleteMany({ where: { userId: params.id } }); } catch {}
      try { await tx.agendaTask.deleteMany({ where: { userId: params.id } }); } catch {}
      try { await tx.agendaHabit.deleteMany({ where: { userId: params.id } }); } catch {}
      try { await tx.agendaReflection.deleteMany({ where: { userId: params.id } }); } catch {}
      try { await tx.agendaUserConfig.deleteMany({ where: { userId: params.id } }); } catch {}

      // Finalmente eliminar el usuario
      await tx.user.delete({ where: { id: params.id } });
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