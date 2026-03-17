'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Clock3, MapPinned, Wallet } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ItinerarySkeleton } from '@/components/ui/Shimmer';

const EXAMPLES = [
  'Weekend in Porto under $100/day',
  '5 days in Bali, adventure + culture',
  'Tokyo hidden gems, solo traveler',
];

const typeEmoji = { gem: '✦', food: '🍜', culture: '🏛', adventure: '⛰', relax: '☀' };
const typeColor = { gem: 'text-gold', food: 'text-warning', culture: 'text-ocean', adventure: 'text-success', relax: 'text-gold-muted' };

export function PlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const seededFromQuery = useRef(false);

  useEffect(() => {
    const presetQuery = searchParams.get('query');
    if (presetQuery && !seededFromQuery.current) {
      setInput(presetQuery);
      seededFromQuery.current = true;
    }
  }, [searchParams]);

  async function submit() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setItinerary(null);
    const res = await fetch('/api/generate-itinerary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: input }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data?.error || 'Could not generate itinerary');
      return;
    }
    if (data?.tripId) {
      router.push(`/app/trips/${encodeURIComponent(String(data.tripId))}`);
      return;
    }
    setLoading(false);
    setItinerary(data.itinerary);
  }

  const totalStops = useMemo(() => (itinerary?.days || []).reduce((sum, day) => sum + (day.items?.length || 0), 0), [itinerary]);
  const source = searchParams.get('source');
  const seededFromDeal = source === 'deal' && !!searchParams.get('deal');

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-[linear-gradient(135deg,#FFFFFF,#F5F2EA)] p-6 shadow-card md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr] xl:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">AI Itinerary Builder</p>
            <h1 className="mb-3 font-display text-4xl font-bold text-earth-900">Plan Your Trip</h1>
            <p className="max-w-2xl text-base leading-7 text-earth-700">Describe the trip you want and TripEdge returns a tighter, local-first plan with pacing, budget context, and cleaner day structure.</p>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Best prompt structure</div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-earth-700">
              <div>1. destination or trip type</div>
              <div>2. number of days</div>
              <div>3. budget or travel style</div>
              <div>4. what you want more of: food, culture, outdoors, nightlife</div>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
        {seededFromDeal ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-button border border-teal/20 bg-teal-light px-4 py-3 text-sm text-earth-800">
            <span>This planner prompt was loaded from a live deal. Generate the itinerary, then save the trip and set an alert if you want to keep watching the price.</span>
            <Link href="/app/deals" className="font-semibold text-teal transition hover:text-ocean">
              Back to deals
            </Link>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="3 days in Tokyo, $150/day budget, love street food and hidden temples..."
            className="h-14 flex-1 rounded-button border border-cream-300 bg-cream-50 px-5 text-sm text-earth-900 outline-none placeholder:text-earth-600"
          />
          <button onClick={submit} className="btn-primary inline-flex items-center justify-center gap-2 rounded-button px-7 py-4 text-sm" disabled={loading}>
            {loading ? 'Planning...' : 'Plan my trip'}
            {!loading ? <ArrowRight size={16} /> : null}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((sample) => (
            <button key={sample} onClick={() => setInput(sample)} className="rounded-badge border border-cream-300 bg-cream-100 px-4 py-2 text-xs text-earth-700">
              {sample}
            </button>
          ))}
        </div>
      </div>

      {loading ? <ItinerarySkeleton /> : null}
      {error ? <div className="rounded-card border border-warning-border bg-warning-light p-4 text-sm text-warning">{error}</div> : null}

      {itinerary ? (
        <div className="space-y-5">
          <section className="rounded-card border border-cream-300 bg-white p-7 shadow-card">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold text-earth-900">{itinerary.destination}</h2>
                {itinerary.tagline ? <p className="mt-2 text-sm italic leading-6 text-earth-700">{itinerary.tagline}</p> : null}
              </div>
              {itinerary.insider_tip ? (
                <div className="max-w-md rounded-button border border-gold-border bg-gold-light p-4 text-sm leading-6 text-gold">
                  <strong>Insider tip:</strong> {itinerary.insider_tip}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><MapPinned size={14} /> Trip shape</div>
                <div className="text-2xl font-bold text-earth-900">{itinerary.days?.length || 0} days</div>
                <div className="mt-1 text-sm text-earth-700">{totalStops} planned stops across the itinerary</div>
              </div>
              <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Wallet size={14} /> Budget</div>
                <div className="text-2xl font-bold text-earth-900">{itinerary.estimated_daily_budget || 'N/A'}</div>
                <div className="mt-1 text-sm text-earth-700">Estimated daily spend target</div>
              </div>
              <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Clock3 size={14} /> Pacing</div>
                <div className="text-2xl font-bold text-earth-900">3-4 stops/day</div>
                <div className="mt-1 text-sm text-earth-700">Deliberately tighter than a generic itinerary dump</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/trips" className="inline-flex items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800">
                Open My Trips
              </Link>
              <Link href="/app/deals" className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal">
                Back to deals
              </Link>
            </div>
          </section>

          <section className="rounded-card border border-cream-300 bg-white p-7 shadow-card">
            <div className="space-y-8">
              {itinerary.days?.map((day) => (
                <section key={day.day}>
                  <div className="mb-4 flex items-end justify-between gap-4 border-b border-cream-200 pb-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Day {day.day}</div>
                      <div className="mt-1 text-2xl font-semibold text-earth-900">{day.title}</div>
                    </div>
                    <div className="text-sm text-earth-600">{day.items?.length || 0} stops</div>
                  </div>
                  <div className="space-y-3">
                    {day.items?.map((item, idx) => (
                      <div key={`${day.day}-${idx}`} className="grid gap-4 rounded-card border border-cream-200 bg-cream-50 px-4 py-4 md:grid-cols-[88px,1fr,auto] md:items-start">
                        <div className="text-sm font-medium text-earth-600">{item.time}</div>
                        <div>
                          <div className="text-sm font-semibold text-earth-900">
                            <span className={`mr-2 ${typeColor[item.type] || 'text-earth-700'}`}>{typeEmoji[item.type] || '•'}</span>
                            {item.activity}
                          </div>
                          <div className="mt-1 text-sm leading-6 text-earth-700">{item.description}</div>
                        </div>
                        <div className="text-sm font-semibold text-success">{item.cost}</div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
