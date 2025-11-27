import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, prorationAmount } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId requerido' }, { status: 400 });
    }

    // Get company by owner or member relation
    const company = await prismaClient.company.findFirst({
      where: {
        OR: [
          { owner: { email: session.user.email } },
          { teamMembers: { some: { email: session.user.email } } }
        ]
      },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Get new plan
    const newPlan = await prismaClient.planConfig.findUnique({
      where: { id: planId }
    });

    if (!newPlan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }

    // Calculate amount to charge (considering proration)
    const amountToCharge = prorationAmount ?? newPlan.precioMensual;

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment for upgrade
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: formatAmountForStripe(amountToCharge),
            product_data: {
              name: `Actualització a ${newPlan.tier}`,
              description: `Upgrade del teu pla a ${newPlan.tier} - ${newPlan.name}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        companyId: company.id,
        planId: newPlan.id,
        currentPlanId: company.subscriptions[0]?.planId || '',
        upgradeType: 'plan_upgrade',
      },
      customer_email: company.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/empresa/pla?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/empresa/plans?payment=cancelled`,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}