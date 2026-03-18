import Link from 'next/link';
import { ArrowRight, CalendarDays, BarChart3, ShieldCheck, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getPreviewContext } from '@/lib/preview-auth-server';
import { buildPlannerQueryFromDeal, DEALS_FALLBACK, formatDealTitle, urgencyBadgeType } from '@/components/dashboard/shared';
import { Badge } from '@/components/ui/Badge';
import { DealActionPanel } from '@/components/dashboard/DealActionPanel';
import { PriceHistoryCard } from '@/components/dashboard/PriceHistoryCard';

function buildForecastSummary(deal) {
  const current = Number(deal.current_price || 0);
  const avg = Number(deal.avg_price || 0);
  const gap = Math.max(0, avg - current);
  return {
    confidence: deal.urgency === 'hot' ? 86 : deal.urgency === 'warm' ? 74 : 66,
    recommendation: deal.trend === 'dropping' ? 'Book soon' : deal.trend === 'stable' ? 'Book with confidence' : 'Monitor for a slightly better entry',
    rationale: deal.trend === 'dropping'
      ? 'The fare is already well below the trailing average and still moving lower. Waiting adds more risk than upside.'
      : 'The market is still below normal and no longer falling aggressively. This is usually a reasonable booking window.',
    expectedMove: gap ? `Roughly ${Math.round((gap / Math.max(avg, 1)) * 100)}% below its normal range` : 'Below trailing average',
  };
}

export default async function DealDetailPage({ params }) {
  const preview = getPreviewContext();
  let deal = null;

  if (!preview) {
    const supabase = createClient();
    const { data } = await supabase.from('active_deals').select('*').eq('route_id', params.id).maybeSingle();
    deal = data;
  }

  if (!deal) {
    const fallbackIndex = Number(params.id) - 1;
    deal = DEALS_FALLBACK[fallbackIndex] || DEALS_FALLBACK[0];
  }

  const forecast = buildForecastSummary(deal);
  const currentPrice = Number(deal.current_price || 0);
  const avgPrice = Number(deal.avg_price || 0);
  const savings = Math.round(Number(deal.savings_pct || 0));

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-[linear-gradient(135deg,#FFFFFF,#F5F2EA)] p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge text={deal.urgency === 'hot' ? 'Hot deal' : deal.urgency === 'warm' ? 'Warm edge' : 'Watch'} type={urgencyBadgeType(deal.urgency)} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Price Forecast</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">{formatDealTitle(deal)}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700">This page turns the raw deal into a booking decision: where the price sits versus normal, whether you should wait, and how much confidence TripEdge has in the call.</p>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Current market</div>
            <div className="mt-2 text-4xl font-bold text-success">${currentPrice}</div>
            <div className="mt-1 text-sm text-earth-600 line-through">Typical ${avgPrice}</div>
            <div className="mt-4 inline-flex rounded-button bg-warning-light px-3 py-2 text-xs font-semibold text-warning">{savings}% below normal</div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <PriceHistoryCard
          origin={deal.origin || ''}
          destination={deal.destination}
          routeType={deal.route_type || 'flight'}
          currentPrice={currentPrice || 300}
          previewMode={Boolean(preview)}
        />

        <section className="space-y-5">
          <DealActionPanel deal={deal} />

          <div className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">AI verdict</div>
            <h2 className="text-2xl font-semibold text-earth-900">{forecast.recommendation}</h2>
            <p className="mt-2 text-sm leading-7 text-earth-700">{forecast.rationale}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-cream-300 bg-cream-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><ShieldCheck size={14} /> Confidence</div>
                <div className="text-3xl font-bold text-earth-900">{forecast.confidence}%</div>
              </div>
              <div className="rounded-card border border-cream-300 bg-cream-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><ArrowRight size={14} /> Expected move</div>
                <div className="text-sm font-semibold leading-6 text-earth-900">{forecast.expectedMove}</div>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Booking context</div>
            <div className="space-y-4 text-sm leading-7 text-earth-700">
              <div className="flex items-start gap-3"><Wallet size={16} className="mt-1 text-teal" /><div><strong className="text-earth-900">Current price:</strong> ${currentPrice} against a normal range closer to ${avgPrice}.</div></div>
              <div className="flex items-start gap-3"><CalendarDays size={16} className="mt-1 text-teal" /><div><strong className="text-earth-900">Travel window:</strong> {deal.travel_dates || 'Flexible dates'}.</div></div>
              <div className="flex items-start gap-3"><BarChart3 size={16} className="mt-1 text-teal" /><div><strong className="text-earth-900">Signal:</strong> {deal.trend === 'dropping' ? 'Price is still compressing lower.' : deal.trend === 'stable' ? 'Price has stabilized below average.' : 'Market is drifting up.'}</div></div>
            </div>
            <div className="mt-5 border-t border-cream-200 pt-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Recommended flow</div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/app/planner?query=${encodeURIComponent(buildPlannerQueryFromDeal(deal))}&source=deal&deal=${encodeURIComponent(String(deal.route_id || deal.id || 'deal'))}`}
                  className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal"
                >
                  Plan this trip
                </Link>
                <Link
                  href="/app/trips"
                  className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-white px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal"
                >
                  Open saved trips
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
