// src/hooks/useDeals.js
'use client';
import { useState, useEffect } from 'react';

export function useDeals(type = 'all', origin = 'all') {
  const [deals, setDeals] = useState([]);
  const [currentOrigin, setCurrentOrigin] = useState(origin);
  const [originOptions, setOriginOptions] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    async function fetchDeals() {
      setLoading(true);
      setError(null);
      setNotice(null);
      setDegraded(false);
      try {
        const params = new URLSearchParams();
        if (type !== 'all') params.set('type', type);
        if (origin && origin !== 'all') params.set('origin', origin);
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`/api/deals${query}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setDeals(data.deals || []);
        setCurrentOrigin(data.currentOrigin || origin || 'all');
        setOriginOptions(Array.isArray(data.originOptions) && data.originOptions.length ? data.originOptions : ['all']);
        setNotice(data.notice || null);
        setDegraded(Boolean(data.degraded));
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchDeals();
  }, [type, origin]);

  return { deals, currentOrigin, originOptions, loading, error, notice, degraded };
}
