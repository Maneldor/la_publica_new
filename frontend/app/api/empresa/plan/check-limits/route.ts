import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import {
  checkCanCreateOffer,
  checkCanActivateOffer,
  checkCanGenerateCoupon,
  checkCanAddTeamMember
} from '@/lib/plans/planService';

/**
 * GET /api/empresa/plan/check-limits?action=create_offer
 * Verificar si se puede realizar una acción específica
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    const sessionUser = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        ownedCompanyId: true,
        memberCompanyId: true,
      },
    });

    const companyId = sessionUser?.ownedCompanyId || sessionUser?.memberCompanyId;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'No pertanys a cap empresa' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Acció no especificada' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'create_offer':
        result = await checkCanCreateOffer(companyId);
        break;

      case 'activate_offer':
        result = await checkCanActivateOffer(companyId);
        break;

      case 'generate_coupon':
        result = await checkCanGenerateCoupon(companyId);
        break;

      case 'add_team_member':
        result = await checkCanAddTeamMember(companyId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Acció no vàlida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      check: {
        action,
        ...result,
      },
    });

  } catch (error) {
    console.error('❌ [Check Limits] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar límits' },
      { status: 500 }
    );
  }
}