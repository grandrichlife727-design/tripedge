'use client';

import { useState } from 'react';
import MillionDollarPart1 from '@/components/labs/MillionDollarPart1';
import MillionDollarPart2 from '@/components/labs/MillionDollarPart2';

const LABS = [
  {
    id: 'revenue',
    label: 'Revenue Systems',
    eyebrow: 'Monetization layer',
    title: 'Affiliate, creator, history, fare, and passport systems',
    description: 'These features expand TripEdge beyond trip planning into monetization, SEO, retention, and user progression.',
    component: MillionDollarPart1,
  },
  {
    id: 'growth',
    label: 'Growth Systems',
    eyebrow: 'Expansion layer',
    title: 'Teams, chat surfaces, visa workflows, and trip dares',
    description: 'These features push TripEdge into team travel, conversational product surfaces, utility workflows, and replayable engagement loops.',
    component: MillionDollarPart2,
  },
];

export default function LabsPage() {
  const [active, setActive] = useState('revenue');
  const selected = LABS.find((item) => item.id === active) || LABS[0];
  const SelectedComponent = selected.component;

  return (
    <div className="space-y-8">
      <section className="rounded-section border border-cream-300 bg-white p-6 shadow-card md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">TripEdge Labs</p>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">{selected.title}</h1>
            <p className="mt-3 text-base leading-7 text-earth-700">{selected.description}</p>
          </div>
          <div className="inline-flex w-fit rounded-button bg-cream-200 p-1">
            {LABS.map((lab) => (
              <button
                key={lab.id}
                type="button"
                onClick={() => setActive(lab.id)}
                className={`rounded-button px-4 py-3 text-sm font-semibold transition ${
                  active === lab.id ? 'bg-white text-earth-900 shadow-navPill' : 'text-earth-700'
                }`}
              >
                {lab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Why this is separate</p>
            <p className="mt-2 text-sm leading-6 text-earth-700">
              These are strategic expansion surfaces. They should be accessible, but not mixed into the core booking and planning workflow until the product and data layer are ready.
            </p>
          </div>
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">What shipped</p>
            <p className="mt-2 text-sm leading-6 text-earth-700">
              The UI source of truth is now wired into the app, and the matching schema migration is staged for Supabase as migration 005.
            </p>
          </div>
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Recommended next step</p>
            <p className="mt-2 text-sm leading-6 text-earth-700">
              Promote only the features with real backend support first. The rest should stay in Labs until their APIs, automation, and billing rules are implemented.
            </p>
          </div>
        </div>
      </section>

      <SelectedComponent embedded />
    </div>
  );
}
