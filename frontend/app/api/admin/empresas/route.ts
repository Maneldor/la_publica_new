import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateCompanyCredentials, MinimalCompanyData, PlanTier } from '@/lib/auth/credentialGenerator';
import bcrypt from 'bcryptjs';

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
      where: where as any, // subscriptionPlan no existe en schema
      select: {
        id: true,
        name: true,
        email: true,
        cif: true,
        address: true,
        // Campos fiscales no existen en schema, usar campos básicos
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

/**
 * POST /api/admin/empresas
 * Crear nueva empresa con datos mínimos (para admin)
 */
export async function POST(request: NextRequest) {
  let prismaClient;

  try {
    prismaClient = new PrismaClient();

    const session = await getServerSession(authOptions);

    // Verificar que sea admin o gestor
    if (!session?.user || !['ADMIN', 'GESTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, companyEmail, companyNif, sector, selectedPlan }: MinimalCompanyData = body;

    // Validaciones básicas
    if (!companyName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nom de l\'empresa és obligatori' },
        { status: 400 }
      );
    }

    if (!companyEmail?.trim()) {
      return NextResponse.json(
        { success: false, error: 'L\'email és obligatori' },
        { status: 400 }
      );
    }

    if (!companyNif?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El CIF/NIF és obligatori' },
        { status: 400 }
      );
    }

    if (!sector?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El sector és obligatori' },
        { status: 400 }
      );
    }

    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: 'El pla és obligatori' },
        { status: 400 }
      );
    }

    const validTiers: PlanTier[] = ['PIONERES', 'STANDARD', 'STRATEGIC', 'ENTERPRISE'];
    if (!validTiers.includes(selectedPlan)) {
      return NextResponse.json(
        { success: false, error: 'Pla no vàlid' },
        { status: 400 }
      );
    }

    console.log(`🏢 [Admin] Creating company: ${companyName} (${selectedPlan})`);

    // Verificar que el plan existe y está activo
    const planConfig = await prismaClient.planConfig.findFirst({
      where: {
        tier: selectedPlan,
        isActive: true,
        isVisible: true
      }
    });

    if (!planConfig) {
      return NextResponse.json(
        { success: false, error: 'Pla no trobat o no disponible' },
        { status: 400 }
      );
    }

    // Verificar que no existe empresa con el mismo CIF/NIF
    const existingCompanyByNif = await prismaClient.company.findFirst({
      where: { cif: companyNif.toUpperCase() }
    });

    if (existingCompanyByNif) {
      return NextResponse.json(
        { success: false, error: 'Ja existeix una empresa amb aquest CIF/NIF' },
        { status: 400 }
      );
    }

    // Verificar que no existe usuario con el mismo email
    const existingUserByEmail = await prismaClient.user.findFirst({
      where: { email: companyEmail.toLowerCase() }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: 'Ja existeix un usuari amb aquest email' },
        { status: 400 }
      );
    }

    // Generar credenciales únicas
    const credentials = await generateCompanyCredentials({
      companyName,
      companyEmail: companyEmail.toLowerCase(),
      companyNif: companyNif.toUpperCase(),
      sector,
      selectedPlan
    });

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(credentials.password, 12);

    // Crear la empresa y usuario en una transacción
    const result = await prismaClient.$transaction(async (tx) => {
      // 1. Crear la empresa
      const company = await tx.company.create({
        data: {
          name: companyName,
          cif: companyNif.toUpperCase(),
          email: companyEmail.toLowerCase()
        }
      });

      console.log(`✅ [Company Created] ID: ${company.id}`);

      // 2. Crear el usuario administrador de la empresa
      const user = await tx.user.create({
        data: {
          email: credentials.email,
          name: `Admin de ${companyName}`,
          password: hashedPassword,
          userType: 'COMPANY_OWNER',
          role: 'ADMIN',
          ownedCompanyId: company.id
        }
      });

      console.log(`✅ [User Created] ID: ${user.id}, Email: ${user.email}`);

      // 3. Crear la suscripción
      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 año de duración

      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: planConfig.id,
          status: 'ACTIVE',
          precioMensual: planConfig.basePrice,
          precioAnual: planConfig.basePrice * 12 * (1 - planConfig.firstYearDiscount),
          limites: planConfig.features as any, // Convertir a InputJsonValue
          startDate: now,
          endDate: endDate
        }
      });

      console.log(`✅ [Subscription Created] ID: ${subscription.id}, Tier: ${selectedPlan}`);

      return {
        company,
        user,
        subscription,
        credentials: {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password // Solo para envío de email
        }
      };
    });

    console.log(`🎉 [Company Setup Complete] ${companyName} ready for onboarding`);

    // TODO: Aquí iría el envío del email con las credenciales
    // await sendWelcomeEmail(result.credentials, companyName, planConfig.name);

    return NextResponse.json({
      success: true,
      message: 'Empresa creada correctament',
      data: {
        companyId: result.company.id,
        companyName: result.company.name,
        userEmail: result.user.email,
        username: result.user.name || result.user.email, // username no existe, usar name o email
        plan: {
          tier: selectedPlan,
          name: planConfig.name
        },
        status: result.company.status,
        // Nota: NO devolvemos la contraseña por seguridad
        // Solo se envía por email
        credentials: {
          username: result.credentials.username,
          email: result.credentials.email,
          emailSent: false // TODO: cambiar a true cuando se implemente el email
        }
      }
    });

  } catch (error) {
    console.error('❌ [Admin Company Creation] Error:', error);

    // Error específico de credenciales duplicadas
    if (error instanceof Error && error.message.includes('email')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error intern creant l\'empresa' },
      { status: 500 }
    );
  } finally {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  }
}