// src/app/api/deals/route.js
import { createClient } from '@/lib/supabase/server';
import { DEALS_FALLBACK, getDealOriginOptions } from '@/components/dashboard/shared';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'flight', 'hotel', or null for all
  const origin = (searchParams.get('origin') || '').toUpperCase();
  const preview = getPreviewContext();

  if (preview) {
    let rows = DEALS_FALLBACK.slice();
    const currentOrigin = origin || preview.profile.home_airport || 'all';
    if (type && type !== 'all') {
      rows = rows.filter((deal) => deal.route_type === type);
    }
    if (currentOrigin !== 'all') {
      rows = rows.filter((deal) => deal.route_type === 'hotel' || deal.origin === currentOrigin);
    }
    return Response.json({
      deals: rows,
      currentOrigin,
      originOptions: getDealOriginOptions(DEALS_FALLBACK),
      preview: true,
    });
  }

  const supabase = createClient();
  let currentOrigin = origin || 'all';

  const { data: { user } } = await supabase.auth.getUser();
  if (user && !origin) {
    const { data: profile } = await supabase.from('profiles').select('home_airport').eq('id', user.id).single();
    if (profile?.home_airport) {
      currentOrigin = String(profile.home_airport).toUpperCase();
    }
  }

  let query = supabase.from('active_deals').select('*');
  if (type && type !== 'all') {
    query = query.eq('route_type', type);
  }
  if (currentOrigin !== 'all') {
    query = query.or(`origin.eq.${currentOrigin},route_type.eq.hotel`);
  }

  const { data, error } = await query.order('savings_pct', { ascending: false }).limit(20);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: routeOrigins } = await supabase
    .from('routes')
    .select('origin')
    .eq('route_type', 'flight')
    .eq('is_active', true)
    .order('origin', { ascending: true });

  return Response.json({
    deals: data,
    currentOrigin,
    originOptions: getDealOriginOptions((routeOrigins || []).map((row, index) => ({ origin: row.origin, id: index + 1 }))),
  });
}
