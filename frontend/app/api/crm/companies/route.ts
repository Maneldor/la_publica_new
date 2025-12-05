import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    // Verificar que es un gestor CRM o admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true, isActive: true }
    });

    if (!user || !['ACCOUNT_MANAGER', 'ADMIN'].includes(user.userType) || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'No tens permisos per veure empreses' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sector = searchParams.get('sector');
    const source = searchParams.get('source');

    console.log('🔍 [CRM Companies] Loading companies for:', session.user.email);

    // Construir filtros de búsqueda
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cif: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Obtener empresas con trazabilidad completa
    const companies = await prismaClient.company.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        cif: true,
        status: true,
        isActive: true,
        phone: true,
        website: true,
        address: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        currentPlanId: true,
        currentPlan: {
          select: {
            id: true,
            name: true,
            nombreCorto: true,
            tier: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 [CRM Companies] Found ${companies.length} companies total`);

    // Obtener información del owner para cada empresa
    const formattedCompanies = await Promise.all(companies.map(async (company) => {
      // Buscar el usuario propietario de la empresa
      const owner = await prismaClient.user.findFirst({
        where: { ownedCompanyId: company.id },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          cargo: true // sector
        }
      });

      return {
        id: company.id,
        name: company.name,
        email: company.email,
        cif: company.cif,
        status: company.status,
        isActive: company.isActive,
        sector: owner?.cargo || null, // Sector desde el campo cargo del owner
        phone: company.phone,
        website: company.website,
        address: company.address,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),

        // Información de trazabilidad
        createdBy: owner ? {
          id: owner.id,
          email: owner.email,
          name: owner.name,
          userType: owner.userType
        } : {
          id: 'system',
          email: 'sistema@lapublica.cat',
          name: 'Sistema',
          userType: 'SYSTEM'
        },

        // Plan actual
        currentPlan: company.currentPlan,

        // Campos CRM adicionales (por implementar)
        assignedTo: null,
        lastContactedAt: null,
        nextFollowUp: null,
        leadScore: null,
        interactions: 0
      };
    }));

    // Filtrar por sector si está especificado
    let filteredCompanies = formattedCompanies;
    if (sector && sector !== 'all') {
      filteredCompanies = formattedCompanies.filter(c => c.sector === sector);
    }

    // Filtrar por fuente si está especificado
    if (source && source !== 'all') {
      switch (source) {
        case 'admin':
          filteredCompanies = filteredCompanies.filter(c =>
            c.createdBy?.userType === 'ADMIN'
          );
          break;
        case 'gestor':
          filteredCompanies = filteredCompanies.filter(c =>
            c.createdBy?.userType === 'ACCOUNT_MANAGER'
          );
          break;
        case 'self':
          filteredCompanies = filteredCompanies.filter(c =>
            !c.createdBy || !['ADMIN', 'ACCOUNT_MANAGER'].includes(c.createdBy.userType)
          );
          break;
      }
    }

    // Calcular estadísticas
    const stats = {
      total: filteredCompanies.length,
      pending: filteredCompanies.filter(c => c.status === 'PENDING').length,
      approved: filteredCompanies.filter(c => c.status === 'APPROVED').length,
      suspended: filteredCompanies.filter(c => c.status === 'SUSPENDED').length,
      newThisMonth: filteredCompanies.filter(c => {
        const createdDate = new Date(c.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() &&
               createdDate.getFullYear() === now.getFullYear();
      }).length,
      conversionRate: filteredCompanies.length > 0
        ? Math.round((filteredCompanies.filter(c => c.status === 'APPROVED').length / filteredCompanies.length) * 100)
        : 0
    };

    console.log('✅ [CRM Companies] Found companies:', {
      total: filteredCompanies.length,
      adminCreated: filteredCompanies.filter(c => c.createdBy?.userType === 'ADMIN').length,
      gestorCreated: filteredCompanies.filter(c => c.createdBy?.userType === 'ACCOUNT_MANAGER').length
    });

    return NextResponse.json({
      success: true,
      companies: filteredCompanies,
      stats
    });

  } catch (error) {
    console.error('❌ [CRM Companies] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error intern del servidor',
        details: error instanceof Error ? error.message : 'Error desconegut'
      },
      { status: 500 }
    );
  }
}