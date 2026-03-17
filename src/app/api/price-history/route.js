import { createClient } from '@/lib/supabase/server';
import { getPreviewPriceHistory } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const routeType = searchParams.get('type') || 'flight';

  if (!destination || (routeType === 'flight' && !origin)) {
    return Response.json({ error: routeType === 'flight' ? 'origin and destination are required' : 'destination is required' }, { status: 400 });
  }

  const preview = getPreviewContext();
  if (preview) {
    const previewData = getPreviewPriceHistory();
    const history = previewData.history || [];
    const latest = history[history.length - 1];
    const min = history.length ? Math.min(...history.map((row) => Number(row.min_price || row.avg_price || 0))) : null;
    const max = history.length ? Math.max(...history.map((row) => Number(row.max_price || row.avg_price || 0))) : null;
    const avg = history.length ? Math.round(history.reduce((sum, row) => sum + Number(row.avg_price || 0), 0) / history.length) : null;
    return Response.json({
      ...previewData,
      stats: {
        latest_price: latest ? Number(latest.avg_price || 0) : null,
        avg_price: avg,
        low_price: min,
        high_price: max,
        observations: history.reduce((sum, row) => sum + Number(row.sample_count || 0), 0),
        last_updated: latest?.updated_at || null,
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let routeQuery = supabase
    .from('routes')
    .select('id, origin, destination, route_type')
    .eq('destination', destination)
    .eq('route_type', routeType);

  if (routeType === 'flight') {
    routeQuery = routeQuery.eq('origin', origin);
  }

  const { data: route, error: routeError } = await routeQuery.maybeSingle();

  if (routeError) return Response.json({ error: routeError.message }, { status: 500 });
  if (!route) return Response.json({ route: null, history: [] });

  const { data: monthly, error: monthlyError } = await supabase
    .from('price_history_monthly')
    .select('month, avg_price, min_price, max_price, sample_count, updated_at')
    .eq('route_id', route.id)
    .order('month', { ascending: true });

  if (monthlyError) return Response.json({ error: monthlyError.message }, { status: 500 });

  const { data: recentPrices, error: recentPricesError } = await supabase
    .from('route_prices')
    .select('price, fetched_at')
    .eq('route_id', route.id)
    .gte('fetched_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('fetched_at', { ascending: false });

  if (recentPricesError) return Response.json({ error: recentPricesError.message }, { status: 500 });

  const prices = recentPrices || [];
  const latestPrice = prices[0] ? Number(prices[0].price || 0) : null;
  const avgPrice = prices.length ? Math.round(prices.reduce((sum, row) => sum + Number(row.price || 0), 0) / prices.length) : null;
  const lowPrice = prices.length ? Math.min(...prices.map((row) => Number(row.price || 0))) : null;
  const highPrice = prices.length ? Math.max(...prices.map((row) => Number(row.price || 0))) : null;
  const lastUpdated = prices[0]?.fetched_at || monthly?.[monthly.length - 1]?.updated_at || null;

  return Response.json({
    route,
    history: monthly || [],
    stats: {
      latest_price: latestPrice,
      avg_price: avgPrice,
      low_price: lowPrice,
      high_price: highPrice,
      observations: prices.length,
      last_updated: lastUpdated,
    },
  });
}
