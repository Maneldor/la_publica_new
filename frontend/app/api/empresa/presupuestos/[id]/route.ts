import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const isCompanyUser = (user: any) => {
  if (!user) return false;
  const role = (user.role || '').toUpperCase();
  const userType = (user.userType || '').toUpperCase();
  return role === 'COMPANY' || ['COMPANY_OWNER', 'COMPANY_MEMBER'].includes(userType);
};

const getAuthToken = (user: any) => user?.backendToken || user?.apiToken || null;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isCompanyUser(session.user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const authToken = getAuthToken(session.user);
    if (!authToken) {
      return NextResponse.json({ error: 'Token no disponible' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/empresa/presupuestos/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener presupuesto' },
      { status: 500 }
    );
  }
}