// src/app/api/webhook/route.js
import { getStripe, getTierFromPriceId } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.supabase_user_id;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const priceId = subscription.items.data[0].price.id;

      await supabase.from('profiles').update({
        tier: getTierFromPriceId(priceId),
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        subscription_status: subscription.status,
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      }).eq('id', userId);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const priceId = subscription.items.data[0].price.id;

      await supabase.from('profiles').update({
        tier: getTierFromPriceId(priceId),
        stripe_price_id: priceId,
        subscription_status: subscription.status,
      }).eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;

      await supabase.from('profiles').update({
        tier: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        stripe_price_id: null,
      }).eq('stripe_subscription_id', subscription.id);
      break;
    }
  }

  return Response.json({ received: true });
}
