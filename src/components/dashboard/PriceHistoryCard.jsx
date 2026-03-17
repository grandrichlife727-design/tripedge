'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';

function buildFallbackPoints(basePrice) {
  const offsets = [58, 42, 34, 28, 18, 6, -4, -10, -16, -24, -32, -26, -18, -14, -8, -2, 4, 12, 18, 10, 3, -6, -12, -9, -15, -22, -28, -34, -40, -46];
  return offsets.map((offset, index) => ({ label: `Day ${index + 1}`, value: Math.max(50, Math.round(basePrice + offset)) }));
}

function formatMonth(value) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

export function PriceHistoryCard({ origin, destination, routeType = 'flight', currentPrice }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('live');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ destination, type: routeType });
        if (origin) params.set('origin', origin);
        const res = await fetch(`/api/price-history?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        if (!active) return;
        const rows = Array.isArray(data?.history) ? data.history : [];
        if (rows.length > 0) {
          setHistory(rows.map((row) => ({ label: formatMonth(row.month), value: Number(row.avg_price || 0) })));
          setStats(data?.stats || null);
          setSource(data?.preview ? 'preview' : 'live');
        } else {
          setHistory(buildFallbackPoints(currentPrice));
          setStats(data?.stats || null);
          setSource('fallback');
        }
      } catch {
        if (!active) return;
        setHistory(buildFallbackPoints(currentPrice));
        setStats(null);
        setSource('fallback');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [origin, destination, routeType, currentPrice]);

  const points = useMemo(() => history.length ? history : buildFallbackPoints(currentPrice), [history, currentPrice]);
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));

  return (
    <section className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Price history</div>
          <h2 className="mt-1 font-display text-2xl font-bold text-earth-900">
            {source === 'fallback' ? 'Modeled trajectory' : 'Observed market trend'}
          </h2>
        </div>
        <BarChart3 size={18} className="text-teal" />
      </div>

      <div className="grid h-64 grid-cols-6 items-end gap-3 rounded-card border border-cream-200 bg-cream-50 px-4 py-5 sm:grid-cols-6">
        {(loading ? Array.from({ length: 6 }).map((_, index) => ({ label: `...${index}`, value: currentPrice })) : points.slice(-6)).map((point, index, rows) => {
          const active = !loading && index === rows.length - 1;
          const height = ((point.value - min) / Math.max(max - min, 1)) * 100;
          return (
            <div key={`${point.label}-${index}`} className="flex h-full flex-col items-center justify-end gap-3">
              <div className="text-[11px] font-semibold text-earth-500">${Math.round(point.value)}</div>
              <div className="flex h-full w-full items-end">
                <div
                  className={`w-full rounded-t-[10px] ${active ? 'bg-[linear-gradient(180deg,#2A9D8F,#1A6DAD)]' : 'bg-cream-300'} ${loading ? 'animate-pulse' : ''}`}
                  style={{ height: `${Math.max(12, height)}%` }}
                  title={`${point.label}: $${Math.round(point.value)}`}
                />
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-earth-500">{loading ? '...' : point.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-earth-600">
        <span>
          {source === 'live' ? 'Live price history from stored route observations.' : source === 'preview' ? 'Preview price history data.' : 'Fallback model shown because no stored price history was available.'}
        </span>
        <span>Current entry ${Math.round(Number(currentPrice || 0))}</span>
      </div>

      {stats ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-earth-600">30d avg</div>
            <div className="mt-1 text-sm font-semibold text-earth-900">{stats.avg_price ? `$${Math.round(stats.avg_price)}` : 'N/A'}</div>
          </div>
          <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-earth-600">Low / High</div>
            <div className="mt-1 text-sm font-semibold text-earth-900">
              {stats.low_price && stats.high_price ? `$${Math.round(stats.low_price)} - $${Math.round(stats.high_price)}` : 'N/A'}
            </div>
          </div>
          <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-earth-600">Observations</div>
            <div className="mt-1 text-sm font-semibold text-earth-900">{stats.observations || 0}</div>
          </div>
          <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-earth-600">Updated</div>
            <div className="mt-1 text-sm font-semibold text-earth-900">
              {stats.last_updated ? formatMonth(stats.last_updated) : 'N/A'}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
