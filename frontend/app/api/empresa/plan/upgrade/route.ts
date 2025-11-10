import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPlan, reason } = body;

    if (!newPlan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    // Para desarrollo, simular upgrade exitoso
    // TODO: Reemplazar con llamada real al backend
    const mockResponse = {
      success: true,
      message: `Pla canviat a ${newPlan} correctament`,
      data: {
        companyId: `company-${session.user.id}`,
        oldPlan: 'PREMIUM',
        newPlan: newPlan,
        changedAt: new Date(),
        reason: reason || 'Usuario solicitó upgrade desde UI'
      }
    };

    // En producción, hacer llamada al backend:
    // const companyId = `company-${session.user.id}`;
    // const response = await fetch(`${process.env.BACKEND_URL}/api/admin/companies/${companyId}/plan/change`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${session.user.apiToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ newPlan, reason })
    // });
    // const data = await response.json();

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}