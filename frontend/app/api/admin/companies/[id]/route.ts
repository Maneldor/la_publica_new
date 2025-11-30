import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prismaClient } from '../../../../../lib/prisma';

// Función para convertir nombre a slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones múltiples con un solo guión
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const identifier = params.id;

  try {
    console.log('🔍 Buscando empresa con identificador:', identifier);

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar rol de admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Buscar empresa por ID o por slug (nombre)
    let company = null;

    // Primero intentar buscar por ID (compatibilidad con URLs existentes)
    if (identifier.length > 20) { // Los IDs de Prisma son largos
      console.log('🔍 Buscando por ID largo:', identifier);
      company = await prismaClient.company.findUnique({
        where: { id: identifier },
        select: {
          id: true,
          name: true,
          cif: true,
          email: true,
          phone: true,
          address: true,
          website: true,
          description: true,
          logo: true,
          isActive: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          currentPlan: {
            select: {
              id: true,
              name: true,
              tier: true,
              badge: true,
              badgeColor: true
            }
          },
          currentPlanId: true,
          // Buscar el usuario propietario de la empresa
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              password: true
            }
          }
        }
      });
    }

    // Si no se encuentra por ID, buscar por slug (nombre normalizado)
    if (!company) {
      console.log('🔍 No encontrada por ID, buscando por nombre/slug:', identifier);

      // Obtener todas las empresas y buscar la que coincida con el slug
      const allCompanies = await prismaClient.company.findMany({
        select: {
          id: true,
          name: true,
        }
      });

      // Buscar la empresa cuyo slug coincida
      const targetCompany = allCompanies.find(c => createSlug(c.name) === identifier);

      if (targetCompany) {
        console.log('✅ Empresa encontrada por slug:', targetCompany.name);
        // Buscar la empresa completa usando el ID encontrado
        company = await prismaClient.company.findUnique({
          where: { id: targetCompany.id },
          select: {
            id: true,
            name: true,
            cif: true,
            email: true,
            phone: true,
            address: true,
            website: true,
            description: true,
            logo: true,
            isActive: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            currentPlan: {
              select: {
                id: true,
                name: true,
                tier: true,
                badge: true,
                badgeColor: true
              }
            },
            currentPlanId: true
          }
        });
      }
    }

    if (!company) {
      console.log('❌ Empresa no encontrada con identificador:', identifier);
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ Empresa encontrada:', company.name);

    // Buscar el usuario propietario de la empresa
    const owner = await prismaClient.user.findFirst({
      where: { ownedCompanyId: company.id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    });

    // Formatear datos para el frontend
    const formattedCompany = {
      id: company.id,
      name: company.name,
      description: company.description,
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: company.address,
      cif: company.cif,
      logo: company.logo,
      isActive: company.isActive,
      status: company.status,
      currentPlan: company.currentPlan,
      owner: owner, // Información del propietario incluyendo contraseña
      subscription: null, // Por ahora null, se puede agregar después si se necesita
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedCompany
    });

  } catch (error) {
    console.error('❌ Error fetching company with identifier:', identifier, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}