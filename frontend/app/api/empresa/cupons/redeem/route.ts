import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';
import { sendEmail, canSendEmail, createNotification } from '@/lib/email';
import { render } from '@react-email/render';

/**
 * POST /api/empresa/cupons/redeem - Usar/canjear cupón (para empresas)
 *
 * Body: {
 *   couponId: string,
 *   originalPrice?: number,
 *   discountAmount?: number,
 *   finalPrice?: number,
 *   redemptionType?: string,
 *   location?: string,
 *   notes?: string,
 *   receiptNumber?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('❌ [API /empresa/cupons/redeem] Unauthorized - no session');
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
      console.log('❌ [API /empresa/cupons/redeem] User not associated with company');
      return NextResponse.json(
        { success: false, error: 'No estàs associat a cap empresa' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      couponId,
      originalPrice,
      discountAmount,
      finalPrice,
      redemptionType = 'in_store',
      location,
      notes,
      receiptNumber
    } = body;

    if (!couponId) {
      return NextResponse.json(
        { success: false, error: 'ID del cupó requerit' },
        { status: 400 }
      );
    }

    console.log(`🎯 [API /empresa/cupons/redeem] Company ${company.name} redeeming coupon: ${couponId}`);

    // Buscar cupón y verificar que pertenece a la empresa
    const coupon = await prismaClient.coupon.findUnique({
      where: { id: couponId },
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
      console.log(`❌ [API /empresa/cupons/redeem] Coupon not found: ${couponId}`);
      return NextResponse.json(
        { success: false, error: 'Cupó no trobat' },
        { status: 404 }
      );
    }

    // Verificar que el cupón pertenece a esta empresa
    if (coupon.companyId !== company.id) {
      console.log(`❌ [API /empresa/cupons/redeem] Coupon belongs to different company: ${coupon.companyId} vs ${company.id}`);
      return NextResponse.json(
        { success: false, error: 'Aquest cupó no és vàlid per la teva empresa' },
        { status: 403 }
      );
    }

    // Verificar estado del cupón
    if (coupon.status !== 'ACTIVE') {
      console.log(`❌ [API /empresa/cupons/redeem] Coupon not active: ${coupon.status}`);
      return NextResponse.json(
        { success: false, error: 'Aquest cupó no està actiu' },
        { status: 410 }
      );
    }

    // Verificar que no esté expirado
    if (coupon.expiresAt < new Date()) {
      console.log(`❌ [API /empresa/cupons/redeem] Coupon expired at: ${coupon.expiresAt}`);
      return NextResponse.json(
        { success: false, error: 'Aquest cupó ha caducat' },
        { status: 410 }
      );
    }

    // Verificar que no haya sido usado ya
    if (coupon.redemption) {
      console.log(`❌ [API /empresa/cupons/redeem] Coupon already redeemed: ${coupon.redemption.id}`);
      return NextResponse.json(
        { success: false, error: 'Aquest cupó ja ha estat utilitzat' },
        { status: 410 }
      );
    }

    // Extraer metadata de la request
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const deviceType = userAgent.toLowerCase().includes('mobile') ? 'mobile' :
                      userAgent.toLowerCase().includes('tablet') ? 'tablet' :
                      'desktop';

    // Calcular precios por defecto si no se proporcionan
    const defaultOriginalPrice = Number(coupon.offer.originalPrice) || 0;
    const defaultOfferPrice = Number(coupon.offer.price) || 0;
    const defaultDiscountAmount = defaultOriginalPrice - defaultOfferPrice;

    const finalOriginalPrice = originalPrice ?? defaultOriginalPrice;
    const finalDiscountAmount = discountAmount ?? defaultDiscountAmount;
    const calculatedFinalPrice = finalPrice ?? (finalOriginalPrice - finalDiscountAmount);

    // Crear transacción para marcar cupón como usado y crear redemption
    const result = await prismaClient.$transaction(async (tx) => {
      // 1. Marcar cupón como usado
      const updatedCoupon = await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          status: 'USED',
          usedAt: new Date()
        }
      });

      // 2. Crear registro de redemption
      const redemption = await tx.redemption.create({
        data: {
          couponId: coupon.id,
          offerId: coupon.offerId,
          userId: coupon.userId,
          companyId: coupon.companyId,
          redemptionType,
          location: location || company.address || 'Establiment',
          originalPrice: finalOriginalPrice > 0 ? new Decimal(finalOriginalPrice) : null,
          discountAmount: finalDiscountAmount > 0 ? new Decimal(finalDiscountAmount) : null,
          finalPrice: calculatedFinalPrice > 0 ? new Decimal(calculatedFinalPrice) : null,
          currency: coupon.offer.currency,
          validatedBy: session.user.id,
          verificationMethod: 'manual',
          userAgent,
          ipAddress,
          deviceType,
          notes,
          receiptNumber
        }
      });

      // 3. Registrar evento COUPON_USED
      await tx.offerEvent.create({
        data: {
          offerId: coupon.offerId,
          userId: coupon.userId,
          companyId: coupon.companyId,
          eventType: 'COUPON_USED',
          userAgent,
          ipAddress,
          deviceType
        }
      });

      return { updatedCoupon, redemption };
    });

    console.log(`✅ [API /empresa/cupons/redeem] Coupon redeemed successfully: ${coupon.code}`);

    // ============= NOTIFICAR A LA EMPRESA =============
    try {
      // Buscar usuario de la empresa para enviar email
      const companyUser = await prismaClient.user.findFirst({
        where: {
          OR: [
            { ownedCompanyId: company.id },
            { memberCompanyId: company.id }
          ],
          role: { in: ['COMPANY', 'ADMIN'] }
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      if (companyUser?.email) {
        const canSend = await canSendEmail(companyUser.id, 'coupon_used');

        if (canSend) {
          const CouponUsedEmail = (await import('@/emails/coupon_used')).default;

          const emailHtml = await render(
            CouponUsedEmail({
              redemption: {
                companyName: company.name,
                offerTitle: coupon.offer.title,
                couponCode: coupon.code,
                userName: coupon.user.name || 'Client',
                userEmail: coupon.user.email || '',
                finalPrice: calculatedFinalPrice,
                originalPrice: finalOriginalPrice,
                discountAmount: finalDiscountAmount,
                location: location || company.address || 'Establiment',
                receiptNumber: receiptNumber || undefined,
                usedAt: new Date()
              }
            })
          );

          await sendEmail({
            to: companyUser.email,
            userId: companyUser.id,
            subject: `✅ Cupó utilitzat: ${coupon.offer.title}`,
            template: 'COUPON_USED',
            templateProps: {
              redemption: {
                companyName: company.name,
                offerTitle: coupon.offer.title,
                couponCode: coupon.code,
                userName: coupon.user.name,
                finalPrice: calculatedFinalPrice
              }
            }
          });

          console.log(`📧 [Redemption] Email sent to company ${companyUser.email}`);
        }

        // Notificación in-app para empresa
        await createNotification(
          companyUser.id,
          'COUPON_USED',
          'Cupó utilitzat',
          `El cupó ${coupon.code} ha estat utilitzat per ${coupon.user.name || 'un client'}. Import final: ${calculatedFinalPrice}€`,
          `/empresa/ofertas/${coupon.offer.id}/analytics`,
          session.user.id
        );

        console.log(`🔔 [Redemption] Notification created for company user ${companyUser.id}`);
      }

    } catch (notificationError) {
      console.error('❌ [Redemption] Error sending company notifications:', notificationError);
      // No fallar la request si las notificaciones fallan
    }
    // ============= FIN NOTIFICAR EMPRESA =============

    return NextResponse.json({
      success: true,
      message: 'Cupó utilitzat correctament',
      redemption: {
        id: result.redemption.id,
        couponCode: coupon.code,
        redeemedAt: result.redemption.redeemedAt,
        originalPrice: Number(result.redemption.originalPrice) || 0,
        discountAmount: Number(result.redemption.discountAmount) || 0,
        finalPrice: Number(result.redemption.finalPrice) || 0,
        currency: result.redemption.currency,
        location: result.redemption.location,
        receiptNumber: result.redemption.receiptNumber,
        user: {
          name: coupon.user.name,
          email: coupon.user.email
        },
        offer: {
          id: coupon.offer.id,
          title: coupon.offer.title
        }
      }
    });

  } catch (error) {
    console.error('❌ [API /empresa/cupons/redeem] Error:', error);

    // Manejo de errores específicos de Prisma
    if (error instanceof Error) {
      // Error de concurrencia - cupón ya fue usado en otra transacción
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { success: false, error: 'Aquest cupó ja ha estat utilitzat' },
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al utilitzar el cupó',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}