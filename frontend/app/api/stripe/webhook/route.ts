import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prismaClient } from '@/lib/prisma';
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
    const company = await prismaClient.company.findUnique({
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

    const newPlan = await prismaClient.planConfig.findUnique({
      where: { id: metadata.planId }
    });

    if (!newPlan) {
      console.error('❌ Plan not found:', metadata.planId);
      return;
    }

    // 2. Update subscription
    if (company.subscriptions && company.subscriptions.length > 0) {
      await prismaClient.subscription.update({
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
      await prismaClient.subscription.create({
        data: {
          companyId: company.id,
          planId: newPlan.id,
          isTrial: false,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });
    }

    // 3. Get next invoice number
    const lastInvoice = await prismaClient.invoice.findFirst({
      orderBy: { invoiceNumber: 'desc' }
    });

    const nextInvoiceNumber = `FP${String((lastInvoice?.invoiceNumber.replace('FP', '') || 0) + 1).padStart(6, '0')}`;

    // 4. Create invoice
    const invoice = await prismaClient.invoice.create({
      data: {
        invoiceNumber: nextInvoiceNumber,
        companyId: company.id,
        planConfigId: newPlan.id,
        amount: session.amount_total! / 100, // Convert from cents
        currency: session.currency!.toUpperCase(),
        status: 'PAID',
        issueDate: new Date(),
        dueDate: new Date(), // Paid immediately
        paidAt: new Date(),
        description: `Actualización a plan ${newPlan.tier}`,
        details: {
          planName: newPlan.tier,
          planPrice: newPlan.monthlyPrice,
          upgradeType: metadata.upgradeType || 'plan_upgrade',
          prorationAmount: session.amount_total! / 100
        }
      }
    });

    // 5. Create payment record
    await prismaClient.payment.create({
      data: {
        companyId: company.id,
        invoiceId: invoice.id,
        amount: session.amount_total! / 100,
        currency: session.currency!.toUpperCase(),
        method: 'STRIPE',
        status: 'COMPLETED',
        transactionId: session.payment_intent as string,
        stripePaymentId: session.payment_intent as string,
        stripeSessionId: session.id,
        processedAt: new Date()
      }
    });

    console.log(`✅ Company ${company.name} upgraded to ${newPlan.tier}`);
    console.log(`📧 Invoice ${nextInvoiceNumber} created for €${session.amount_total! / 100}`);

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