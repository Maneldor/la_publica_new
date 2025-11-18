import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isValidCouponCode } from '@/lib/coupon-utils';

/**
 * POST /api/empresa/cupons/validate - Validar cupón (para empresas)
 *
 * Body: { code: string, redemptionType?: string, location?: string, notes?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('❌ [API /empresa/cupons/validate] Unauthorized - no session');
      return NextResponse.json(
        { success: false, error: 'No autoritzat. Cal iniciar sessió.' },
        { status: 401 }
      );
    }

    // Verificar que el usuario pertenece a una empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      include: {
        ownedCompany: true,
        memberCompany: true
      }
    });

    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      console.log('❌ [API /empresa/cupons/validate] User not associated with company');
      return NextResponse.json(
        { success: false, error: 'No estàs associat a cap empresa' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, redemptionType = 'in_store', location, notes } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Codi de cupó requerit' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toUpperCase();

    console.log(`🔍 [API /empresa/cupons/validate] Company ${company.name} validating code: ${trimmedCode}`);

    // Validar formato del código
    if (!isValidCouponCode(trimmedCode)) {
      console.log(`❌ [API /empresa/cupons/validate] Invalid code format: ${trimmedCode}`);
      return NextResponse.json(
        { success: false, error: 'Format de codi invàlid' },
        { status: 400 }
      );
    }

    // Buscar cupón en la base de datos
    const coupon = await prismaClient.coupon.findUnique({
      where: { code: trimmedCode },
      include: {
        offer: {
          include: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        redemption: true
      }
    });

    if (!coupon) {
      console.log(`❌ [API /empresa/cupons/validate] Coupon not found: ${trimmedCode}`);
      return NextResponse.json(
        { success: false, error: 'Cupó no trobat' },
        { status: 404 }
      );
    }

    // Verificar que el cupón pertenece a esta empresa
    if (coupon.companyId !== company.id) {
      console.log(`❌ [API /empresa/cupons/validate] Coupon belongs to different company: ${coupon.companyId} vs ${company.id}`);
      return NextResponse.json(
        { success: false, error: 'Aquest cupó no és vàlid per la teva empresa' },
        { status: 403 }
      );
    }

    // Verificar estado del cupón
    if (coupon.status !== 'ACTIVE') {
      console.log(`❌ [API /empresa/cupons/validate] Coupon not active: ${coupon.status}`);

      let errorMessage = 'Cupó no vàlid';
      if (coupon.status === 'USED') {
        errorMessage = 'Aquest cupó ja ha estat utilitzat';
      } else if (coupon.status === 'EXPIRED') {
        errorMessage = 'Aquest cupó ha caducat';
      } else if (coupon.status === 'CANCELLED') {
        errorMessage = 'Aquest cupó ha estat cancel·lat';
      } else if (coupon.status === 'SUSPENDED') {
        errorMessage = 'Aquest cupó està suspès temporalment';
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 410 }
      );
    }

    // Verificar fecha de expiración
    if (coupon.expiresAt < new Date()) {
      console.log(`❌ [API /empresa/cupons/validate] Coupon expired at: ${coupon.expiresAt}`);

      // Marcar como expirado automáticamente
      await prismaClient.coupon.update({
        where: { id: coupon.id },
        data: { status: 'EXPIRED' }
      });

      return NextResponse.json(
        { success: false, error: 'Aquest cupó ha caducat' },
        { status: 410 }
      );
    }

    // Verificar si ya fue usado
    if (coupon.redemption) {
      console.log(`❌ [API /empresa/cupons/validate] Coupon already redeemed: ${coupon.redemption.id}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Aquest cupó ja ha estat utilitzat',
          redemption: {
            redeemedAt: coupon.redemption.redeemedAt,
            location: coupon.redemption.location,
            validatedBy: coupon.redemption.validatedBy
          }
        },
        { status: 410 }
      );
    }

    // Si llegamos aquí, el cupón es válido para usar
    console.log(`✅ [API /empresa/cupons/validate] Valid coupon found for offer: ${coupon.offer.title}`);

    // Calcular información de descuento
    const originalPrice = Number(coupon.offer.originalPrice) || 0;
    const offerPrice = Number(coupon.offer.price) || 0;
    const discountAmount = originalPrice - offerPrice;
    const discountPercentage = originalPrice > 0
      ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      message: 'Cupó vàlid i llest per utilitzar',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        generatedAt: coupon.generatedAt,
        expiresAt: coupon.expiresAt,
        user: {
          name: coupon.user.name,
          email: coupon.user.email
        },
        offer: {
          id: coupon.offer.id,
          title: coupon.offer.title,
          originalPrice,
          offerPrice,
          discountAmount,
          discountPercentage,
          currency: coupon.offer.currency
        }
      },
      // Datos sugeridos para la redención
      suggestedRedemption: {
        originalPrice,
        discountAmount,
        finalPrice: offerPrice,
        currency: coupon.offer.currency,
        redemptionType,
        location: location || company.address || 'Establiment',
        validatedBy: session.user.id
      }
    });

  } catch (error) {
    console.error('❌ [API /empresa/cupons/validate] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al validar el cupó',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}