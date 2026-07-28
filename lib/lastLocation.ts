'use client';

import type { Coords } from '@/lib/geo';

const LAST_LOCATION_KEY = 'margasiri:last-location';

export function saveLastLocation(coords: Coords) {
  window.localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(coords));
}

export function readLastLocation(): Coords | null {
  const raw = window.localStorage.getItem(LAST_LOCATION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lng)) {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch {
    return null;
  }

  return null;
}
