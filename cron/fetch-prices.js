// cron/fetch-prices.js
// Run every 2 hours via Vercel Cron or GitHub Actions
// vercel.json: { "crons": [{ "path": "/api/cron/fetch-prices", "schedule": "0 */2 * * *" }] }
//
// This can also be deployed as a Supabase Edge Function.
// Below is the logic — adapt the import style for your deployment target.

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ─── Amadeus auth ───
async function getAmadeusToken() {
  const res = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${process.env.AMADEUS_CLIENT_ID}&client_secret=${process.env.AMADEUS_CLIENT_SECRET}`,
  });
  const data = await res.json();
  return data.access_token;
}

// ─── Fetch flight price from Amadeus ───
async function fetchFlightPrice(token, origin, destination) {
  const departDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]; // 30 days out
  const url = `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departDate}&adults=1&max=1&currencyCode=USD`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const price = parseFloat(data.data?.[0]?.price?.total);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

// ─── Main cron logic ───
async function main() {
  const supabase = getSupabase();
  console.log('[TripEdge Cron] Starting price fetch...');

  // Get all active routes
  const { data: routes } = await supabase
    .from('routes')
    .select('*')
    .eq('is_active', true);

  if (!routes?.length) {
    console.log('[TripEdge Cron] No active routes found.');
    return;
  }

  const token = await getAmadeusToken();
  let pricesFetched = 0;
  let steamMoves = 0;

  for (const route of routes) {
    // Only handle flights via Amadeus for now
    // Hotels would need a separate API (Booking.com, Hotels.com, etc.)
    if (route.route_type !== 'flight') continue;

    const price = await fetchFlightPrice(token, route.origin, route.destination);
    if (!price) continue;

    // Insert new price point
    await supabase.from('route_prices').insert({
      route_id: route.id,
      price,
      source: 'amadeus',
    });
    pricesFetched++;

    // ─── Steam move detection ───
    // Check if price dropped 15%+ in last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 3600000).toISOString();
    const { data: recentPrices } = await supabase
      .from('route_prices')
      .select('price, fetched_at')
      .eq('route_id', route.id)
      .gte('fetched_at', fourHoursAgo)
      .order('fetched_at', { ascending: true });

    if (recentPrices?.length >= 2) {
      const oldest = recentPrices[0].price;
      const dropPct = ((oldest - price) / oldest) * 100;

      if (dropPct >= 15) {
        await supabase.from('steam_moves').insert({
          route_id: route.id,
          price_before: oldest,
          price_after: price,
          drop_pct: Math.round(dropPct * 100) / 100,
          window_hours: 4,
        });
        steamMoves++;
        console.log(`[Steam Move] ${route.origin}→${route.destination}: -${dropPct.toFixed(1)}%`);
      }
    }

    // Rate limit: don't slam the API
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`[TripEdge Cron] Done. ${pricesFetched} prices fetched, ${steamMoves} steam moves detected.`);
}

// ─── If running as Vercel Cron (API route) ───
// Export as: src/app/api/cron/fetch-prices/route.js
export async function GET(request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await main();
  return Response.json({ ok: true });
}

// ─── If running standalone ───
if (typeof process !== 'undefined' && process.argv?.[1]?.includes('fetch-prices')) {
  main().catch(console.error);
}
