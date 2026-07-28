'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Place } from '@/lib/data/places';
import { haversineKm, type Coords } from '@/lib/geo';
import { MAPLIBRE_CSS, MAPLIBRE_JS, missingTileProviderMessage, osmStyleUrl } from '@/lib/mapLibre';
import JourneyStepsSheet, { type JourneyStep } from '@/components/JourneyStepsSheet';

declare global {
  interface Window {
    maplibregl?: any;
  }
}

interface Props {
  place: Place;
}

interface RouteState {
  coordinates: [number, number][];
  steps: JourneyStep[];
  distance: number;
  duration: number;
}

const ARRIVAL_METERS = 100;
const REROUTE_METERS = 50;

function toMeters(km: number) {
  return km * 1000;
}

function bearing(from: Coords, to: Coords) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const toDeg = (value: number) => (value * 180) / Math.PI;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function metersToSegment(point: Coords, a: [number, number], b: [number, number]) {
  const latScale = 111320;
  const lngScale = 111320 * Math.cos((point.lat * Math.PI) / 180);
  const px = point.lng * lngScale;
  const py = point.lat * latScale;
  const ax = a[0] * lngScale;
  const ay = a[1] * latScale;
  const bx = b[0] * lngScale;
  const by = b[1] * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distanceToRouteMeters(point: Coords, coordinates: [number, number][]) {
  if (coordinates.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 0; i < coordinates.length - 1; i += 1) {
    min = Math.min(min, metersToSegment(point, coordinates[i], coordinates[i + 1]));
  }
  return min;
}

function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);

  return new Promise<any>((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPLIBRE_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPLIBRE_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.maplibregl));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.onload = () => resolve(window.maplibregl);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function JourneyMap({ place }: Props) {
  const router = useRouter();
  const tileStyleUrl = osmStyleUrl();
  const destination = useMemo(() => ({ lat: place.lat, lng: place.lng }), [place.lat, place.lng]);
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<Coords | null>(null);
  const routeRef = useRef<RouteState | null>(null);
  const rerouteAtRef = useRef(0);
  const [position, setPosition] = useState<Coords | null>(null);
  const [route, setRoute] = useState<RouteState | null>(null);
  const [status, setStatus] = useState('Preparing live journey...');
  const [tracking, setTracking] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const endJourney = useCallback(() => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    mapRef.current?.remove();
    mapRef.current = null;
    router.push(`/place/${place.slug}`);
  }, [place.slug, router]);

  const drawRoute = useCallback((nextRoute: RouteState) => {
    const map = mapRef.current;
    if (!map) return;

    const data = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: nextRoute.coordinates }
    };

    if (map.getSource('journey-route')) {
      map.getSource('journey-route').setData(data);
      return;
    }

    map.addSource('journey-route', { type: 'geojson', data });
    map.addLayer({
      id: 'journey-route-line',
      type: 'line',
      source: 'journey-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#c0392f', 'line-width': 6, 'line-opacity': 0.92 }
    });
  }, []);

  const fetchRoute = useCallback(async (origin: Coords) => {
    setStatus('Calculating route inside Margasiri...');
    const res = await fetch('/api/journey/route', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ origin, destination })
    });
    if (!res.ok) throw new Error('Directions request failed');

    const data = await res.json();
    const nextRoute: RouteState = {
      coordinates: data.coordinates ?? [],
      distance: data.distance ?? 0,
      duration: data.duration ?? 0,
      steps: data.steps ?? []
    };

    routeRef.current = nextRoute;
    setRoute(nextRoute);
    setActiveStepIndex(0);
    drawRoute(nextRoute);
    setStatus('Journey running. Keep this screen open for live turn-by-turn guidance.');
  }, [destination, drawRoute]);

  const updateMarker = useCallback((coords: Coords, heading?: number | null) => {
    const maplibregl = window.maplibregl;
    const map = mapRef.current;
    if (!maplibregl || !map) return;

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'h-5 w-5 rounded-full border-[3px] border-white bg-vermillion shadow-lg';
      markerRef.current = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
    }

    const marker = markerRef.current;
    const start = marker.getLngLat();
    const startTime = performance.now();
    const duration = 800;

    function frame(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      marker.setLngLat([start.lng + (coords.lng - start.lng) * t, start.lat + (coords.lat - start.lat) * t]);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    map.easeTo({
      center: [coords.lng, coords.lat],
      bearing: heading ?? map.getBearing(),
      pitch: 52,
      zoom: Math.max(map.getZoom(), 14),
      duration: 700
    });
  }, []);

  const handlePosition = useCallback((geoPosition: GeolocationPosition) => {
    const coords = { lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude };
    const last = lastPositionRef.current;
    const heading = Number.isFinite(geoPosition.coords.heading)
      ? geoPosition.coords.heading
      : last
        ? bearing(last, coords)
        : null;

    lastPositionRef.current = coords;
    setPosition(coords);
    updateMarker(coords, heading);

    const destinationMeters = toMeters(haversineKm(coords, destination));
    if (destinationMeters <= ARRIVAL_METERS) {
      setArrived(true);
      setStatus(`You are within ${Math.round(destinationMeters)} m of ${place.name}.`);
    }

    const currentRoute = routeRef.current;
    if (currentRoute) {
      let closestStep = 0;
      let closestDistance = Infinity;
      currentRoute.steps.forEach((step, index) => {
        const meters = toMeters(haversineKm(coords, { lat: step.location[1], lng: step.location[0] }));
        if (meters < closestDistance) {
          closestDistance = meters;
          closestStep = index;
        }
      });
      setActiveStepIndex(Math.min(closestStep + (closestDistance < 35 ? 1 : 0), Math.max(0, currentRoute.steps.length - 1)));

      const offRouteMeters = distanceToRouteMeters(coords, currentRoute.coordinates);
      if (offRouteMeters > REROUTE_METERS && Date.now() - rerouteAtRef.current > 15000) {
        rerouteAtRef.current = Date.now();
        fetchRoute(coords).catch(() => setStatus('Route recalculation failed. Still tracking your live position.'));
      }
    }
  }, [destination, fetchRoute, place.name, updateMarker]);

  useEffect(() => {
    if (!tileStyleUrl) {
      setStatus(missingTileProviderMessage('in-app turn-by-turn navigation'));
      return undefined;
    }

    let disposed = false;
    // MapLibre GL JS is the open-source fork of Mapbox GL JS. It keeps the
    // vector-tile, marker, camera, and route-layer APIs close to the old code.
    loadMapLibre()
      .then((maplibregl) => {
        if (disposed || !mapNodeRef.current) return;

        const map = new maplibregl.Map({
          container: mapNodeRef.current,
          style: tileStyleUrl,
          center: [destination.lng, destination.lat],
          zoom: 11,
          pitch: 35,
          attributionControl: true
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
        mapRef.current = map;

        map.on('load', () => {
          const el = document.createElement('div');
          el.className = 'h-7 w-7 rounded-full border-[3px] border-paper-light bg-pine shadow-lg';
          destinationMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([destination.lng, destination.lat])
            .addTo(map);
          setStatus('Tap Start Journey to request GPS and calculate your OSRM route.');
        });
      })
      .catch(() => setStatus('Map could not load. Check network access or the OSM tile style URL.'));

    return () => {
      disposed = true;
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      destinationMarkerRef.current?.remove();
      markerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [destination.lat, destination.lng, tileStyleUrl]);

  function startJourney() {
    if (!tileStyleUrl) {
      setStatus(missingTileProviderMessage('live journeys'));
      return;
    }
    if (!navigator.geolocation) {
      setStatus('GPS is not available in this browser.');
      return;
    }

    setStatus('Requesting your current location...');
    navigator.geolocation.getCurrentPosition(
      async (firstPosition) => {
        setTracking(true);
        handlePosition(firstPosition);
        try {
          await fetchRoute({ lat: firstPosition.coords.latitude, lng: firstPosition.coords.longitude });
        } catch {
          setStatus('Could not calculate a route. Check OSRM server health, network, or destination coverage.');
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePosition,
          () => {
            setTracking(false);
            setStatus('Live tracking stopped because GPS permission or signal was unavailable.');
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 }
        );
      },
      () => setStatus('Location permission was denied. Allow location access to start in-app navigation.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  const remainingDistance = position ? toMeters(haversineKm(position, destination)) : route?.distance ?? null;
  const remainingDuration = route && remainingDistance != null ? Math.max(60, route.duration * (remainingDistance / Math.max(route.distance, 1))) : null;
  const nextStep = route?.steps[activeStepIndex];
  const distanceToNextTurn = position && nextStep
    ? toMeters(haversineKm(position, { lat: nextStep.location[1], lng: nextStep.location[0] }))
    : null;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-indigo text-paper-light">
      <div ref={mapNodeRef} className="absolute inset-0" />

      <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-3">
        <div className="max-w-[calc(100%-5rem)] rounded-xl border border-paper/20 bg-indigo/90 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-paper/60">Journey to</p>
          <h1 className="truncate text-lg font-semibold">{place.name}</h1>
          <p className="mt-1 text-xs text-paper/75">{status}</p>
        </div>
        <button type="button" onClick={endJourney} className="rounded-full bg-paper-light px-4 py-3 text-sm font-semibold text-indigo shadow-lg">
          End
        </button>
      </div>

      {!tracking && (
        <div className="absolute inset-x-4 top-32 z-20 mx-auto max-w-sm rounded-2xl border border-paper/20 bg-paper-light p-5 text-ink shadow-2xl">
          <p className="text-xs uppercase tracking-widest opacity-50">In-app navigation</p>
          <h2 className="mt-2 text-2xl font-semibold">Start Journey</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-75">
            Margasiri will request GPS, draw an OSRM route here, and keep turn-by-turn guidance inside this screen. Durations are not traffic-aware.
          </p>
          <button type="button" onClick={startJourney} className="mt-5 w-full rounded-lg bg-vermillion px-4 py-3 text-sm font-semibold text-white">
            Start Journey
          </button>
        </div>
      )}

      <JourneyStepsSheet
        steps={route?.steps ?? []}
        activeStepIndex={activeStepIndex}
        remainingDistance={remainingDistance}
        remainingDuration={remainingDuration}
        distanceToNextTurn={distanceToNextTurn}
        arrived={arrived}
        onEnd={endJourney}
      />
    </main>
  );
}
