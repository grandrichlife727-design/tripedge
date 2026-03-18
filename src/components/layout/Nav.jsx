'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const MARKETING_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
];

const DASHBOARD_LINKS = [
  { href: '/app', label: 'Explore' },
  { href: '/app/deals', label: 'Deals' },
  { href: '/app/alerts', label: 'Alerts' },
  { href: '/app/planner', label: 'Plan a Trip' },
  { href: '/app/groups', label: 'Group Trips' },
  { href: '/app/labs', label: 'Labs' },
];

function navLinkClass(active) {
  return active
    ? 'rounded-button bg-white px-3 py-2 text-earth-900 shadow-navPill font-semibold'
    : 'px-1 py-2 text-earth-700 hover:text-teal transition-colors';
}

export function Nav({ mode = 'marketing', tier = 'free', preview = false }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [previewParamActive, setPreviewParamActive] = useState(false);
  const dashboard = mode === 'dashboard';
  const links = dashboard ? DASHBOARD_LINKS : MARKETING_LINKS;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setPreviewParamActive(params.get('preview') === '1');
  }, [pathname]);

  const previewQuery = preview || previewParamActive ? '?preview=1' : '';
  const withPreview = (href) => {
    if (!previewQuery || href.startsWith('/auth/preview-exit')) return href;
    return href.includes('?') ? `${href}&preview=1` : `${href}${previewQuery}`;
  };
  const ctaHref = dashboard ? (preview ? '/auth/preview-exit' : '/pricing') : withPreview('/app');
  const ctaLabel = dashboard ? (preview ? 'Exit Preview' : 'Upgrade') : 'Open App';
  const tierLabel = useMemo(() => String(tier || 'free').toUpperCase(), [tier]);

  return (
    <nav className="sticky top-0 z-50 border-b border-cream-300/90 bg-cream-50/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8 md:py-4">
        <Link href={dashboard ? withPreview('/app') : '/'} className="shrink-0">
          <Logo size={dashboard ? 18 : 20} />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={withPreview(link.href)} className={`text-sm ${navLinkClass(active)}`}>
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {dashboard ? (
            <span className="rounded-badge border border-cream-300 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-earth-700">
              {tierLabel}{preview ? ' PREVIEW' : ''}
            </span>
          ) : (
            <Link href="/auth/login" className="text-sm font-semibold text-earth-700 hover:text-teal">
              Log in
            </Link>
          )}
          <Link href={ctaHref} className="btn-primary inline-flex items-center rounded-button px-4 py-2 text-sm">
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-white p-2 text-earth-900 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-cream-300 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={withPreview(link.href)} onClick={() => setOpen(false)} className={`rounded-button px-3 py-2 text-sm ${active ? 'bg-cream-100 font-semibold text-earth-900' : 'text-earth-700'}`}>
                  {link.label}
                </Link>
              );
            })}
            {!dashboard ? (
              <Link href="/auth/login" onClick={() => setOpen(false)} className="rounded-button px-3 py-2 text-sm font-semibold text-earth-700">
                Log in
              </Link>
            ) : null}
            <Link href={ctaHref} onClick={() => setOpen(false)} className="btn-primary mt-2 inline-flex items-center justify-center rounded-button px-4 py-3 text-sm">
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
