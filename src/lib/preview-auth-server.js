import { cookies } from 'next/headers';
import { getPreviewProfile, getPreviewTierFromCookieStore } from '@/lib/preview-auth';

export function getPreviewContext() {
  const cookieStore = cookies();
  const tier = getPreviewTierFromCookieStore(cookieStore);
  if (!tier) return null;
  return {
    tier,
    user: getPreviewProfile(tier),
    profile: getPreviewProfile(tier),
  };
}
