'use client';

import { useEffect, useMemo, useState } from 'react';
import PlaceCard from '@/components/PlaceCard';
import { PLACES, getStates } from '@/lib/data/places';
import { haversineKm } from '@/lib/geo';

export default function ExplorePage() {
  const [q, setQ] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  const states = useMemo(() => getStates(), []);
  const categories = useMemo(() => [...new Set(PLACES.map((p) => p.category))].sort(), []);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const filtered = useMemo(() => {
    let list = PLACES.filter((p) => {
      if (stateFilter && p.stateSlug !== stateFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (q) {
        const hay = `${p.name} ${p.district} ${p.state}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    const withDistance = list.map((p) => ({
      ...p,
      distanceKm: origin ? Math.round(haversineKm(origin, { lat: p.lat, lng: p.lng })) : null
    }));

    if (origin) withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    else withDistance.sort((a, b) => a.name.localeCompare(b.name));

    return withDistance;
  }, [q, stateFilter, categoryFilter, origin]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-6">The ledger</h1>

      <div className="flex flex-wrap gap-3 mb-8 bg-paper-light border border-black/10 rounded-2xl p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by place, district or state…"
          className="flex-1 min-w-[220px] border border-black/10 rounded-lg px-3 py-2 text-sm bg-white"
        />
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="border border-black/10 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-black/10 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All kinds</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <p className="text-xs opacity-60 mb-4">{filtered.length} of {PLACES.length} places</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <PlaceCard key={p.slug} place={p} origin={origin} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center opacity-60 py-16 text-sm">Nothing matches that search yet. Try a different state or keyword.</p>
      )}
    </main>
  );
}
