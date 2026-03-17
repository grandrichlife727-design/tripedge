'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingDown, MapPinned, Users, BellRing } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Badge } from '@/components/ui/Badge';

const FEATURES = [
  { icon: TrendingDown, title: 'Deal Scanner', desc: 'AI monitors routes and properties, then flags the ones trading below historical averages before they bounce back.', tag: 'Save 30-50%' },
  { icon: MapPinned, title: 'AI Trip Planner', desc: 'Describe the trip you want and get a local-first itinerary with hidden gems, not recycled tourist lists.', tag: 'Powered by AI' },
  { icon: Users, title: 'Group Coordinator', desc: 'Everyone votes on dates, destinations, and budget. AI finds the plan that works for the whole crew.', tag: 'No group chat chaos' },
  { icon: BellRing, title: 'Price Alerts', desc: 'Track routes, catch sudden drops, and react before the market retraces.', tag: 'Real-time' },
];

const DEAL_CARDS = [
  { dest: 'Lisbon', price: '$287', saved: '41% below normal', img: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=640&h=400&fit=crop', note: 'JFK → LIS · Apr 12-18' },
  { dest: 'Bali', price: '$42/nt', saved: '56% below normal', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=640&h=400&fit=crop', note: 'Boutique villa · Ubud' },
  { dest: 'Reykjavik', price: '$198', saved: '52% below normal', img: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=640&h=400&fit=crop', note: 'BOS → KEF · May 4-9' },
];

const STATS = [
  { val: '38%', label: 'Average savings' },
  { val: '12K+', label: 'Trips planned/mo' },
  { val: '4.8★', label: 'User rating' },
  { val: '<30s', label: 'AI itinerary speed' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', loc: 'Brooklyn, NY', text: 'Found a $280 round-trip to Lisbon that was normally $500+. The deal scanner actually works.', avatar: 'S' },
  { name: 'Marcus T.', loc: 'Austin, TX', text: 'The group trip feature saved our friend group from 200 messages of what dates work for everyone.', avatar: 'M' },
  { name: 'Priya R.', loc: 'San Francisco, CA', text: 'The AI itinerary for Kyoto was better than any blog I found. Every stop felt local and intentional.', avatar: 'P' },
];

export function LandingPage() {
  return (
    <div>
      <section className="animate-gradient bg-[linear-gradient(135deg,#FDFBF7_0%,#E8F5EE_36%,#E6F2FA_74%,#FDFBF7_100%)] px-5 py-14 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1.1fr,0.9fr] xl:items-center">
          <div>
            <Reveal>
              <div className="mb-5 inline-flex items-center gap-2 rounded-badge border border-teal-border bg-white/80 px-4 py-2 text-sm font-semibold text-success shadow-[0_10px_30px_rgba(26,109,173,0.08)]">
                <Sparkles size={15} />
                AI-powered travel deals and planning
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-earth-900 md:text-7xl">
                Find the trip.<br />
                <span className="text-teal">Beat the price.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-earth-700 md:text-xl">
                TripEdge treats travel like a market: spot the mispricing, plan the better route, and coordinate the trip before the deal disappears.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/app" className="btn-primary inline-flex h-14 items-center justify-center gap-2 rounded-button px-7 text-sm">
                  Start for free
                  <ArrowRight size={16} />
                </Link>
                <Link href="/pricing" className="btn-secondary inline-flex h-14 items-center justify-center rounded-button px-7 text-sm">
                  View pricing
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-earth-600">
                <span>No credit card required</span>
                <span>Preview the app instantly</span>
                <span>Email login available</span>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-card border border-cream-300 bg-white/90 p-4 shadow-card">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Today’s edge</div>
                  <div className="mt-2 text-2xl font-bold text-success">Lisbon −41%</div>
                  <p className="mt-1 text-sm leading-6 text-earth-700">Under historical average with shoulder-season timing still intact.</p>
                </div>
                <div className="rounded-card border border-cream-300 bg-white/90 p-4 shadow-card">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Planner output</div>
                  <div className="mt-2 text-2xl font-bold text-ocean">3-day local itinerary</div>
                  <p className="mt-1 text-sm leading-6 text-earth-700">Hidden-gem pacing, realistic budgets, and cleaner day structure.</p>
                </div>
                <div className="rounded-card border border-cream-300 bg-white/90 p-4 shadow-card">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Group trips</div>
                  <div className="mt-2 text-2xl font-bold text-warning">No group chat chaos</div>
                  <p className="mt-1 text-sm leading-6 text-earth-700">Votes, budget alignment, and invite flow in one shared workspace.</p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="rounded-section border border-cream-300 bg-white/85 p-4 shadow-[0_24px_80px_rgba(44,36,24,0.08)] backdrop-blur md:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-cream-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Live market board</p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-earth-900">What TripEdge sees right now</h2>
                </div>
                <Badge text="Updated live" type="drop" />
              </div>
              <div className="space-y-4">
                {DEAL_CARDS.map((card, index) => (
                  <article key={card.dest} className="card-hover overflow-hidden rounded-card border border-cream-300 bg-cream-50 shadow-card" style={{ animationDelay: `${index * 0.12}s` }}>
                    <div className="grid md:grid-cols-[180px,1fr]">
                      <img src={card.img} alt={card.dest} className="h-40 w-full object-cover md:h-full" />
                      <div className="p-5 text-left">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-earth-900">{card.dest}</h3>
                            <p className="text-sm text-earth-600">{card.note}</p>
                          </div>
                          <span className="rounded-md bg-warning-light px-2 py-1 text-xs font-semibold text-warning">{card.saved}</span>
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <div className="text-3xl font-bold text-success">{card.price}</div>
                            <div className="text-sm text-earth-600">Flagged as mispriced vs trailing average</div>
                          </div>
                          <div className="rounded-button border border-teal-border bg-white px-3 py-2 text-xs font-semibold text-teal">Open in app</div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grid border-y border-cream-300 md:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <div className="border-b border-cream-300 px-6 py-10 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <div className="font-display text-4xl font-extrabold text-teal">{stat.val}</div>
              <div className="mt-1 text-sm text-earth-700">{stat.label}</div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="px-5 py-16 md:px-12 md:py-20">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-3 font-display text-4xl font-bold text-earth-900">Your unfair advantage in travel</h2>
            <p className="text-lg leading-8 text-earth-700">We treat travel like a market: find the mispriced deals, skip the overpriced itinerary clutter, and move faster.</p>
          </div>
        </Reveal>
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.08}>
                <div className="card-hover rounded-card border border-cream-300 bg-white p-8 shadow-card">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-card bg-cream-100 text-teal">
                      <Icon size={22} />
                    </div>
                    <Badge text={feature.tag} type="drop" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold text-earth-900">{feature.title}</h3>
                  <p className="text-base leading-7 text-earth-700">{feature.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="bg-cream-100 px-5 py-16 md:px-12 md:py-20">
        <Reveal>
          <h2 className="mb-12 text-center font-display text-4xl font-bold text-earth-900">How it works</h2>
        </Reveal>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {[
            ['01', 'Tell us your trip thesis', 'Destination, budget, travel style, group size, or just one sentence about the trip you want.'],
            ['02', 'TripEdge finds the pricing gap', 'We scan deals, compare them to historical norms, and build a local-first itinerary around the best timing.'],
            ['03', 'Move with conviction', 'Track prices, coordinate your group, and book while the market still gives you the edge.'],
          ].map(([step, title, desc], index) => (
            <Reveal key={step} delay={index * 0.1}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2A9D8F,#1A6DAD)] font-display text-lg font-bold text-white">{step}</div>
                <h3 className="mb-2 text-xl font-semibold text-earth-900">{title}</h3>
                <p className="text-sm leading-7 text-earth-700">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 md:px-12 md:py-20">
        <Reveal>
          <h2 className="mb-12 text-center font-display text-4xl font-bold text-earth-900">Travelers love TripEdge</h2>
        </Reveal>
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.08}>
              <div className="card-hover rounded-card border border-cream-300 bg-white p-7 shadow-card">
                <p className="mb-5 text-base italic leading-7 text-earth-900">“{item.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2A9D8F,#1A6DAD)] text-sm font-bold text-white">{item.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold text-earth-900">{item.name}</div>
                    <div className="text-xs text-earth-600">{item.loc}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 pb-16 md:px-12 md:pb-24">
        <Reveal>
          <div className="mx-auto max-w-5xl rounded-section border border-teal-border bg-[linear-gradient(135deg,#E8F5EE,#E6F2FA)] px-6 py-14 text-center md:px-12">
            <h2 className="mb-3 font-display text-4xl font-bold text-earth-900">Ready to travel smarter?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-earth-700">Join travelers using TripEdge to find underpriced trips, better itineraries, and cleaner group planning.</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/app" className="btn-primary inline-flex items-center justify-center rounded-button px-8 py-4 text-base">Get Started Free</Link>
              <Link href="/pricing" className="btn-secondary inline-flex items-center justify-center rounded-button px-8 py-4 text-base">View Pricing</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
