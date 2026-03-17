'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Bell, ShieldAlert, Trash2 } from 'lucide-react';

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatRouteLabel(route, routeId) {
  if (!route) return routeId;
  if (route.route_type === 'hotel') return route.destination;
  return `${route.origin} → ${route.destination}`;
}

export function AlertsManager({ initialAlerts = [] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const activeCount = useMemo(() => alerts.filter((alert) => alert.is_active).length, [alerts]);

  async function toggleAlert(alert) {
    setBusyId(alert.id);
    setMessage('');
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: alert.id, is_active: !alert.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not update alert');
      setAlerts((current) => current.map((row) => row.id === alert.id ? { ...row, is_active: !alert.is_active } : row));
      setMessage(alert.is_active ? 'Alert paused.' : 'Alert reactivated.');
    } catch (error) {
      setMessage(error.message || 'Could not update alert');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAlert(id) {
    setBusyId(id);
    setMessage('');
    try {
      const res = await fetch('/api/alerts', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not delete alert');
      setAlerts((current) => current.filter((row) => row.id !== id));
      setMessage('Alert removed.');
    } catch (error) {
      setMessage(error.message || 'Could not delete alert');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-section border border-cream-300 bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">Price Monitoring</p>
            <h1 className="font-display text-4xl font-bold text-earth-900 md:text-5xl">Alerts</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-earth-700">
              This is the follow-through layer after a deal catches your interest. Set a target, let TripEdge watch the market, and come back when the price moves.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-card border border-cream-300 bg-cream-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Active alerts</div>
              <div className="mt-1 text-3xl font-bold text-earth-900">{activeCount}</div>
            </div>
            <div className="rounded-card border border-cream-300 bg-cream-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Next best move</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-earth-900">Track live deals you are not ready to book yet.</div>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-card border border-cream-300 bg-cream-50 p-4 text-sm text-earth-800">
          {message}
        </div>
      ) : null}

      {alerts.length === 0 ? (
        <section className="rounded-card border border-cream-300 bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-light text-teal">
            <Bell size={24} />
          </div>
          <p className="mb-2 font-display text-3xl font-bold text-earth-900">No active alerts yet</p>
          <p className="mx-auto max-w-xl text-base leading-7 text-earth-700">
            Start from a deal detail page, then click <strong>Watch this price</strong> when the market is interesting but not quite ready.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app/deals" className="inline-flex items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800">
              Browse deals
            </Link>
            <Link href="/app/planner" className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal">
              Open planner
            </Link>
          </div>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {alerts.map((alert) => {
            const route = alert.routes;
            const isBusy = busyId === alert.id;
            return (
              <article key={alert.id} className="rounded-card border border-cream-300 bg-white p-6 shadow-card">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Tracked route</div>
                    <h2 className="font-display text-3xl font-bold text-earth-900">{formatRouteLabel(route, alert.route_id)}</h2>
                    <p className="mt-2 text-sm leading-6 text-earth-700">
                      {alert.alert_on_any_drop ? 'Trigger on any downward move.' : `Trigger when the market reaches $${alert.target_price}.`}
                    </p>
                  </div>
                  <span className={`rounded-badge px-3 py-1 text-xs font-semibold tracking-[0.18em] ${alert.is_active ? 'border border-success/20 bg-teal-light text-success' : 'border border-cream-300 bg-cream-100 text-earth-700'}`}>
                    {alert.is_active ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">
                      <ShieldAlert size={14} />
                      Trigger
                    </div>
                    <div className="text-sm font-semibold text-earth-900">
                      {alert.alert_on_any_drop ? 'Any drop' : `$${alert.target_price}`}
                    </div>
                  </div>
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">
                      <BarChart3 size={14} />
                      Type
                    </div>
                    <div className="text-sm font-semibold text-earth-900">{route?.route_type === 'hotel' ? 'Hotel stay' : 'Flight route'}</div>
                  </div>
                  <div className="rounded-button border border-cream-300 bg-cream-50 px-4 py-3">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600">Created</div>
                    <div className="text-sm font-semibold text-earth-900">{formatDate(alert.created_at)}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-cream-200 pt-5">
                  <Link
                    href={`/app/deals/${encodeURIComponent(String(route?.id || alert.route_id))}`}
                    className="inline-flex items-center justify-center rounded-button bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-800"
                  >
                    Open deal
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleAlert(alert)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center rounded-button border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-earth-900 transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {alert.is_active ? 'Pause alert' : 'Resume alert'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAlert(alert.id)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-button border border-warning-border bg-white px-4 py-3 text-sm font-semibold text-warning transition hover:bg-warning-light disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
