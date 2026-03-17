'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const PREVIEW_TIERS = [
  { label: 'Free Preview', href: '/auth/preview?tier=free' },
  { label: 'Pro Preview', href: '/auth/preview?tier=pro' },
  { label: 'Premium Preview', href: '/auth/preview?tier=premium' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabaseRef = useRef(null);

  function getSupabase() {
    if (supabaseRef.current) return supabaseRef.current;
    supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = getSupabase();

    const { error: authError } = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/app';
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FDFBF7', fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{
        width: 420, background: '#fff', border: '1px solid #EDE8DD',
        borderRadius: 20, padding: 40,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #2A9D8F, #1A6DAD)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff', margin: '0 auto 16px',
          }}>✈</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 14, color: '#8C7E6A' }}>
            {mode === 'signup' ? 'Start finding deals in seconds' : 'Sign in to your TripEdge account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address" required
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 12,
              border: '1.5px solid #EDE8DD', background: '#FDFBF7',
              fontSize: 15, fontFamily: 'inherit', color: '#2C2418',
              outline: 'none', marginBottom: 12,
            }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" required minLength={6}
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 12,
              border: '1.5px solid #EDE8DD', background: '#FDFBF7',
              fontSize: 15, fontFamily: 'inherit', color: '#2C2418',
              outline: 'none', marginBottom: 20,
            }} />

          {error && (
            <div style={{
              background: '#FEF0E7', border: '1px solid #FADCC8', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, color: '#D4600E', marginBottom: 16,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            background: loading ? '#D4C9B5' : 'linear-gradient(135deg, #2A9D8F, #1A6DAD)',
            color: '#fff', border: 'none', fontSize: 16, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(42,157,143,0.25)',
          }}>
            {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 18, display: 'grid', gap: 8 }}>
          {PREVIEW_TIERS.map((preview) => (
            <Link
              key={preview.href}
              href={preview.href}
              style={{
                display: 'block', textAlign: 'center', padding: '12px 14px', borderRadius: 12,
                border: '1px solid #EDE8DD', background: '#FDFBF7', color: '#2C2418',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}
            >
              {preview.label}
            </Link>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#8C7E6A' }}>
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <span onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            style={{ color: '#2A9D8F', fontWeight: 600, cursor: 'pointer' }}>
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}
