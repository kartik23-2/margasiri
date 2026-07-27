import { NextRequest, NextResponse } from 'next/server';
import { PLACES } from '@/lib/data/places';
import { haversineKm } from '@/lib/geo';

// Currently reads from the static seed in lib/data/places.ts.
// To go live on a real database, swap the PLACES lookup below for:
//
//   import { prisma } from '@/lib/prisma';
//   const places = await prisma.place.findMany({ where: { status: 'PUBLISHED' }, include: { district: true, state: true } });
//
// The response shape stays the same, so the frontend doesn't need to change.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state');
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.toLowerCase();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  let results = [...PLACES];

  if (state) results = results.filter((p) => p.stateSlug === state);
  if (category) results = results.filter((p) => p.category === category);
  if (q) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
    );
  }

  const withDistance = results.map((p) => ({
    ...p,
    distanceKm:
      lat && lng
        ? Math.round(haversineKm({ lat: parseFloat(lat), lng: parseFloat(lng) }, { lat: p.lat, lng: p.lng }))
        : null
  }));

  if (lat && lng) {
    withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  return NextResponse.json({ count: withDistance.length, places: withDistance });
}
