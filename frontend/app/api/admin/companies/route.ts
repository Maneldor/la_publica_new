import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock empresas para desarrollo
    const mockCompanies = [
      {
        id: 'comp_1',
        name: 'Ajuntament de Barcelona',
        email: 'contacte@barcelona.cat',
        subscriptionPlan: 'PREMIUM',
        hasCustomPlan: false,
        status: 'active',
        createdAt: new Date('2024-01-15'),
        memberCount: 8,
        usedStorage: 45
      },
      {
        id: 'comp_2',
        name: 'Generalitat de Catalunya',
        email: 'info@gencat.cat',
        subscriptionPlan: 'EMPRESARIAL',
        hasCustomPlan: true,
        status: 'active',
        createdAt: new Date('2024-02-10'),
        memberCount: 25,
        usedStorage: 120
      },
      {
        id: 'comp_3',
        name: 'Diputació de Girona',
        email: 'diputacio@ddgi.cat',
        subscriptionPlan: 'STANDARD',
        hasCustomPlan: false,
        status: 'active',
        createdAt: new Date('2024-03-05'),
        memberCount: 3,
        usedStorage: 12
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockCompanies
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}