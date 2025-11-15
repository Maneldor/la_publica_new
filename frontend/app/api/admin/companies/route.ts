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

    // Obtener todas las empresas activas
    const companies = await prismaClient.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        cif: true,
        email: true,
        phone: true,
        address: true,
        website: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    // Formatear respuesta para compatibilidad con el frontend
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: 'Empresa registrada en la plataforma', // Descripción por defecto
      sector: 'otros', // Por defecto, ya que no hay campo sector en el modelo
      size: 'pequeña', // Por defecto, ya que no hay campo size en el modelo
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: company.address,
      logo: null, // Por ahora null
      isVerified: true, // Por defecto, ya que no hay campo isVerified en el modelo
      isActive: company.isActive,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.createdAt.toISOString(),
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