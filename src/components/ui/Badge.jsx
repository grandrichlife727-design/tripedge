// src/components/ui/Badge.jsx
'use client';
import { badgeStyles } from '@/lib/tokens';

export function Badge({ text, type = 'watch' }) {
  const s = badgeStyles[type] || badgeStyles.watch;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      letterSpacing: 0.3, whiteSpace: 'nowrap', display: 'inline-block',
    }}>{text}</span>
  );
}
