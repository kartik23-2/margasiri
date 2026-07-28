import { NextResponse } from 'next/server';

type OsrmStep = {
  distance?: number;
  duration?: number;
  name?: string;
  maneuver?: {
    type?: string;
    modifier?: string;
    instruction?: string;
    location?: [number, number];
  };
};

function cleanBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function osrmInstruction(step: OsrmStep) {
  if (step.maneuver?.instruction) return step.maneuver.instruction;

  const road = step.name ? ` onto ${step.name}` : '';
  const modifier = step.maneuver?.modifier ? ` ${step.maneuver.modifier.replaceAll('_', ' ')}` : '';

  switch (step.maneuver?.type) {
    case 'depart':
      return `Start${road}`;
    case 'arrive':
      return 'Arrive at destination';
    case 'turn':
    case 'new name':
    case 'continue':
      return `Continue${modifier}${road}`;
    case 'roundabout':
    case 'rotary':
      return `Enter the roundabout${road}`;
    case 'merge':
      return `Merge${modifier}${road}`;
    case 'on ramp':
      return `Take the ramp${road}`;
    case 'off ramp':
      return `Take the exit${road}`;
    case 'fork':
      return `Keep${modifier}${road}`;
    case 'end of road':
      return `At the end of the road, turn${modifier}${road}`;
    default:
      return road ? `Continue${road}` : 'Continue';
  }
}

export async function POST(request: Request) {
  const osrmServerUrl = process.env.OSRM_SERVER_URL;
  if (!osrmServerUrl) {
    return NextResponse.json({ error: 'OSRM_SERVER_URL is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const origin = body?.origin;
  const destination = body?.destination;

  if (
    !Number.isFinite(origin?.lat) ||
    !Number.isFinite(origin?.lng) ||
    !Number.isFinite(destination?.lat) ||
    !Number.isFinite(destination?.lng)
  ) {
    return NextResponse.json({ error: 'origin and destination coordinates are required.' }, { status: 400 });
  }

  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = new URL(`${cleanBaseUrl(osrmServerUrl)}/route/v1/driving/${coordinates}`);
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('steps', 'true');

  const response = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) {
    return NextResponse.json({ error: 'OSRM route request failed.' }, { status: response.status });
  }

  const data = await response.json();
  const firstRoute = data.routes?.[0];
  const leg = firstRoute?.legs?.[0];
  if (!firstRoute || !leg) {
    return NextResponse.json({ error: 'No route found.' }, { status: 404 });
  }

  return NextResponse.json({
    coordinates: firstRoute.geometry?.coordinates ?? [],
    distance: firstRoute.distance ?? 0,
    duration: firstRoute.duration ?? 0,
    steps: (leg.steps ?? []).map((step: OsrmStep) => ({
      instruction: osrmInstruction(step),
      distance: step.distance ?? 0,
      duration: step.duration ?? 0,
      location: step.maneuver?.location ?? [origin.lng, origin.lat],
      maneuverType: step.maneuver?.type ?? 'continue',
      modifier: step.maneuver?.modifier ?? null,
      roadName: step.name ?? ''
    }))
  });
}
