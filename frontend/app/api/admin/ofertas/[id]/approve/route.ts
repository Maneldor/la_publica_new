import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';

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
        error: 'Només es poden aprovar ofertes pendents',
        currentStatus: offer.status
      }, { status: 400 });
    }

    // Approve offer
    const approvedOffer = await prismaClient.offer.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: user.id
      },
      include: {
        category: true,
        company: true,
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // TODO: Send notification email to company
    // await sendOfferApprovedEmail(offer.company.email, offer.title);

    return NextResponse.json({
      message: 'Oferta aprovada correctament',
      offer: approvedOffer
    });

  } catch (error: any) {
    console.error('Error approving offer:', error);
    return NextResponse.json(
      { error: 'Error al aprovar oferta', details: error.message },
      { status: 500 }
    );
  }
}