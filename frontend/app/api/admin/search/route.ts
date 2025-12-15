import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/admin/search
 * Búsqueda global en el panel de administración
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true }
    });

    if (!adminUser || (adminUser.userType !== 'ADMIN' && adminUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado. Solo administradores.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: []
      });
    }

    const searchTerm = query.trim().toLowerCase();
    const results: any[] = [];

    // Buscar usuarios
    const users = await prismaClient.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true
      },
      take: 5
    });

    users.forEach(user => {
      results.push({
        id: user.id,
        type: 'user',
        title: user.name || user.email,
        subtitle: `${user.email} • ${user.userType}`,
        url: `/admin/usuaris/${user.id}`
      });
    });

    // Buscar empresas
    const companies = await prismaClient.company.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { contactEmail: { contains: searchTerm, mode: 'insensitive' } },
          { cif: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        cif: true,
        status: true
      },
      take: 5
    });

    companies.forEach(company => {
      results.push({
        id: company.id,
        type: 'company',
        title: company.name,
        subtitle: `${company.contactEmail} • ${company.status}`,
        url: `/gestio/admin/empreses/${company.id}`
      });
    });

    // Buscar ofertas (si existe el modelo)
    try {
      const offers = await prismaClient.offer.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          status: true,
          company: {
            select: {
              name: true
            }
          }
        },
        take: 5
      });

      offers.forEach(offer => {
        results.push({
          id: offer.id,
          type: 'offer',
          title: offer.title,
          subtitle: `${offer.company.name} • ${offer.status}`,
          url: `/gestio/admin/ofertes/${offer.id}`
        });
      });
    } catch (error) {
      // Model Offer might not exist, continue without it
    }

    // Buscar logs de auditoría
    const auditLogs = await prismaClient.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: searchTerm, mode: 'insensitive' } },
          { entity: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { userName: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        action: true,
        entity: true,
        description: true,
        userName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    auditLogs.forEach(log => {
      results.push({
        id: log.id,
        type: 'log',
        title: `${log.action} - ${log.entity}`,
        subtitle: `${log.userName || 'Sistema'} • ${log.createdAt.toLocaleDateString()}`,
        url: `/admin/logs?search=${encodeURIComponent(log.id)}`
      });
    });

    // Ordenar resultados por relevancia (usuarios y empresas primero)
    const sortedResults = results.sort((a, b) => {
      const typeOrder = { user: 1, company: 2, offer: 3, log: 4 };
      return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
    });

    return NextResponse.json({
      success: true,
      results: sortedResults.slice(0, 15) // Limitar a 15 resultados
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}