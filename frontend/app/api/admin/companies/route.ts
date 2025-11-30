import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/companies
 * Obtener todas las empresas para el wizard de presupuestos
 */
export async function GET(request: NextRequest) {
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
      select: { userType: true, isActive: true }
    });

    if (!user || user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 403 }
      );
    }

    // Obtener todas las empresas con su plan actual
    const companies = await prismaClient.company.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formatear respuesta para compatibilidad con el frontend
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description || 'Empresa colaboradora',
      sector: 'colaboracion', // Sector por defecto para empresas colaboradoras
      size: 'pequeña', // Tamaño por defecto
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: company.address,
      logo: company.logo,
      isVerified: company.status !== 'PENDING', // Verificada si no está pendiente
      isActive: company.isActive,
      status: company.status, // Incluir el status real
      currentPlan: company.currentPlan, // Incluir el plan actual
      currentPlanId: company.currentPlanId,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      foundedYear: null,
      employeeCount: 0,
      configuration: {}
    }));

    return NextResponse.json({
      success: true,
      data: formattedCompanies
    });

  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Error al obtener empresas' },
      { status: 500 }
    );
  }
}