import { createClient } from '@/lib/supabase/server';
import Tier2FeaturesDemo from '@/components/features/Tier2FeaturesDemo';
import { UpgradePrompt } from '@/components/app/UpgradePrompt';
import { getPreviewContext } from '@/lib/preview-auth-server';

export default async function CompanionPage() {
  const preview = getPreviewContext();
  const tier = preview?.tier || 'free';

  if (!preview) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
    if ((profile?.tier || 'free') !== 'premium') {
      return <UpgradePrompt title="Live Companion is Premium" description="This route is reserved for real-time trip guidance, context-aware suggestions, and weather-aware itinerary adjustments." tier="premium" />;
    }
  } else if (tier !== 'premium') {
    return <UpgradePrompt title="Live Companion is Premium" description="Switch to Premium preview to inspect the live companion workflow." tier="premium" />;
  }

  return <Tier2FeaturesDemo initialFeature="companion" embedded />;
}
