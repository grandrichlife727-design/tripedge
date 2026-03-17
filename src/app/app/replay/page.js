import { Camera, Palette, Share2 } from 'lucide-react';
import TripReplayDemo from '@/components/features/TripReplayDemo';

export default function ReplayPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-[linear-gradient(135deg,#FFFFFF,#F5F2EA)] p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Post-Trip Storytelling</p>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">Trip Replay</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700">Turn a finished trip into something worth sharing: the highlights, the best photos, the money saved, and the moments people actually remember.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Camera size={14} /> Source material</div>
            <div className="text-3xl font-bold text-earth-900">Photos + trip data</div>
            <div className="mt-1 text-sm text-earth-700">Replay combines actual trip stats with your best visual moments</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Palette size={14} /> Themes</div>
            <div className="text-3xl font-bold text-earth-900">3 story styles</div>
            <div className="mt-1 text-sm text-earth-700">Editorial, polaroid, and minimal visual directions</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Share2 size={14} /> Output</div>
            <div className="text-3xl font-bold text-earth-900">Share-ready</div>
            <div className="mt-1 text-sm text-earth-700">Built to export and publish with TripEdge branding</div>
          </div>
        </div>
      </section>

      <TripReplayDemo />
    </div>
  );
}
