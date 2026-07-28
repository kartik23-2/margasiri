'use client';

import { useEffect, useMemo, useState } from 'react';
import PlaceCard from '@/components/PlaceCard';
import { CATEGORY_OPTIONS, getPlaceCategories } from '@/lib/categories';
import { PLACES, getStates } from '@/lib/data/places';
import { haversineKm } from '@/lib/geo';

export default function ExplorePage() {
  const [q, setQ] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  const states = useMemo(() => getStates(), []);

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
      if (categoryFilters.length) {
        const placeCategories = getPlaceCategories(p);
        if (!categoryFilters.every((category) => placeCategories.includes(category as any))) return false;
      }
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
  }, [q, stateFilter, categoryFilters, origin]);

  function toggleCategory(category: string) {
    setCategoryFilters((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

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
        <div className="flex basis-full flex-wrap gap-2 pt-1">
          {CATEGORY_OPTIONS.map((category) => {
            const active = categoryFilters.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active ? 'border-indigo bg-indigo text-paper-light' : 'border-black/10 bg-white text-ink hover:border-indigo'
                }`}
              >
                {category}
              </button>
            );
          })}
          {categoryFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setCategoryFilters([])}
              className="rounded-full border border-vermillion px-3 py-1.5 text-xs font-semibold text-vermillion"
            >
              Clear categories
            </button>
          )}
        </div>
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
