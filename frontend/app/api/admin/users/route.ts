import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { UserRole, UserType } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users
 * Obtiene lista de usuarios (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando llamada a /api/admin/users');

    const session = await getServerSession(authOptions);
    console.log('📄 Session:', session ? 'existe' : 'no existe');

    if (!session || !session.user) {
      console.log('❌ No hay sesión válida');
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    console.log('🔐 Usuario autenticado:', session.user.email);

    // Verificar rol de admin - simplificado para debugging
    console.log('🔍 Buscando usuario en base de datos...');
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, userType: true, email: true }
    });

    console.log('👤 Usuario encontrado:', user);

    if (!user) {
      console.log('❌ Usuario no encontrado en base de datos');
      return NextResponse.json(
        { error: 'Usuario no encontrado en base de datos.' },
        { status: 404 }
      );
    }

    if (user.role !== 'ADMIN' && user.userType !== 'ADMIN') {
      console.log('❌ Usuario no es admin:', { role: user.role, userType: user.userType });
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    console.log('✅ Usuario autorizado como admin');

    // Obtener todos los usuarios
    console.log('📊 Obteniendo lista de usuarios...');
    const users = await prismaClient.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear respuesta para compatibilidad con el frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      primaryRole: user.userType || user.role || 'USER', // Usar userType o role como primaryRole
      isActive: user.isActive,
      lastLogin: undefined, // Campo no disponible en el esquema actual
      createdAt: user.createdAt.toISOString(),
      employee: user.name ? {
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        nick: undefined,
      } : undefined,
      company: undefined, // Por ahora no hay relación directa
      publicAdministration: undefined, // Por ahora no hay relación directa
      additionalRoles: [], // Por ahora vacío
      permissions: [], // Por ahora vacío
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Crea un nuevo usuario (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión requerida.' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true, userType: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.userType !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📝 Datos recibidos para crear empresa:', body);

    const {
      userType,
      email,
      password,
      userData = {},
      // Nuevos campos opcionales para empresas
      companyName,
      selectedPlan,
      cif,
      phone,
      address,
      sector
    } = body;

    console.log('🏭 Sector extraído:', sector);

    // Validaciones básicas
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Campos requeridos: email, password, userType' },
        { status: 400 }
      );
    }

    // Verificar que el email no exista
    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Mapear userType del frontend al esquema de Prisma
    let prismaUserType: UserType = 'EMPLOYEE'; // default
    let role: UserRole = 'USER'; // default

    switch (userType) {
      case 'SUPER_ADMIN':
        prismaUserType = 'ADMIN';
        role = 'SUPER_ADMIN';
        break;
      case 'ADMIN':
        prismaUserType = 'ADMIN';
        role = 'ADMIN';
        break;
      case 'EMPLEADO_PUBLICO':
        prismaUserType = 'EMPLOYEE';
        role = 'USER';
        break;
      case 'EMPRESA':
      case 'COMPANY_OWNER':
        prismaUserType = 'COMPANY_OWNER';
        role = 'COMPANY';
        break;
      case 'GESTOR_EMPRESAS':
        prismaUserType = 'ACCOUNT_MANAGER';
        role = 'MODERATOR';
        break;
      case 'GESTOR_CONTENIDO':
        prismaUserType = 'EMPLOYEE';
        role = 'MODERATOR';
        break;
      default:
        prismaUserType = 'EMPLOYEE';
        role = 'USER';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nombre completo basado en userData
    let fullName = '';
    if (userData.firstName && userData.lastName) {
      fullName = `${userData.firstName} ${userData.lastName}`;
    } else if (userData.name) {
      fullName = userData.name;
    }

    // Usar transacción para crear usuario y empresa atómicamente
    const result = await prismaClient.$transaction(async (tx) => {
      console.log('🔄 Iniciando transacción para crear usuario/empresa');
      console.log('📝 Datos a guardar:', {
        userType: prismaUserType,
        role: role,
        sector: sector,
        cargo: sector || null
      });

      // 1. Crear usuario primero
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: fullName || null,
          userType: prismaUserType,
          role: role,
          isActive: true,
          cargo: sector || null, // Guardar el sector en campo cargo
        }
      });

      console.log('✅ Usuario creado con cargo:', newUser.cargo);

      let newCompany = null;

      // 2. Si es tipo EMPRESA, crear también la entrada en Company con status PENDING
      if (userType === 'EMPRESA' || userType === 'COMPANY_OWNER') {
        // Usar companyName del request o userData.name como fallback
        const companyNameToUse = companyName || userData.name;

        if (!companyNameToUse) {
          throw new Error('Nombre de empresa requerido para usuarios tipo EMPRESA');
        }

        // Buscar plan seleccionado o usar plan por defecto PIONERES
        let planToAssign;

        if (selectedPlan) {
          // Buscar plan específico seleccionado
          planToAssign = await tx.planConfig.findFirst({
            where: {
              tier: selectedPlan,
              isActive: true
            }
          });
        }

        // Si no se encontró el plan seleccionado o no se especificó, usar plan por defecto
        if (!planToAssign) {
          planToAssign = await tx.planConfig.findFirst({
            where: {
              OR: [
                { slug: 'empreses-pioneres' },
                { isDefault: true },
                { tier: 'PIONERES' }
              ],
              isActive: true
            }
          });
        }

        if (!planToAssign) {
          throw new Error('Plan no encontrado. Verificar configuración de planes.');
        }

        newCompany = await tx.company.create({
          data: {
            name: companyNameToUse,
            cif: cif || userData.cif || `PENDING-${Date.now()}`, // CIF temporal si no se proporciona
            email: email,
            phone: phone || userData.phone || null,
            address: address || userData.address || null,
            description: userData.description || null,
            website: userData.website || null,
            // NUEVOS CAMPOS - usar los que existen en el schema
            status: 'PENDING', // Empresa pendiente de aprobación
            isActive: true,    // Activa por defecto
            currentPlanId: planToAssign.id, // Asignar plan seleccionado o por defecto
            owner: {
              connect: { id: newUser.id } // Conectar con el usuario propietario
            }
          }
        });

        // Determinar duración del trial según el plan
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + (planToAssign.trialDurationDays || 180));

        // 3. Crear subscription con trial gratuito
        await tx.subscription.create({
          data: {
            companyId: newCompany.id,
            planId: planToAssign.id,
            status: 'ACTIVE', // Estado activo durante trial
            precioMensual: 0, // Gratis durante trial
            precioAnual: planToAssign.basePrice,
            startDate: new Date(),
            endDate: trialEndDate,
            isAutoRenew: false, // No renovar automáticamente durante trial
            limites: {
              maxMembers: planToAssign.maxTeamMembers,
              maxStorage: planToAssign.maxStorage,
              maxActiveOffers: planToAssign.maxActiveOffers,
              maxFeaturedOffers: planToAssign.maxFeaturedOffers
            }
          }
        });

        // 3. Actualizar el usuario con la relación a la empresa
        await tx.user.update({
          where: { id: newUser.id },
          data: {
            ownedCompanyId: newCompany.id // Relación desde User hacia Company
          }
        });
      }

      return { user: newUser, company: newCompany };
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          userType: result.user.userType,
          role: result.user.role,
          isActive: result.user.isActive,
          createdAt: result.user.createdAt.toISOString(),
        },
        company: result.company ? {
          id: result.company.id,
          name: result.company.name,
          cif: result.company.cif,
          status: result.company.status,
          isActive: result.company.isActive,
          createdAt: result.company.createdAt.toISOString(),
        } : null
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      {
        error: 'Error al crear usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]/toggle-status
 * Activa/desactiva un usuario
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params?: { id?: string } }
) {
  // Esta función manejará las rutas como /api/admin/users/[id]/toggle-status
  // Por ahora retornamos método no permitido ya que necesitamos configurar la ruta dinámica
  return NextResponse.json(
    { error: 'Método no implementado. Use /api/admin/users/[id]/toggle-status' },
    { status: 405 }
  );
}

/**
 * DELETE /api/admin/users/[id]
 * Elimina un usuario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params?: { id?: string } }
) {
  // Esta función manejará las rutas como /api/admin/users/[id]
  // Por ahora retornamos método no permitido ya que necesitamos configurar la ruta dinámica
  return NextResponse.json(
    { error: 'Método no implementado. Use /api/admin/users/[id]' },
    { status: 405 }
  );
}