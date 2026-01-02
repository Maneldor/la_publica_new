import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { createAuditLog, getRequestInfo } from '@/lib/auditLog';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users/[id]/credentials
 * Obtiene información de credenciales del usuario (sin la contraseña real)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true }
    });

    const isAdmin = adminUser?.userType === 'ADMIN' ||
      ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(adminUser?.role || '');

    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;

    const user = await prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isEmailVerified: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        hasPassword: !!user.password,
        createdAt: user.createdAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error obtenint credencials:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users/[id]/credentials
 * Gestiona credenciales: verificar email, cambiar contraseña, generar nueva
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true, id: true }
    });

    const isAdmin = adminUser?.userType === 'ADMIN' ||
      ['SUPER_ADMIN', 'ADMIN', 'ADMIN_GESTIO'].includes(adminUser?.role || '');

    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, password } = body;

    const user = await prismaClient.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, isEmailVerified: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuari no trobat' }, { status: 404 });
    }

    const { ipAddress, userAgent } = getRequestInfo(request);

    switch (action) {
      case 'verify_email': {
        // Verificar email manualmente
        await prismaClient.user.update({
          where: { id },
          data: {
            isEmailVerified: true,
          }
        });

        await createAuditLog({
          action: 'USER_EMAIL_VERIFIED',
          entity: 'USER',
          entityId: id,
          entityName: user.name || user.email,
          description: `Email verificat manualment per admin: ${user.email}`,
          severity: 'INFO',
          ipAddress,
          userAgent
        });

        return NextResponse.json({
          success: true,
          message: 'Email verificat correctament',
        });
      }

      case 'unverify_email': {
        // Quitar verificación de email
        await prismaClient.user.update({
          where: { id },
          data: {
            isEmailVerified: false,
          }
        });

        await createAuditLog({
          action: 'USER_EMAIL_UNVERIFIED',
          entity: 'USER',
          entityId: id,
          entityName: user.name || user.email,
          description: `Verificació d'email eliminada per admin: ${user.email}`,
          severity: 'WARNING',
          ipAddress,
          userAgent
        });

        return NextResponse.json({
          success: true,
          message: 'Verificació eliminada correctament',
        });
      }

      case 'set_password': {
        // Establecer contraseña específica
        if (!password || password.length < 6) {
          return NextResponse.json(
            { error: 'La contrasenya ha de tenir mínim 6 caràcters' },
            { status: 400 }
          );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prismaClient.user.update({
          where: { id },
          data: {
            password: hashedPassword,
          }
        });

        await createAuditLog({
          action: 'USER_PASSWORD_CHANGED',
          entity: 'USER',
          entityId: id,
          entityName: user.name || user.email,
          description: `Contrasenya canviada per admin: ${user.email}`,
          severity: 'WARNING',
          ipAddress,
          userAgent
        });

        return NextResponse.json({
          success: true,
          message: 'Contrasenya actualitzada correctament',
        });
      }

      case 'generate_password': {
        // Generar contraseña aleatoria
        const generatedPassword = generateSecurePassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 12);

        await prismaClient.user.update({
          where: { id },
          data: {
            password: hashedPassword,
          }
        });

        await createAuditLog({
          action: 'USER_PASSWORD_RESET',
          entity: 'USER',
          entityId: id,
          entityName: user.name || user.email,
          description: `Contrasenya generada per admin: ${user.email}`,
          severity: 'WARNING',
          ipAddress,
          userAgent
        });

        return NextResponse.json({
          success: true,
          message: 'Nova contrasenya generada',
          data: {
            password: generatedPassword,
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Acció no vàlida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error gestionant credencials:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

/**
 * Genera una contraseña segura
 */
function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%&*';

  const all = uppercase + lowercase + numbers + special;

  let password = '';

  // Asegurar al menos uno de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Completar el resto
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Mezclar
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
