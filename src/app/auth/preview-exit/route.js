import { NextResponse } from 'next/server';
import { PREVIEW_COOKIE } from '@/lib/preview-auth';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  response.cookies.set(PREVIEW_COOKIE, '', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
