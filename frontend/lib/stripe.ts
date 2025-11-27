import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en variables de entorno');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Helper para formatear precios a centavos (Stripe usa centavos)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper para formatear de centavos a euros
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}