'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PlaceCard from '@/components/PlaceCard';
import type { Place } from '@/lib/data/places';

interface PlaceWithDistance extends Place {
  distanceKm: number | null;
}

export default function HomePage() {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [places, setPlaces] = useState<PlaceWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPlaces(o?: { lat: number; lng: number } | null) {
    const params = new URLSearchParams();
    if (o) {
      params.set('lat', String(o.lat));
      params.set('lng', String(o.lng));
    }
    const res = await fetch(`/api/places?${params.toString()}`);
    const data = await res.json();
    setPlaces(data.places.slice(0, 6));
    setLoading(false);
  }

  useEffect(() => {
    fetchPlaces();
  }, []);

  function toggleLocation() {
    if (tracking) {
      setTracking(false);
      setOrigin(null);
      fetchPlaces(null);
      return;
    }
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const o = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(o);
        setTracking(true);
        fetchPlaces(o);
      },
      () => setTracking(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <main>
      <header className="bg-indigo text-paper border-b-[6px] border-vermillion px-6 py-16 text-center">
        <p className="uppercase tracking-widest text-xs opacity-60 mb-3">A field guide to the overlooked</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">
          Find what's <span className="text-marigold">past the milestone.</span>
        </h1>
        <p className="max-w-xl mx-auto opacity-80 mb-8 text-[15px] leading-relaxed">
          Verified hidden villages, valleys and heritage sites across India &mdash; sorted by real distance from
          exactly where you're standing. English, Hindi, and Kannada.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          <button
            onClick={toggleLocation}
            className="bg-vermillion text-paper-light px-6 py-3 rounded-lg font-semibold text-sm"
          >
            {tracking ? 'Live tracking on' : 'Turn on live location'}
          </button>
          <Link
            href="/explore"
            className="border border-paper/40 px-6 py-3 rounded-lg font-semibold text-sm"
          >
            Explore all places
          </Link>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <div className="milestone px-5 py-2 min-w-[110px]">
            <div className="font-mono font-semibold text-xl">51+</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">Karnataka</div>
          </div>
          <div className="milestone px-5 py-2 min-w-[110px]">
            <div className="font-mono font-semibold text-xl">28</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">states</div>
          </div>
          <div className="milestone px-5 py-2 min-w-[110px]">
            <div className="font-mono font-semibold text-xl">3</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">languages</div>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="font-display text-2xl mb-5">
          {origin ? 'Nearest to you' : 'A place to start'}
        </h2>
        {loading ? (
          <p className="opacity-60 text-sm">Loading places…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map((p) => (
              <PlaceCard key={p.slug} place={p} origin={origin} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
