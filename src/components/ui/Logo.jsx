// src/components/ui/Logo.jsx
'use client';

export function Logo({ size = 20, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{
        width: size * 1.7, height: size * 1.7, borderRadius: 10,
        background: 'linear-gradient(135deg, #2A9D8F, #1A6DAD)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.85, color: '#fff',
      }}>✈</div>
      <span style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: size, color: '#2C2418',
      }}>
        Trip<span style={{ color: '#2A9D8F' }}>Edge</span>
      </span>
    </div>
  );
}
