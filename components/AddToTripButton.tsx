'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';

const TRIP_KEY = 'margasiri:trip-plan';

type TripStop = { slug: string; day: number };

function readTrip(): TripStop[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TRIP_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addPlaceToTrip(place: Pick<Place, 'slug'>, day = 1) {
  const trip = readTrip();
  if (!trip.some((stop) => stop.slug === place.slug)) {
    window.localStorage.setItem(TRIP_KEY, JSON.stringify([...trip, { slug: place.slug, day }]));
  }
}

export default function AddToTripButton({ place }: { place: Pick<Place, 'slug'> }) {
  const [added, setAdded] = useState(false);
  const { tr } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => {
        addPlaceToTrip(place);
        setAdded(true);
      }}
      className="rounded-xl border border-indigo px-5 py-3 text-sm font-semibold text-indigo"
    >
      {added ? tr('addedToTrip') : tr('addToTrip')}
    </button>
  );
}
