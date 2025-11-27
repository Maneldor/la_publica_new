import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 });
  }

  const { newPlan } = await request.json();

  if (!newPlan) {
    return NextResponse.json(
      { error: 'Nou pla obligatori' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Canvi de pla no disponible actualment',
      message: 'Contacta amb suport per gestionar el canvi de pla.',
    },
    { status: 501 }
  );
}