import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { logSuccess, logError } from '@/lib/auditLog';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verify user is admin
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accés no autoritzat' }, { status: 403 });
    }

    // Get body
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({
        error: 'El motiu del rebuig és obligatori'
      }, { status: 400 });
    }

    // Get offer
    const offer = await prismaClient.offer.findUnique({
      where: { id: params.id },
      include: {
        company: true
      }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Oferta no trobada' }, { status: 404 });
    }

    // Check if offer is pending
    if (offer.status !== 'PENDING') {
      return NextResponse.json({
        error: 'Només es poden rebutjar ofertes pendents',
        currentStatus: offer.status
      }, { status: 400 });
    }

    // Reject offer
    const rejectedOffer = await prismaClient.offer.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: user.id,
        rejectedReason: reason
      },
      include: {
        category: true,
        company: true,
        rejectedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log audit trail
    await logSuccess(
      'OFFER_REJECTED',
      'Offer',
      rejectedOffer.id,
      rejectedOffer.title,
      `Oferta "${rejectedOffer.title}" de l'empresa "${rejectedOffer.company.name}" rebutjada: ${reason}`,
      {
        offerId: rejectedOffer.id,
        companyId: rejectedOffer.companyId,
        companyName: rejectedOffer.company.name,
        rejectionReason: reason,
        previousStatus: offer.status,
        newStatus: 'REJECTED'
      },
      request
    );

    // TODO: Send notification email to company
    // await sendOfferRejectedEmail(offer.company.email, offer.title, reason);

    return NextResponse.json({
      message: 'Oferta rebutjada',
      offer: rejectedOffer
    });

  } catch (error: any) {
    console.error('Error rejecting offer:', error);

    // Log audit trail for error
    await logError(
      'OFFER_REJECTED',
      'Offer',
      `Error rebutjant oferta ${params.id}`,
      error,
      { offerId: params.id },
      request
    );

    return NextResponse.json(
      { error: 'Error al rebutjar oferta', details: error.message },
      { status: 500 }
    );
  }
}