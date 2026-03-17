import { Bookmark, FolderKanban, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import NewFeaturesDemo from '@/components/features/NewFeaturesDemo';
import { getPreviewSavedSpots } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export default async function SavedPage() {
  const preview = getPreviewContext();
  let spots = [];

  if (preview) {
    spots = getPreviewSavedSpots();
  } else {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('saved_spots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(24);
    spots = data || [];
  }

  const cities = [...new Set(spots.map((spot) => spot.city).filter(Boolean))];
  const collections = [...new Set(spots.map((spot) => spot.metadata?.collection).filter(Boolean))];

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-[linear-gradient(135deg,#FFFFFF,#F5F2EA)] p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Social Save</p>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">Saved Spots</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700">
              Save restaurants, viewpoints, hotels, and hidden gems from anywhere on the web, then turn them into a usable trip plan.
            </p>
          </div>
          <div className="rounded-card border border-cream-300 bg-white px-5 py-4 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Current mode</div>
            <div className="mt-1 text-sm font-semibold text-earth-900">{preview ? 'Preview library' : 'Live account library'}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Bookmark size={14} /> Saved spots</div>
            <div className="text-3xl font-bold text-earth-900">{spots.length}</div>
            <div className="mt-1 text-sm text-earth-700">Items currently saved into your trip library</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><FolderKanban size={14} /> Collections</div>
            <div className="text-3xl font-bold text-earth-900">{collections.length || 1}</div>
            <div className="mt-1 text-sm text-earth-700">Organized buckets for turning saves into itineraries</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Sparkles size={14} /> Cities captured</div>
            <div className="text-3xl font-bold text-earth-900">{cities.length || 1}</div>
            <div className="mt-1 text-sm text-earth-700">Distinct destinations already represented in your saves</div>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-teal-border bg-[linear-gradient(135deg,#E8F5EE,#E6F2FA)] p-5 shadow-card">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">How this should work</div>
        <div className="mt-2 text-sm leading-7 text-earth-900">Save inspiration first, then use TripEdge to convert those loose ideas into a real itinerary while the pricing still supports the trip.</div>
      </section>

      <NewFeaturesDemo initialFeature="save" embedded />
    </div>
  );
}
