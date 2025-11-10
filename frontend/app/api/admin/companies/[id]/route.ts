import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const companyId = params.id;

    // Mock empresa basada en el ID
    const mockCompany = {
      id: companyId,
      name: companyId === 'comp_1' ? 'Ajuntament de Barcelona' :
            companyId === 'comp_2' ? 'Generalitat de Catalunya' :
            companyId === 'comp_3' ? 'Diputació de Girona' :
            'Empresa Test',
      email: companyId === 'comp_1' ? 'contacte@barcelona.cat' :
             companyId === 'comp_2' ? 'info@gencat.cat' :
             companyId === 'comp_3' ? 'diputacio@ddgi.cat' :
             'test@empresa.cat',
      subscriptionPlan: companyId === 'comp_2' ? 'EMPRESARIAL' :
                       companyId === 'comp_3' ? 'STANDARD' : 'PREMIUM',
      hasCustomPlan: companyId === 'comp_2',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      memberCount: companyId === 'comp_2' ? 25 : companyId === 'comp_3' ? 3 : 8,
      usedStorage: companyId === 'comp_2' ? 120 : companyId === 'comp_3' ? 12 : 45,
      phone: '+34 93 402 70 00',
      website: 'https://www.barcelona.cat'
    };

    return NextResponse.json(mockCompany);

  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}