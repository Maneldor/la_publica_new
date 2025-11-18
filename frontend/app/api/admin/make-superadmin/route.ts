import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * ⚠️ ENDPOINT TEMPORAL - ELIMINAR DESPRÉS D'USAR
 *
 * POST /api/admin/make-superadmin
 * Converteix l'usuari actual a SUPER_ADMIN
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticat' },
        { status: 401 }
      );
    }

    console.log(`🔐 [Upgrade] Converting user to SUPER_ADMIN: ${session.user.email}`);

    const updated = await prismaClient.user.update({
      where: { id: session.user.id },
      data: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });

    console.log(`✅ [Upgrade] User upgraded successfully: ${updated.email}`);

    return NextResponse.json({
      success: true,
      user: updated,
      message: '✅ Ara ets SUPER_ADMIN! Tanca sessió i torna a iniciar per aplicar els canvis.',
      instructions: [
        '1. Tanca aquesta pestanya',
        '2. Tanca sessió completament',
        '3. Torna a iniciar sessió',
        '4. Accedeix a /admin/logs',
        '5. ELIMINA aquest endpoint: app/api/admin/make-superadmin/route.ts'
      ]
    });

  } catch (error) {
    console.error('❌ [Upgrade] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualitzar usuari',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET també funciona per testing ràpid
 */
export async function GET(request: NextRequest) {
  return POST(request);
}