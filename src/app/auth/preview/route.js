import { NextResponse } from 'next/server';
import { ALLOWED_TIERS, PREVIEW_COOKIE } from '@/lib/preview-auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestedTier = String(searchParams.get('tier') || 'free').toLowerCase();
  const tier = ALLOWED_TIERS.has(requestedTier) ? requestedTier : 'free';
  const redirectTo = searchParams.get('redirect') || '/app';

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(PREVIEW_COOKIE, tier, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
