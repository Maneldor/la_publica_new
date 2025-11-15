import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        console.log('✅ PaymentIntent succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session.id);

  const metadata = session.metadata;

  if (!metadata?.companyId || !metadata?.planId) {
    console.error('❌ Missing metadata in checkout session');
    return;
  }

  try {
    // 1. Get company and new plan
    const company = await prisma.company.findUnique({
      where: { id: metadata.companyId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!company) {
      console.error('❌ Company not found:', metadata.companyId);
      return;
    }

    const newPlan = await prisma.planConfig.findUnique({
      where: { id: metadata.planId }
    });

    if (!newPlan) {
      console.error('❌ Plan not found:', metadata.planId);
      return;
    }

    // 2. Update subscription
    if (company.subscriptions && company.subscriptions.length > 0) {
      await prisma.subscription.update({
        where: { id: company.subscriptions[0].id },
        data: {
          planId: newPlan.id,
          isTrial: false,
          trialEndsAt: null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
        }
      });
    } else {
      // Create subscription if doesn't exist
      await prisma.subscription.create({
        data: {
          companyId: company.id,
          planId: newPlan.id,
          isTrial: false,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });
    }

    console.log(`✅ Company ${company.name} upgraded to ${newPlan.tier}`);

  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  // TODO: Send notification to company about failed payment
  // TODO: Update subscription status if needed
}