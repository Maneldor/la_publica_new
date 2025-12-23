import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prismaClient } from '@/lib/prisma';
import Stripe from 'stripe';
import { PaymentMethod } from '@prisma/client';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get Stripe instance (throws if not configured)
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
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
    const defaultLimits = newPlan.limitesJSON ? JSON.parse(newPlan.limitesJSON) : {};

    if (company.subscriptions && company.subscriptions.length > 0) {
      await prismaClient.subscription.update({
        where: { id: company.subscriptions[0].id },
        data: {
          planId: newPlan.id,
          precioMensual: newPlan.precioMensual,
          precioAnual: newPlan.precioAnual,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          limites: defaultLimits
        }
      });
    } else {
      await prismaClient.subscription.create({
        data: {
          companyId: company.id,
          planId: newPlan.id,
          precioMensual: newPlan.precioMensual,
          precioAnual: newPlan.precioAnual,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          limites: defaultLimits
        }
      });
    }

    // 3. Get next invoice number
    // 4. Create invoice
    const invoice = await prismaClient.invoice.create({
      data: {
        companyId: company.id,
        subscriptionId: company.subscriptions[0]?.id || undefined,
        invoiceNumber: `FP-${Date.now()}`,
        concept: `Actualización a plan ${newPlan.tier}`,
        totalAmount: session.amount_total ?? 0,
        subtotalAmount: session.amount_total ?? 0,
        taxAmount: 0,
        pendingAmount: 0,
        paidAmount: session.amount_total ?? 0,
        status: 'PAID',
        issueDate: new Date(),
        dueDate: new Date(),
        paidDate: new Date(),
        clientName: company.name,
        clientCif: company.cif || 'N/D',
        clientEmail: company.email,
        clientAddress: company.address || 'N/D',
        items: {
          create: [
            {
              description: `Plan ${newPlan.tier}`,
              quantity: 1,
              unitPrice: session.amount_total ?? 0,
              subtotalAmount: session.amount_total ?? 0,
              taxAmount: 0,
              totalAmount: session.amount_total ?? 0
            }
          ]
        }
      }
    });

    // 5. Create payment record
    await prismaClient.payment.create({
      data: {
        invoiceId: invoice.id,
        paymentNumber: `PAY-${Date.now()}`,
        amount: session.amount_total ?? 0,
        netAmount: session.amount_total ?? 0,
        method: PaymentMethod.CREDIT_CARD,
        status: 'COMPLETED',
        paymentDate: new Date(),
        stripePaymentId: session.payment_intent as string,
        stripeSessionId: session.id
      }
    });

    console.log(`✅ Company ${company.name} upgraded to ${newPlan.tier}`);
    console.log(`📧 Invoice ${invoice.invoiceNumber} created for €${(session.amount_total ?? 0) / 100}`);

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