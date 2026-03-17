// src/components/ui/Shimmer.jsx
'use client';

export function Shimmer({ width = '100%', height = 20, style = {} }) {
  return (
    <div className="animate-shimmer" style={{
      width, height, borderRadius: 8, ...style,
    }} />
  );
}

export function ItinerarySkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE8DD', borderRadius: 16, padding: 28 }}>
      <Shimmer height={24} width="35%" style={{ marginBottom: 20 }} />
      {[1, 2, 3].map(d => (
        <div key={d} style={{ marginBottom: 24 }}>
          <Shimmer height={18} width="20%" style={{ marginBottom: 14 }} />
          {[1, 2, 3].map(r => (
            <Shimmer key={r} height={56} style={{ marginBottom: 10 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
