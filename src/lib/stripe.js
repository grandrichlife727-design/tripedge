import Stripe from 'stripe';

let stripeClient;

export function getStripe() {
  if (stripeClient) return stripeClient;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required.');
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  return stripeClient;
}

// Map Stripe price IDs to tiers
export function getTierFromPriceId(priceId) {
  const map = {
    [process.env.STRIPE_PRICE_PRO_MONTHLY]: 'pro',
    [process.env.STRIPE_PRICE_PRO_ANNUAL]: 'pro',
    [process.env.STRIPE_PRICE_PREMIUM_MONTHLY]: 'premium',
    [process.env.STRIPE_PRICE_PREMIUM_ANNUAL]: 'premium',
  };
  return map[priceId] || 'free';
}

// Plan config for frontend
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    itineraryLimit: 3,
    alertLimit: 1,
    groupMemberLimit: 3,
  },
  pro: {
    name: 'Pro',
    itineraryLimit: Infinity,
    alertLimit: 25,
    groupMemberLimit: 10,
  },
  premium: {
    name: 'Premium',
    itineraryLimit: Infinity,
    alertLimit: Infinity,
    groupMemberLimit: Infinity,
  },
};
