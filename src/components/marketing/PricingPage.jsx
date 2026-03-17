'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reveal } from '@/components/ui/Reveal';

const PLANS = [
  { name: 'Free', key: 'free', price: 0, desc: 'Get started with basic trip planning', eyebrow: 'For trying the product', features: ['AI itinerary builder (3/month)', 'Browse active deals', '1 price alert', 'Basic group trip (up to 3)'], accent: '#8C7E6A' },
  { name: 'Pro', key: 'pro', price: 12, desc: 'For travelers who want the edge', eyebrow: 'Best for active travelers', features: ['Unlimited AI itineraries', 'Full Deal Scanner access', '25 price alerts + push notifications', 'Steam move detection', 'Group trips up to 10 people', 'Price history charts', 'Priority deal alerts'], accent: '#2A9D8F', popular: true },
  { name: 'Premium', key: 'premium', price: 29, desc: 'Concierge-level AI planning', eyebrow: 'Best for power users', features: ['Everything in Pro', 'Unlimited price alerts', 'AI concierge chat (24/7)', 'Unlimited group trips', 'Affiliate cashback on bookings', 'Exclusive flash deal access', 'Calendar sync + auto-booking', 'Multi-city trip optimizer'], accent: '#1A6DAD' },
];

const PRICE_ID_MAP = {
  pro: { monthly: 'STRIPE_PRICE_PRO_MONTHLY', annual: 'STRIPE_PRICE_PRO_ANNUAL' },
  premium: { monthly: 'STRIPE_PRICE_PREMIUM_MONTHLY', annual: 'STRIPE_PRICE_PREMIUM_ANNUAL' },
};

export function PricingPage() {
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState('');
  const router = useRouter();

  async function startCheckout(planKey) {
    if (planKey === 'free') {
      router.push('/auth/login');
      return;
    }
    const priceId = process.env[`NEXT_PUBLIC_${PRICE_ID_MAP[planKey][billing]}`];
    if (!priceId) return;
    setLoading(planKey);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    setLoading('');
    if (data?.url) window.location.href = data.url;
  }

  const annualPrices = useMemo(() => ({ pro: 9.6, premium: 23.2 }), []);

  return (
    <div className="px-5 py-16 md:px-12 md:py-20">
      <Reveal>
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="mb-4 font-display text-5xl font-extrabold text-earth-900">Simple, transparent pricing</h1>
          <p className="mb-8 text-lg leading-8 text-earth-700">Start free. Upgrade when you want faster deal intelligence, deeper coordination, and premium travel tooling.</p>
          <div className="inline-flex rounded-button bg-cream-200 p-1">
            {['monthly', 'annual'].map((period) => (
              <button key={period} onClick={() => setBilling(period)} className={`rounded-button px-5 py-3 text-sm font-semibold ${billing === period ? 'bg-white text-earth-900 shadow-navPill' : 'text-earth-700'}`}>
                {period === 'monthly' ? 'Monthly' : 'Annual'}
                {period === 'annual' ? <span className="ml-2 text-success">Save 20%</span> : null}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
        {PLANS.map((plan, index) => {
          const displayPrice = plan.price === 0 ? '$0' : `$${billing === 'annual' ? annualPrices[plan.key] : plan.price}`;
          return (
            <Reveal key={plan.key} delay={index * 0.08}>
              <div className={`relative h-full rounded-card bg-white p-8 ${plan.popular ? 'border-2 border-teal shadow-popular' : 'border border-cream-300 shadow-card'}`}>
                {plan.popular ? (
                  <div className="absolute right-5 top-5 rounded-badge border border-teal-border bg-teal-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-success">
                    Most popular
                  </div>
                ) : null}
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: plan.accent }}>{plan.eyebrow}</div>
                <div className="mb-1 text-2xl font-semibold text-earth-900">{plan.name}</div>
                <div className="mb-1 flex items-end gap-1">
                  <div className="font-display text-5xl font-extrabold text-earth-900">{displayPrice}</div>
                  <div className="pb-2 text-sm text-earth-600">{plan.price === 0 ? '/forever' : '/mo'}</div>
                </div>
                <p className="mb-8 text-sm leading-7 text-earth-700">{plan.desc}</p>
                <button onClick={() => startCheckout(plan.key)} className={`mb-8 inline-flex w-full items-center justify-center rounded-button px-5 py-4 text-sm font-semibold ${plan.popular ? 'btn-primary text-white' : 'btn-secondary'}`} disabled={loading === plan.key}>
                  {loading === plan.key ? 'Redirecting...' : plan.key === 'free' ? 'Get Started' : 'Start Free Trial'}
                </button>
                <div className="space-y-3 border-t border-cream-200 pt-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-earth-800">
                      <span className="mt-0.5 text-teal">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
