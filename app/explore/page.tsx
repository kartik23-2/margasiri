'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import FilterSheet from '@/components/FilterSheet';
import PlaceCard from '@/components/PlaceCard';
import VoiceSearchButton from '@/components/VoiceSearchButton';
import { getPlaceCategories } from '@/lib/categories';
import { getSeasonalCollections } from '@/lib/collections';
import { PLACES, getStates } from '@/lib/data/places';
import { haversineKm } from '@/lib/geo';
import { saveLastLocation } from '@/lib/lastLocation';

function ExploreContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  const states = useMemo(() => getStates(), []);
  const collectionSlug = searchParams.get('collection') ?? '';
  const activeCollection = useMemo(
    () => getSeasonalCollections().find((collection) => collection.slug === collectionSlug),
    [collectionSlug]
  );

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(next);
        saveLastLocation(next);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const filtered = useMemo(() => {
    const basePlaces = activeCollection ? activeCollection.places : PLACES;
    const list = basePlaces.filter((place) => {
      if (stateFilter && place.stateSlug !== stateFilter) return false;
      if (categoryFilters.length) {
        const placeCategories = getPlaceCategories(place);
        if (!categoryFilters.every((category) => placeCategories.includes(category as any))) return false;
      }
      if (q) {
        const hay = `${place.name} ${place.district} ${place.state}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    const withDistance = list.map((place) => ({
      ...place,
      distanceKm: origin ? Math.round(haversineKm(origin, { lat: place.lat, lng: place.lng })) : null
    }));

    if (origin) withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    else withDistance.sort((a, b) => a.name.localeCompare(b.name));

    return withDistance;
  }, [activeCollection, categoryFilters, origin, q, stateFilter]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-50">Browse</p>
          <h1 className="font-display text-3xl">Explore</h1>
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo px-4 py-3 text-sm font-semibold text-paper-light"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-black/10 bg-paper-light p-4">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search by place, district or state..."
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm"
        />
        <VoiceSearchButton onResult={setQ} />
      </div>

      {activeCollection && (
        <div className="mb-5 rounded-xl border border-indigo/20 bg-paper-light p-4">
          <p className="text-xs uppercase tracking-widest opacity-50">{activeCollection.season}</p>
          <h2 className="font-display text-2xl">{activeCollection.title}</h2>
          <p className="mt-1 text-sm opacity-70">{activeCollection.description}</p>
        </div>
      )}

      <p className="mb-4 text-xs opacity-60">
        {filtered.length} of {PLACES.length} places
        {(stateFilter || categoryFilters.length > 0) && ` - ${categoryFilters.length + (stateFilter ? 1 : 0)} filters active`}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((place) => (
          <PlaceCard key={place.slug} place={place} origin={origin} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm opacity-60">Nothing matches that search yet. Try a different state or keyword.</p>
      )}

      <FilterSheet
        open={filtersOpen}
        states={states}
        stateFilter={stateFilter}
        categoryFilters={categoryFilters}
        onClose={() => setFiltersOpen(false)}
        onApply={(filters) => {
          setStateFilter(filters.state);
          setCategoryFilters(filters.categories);
          setFiltersOpen(false);
        }}
      />
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl px-6 py-6"><p className="text-sm opacity-60">Loading explore...</p></main>}>
      <ExploreContent />
    </Suspense>
  );
}
