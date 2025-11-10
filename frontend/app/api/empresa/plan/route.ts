import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Para desarrollo, usar datos mock
    // TODO: Reemplazar con llamada real al backend
    const mockPlanData = {
      company: {
        id: `company-${session.user.id}`,
        name: session.user.name || 'Empresa de Prueba SL',
        subscriptionPlan: 'PREMIUM'
      },
      subscription: {
        plan: 'PREMIUM',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      usage: {
        members: { used: 3, limit: 10 },
        storage: { used: 2.5 * 1024 * 1024 * 1024, limit: 10 * 1024 * 1024 * 1024 },
        projects: { used: 5, limit: 50 },
        documents: { used: 120, limit: 500 }
      }
    };

    // En producción, hacer llamada al backend:
    // const response = await fetch(`${process.env.BACKEND_URL}/api/admin/companies/${companyId}/plan`, {
    //   headers: {
    //     'Authorization': `Bearer ${session.user.apiToken}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const data = await response.json();

    return NextResponse.json(mockPlanData);
  } catch (error) {
    console.error('Error fetching plan data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}