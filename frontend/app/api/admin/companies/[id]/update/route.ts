import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../../lib/auth';
import { prismaClient } from '../../../../../../lib/prisma';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const identifier = params.id;

  try {
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

    const body = await request.json();
    console.log('📝 Datos a actualizar:', body);

    const {
      name,
      email,
      cif,
      description,
      phone,
      website,
      address,
      logo,
      sector,
      currentPlanTier
    } = body;

    // Buscar empresa por ID o por slug (misma lógica que en route.ts de lectura)
    let company = null;

    // Primero intentar buscar por ID (compatibilidad con URLs existentes)
    if (identifier.length > 20) { // Los IDs de Prisma son largos
      console.log('🔍 Buscando por ID largo:', identifier);
      company = await prismaClient.company.findUnique({
        where: { id: identifier }
      });
    }

    // Si no se encuentra por ID, buscar por slug
    if (!company) {
      console.log('🔍 No encontrada por ID, buscando por nombre/slug:', identifier);

      // Obtener todas las empresas y buscar la que coincida con el slug
      const allCompanies = await prismaClient.company.findMany({
        select: { id: true, name: true }
      });

      // Buscar la empresa cuyo slug coincida
      const targetCompany = allCompanies.find(c => createSlug(c.name) === identifier);

      if (targetCompany) {
        console.log('✅ Empresa encontrada por slug:', targetCompany.name);
        company = await prismaClient.company.findUnique({
          where: { id: targetCompany.id }
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

    console.log('✅ Empresa a actualizar:', company.name);

    // Preparar datos de actualización
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (cif !== undefined) updateData.cif = cif;
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (address !== undefined) updateData.address = address;
    if (logo !== undefined) updateData.logo = logo;

    // Si se está cambiando el plan, buscar el nuevo plan
    if (currentPlanTier) {
      const newPlan = await prismaClient.planConfig.findFirst({
        where: {
          tier: currentPlanTier,
          isActive: true
        }
      });

      if (newPlan) {
        updateData.currentPlanId = newPlan.id;
      }
    }

    // Actualizar la empresa
    const updatedCompany = await prismaClient.company.update({
      where: { id: company.id }, // Usar company.id en lugar de identifier
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        currentPlan: {
          select: {
            id: true,
            name: true,
            tier: true,
            badge: true,
            badgeColor: true
          }
        }
      }
    });

    // Si se cambió el email, actualizar también el usuario propietario
    if (email && email !== company.email) {
      await prismaClient.user.updateMany({
        where: { ownedCompanyId: company.id },
        data: { email }
      });
    }

    // Si se actualiza el campo sector, actualizar el owner
    if (sector) {
      console.log('🔧 Actualizando sector del owner:', sector);
      try {
        await prismaClient.user.updateMany({
          where: { ownedCompanyId: company.id },
          data: { cargo: sector }
        });
        console.log('✅ Sector del owner actualizado');
      } catch (ownerError) {
        console.warn('⚠️ No se pudo actualizar el sector del owner:', ownerError);
      }
    }

    console.log('✅ Empresa actualizada:', updatedCompany.name);

    return NextResponse.json({
      success: true,
      message: 'Empresa actualitzada correctament',
      data: updatedCompany
    });

  } catch (error) {
    console.error('❌ Error updating company:', identifier, error);
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