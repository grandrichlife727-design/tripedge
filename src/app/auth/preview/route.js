import { NextResponse } from 'next/server';
import { ALLOWED_TIERS, PREVIEW_COOKIE } from '@/lib/preview-auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const requestedTier = String(searchParams.get('tier') || 'free').toLowerCase();
  const tier = ALLOWED_TIERS.has(requestedTier) ? requestedTier : 'free';
  const requestedRedirect = searchParams.get('redirect') || '/app';
  const redirectUrl = new URL(requestedRedirect, request.url);
  redirectUrl.searchParams.set('preview', '1');

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(PREVIEW_COOKIE, tier, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
