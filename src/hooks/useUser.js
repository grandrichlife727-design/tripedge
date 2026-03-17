'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getPreviewProfile, PREVIEW_COOKIE } from '@/lib/preview-auth';

function getPreviewTierFromDocument() {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${PREVIEW_COOKIE}=`));
  if (!cookie) return null;
  return decodeURIComponent(cookie.split('=')[1] || '');
}

export function useUser() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previewTier = getPreviewTierFromDocument();
    if (previewTier) {
      const previewProfile = getPreviewProfile(previewTier);
      setUser({ id: previewProfile.id, email: previewProfile.email, isPreview: true });
      setProfile(previewProfile);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }

      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, tier: profile?.tier || 'free' };
}
