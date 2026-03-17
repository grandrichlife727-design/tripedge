import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPreviewItinerary } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildPlannerQueryFromTrip(trip) {
  const budget = trip.estimated_daily_budget ? `${trip.estimated_daily_budget}/day` : 'balanced budget';
  return `Refine my ${trip.destination} itinerary with ${budget}, local food, hidden gems, and cleaner pacing`;
}

export default async function TripsPage() {
  const preview = getPreviewContext();
  let itineraries = [];
  let error = null;

  if (preview) {
    itineraries = [
      {
        id: 'preview-trip-1',
        destination: 'Lisbon, Portugal',
        tagline: 'Golden-hour viewpoints, tiled streets, and long lunches by the water.',
        estimated_daily_budget: '$140',
        insider_tip: 'Book Time Out Market lunches off-peak, then move to smaller neighborhood taverns at night.',
        is_favorite: true,
        created_at: new Date().toISOString(),
        itinerary_data: getPreviewItinerary('Lisbon preview'),
      },
    ];
  } else {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: trips, error: tripsError } = await supabase
      .from('itineraries')
      .select('id, destination, tagline, estimated_daily_budget, insider_tip, is_favorite, created_at, itinerary_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    itineraries = trips || [];
    error = tripsError;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Saved Itineraries</p>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">My Trips</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700">
              Every itinerary you generate is saved here so you can reopen, favorite, and reuse it without starting over.
            </p>
          </div>
          <div className="rounded-card border border-cream-300 bg-cream-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Trips Saved</p>
            <p className="mt-1 text-3xl font-bold text-earth-900">{itineraries.length}</p>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-card border border-warning-border bg-warning-light p-4 text-sm text-warning">Could not load saved itineraries: {error.message}</div> : null}

      {!error && itineraries.length === 0 ? (
        <section className="rounded-card border border-cream-300 bg-white p-8 text-center shadow-card">
          <p className="mb-2 font-display text-3xl font-bold text-earth-900">No trips saved yet</p>
          <p className="mx-auto max-w-xl text-base leading-7 text-earth-700">
            Generate your first itinerary in the planner and it will appear here automatically with budget, highlights, and the full day-by-day plan.
          </p>
          <div className="mt-6">
            <Link href="/app/planner" className="inline-flex items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800">
              Start in planner
            </Link>
          </div>
        </section>
      ) : null}

      {itineraries.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {itineraries.map((trip) => {
            const days = Array.isArray(trip.itinerary_data?.days) ? trip.itinerary_data.days.length : 0;
            return (
              <article key={trip.id} className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Link href={`/app/trips/${encodeURIComponent(String(trip.id))}`} className="transition-colors hover:text-teal">
                        <h2 className="font-display text-3xl font-bold text-earth-900">{trip.destination}</h2>
                      </Link>
                      {trip.is_favorite ? <span className="rounded-badge border border-gold-border bg-gold-light px-3 py-1 text-xs font-semibold tracking-[0.18em] text-gold">FAVORITE</span> : null}
                    </div>
                    {trip.tagline ? <p className="mt-2 text-sm italic leading-6 text-earth-700">{trip.tagline}</p> : null}
                  </div>
                  <div className="text-right text-xs text-earth-600">
                    <div className="font-semibold uppercase tracking-[0.18em]">Saved</div>
                    <div className="mt-1">{formatDate(trip.created_at)}</div>
                  </div>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Budget</div><div className="mt-1 text-sm font-semibold text-earth-900">{trip.estimated_daily_budget || 'N/A'}</div></div>
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Days</div><div className="mt-1 text-sm font-semibold text-earth-900">{days || 'N/A'}</div></div>
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Status</div><div className="mt-1 text-sm font-semibold text-success">Saved</div></div>
                </div>

                {trip.insider_tip ? <div className="rounded-button border border-gold-border bg-gold-light p-4 text-sm leading-6 text-gold"><strong>Insider tip:</strong> {trip.insider_tip}</div> : null}

                {days > 0 ? (
                  <div className="mt-5 space-y-3">
                    {trip.itinerary_data.days.slice(0, 2).map((day) => (
                      <div key={day.day} className="rounded-button border border-cream-200 bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Day {day.day}</div>
                        <div className="mt-1 text-sm font-semibold text-earth-900">{day.title}</div>
                        <div className="mt-1 text-sm text-earth-700">{Array.isArray(day.items) ? `${day.items.length} planned stops` : 'Planned day'}</div>
                      </div>
                    ))}
                    {days > 2 ? <div className="text-sm font-medium text-teal">+{days - 2} more day{days - 2 === 1 ? '' : 's'}</div> : null}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3 border-t border-cream-200 pt-5">
                  <Link
                    href={`/app/trips/${encodeURIComponent(String(trip.id))}`}
                    className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-white px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal"
                  >
                    Open trip
                  </Link>
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
                    Find another deal
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
