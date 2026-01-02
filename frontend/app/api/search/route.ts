import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

/**
 * GET /api/search?q=query&type=all|empreses|ofertes
 * Cerca global a la plataforma
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticat' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { empreses: [], ofertes: [], usuaris: [] }
      });
    }

    const results: {
      empreses: any[];
      ofertes: any[];
      usuaris: any[];
    } = {
      empreses: [],
      ofertes: [],
      usuaris: []
    };

    // Cercar empreses
    if (type === 'all' || type === 'empreses') {
      results.empreses = await prismaClient.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { sector: { contains: query, mode: 'insensitive' } },
            { slogan: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: limit,
        select: {
          id: true,
          name: true,
          logo: true,
          logoUrl: true,
          sector: true,
          slogan: true,
          isVerified: true,
        },
        orderBy: { name: 'asc' }
      });
    }

    // Cercar ofertes
    if (type === 'all' || type === 'ofertes') {
      results.ofertes = await prismaClient.offer.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { shortDescription: { contains: query, mode: 'insensitive' } },
          ],
          status: 'APPROVED',
        },
        take: limit,
        select: {
          id: true,
          title: true,
          shortDescription: true,
          price: true,
          originalPrice: true,
          featured: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Cercar usuaris (només per admins/gestió)
    const userRole = session.user.role;
    const canSearchUsers = ['ADMIN', 'SUPER_ADMIN', 'ADMIN_GESTIO', 'CRM_COMERCIAL'].includes(userRole || '');

    if (canSearchUsers && (type === 'all' || type === 'usuaris')) {
      results.usuaris = await prismaClient.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { nick: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          nick: true,
          image: true,
          role: true,
          userType: true,
        },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      query,
    });

  } catch (error) {
    console.error('Error cercant:', error);
    return NextResponse.json(
      { error: 'Error al cercar' },
      { status: 500 }
    );
  }
}
