'use client';

import Link from 'next/link';
import { ArrowRight, BellRing, Compass, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Badge } from '@/components/ui/Badge';
import { useDeals } from '@/hooks/useDeals';
import { ALERTS_FALLBACK, DEALS_FALLBACK, TRENDING, formatDealTitle, urgencyBadgeType } from '@/components/dashboard/shared';

export function ExplorePage() {
  const { deals, loading } = useDeals('all');
  const topDeals = deals?.length ? deals : DEALS_FALLBACK;
  const avgSavings = topDeals.length ? Math.round(topDeals.reduce((sum, deal) => sum + Number(deal.savings_pct || 0), 0) / topDeals.length) : 38;
  const leadDeal = topDeals[0];

  return (
    <div className="space-y-8">
      <section className="rounded-section border border-cream-300 bg-[linear-gradient(135deg,#FFFFFF,#F5F2EA)] p-6 shadow-card md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr] xl:items-start">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-badge border border-teal-border bg-teal-light px-4 py-2 text-sm font-semibold text-success">
              <Sparkles size={15} />
              TripEdge market overview
            </div>
            <h1 className="mb-3 font-display text-4xl font-bold text-earth-900">Where to next?</h1>
            <p className="max-w-2xl text-base leading-7 text-earth-700">
              AI-detected deals, hidden gems, and insider itineraries. Start with the strongest pricing gap, then move into planning.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/app/deals" className="btn-primary inline-flex items-center justify-center gap-2 rounded-button px-5 py-3 text-sm">
                Open deal scanner
                <ArrowRight size={16} />
              </Link>
              <Link href="/app/planner" className="btn-secondary inline-flex items-center justify-center rounded-button px-5 py-3 text-sm">
                Build itinerary
              </Link>
            </div>
          </div>

          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Best current edge</div>
                <div className="mt-1 text-xl font-semibold text-earth-900">{leadDeal ? formatDealTitle(leadDeal) : 'No live deals yet'}</div>
              </div>
              <Badge text={leadDeal?.urgency === 'hot' ? 'Hot' : leadDeal?.urgency === 'warm' ? 'Warm' : 'Watch'} type={urgencyBadgeType(leadDeal?.urgency)} />
            </div>
            {leadDeal ? (
              <>
                <div className="flex items-end justify-between gap-4 border-b border-cream-200 pb-4">
                  <div>
                    <div className="text-3xl font-bold text-success">${leadDeal.current_price}</div>
                    <div className="text-sm text-earth-600 line-through">avg ${Math.round(Number(leadDeal.avg_price || 0))}</div>
                  </div>
                  <div className="rounded-button bg-warning-light px-3 py-2 text-xs font-semibold text-warning">-{Math.round(Number(leadDeal.savings_pct || 0))}%</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-earth-700">{leadDeal.route_type === 'hotel' ? leadDeal.destination : leadDeal.carrier}</div>
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-earth-700">{leadDeal.travel_dates || 'Flexible dates'}</div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Active Deals', String(topDeals.length || 23), '✦', 'text-teal'],
          ['Avg. Savings', `${avgSavings}%`, '↓', 'text-warning'],
          ['Price Drops Today', '5', '📉', 'text-ocean'],
          ['Routes Tracked', '12', '◎', 'text-gold'],
        ].map(([label, value, icon, color]) => (
          <div key={label} className="card-hover rounded-card border border-cream-300 bg-white p-6 shadow-card">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-earth-700">
              <span>{label}</span>
              <span className="text-lg normal-case">{icon}</span>
            </div>
            <div className={`text-4xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-earth-900">Trending destinations</h2>
            <p className="text-sm text-earth-700">These are the markets where TripEdge is seeing the best travel value right now.</p>
          </div>
          <Link href="/app/deals" className="text-sm font-semibold text-teal">See all deals →</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {TRENDING.map((item, index) => (
            <Reveal key={item.city} delay={index * 0.08}>
              <article className="card-hover overflow-hidden rounded-card border border-cream-300 bg-white shadow-card">
                <img src={item.image} alt={item.city} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <div className="mb-3"><Badge text={item.tag} type={item.tag === 'Trending' ? 'hot' : item.tag === 'Hidden Gem' ? 'low' : 'deal'} /></div>
                  <h3 className="text-xl font-semibold text-earth-900">{item.city}</h3>
                  <p className="mb-2 text-sm text-earth-600">{item.country}</p>
                  <p className="text-sm font-medium text-teal">{item.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <section className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-earth-900">Top Edge Deals</h2>
              <p className="text-sm text-earth-700">Best current pricing mismatches across tracked routes.</p>
            </div>
            {loading ? <span className="text-xs text-earth-600">Loading…</span> : null}
          </div>
          <div className="space-y-4">
            {topDeals.slice(0, 4).map((deal) => (
              <div key={deal.id} className="deal-row grid gap-4 rounded-button border border-cream-200 bg-cream-50 px-4 py-4 transition-colors md:grid-cols-[1fr,auto,auto] md:items-center">
                <div>
                  <div className="text-sm font-semibold text-earth-900">{formatDealTitle(deal)}</div>
                  <div className="mt-1 text-xs text-earth-600">{deal.route_type === 'hotel' ? deal.destination : deal.carrier} · {deal.travel_dates || 'Flexible dates'}</div>
                </div>
                <Badge text={deal.urgency === 'hot' ? '🔥 Hot' : deal.urgency === 'warm' ? 'Warm' : 'Watch'} type={urgencyBadgeType(deal.urgency)} />
                <div className="text-left md:text-right">
                  <div className="text-lg font-bold text-success">${deal.current_price}</div>
                  <div className="text-xs text-earth-600 line-through">avg ${Math.round(Number(deal.avg_price || 0))}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-earth-900">Live Price Alerts</h2>
              <p className="text-sm text-earth-700">What would normally trigger you to act.</p>
            </div>
            <BellRing className="text-teal" size={18} />
          </div>
          <div className="space-y-3">
            {ALERTS_FALLBACK.map((alert) => (
              <div key={alert.msg} className="rounded-button border border-cream-300 bg-cream-50 p-4">
                <div className="text-sm font-medium leading-6 text-earth-900">{alert.msg}</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-earth-600">{alert.time}</span>
                  <Badge text={alert.type === 'drop' ? 'Price Drop' : alert.type === 'low' ? '6mo Low' : 'Deal'} type={alert.type} />
                </div>
              </div>
            ))}
            <div className="rounded-button border border-teal-border bg-[linear-gradient(135deg,#E8F5EE,#E6F2FA)] p-4 text-sm leading-6 text-success">
              <strong>AI Insight:</strong> European flights are still trending below seasonal averages. Best booking window looks like the next 48 hours.
            </div>
          </div>
        </section>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">
            <Compass size={14} />
            Next best move
          </div>
          <h3 className="text-2xl font-semibold text-earth-900">Use the planner while the pricing edge is still there</h3>
          <p className="mt-2 text-sm leading-7 text-earth-700">TripEdge works best when you move from discovery into planning quickly. Build the itinerary while the market still supports the trip.</p>
          <Link href="/app/planner" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal">Open planner <ArrowRight size={15} /></Link>
        </div>
        <div className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Saved workflow</div>
          <h3 className="text-2xl font-semibold text-earth-900">Save a destination, track it, then share it with your group</h3>
          <p className="mt-2 text-sm leading-7 text-earth-700">The product feels more premium when the steps connect. Discovery, planning, and group coordination should read like one system.</p>
          <Link href="/app/groups" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal">Open groups <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}
