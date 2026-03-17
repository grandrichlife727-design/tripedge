'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { buildPlannerQueryFromDeal, getDealId } from '@/components/dashboard/shared';

export function DealActionPanel({ deal }) {
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const routeId = useMemo(() => getDealId(deal), [deal]);
  const plannerHref = useMemo(
    () => `/app/planner?query=${encodeURIComponent(buildPlannerQueryFromDeal(deal))}&source=deal&deal=${encodeURIComponent(routeId)}`,
    [deal, routeId]
  );

  async function createAlert() {
    setStatus({ type: 'loading', message: 'Creating alert...' });
    try {
      const targetPrice = Number(deal.current_price || 0) > 0 ? Math.max(25, Math.round(Number(deal.current_price) * 0.95)) : null;
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ route_id: routeId, target_price: targetPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not create alert');
      setStatus({
        type: 'success',
        message: targetPrice ? `Alert active at $${targetPrice}` : 'Alert created successfully',
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not create alert' });
    }
  }

  return (
    <div className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Next move</div>
      <div className="space-y-3">
        <Link
          href={plannerHref}
          className="inline-flex w-full items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800"
        >
          Turn this into a trip plan
        </Link>
        <button
          type="button"
          onClick={createAlert}
          disabled={status.type === 'loading'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status.type === 'success' ? <CheckCircle2 size={16} /> : <Bell size={16} />}
          {status.type === 'loading' ? 'Creating alert...' : 'Watch this price'}
        </button>
      </div>
      <p className="mt-4 text-sm leading-6 text-earth-700">
        Use planning if you are ready to shape the trip. Use alerts if you like the market but want TripEdge to watch for a better entry.
      </p>
      {status.type !== 'idle' ? (
        <div
          className={`mt-4 rounded-button px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'border border-success/20 bg-teal-light text-success'
              : status.type === 'error'
                ? 'border border-warning-border bg-warning-light text-warning'
                : 'border border-cream-300 bg-cream-50 text-earth-700'
          }`}
        >
          {status.message}
        </div>
      ) : null}
    </div>
  );
}
