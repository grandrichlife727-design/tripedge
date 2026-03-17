import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Nav } from '@/components/layout/Nav';
import { createClient } from '@/lib/supabase/server';
import { getPreviewProfile, getPreviewTierFromCookieStore } from '@/lib/preview-auth';

export default async function AppLayout({ children }) {
  const cookieStore = cookies();
  const previewTier = getPreviewTierFromCookieStore(cookieStore);

  if (previewTier) {
    const previewProfile = getPreviewProfile(previewTier);
    return (
      <div className="min-h-screen bg-cream-50 text-earth-900">
        <Nav mode="dashboard" tier={previewProfile.tier} preview />
        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();

  return (
    <div className="min-h-screen bg-cream-50 text-earth-900">
      <Nav mode="dashboard" tier={profile?.tier || 'free'} />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
