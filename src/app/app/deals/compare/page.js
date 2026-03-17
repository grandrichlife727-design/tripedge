import { ArrowLeftRight, BadgeDollarSign, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Tier2FeaturesDemo from '@/components/features/Tier2FeaturesDemo';
import { UpgradePrompt } from '@/components/app/UpgradePrompt';
import { getPreviewContext } from '@/lib/preview-auth-server';

export default async function ComparePage() {
  const preview = getPreviewContext();
  const tier = preview?.tier || 'free';

  if (!preview) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
    if (!['pro', 'premium'].includes(profile?.tier || 'free')) {
      return <UpgradePrompt title="AI Negotiator is a Pro feature" description="Cross-site comparisons and AI booking guidance are part of the paid comparison workflow." tier="pro" />;
    }
  } else if (!['pro', 'premium'].includes(tier)) {
    return <UpgradePrompt title="AI Negotiator is a Pro feature" description="Switch to Pro or Premium preview to inspect the comparison workflow." tier="pro" />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-[linear-gradient(135deg,#FFFFFF,#F5F2EA)] p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Cross-Site Comparison</p>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">AI Negotiator</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700">This is where pricing comparisons, direct-booking advantages, and booking-friction tradeoffs should become a clear recommendation.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><ArrowLeftRight size={14} /> Comparison layer</div>
            <div className="text-3xl font-bold text-earth-900">3+</div>
            <div className="mt-1 text-sm text-earth-700">Sources compared side by side before you book</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><BadgeDollarSign size={14} /> Hidden savings</div>
            <div className="text-3xl font-bold text-earth-900">Codes + perks</div>
            <div className="mt-1 text-sm text-earth-700">Direct-booking value is surfaced instead of buried</div>
          </div>
          <div className="rounded-card border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><ShieldCheck size={14} /> Decision support</div>
            <div className="text-3xl font-bold text-earth-900">Risk-aware</div>
            <div className="mt-1 text-sm text-earth-700">Tradeoffs are explained, not just ranked</div>
          </div>
        </div>
      </section>

      <Tier2FeaturesDemo initialFeature="negotiator" embedded />
    </div>
  );
}
