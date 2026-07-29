'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PlaceCard from '@/components/PlaceCard';
import { getPlaceCategories } from '@/lib/categories';
import { getSeasonalCollections } from '@/lib/collections';
import { PLACES, type Place } from '@/lib/data/places';
import { haversineKm } from '@/lib/geo';
import { saveLastLocation } from '@/lib/lastLocation';

interface PlaceWithDistance extends Place {
  distanceKm?: number | null;
}

const homeCategories = ['Art & Culture', 'Architecture', 'History', 'Nature', 'Adventure', 'Wildlife', 'Beach', 'Spiritual', 'Village'];

function Rail({ title, places, origin }: { title: string; places: PlaceWithDistance[]; origin?: { lat: number; lng: number } | null }) {
  if (!places.length) return null;

  return (
    <section className="mb-9">
      <div className="mb-3 flex items-center justify-between px-6">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link href="/explore" className="text-xs font-semibold text-indigo">See all</Link>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto px-6 pb-2">
        {places.map((place) => (
          <div key={place.slug} className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[320px]">
            <PlaceCard place={place} origin={origin} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const placesWithDistance = useMemo<PlaceWithDistance[]>(() => {
    return PLACES.map((place) => ({
      ...place,
      distanceKm: origin ? Math.round(haversineKm(origin, { lat: place.lat, lng: place.lng })) : null
    }));
  }, [origin]);

  const nearest = useMemo(() => {
    if (!origin) return [];
    return [...placesWithDistance].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)).slice(0, 12);
  }, [origin, placesWithDistance]);

  const categoryFeed = useMemo(() => {
    if (!activeCategory) return [];
    return placesWithDistance.filter((place) => getPlaceCategories(place).includes(activeCategory as any)).slice(0, 12);
  }, [activeCategory, placesWithDistance]);

  const karnatakaPicks = useMemo(() => placesWithDistance.filter((place) => place.state === 'Karnataka').slice(0, 12), [placesWithDistance]);
  const history = useMemo(() => placesWithDistance.filter((place) => getPlaceCategories(place).includes('History')).slice(0, 12), [placesWithDistance]);
  const wild = useMemo(() => placesWithDistance.filter((place) => ['Wildlife', 'Wilderness', 'Nature'].some((cat) => getPlaceCategories(place).includes(cat as any))).slice(0, 12), [placesWithDistance]);
  const coast = useMemo(() => placesWithDistance.filter((place) => getPlaceCategories(place).includes('Beach')).slice(0, 12), [placesWithDistance]);
  const collections = useMemo(() => getSeasonalCollections().slice(0, 3), []);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(next);
        saveLastLocation(next);
        setTracking(true);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  function toggleLocation() {
    if (tracking) {
      setTracking(false);
      setOrigin(null);
      return;
    }

    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(next);
        saveLastLocation(next);
        setTracking(true);
      },
      () => setTracking(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <main className="pb-2">
      <section className="px-6 py-5">
        <div className="rounded-3xl bg-indigo p-5 text-paper-light shadow-xl">
          <p className="text-xs uppercase tracking-widest text-paper/60">A field guide to the overlooked</p>
          <h1 className="mt-2 font-display text-4xl leading-tight">
            Find what is <span className="text-marigold">past the milestone.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/75">
            {PLACES.length}+ verified places across India, sorted by distance when live location is on.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleLocation}
              className="rounded-xl bg-vermillion px-5 py-3 text-sm font-semibold text-white"
            >
              {tracking ? 'Live location on' : 'Turn on live location'}
            </button>
            <Link href="/map" className="rounded-xl border border-paper/30 px-5 py-3 text-sm font-semibold">
              Browse map
            </Link>
            <Link href="/trip" className="rounded-xl border border-paper/30 px-5 py-3 text-sm font-semibold">
              Plan trip
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-6 flex gap-2 overflow-x-auto px-6 pb-1">
        {homeCategories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(active ? '' : category)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${
                active ? 'border-indigo bg-indigo text-paper-light' : 'border-black/10 bg-paper-light'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <section className="mb-9">
        <div className="mb-3 flex items-center justify-between px-6">
          <h2 className="font-display text-2xl">Seasonal collections</h2>
          <Link href="/collections" className="text-xs font-semibold text-indigo">See all</Link>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto px-6 pb-2">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/explore?collection=${collection.slug}`}
              className="w-[78vw] max-w-[320px] shrink-0 snap-start rounded-2xl border border-black/10 bg-paper-light p-4"
            >
              <p className="text-xs uppercase tracking-widest opacity-50">{collection.season}</p>
              <h3 className="mt-2 font-display text-2xl">{collection.title}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{collection.description}</p>
              <p className="mt-4 text-xs font-semibold text-indigo">{collection.places.length} places</p>
            </Link>
          ))}
        </div>
      </section>

      <Rail title={origin ? 'Nearest to you' : 'Turn on location for nearest places'} places={nearest} origin={origin} />
      <Rail title={activeCategory ? `${activeCategory} picks` : ''} places={categoryFeed} origin={origin} />
      <Rail title="Karnataka picks" places={karnatakaPicks} origin={origin} />
      <Rail title="For history lovers" places={history} origin={origin} />
      <Rail title="Into the wild" places={wild} origin={origin} />
      <Rail title="Coastal escapes" places={coast} origin={origin} />
    </main>
  );
}
