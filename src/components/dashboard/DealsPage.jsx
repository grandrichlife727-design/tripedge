'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Shimmer } from '@/components/ui/Shimmer';
import { useDeals } from '@/hooks/useDeals';
import { useUser } from '@/hooks/useUser';
import { buildPlannerQueryFromDeal, DEALS_FALLBACK, formatDealTitle, getDealId, urgencyBadgeType } from '@/components/dashboard/shared';
import { findAirportMatches, getAirportByCode } from '@/lib/airports';

export function DealsPage() {
  const { profile } = useUser();
  const previewSuffix = profile?.isPreview ? '?preview=1' : '';
  const plannerPreviewSuffix = profile?.isPreview ? '&preview=1' : '';
  const [filter, setFilter] = useState('all');
  const [origin, setOrigin] = useState('all');
  const [customOrigin, setCustomOrigin] = useState('');
  const [savingOrigin, setSavingOrigin] = useState(false);
  const [originError, setOriginError] = useState('');
  const [airportMatches, setAirportMatches] = useState([]);
  const [airportSearchLoading, setAirportSearchLoading] = useState(false);
  const { deals, currentOrigin, loading, error, notice, degraded } = useDeals(filter, origin);

  useEffect(() => {
    if (profile?.home_airport && origin === 'all') {
      setOrigin(String(profile.home_airport).toUpperCase());
    }
  }, [profile?.home_airport, origin]);

  useEffect(() => {
    if (currentOrigin && currentOrigin !== origin) {
      setOrigin(currentOrigin);
    }
  }, [currentOrigin]); // keep UI aligned with server default

  useEffect(() => {
    if (origin !== 'all') {
      setCustomOrigin(origin);
    }
  }, [origin]);

  const fallbackRows = useMemo(() => {
    return DEALS_FALLBACK.filter((deal) => {
      if (filter !== 'all' && deal.route_type !== filter) return false;
      if (origin !== 'all' && deal.route_type !== 'hotel' && deal.origin !== origin) return false;
      return true;
    });
  }, [filter, origin]);

  const rows = useMemo(() => (deals?.length ? deals : fallbackRows), [deals, fallbackRows]);
  const localAirportMatches = useMemo(() => findAirportMatches(customOrigin), [customOrigin]);
  const visibleAirportMatches = useMemo(() => {
    const merged = [];
    const seen = new Set();
    [...airportMatches, ...localAirportMatches].forEach((airport) => {
      const code = String(airport?.code || '').toUpperCase();
      if (!code || seen.has(code)) return;
      seen.add(code);
      merged.push(airport);
    });
    return merged.slice(0, 8);
  }, [airportMatches, localAirportMatches]);
  const activeAirport = useMemo(() => {
    const normalized = String(origin || '').trim().toUpperCase();
    if (!normalized || normalized === 'ALL') return null;
    return visibleAirportMatches.find((airport) => airport.code === normalized) || getAirportByCode(normalized);
  }, [origin, visibleAirportMatches]);
  const quickOriginButtons = useMemo(() => {
    const selected = origin && origin !== 'all' ? origin : currentOrigin && currentOrigin !== 'all' ? currentOrigin : profile?.home_airport;
    const buttons = ['all'];
    if (selected && selected !== 'all') buttons.push(String(selected).toUpperCase());
    return buttons;
  }, [currentOrigin, origin, profile?.home_airport]);

  useEffect(() => {
    const query = String(customOrigin || '').trim();
    if (query.length < 2) {
      setAirportMatches([]);
      setAirportSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setAirportSearchLoading(true);
      try {
        const response = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}&limit=8`);
        const payload = await response.json();
        if (!cancelled) {
          setAirportMatches(Array.isArray(payload.matches) ? payload.matches : []);
        }
      } catch {
        if (!cancelled) {
          setAirportMatches([]);
        }
      } finally {
        if (!cancelled) {
          setAirportSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [customOrigin]);

  async function updateHomeAirport(nextOrigin) {
    const normalized = String(nextOrigin || '').trim().toUpperCase();
    setOrigin(normalized || 'all');
    setOriginError('');
    if (!normalized || normalized === 'ALL') {
      setOrigin('all');
      setCustomOrigin('');
      return;
    }
    if (!/^[A-Z]{3}$/.test(normalized)) {
      setOriginError('Use a 3-letter airport code like MCO, LHR, CDG, or HND.');
      return;
    }
    setSavingOrigin(true);
    try {
      await fetch('/api/profile/home-airport', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ home_airport: normalized }),
      });
    } finally {
      setSavingOrigin(false);
    }
  }

  function submitCustomOrigin(e) {
    e.preventDefault();
    updateHomeAirport(customOrigin);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 font-display text-4xl font-bold text-earth-900">Deal Scanner</h1>
          <p className="text-base text-earth-700">
            AI-detected mispriced flights and hotels, sorted by savings edge.
            {origin !== 'all' ? ` Showing flight deals from ${origin}.` : ' Showing the full network.'}
          </p>
          {degraded ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-earth-500">Fallback board</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <div className="inline-flex flex-wrap gap-2 rounded-button bg-cream-200 p-1">
            {['all', 'flight', 'hotel'].map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-button px-4 py-2 text-sm font-semibold capitalize ${filter === value ? 'bg-white text-earth-900 shadow-navPill' : 'text-earth-700'}`}
              >
                {value === 'all' ? 'All' : `${value}s`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Origin airport</span>
            <div className="inline-flex flex-wrap gap-2 rounded-button bg-cream-100 p-1">
              {quickOriginButtons.map((code) => (
                <button
                  key={code}
                  onClick={() => updateHomeAirport(code)}
                  className={`rounded-button px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${origin === code ? 'bg-white text-earth-900 shadow-navPill' : 'text-earth-700'}`}
                >
                  {code === 'all' ? 'Any' : code}
                </button>
              ))}
            </div>
            {savingOrigin ? <span className="text-xs text-earth-600">Saving default airport…</span> : null}
          </div>
          <form onSubmit={submitCustomOrigin} className="flex w-full flex-col gap-2 md:max-w-md">
            <label htmlFor="origin-airport" className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">
              Search any airport worldwide
            </label>
            <div className="flex gap-2">
              <input
                id="origin-airport"
                value={customOrigin}
                onChange={(e) => {
                  setCustomOrigin(e.target.value);
                  if (originError) setOriginError('');
                }}
                placeholder="Search by code or city, then select"
                className="h-11 flex-1 rounded-button border border-cream-300 bg-white px-4 text-sm text-earth-900 outline-none placeholder:text-earth-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={savingOrigin || String(customOrigin).trim().length !== 3}
              >
                Set airport
              </button>
            </div>
            <p className="text-xs text-earth-600">
              Search by airport code, city, airport name, or country. Results are international and stored as a 3-letter IATA origin.
            </p>
            {activeAirport ? (
              <p className="text-xs text-earth-700">
                Current default: <strong>{activeAirport.code}</strong> — {activeAirport.city}, {activeAirport.country}
              </p>
            ) : null}
            {airportSearchLoading ? <p className="text-xs text-earth-600">Searching airports…</p> : null}
            {visibleAirportMatches.length > 0 ? (
              <div className="grid gap-2 rounded-card border border-cream-300 bg-white p-3">
                {visibleAirportMatches.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => {
                      setCustomOrigin(airport.code);
                      updateHomeAirport(airport.code);
                    }}
                    className="flex items-start justify-between gap-3 rounded-button border border-cream-200 bg-cream-50 px-3 py-3 text-left transition hover:border-teal"
                  >
                    <div>
                      <div className="text-sm font-semibold text-earth-900">{airport.city}, {airport.country}</div>
                      <div className="mt-1 text-xs text-earth-600">{airport.name}</div>
                    </div>
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-teal">{airport.code}</div>
                  </button>
                ))}
              </div>
            ) : null}
            {originError ? <p className="text-xs text-warning">{originError}</p> : null}
          </form>
        </div>
      </div>

      {notice ? (
        <div className="rounded-card border border-cream-300 bg-cream-100 p-4 text-sm text-earth-700">{notice}</div>
      ) : null}
      {error ? <div className="rounded-card border border-warning-border bg-warning-light p-4 text-sm text-warning">{error}</div> : null}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-card border border-cream-300 bg-white p-4 shadow-card">
              <Shimmer height={180} />
              <Shimmer height={24} style={{ marginTop: 16 }} />
              <Shimmer height={18} width="60%" style={{ marginTop: 12 }} />
              <Shimmer height={18} width="40%" style={{ marginTop: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((deal) => (
            <article key={getDealId(deal)} className="card-hover overflow-hidden rounded-card border border-cream-300 bg-white shadow-card">
              <Link href={`/app/deals/${encodeURIComponent(getDealId(deal))}${previewSuffix}`} className="block">
                <img src={deal.image_url || DEALS_FALLBACK[0].image_url} alt={deal.destination} className="h-44 w-full object-cover" />
              </Link>
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <Badge text={deal.urgency === 'hot' ? '🔥 Hot Deal' : deal.urgency === 'warm' ? 'Warm' : 'Watch'} type={urgencyBadgeType(deal.urgency)} />
                  <span className="rounded-md bg-successLight px-2 py-1 text-xs font-bold text-success">-{Math.round(Number(deal.savings_pct || 0))}%</span>
                </div>
                <Link href={`/app/deals/${encodeURIComponent(getDealId(deal))}${previewSuffix}`} className="block">
                  <h2 className="text-xl font-semibold text-earth-900 transition-colors hover:text-teal">{formatDealTitle(deal)}</h2>
                </Link>
                <p className="mt-1 text-sm text-earth-600">{deal.route_type === 'flight' ? deal.carrier : deal.destination} · {deal.travel_dates || 'Live market'}</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-3xl font-bold text-success">${deal.current_price}</div>
                    <div className="text-sm text-earth-600 line-through">avg ${Math.round(Number(deal.avg_price || 0))}</div>
                  </div>
                  <div className={`rounded-button px-3 py-2 text-xs font-semibold ${deal.trend === 'dropping' ? 'bg-teal-light text-success' : deal.trend === 'rising' ? 'bg-warning-light text-warning' : 'bg-cream-100 text-earth-700'}`}>
                    {deal.trend === 'dropping' ? '📉 Price dropping' : deal.trend === 'rising' ? '📈 Trending up' : '→ Stable'}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/app/deals/${encodeURIComponent(getDealId(deal))}${previewSuffix}`}
                    className="inline-flex items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800"
                  >
                    View forecast
                  </Link>
                  <Link
                    href={`/app/planner?query=${encodeURIComponent(buildPlannerQueryFromDeal(deal))}&source=deal&deal=${encodeURIComponent(getDealId(deal))}${plannerPreviewSuffix}`}
                    className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal"
                  >
                    Plan this trip
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
