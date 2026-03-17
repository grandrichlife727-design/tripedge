'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, Compass, PiggyBank, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function GroupsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTripId, setActiveTripId] = useState('');

  useEffect(() => {
    let channel;
    async function load() {
      setLoading(true);
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not load groups');
        setLoading(false);
        return;
      }
      const rows = data.trips || [];
      setTrips(rows);
      if (!activeTripId && rows[0]?.id) setActiveTripId(rows[0].id);
      setLoading(false);

      const supabase = createClient();
      channel = supabase
        .channel('tripedge-group-members')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, async () => {
          const refreshRes = await fetch('/api/groups');
          const refreshData = await refreshRes.json();
          if (refreshRes.ok) setTrips(refreshData.trips || []);
        })
        .subscribe();
    }
    load();
    return () => { if (channel) createClient().removeChannel(channel); };
  }, [activeTripId]);

  const activeTrip = useMemo(() => trips.find((trip) => trip.id === activeTripId) || trips[0], [trips, activeTripId]);
  const members = activeTrip?.group_members || [];
  const votedCount = members.filter((member) => member.has_voted).length;
  const dateVotes = useMemo(() => {
    const counts = {};
    members.forEach((member) => {
      if (member.date_vote) counts[member.date_vote] = (counts[member.date_vote] || 0) + 1;
    });
    return counts;
  }, [members]);
  const destinationVotes = useMemo(() => {
    const counts = {};
    members.forEach((member) => {
      if (member.destination_vote) counts[member.destination_vote] = (counts[member.destination_vote] || 0) + 1;
    });
    return counts;
  }, [members]);
  const topDestination = useMemo(() => {
    return Object.entries(destinationVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || activeTrip?.destination_options?.[0] || 'Not decided';
  }, [destinationVotes, activeTrip]);
  const avgBudget = useMemo(() => {
    const budgets = members.map((member) => Number(member.budget || 0)).filter(Boolean);
    if (!budgets.length) return null;
    return budgets.reduce((sum, value) => sum + value, 0) / budgets.length;
  }, [members]);
  const topDate = useMemo(() => {
    return Object.entries(dateVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || activeTrip?.date_options?.[0] || 'No date selected';
  }, [dateVotes, activeTrip]);

  if (loading) return <div className="rounded-card border border-cream-300 bg-white p-6 shadow-card">Loading group trips…</div>;
  if (error) return <div className="rounded-card border border-warning-border bg-warning-light p-4 text-sm text-warning">{error}</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-[linear-gradient(135deg,#FFFFFF,#F5F2EA)] p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Group Coordination</p>
            <h1 className="mb-2 font-display text-4xl font-bold text-earth-900">Group Trips</h1>
            <p className="max-w-2xl text-base leading-7 text-earth-700">Keep the trip moving without a messy thread. Votes, budgets, and the current recommendation stay in one shared workspace.</p>
          </div>
          <button className="btn-primary rounded-button px-6 py-3 text-sm">+ New Group Trip</button>
        </div>
      </section>

      {trips.length ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {trips.map((trip) => {
            const isActive = trip.id === activeTrip?.id;
            const memberCount = (trip.group_members || []).length;
            return (
              <button
                key={trip.id}
                onClick={() => setActiveTripId(trip.id)}
                className={`text-left rounded-card border p-5 transition-all ${isActive ? 'border-teal bg-white shadow-card' : 'border-cream-300 bg-white/80 hover:border-teal/40 hover:bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-earth-900">{trip.name}</div>
                    <div className="mt-1 text-sm text-earth-600">{trip.destination_options?.slice(0, 2).join(' · ') || 'Destination options pending'}</div>
                  </div>
                  <ChevronRight size={16} className={isActive ? 'text-teal' : 'text-earth-500'} />
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-earth-600">
                  <span>{memberCount} members</span>
                  <span>{(trip.group_members || []).filter((member) => member.has_voted).length} voted</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTrip ? (
        <div className="space-y-5">
          <section className="rounded-card border border-cream-300 bg-white p-7 shadow-card">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="font-display text-3xl font-bold text-earth-900">{activeTrip.name}</h2>
                  <Badge text={`${votedCount}/${members.length || 0} voted`} type="low" />
                </div>
                <p className="max-w-2xl text-sm leading-7 text-earth-700">Current AI recommendation, vote concentration, and budget comfort for this trip are summarized below.</p>
              </div>
              <div className="rounded-button border border-gold-border bg-gold-light px-4 py-3 text-sm text-gold">
                Invite code: <span className="font-semibold">{activeTrip.invite_code || 'PREVIEW7'}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Users size={14} /> Members</div>
                <div className="text-3xl font-bold text-earth-900">{members.length}</div>
                <div className="mt-1 text-sm text-earth-700">{votedCount} have submitted votes</div>
              </div>
              <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><Compass size={14} /> Lead destination</div>
                <div className="text-3xl font-bold text-earth-900">{topDestination}</div>
                <div className="mt-1 text-sm text-earth-700">Most selected destination so far</div>
              </div>
              <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><CalendarDays size={14} /> Lead dates</div>
                <div className="text-2xl font-bold text-earth-900">{topDate}</div>
                <div className="mt-1 text-sm text-earth-700">Most aligned date window</div>
              </div>
              <div className="rounded-card border border-cream-300 bg-cream-50 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600"><PiggyBank size={14} /> Avg budget</div>
                <div className="text-3xl font-bold text-earth-900">{avgBudget ? formatMoney(avgBudget) : '—'}</div>
                <div className="mt-1 text-sm text-earth-700">Average comfort level across members</div>
              </div>
            </div>

            {activeTrip.ai_recommendation ? (
              <div className="mt-6 rounded-card border border-teal-border bg-[linear-gradient(135deg,#E8F5EE,#E6F2FA)] p-5 text-sm leading-7 text-earth-900">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal">AI Recommendation</div>
                {activeTrip.ai_recommendation}
              </div>
            ) : null}
          </section>

          <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
            <section className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Members and Preferences</div>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4 rounded-button border border-cream-200 bg-cream-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${member.has_voted ? 'bg-[linear-gradient(135deg,#2A9D8F,#1A6DAD)] text-white' : 'bg-cream-300 text-earth-600'}`}>
                        {(member.profiles?.full_name || member.user_id || 'U')[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-earth-900">{member.profiles?.full_name || 'Traveler'}</div>
                        <div className="mt-1 text-xs text-earth-600">{member.destination_vote || 'No destination vote yet'}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-earth-600">
                      <div>{member.budget ? `${formatMoney(member.budget)} budget` : 'Budget pending'}</div>
                      <div className="mt-1">{member.date_vote || 'Date vote pending'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-5">
              <section className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Destination Votes</div>
                <div className="space-y-4">
                  {(activeTrip.destination_options || []).map((destination) => {
                    const votes = destinationVotes[destination] || 0;
                    const total = Math.max(members.length, 1);
                    return (
                      <div key={destination}>
                        <div className="mb-2 flex items-center justify-between text-sm text-earth-900">
                          <span>{destination}</span>
                          <span className="text-earth-600">{votes} votes</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-cream-300">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,#2A9D8F,#1A6DAD)]" style={{ width: `${(votes / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Date Votes</div>
                <div className="space-y-4">
                  {(activeTrip.date_options || []).map((dateOption) => {
                    const votes = dateVotes[dateOption] || 0;
                    const total = Math.max(members.length, 1);
                    return (
                      <div key={dateOption}>
                        <div className="mb-2 flex items-center justify-between text-sm text-earth-900">
                          <span>{dateOption}</span>
                          <span className="text-earth-600">{votes} votes</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-cream-300">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,#2A9D8F,#1A6DAD)]" style={{ width: `${(votes / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-card border border-cream-300 bg-white p-8 text-center shadow-card">
          <div className="mb-2 text-4xl">👥</div>
          <div className="text-lg font-semibold text-earth-900">No group trips yet</div>
          <div className="mt-2 text-sm text-earth-700">Create one to start collecting votes and coordinating dates.</div>
        </div>
      )}
    </div>
  );
}
