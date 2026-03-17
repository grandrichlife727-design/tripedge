import { createClient } from '@/lib/supabase/server';
import NewFeaturesDemo from '@/components/features/NewFeaturesDemo';
import { UpgradePrompt } from '@/components/app/UpgradePrompt';
import { getPreviewContext } from '@/lib/preview-auth-server';

export default async function HacksPage() {
  const preview = getPreviewContext();
  const tier = preview?.tier || 'free';

  if (!preview) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
    if (!['pro', 'premium'].includes(profile?.tier || 'free')) {
      return <UpgradePrompt title="Hack Finder is a Pro feature" description="These booking tricks are part of the paid research layer. Upgrade to unlock route hacks, savings breakdowns, and risk labels." tier="pro" />;
    }
  } else if (!['pro', 'premium'].includes(tier)) {
    return <UpgradePrompt title="Hack Finder is a Pro feature" description="Switch to Pro or Premium preview to inspect the full Hack Finder workflow." tier="pro" />;
  }

  return <NewFeaturesDemo initialFeature="hacks" embedded />;
}
