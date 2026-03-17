import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getPreviewItinerary } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

function buildPreviewTrip(id) {
  return {
    id,
    destination: 'Lisbon, Portugal',
    tagline: 'Golden-hour viewpoints, tiled streets, and long lunches by the water.',
    estimated_daily_budget: '$140',
    insider_tip: 'Book Time Out Market lunches off-peak, then move to smaller neighborhood taverns at night.',
    is_favorite: true,
    created_at: new Date().toISOString(),
    itinerary_data: getPreviewItinerary('Lisbon preview'),
  };
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildPlannerQueryFromTrip(trip) {
  const budget = trip.estimated_daily_budget ? `${trip.estimated_daily_budget}/day` : 'balanced budget';
  return `Refine my ${trip.destination} itinerary with ${budget}, local food, hidden gems, and cleaner pacing`;
}

export default async function TripDetailPage({ params }) {
  const preview = getPreviewContext();
  let trip = null;

  if (preview) {
    trip = buildPreviewTrip(params.id);
  } else {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('itineraries')
      .select('id, destination, tagline, estimated_daily_budget, insider_tip, is_favorite, created_at, itinerary_data')
      .eq('user_id', user.id)
      .eq('id', params.id)
      .maybeSingle();
    trip = data;
  }

  if (!trip) notFound();

  const days = Array.isArray(trip.itinerary_data?.days) ? trip.itinerary_data.days : [];

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Saved itinerary</p>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">{trip.destination}</h1>
            {trip.tagline ? <p className="mt-3 max-w-3xl text-base leading-7 text-earth-700">{trip.tagline}</p> : null}
          </div>
          <div className="rounded-card border border-cream-300 bg-cream-50 px-5 py-4 text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Saved</div>
            <div className="mt-1 text-sm font-semibold text-earth-900">{formatDate(trip.created_at)}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><CalendarDays size={14} /> Days</div>
            <div className="text-2xl font-bold text-earth-900">{days.length || 'N/A'}</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Wallet size={14} /> Budget</div>
            <div className="text-2xl font-bold text-earth-900">{trip.estimated_daily_budget || 'N/A'}</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Status</div>
            <div className="text-2xl font-bold text-earth-900">{trip.is_favorite ? 'Favorite' : 'Saved'}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/app/planner?query=${encodeURIComponent(buildPlannerQueryFromTrip(trip))}&source=trip&trip=${encodeURIComponent(String(trip.id))}`}
            className="inline-flex items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800"
          >
            Refine in planner
          </Link>
          <Link
            href="/app/deals"
            className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal"
          >
            Find matching deals
          </Link>
          <Link
            href="/app/trips"
            className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-white px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal"
          >
            Back to all trips
          </Link>
        </div>
      </section>

      {trip.insider_tip ? (
        <section className="rounded-card border border-gold-border bg-gold-light p-5 text-sm leading-7 text-gold shadow-card">
          <strong>Insider tip:</strong> {trip.insider_tip}
        </section>
      ) : null}

      <section className="rounded-card border border-cream-300 bg-white p-7 shadow-card">
        <div className="space-y-8">
          {days.map((day) => (
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
                      <div className="text-sm font-semibold text-earth-900">{item.activity}</div>
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
  );
}
