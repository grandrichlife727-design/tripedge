import { createAdminClient } from '@/lib/supabase/server';

export default async function PublicReplayPage({ params }) {
  const supabase = createAdminClient();
  const { data: replay } = await supabase
    .from('trip_replays')
    .select('city, country, dates_label, headline, subheadline, narrative, pull_quote, social_caption, theme, stats, highlights, is_public')
    .eq('public_slug', params.slug)
    .eq('is_public', true)
    .maybeSingle();

  if (!replay) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-5xl font-bold text-earth-900">Replay not found</h1>
        <p className="mt-4 text-base text-earth-700">This replay does not exist or is not public.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-section border border-cream-300 bg-white p-8 shadow-card md:p-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">tripedge.ai</p>
        <h1 className="font-display text-5xl font-bold text-earth-900">{replay.headline}</h1>
        {replay.subheadline ? <p className="mt-4 text-lg italic text-earth-700">{replay.subheadline}</p> : null}
        <p className="mt-4 text-sm text-earth-600">{replay.city}, {replay.country} · {replay.dates_label}</p>
        <div className="mt-8 whitespace-pre-line text-base leading-8 text-earth-900">{replay.narrative}</div>
        {replay.pull_quote ? (
          <blockquote className="mt-8 rounded-card border border-teal-border bg-[linear-gradient(135deg,#E8F5EE,#E6F2FA)] p-6 font-display text-3xl font-bold text-earth-900">
            “{replay.pull_quote}”
          </blockquote>
        ) : null}
      </div>
    </div>
  );
}
