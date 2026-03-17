import Link from 'next/link';

export function UpgradePrompt({ title, description, tier = 'pro' }) {
  return (
    <div className="rounded-card border border-cream-300 bg-white p-8 text-center shadow-card">
      <div className="mb-3 text-4xl">{tier === 'premium' ? '👑' : '⚡'}</div>
      <h2 className="font-display text-3xl font-bold text-earth-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-earth-700">{description}</p>
      <Link href="/pricing" className="btn-primary mt-6 inline-flex items-center justify-center rounded-button px-6 py-3 text-sm">
        Upgrade to {tier === 'premium' ? 'Premium' : 'Pro'}
      </Link>
    </div>
  );
}
