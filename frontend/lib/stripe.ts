import Stripe from 'stripe';

// No lanzar error en build time - solo en runtime cuando se use
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null;

// Helper para verificar que Stripe está configurado antes de usar
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY no está definida en variables de entorno');
  }
  return stripe;
}

// Helper para formatear precios a centavos (Stripe usa centavos)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper para formatear de centavos a euros
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}