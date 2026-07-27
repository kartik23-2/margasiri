'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Place } from '@/lib/data/places';
import { haversineKm, type Coords } from '@/lib/geo';
import JourneyStepsSheet, { type JourneyStep } from '@/components/JourneyStepsSheet';

declare global {
  interface Window {
    mapboxgl?: any;
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

const MAPBOX_CSS = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css';
const MAPBOX_JS = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js';
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
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function distanceToRouteMeters(point: Coords, coordinates: [number, number][]) {
  if (coordinates.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 0; i < coordinates.length - 1; i += 1) {
    min = Math.min(min, metersToSegment(point, coordinates[i], coordinates[i + 1]));
  }
  return min;
}

function loadMapbox() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);

  return new Promise<any>((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPBOX_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPBOX_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPBOX_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.mapboxgl));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = MAPBOX_JS;
    script.async = true;
    script.onload = () => resolve(window.mapboxgl);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function brandMapStyle(): any {
  return {
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: {
      composite: {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8'
      }
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#efe6cf' } },
      { id: 'landuse', type: 'fill', source: 'composite', 'source-layer': 'landuse', paint: { 'fill-color': '#d9dcc5', 'fill-opacity': 0.5 } },
      { id: 'water', type: 'fill', source: 'composite', 'source-layer': 'water', paint: { 'fill-color': '#8db8bd' } },
      { id: 'roads', type: 'line', source: 'composite', 'source-layer': 'road', paint: { 'line-color': '#f7f1de', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 14, 5] } },
      { id: 'major-roads', type: 'line', source: 'composite', 'source-layer': 'road', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]], paint: { 'line-color': '#c0392f', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 14, 6], 'line-opacity': 0.55 } },
      { id: 'place-labels', type: 'symbol', source: 'composite', 'source-layer': 'place_label', layout: { 'text-field': ['get', 'name'], 'text-size': 12 }, paint: { 'text-color': '#17264a', 'text-halo-color': '#efe6cf', 'text-halo-width': 1.2 } }
    ]
  };
}

export default function JourneyMap({ place }: Props) {
  const router = useRouter();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
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
    if (!token) return;

    setStatus('Calculating route inside Margasiri...');
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`);
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('steps', 'true');
    url.searchParams.set('overview', 'full');
    url.searchParams.set('access_token', token);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Directions request failed');
    const data = await res.json();
    const firstRoute = data.routes?.[0];
    const leg = firstRoute?.legs?.[0];
    if (!firstRoute || !leg) throw new Error('No route found');

    const nextRoute: RouteState = {
      coordinates: firstRoute.geometry.coordinates,
      distance: firstRoute.distance,
      duration: firstRoute.duration,
      steps: leg.steps.map((step: any) => ({
        instruction: step.maneuver?.instruction ?? 'Continue',
        distance: step.distance ?? 0,
        duration: step.duration ?? 0,
        location: step.maneuver?.location ?? [origin.lng, origin.lat]
      }))
    };

    routeRef.current = nextRoute;
    setRoute(nextRoute);
    setActiveStepIndex(0);
    drawRoute(nextRoute);
    setStatus('Journey running. Keep this screen open for live turn-by-turn guidance.');
  }, [destination.lat, destination.lng, drawRoute, token]);

  const updateMarker = useCallback((coords: Coords, heading?: number | null) => {
    const mapboxgl = window.mapboxgl;
    const map = mapRef.current;
    if (!mapboxgl || !map) return;

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'h-5 w-5 rounded-full border-[3px] border-white bg-vermillion shadow-lg';
      markerRef.current = new mapboxgl.Marker({ element: el, rotationAlignment: 'map' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
    }

    const marker = markerRef.current;
    const start = marker.getLngLat();
    const startTime = performance.now();
    const duration = 800;

    function frame(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      const lng = start.lng + (coords.lng - start.lng) * t;
      const lat = start.lat + (coords.lat - start.lat) * t;
      marker.setLngLat([lng, lat]);
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
    if (!token) {
      setStatus('Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to enable in-app turn-by-turn navigation.');
      return undefined;
    }

    let disposed = false;
    loadMapbox()
      .then((mapboxgl) => {
        if (disposed || !mapNodeRef.current) return;
        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: mapNodeRef.current,
          style: brandMapStyle(),
          center: [destination.lng, destination.lat],
          zoom: 11,
          pitch: 35,
          attributionControl: false
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
        mapRef.current = map;

        map.on('load', () => {
          const el = document.createElement('div');
          el.className = 'h-7 w-7 rounded-full border-[3px] border-paper-light bg-pine shadow-lg';
          destinationMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([destination.lng, destination.lat])
            .addTo(map);
          setStatus('Tap Start Journey to request GPS and calculate your route.');
        });
      })
      .catch(() => setStatus('Map could not load. Check network access or the Mapbox token.'));

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
  }, [destination.lat, destination.lng, token]);

  function startJourney() {
    if (!token) {
      setStatus('Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN before starting live journeys.');
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
          setStatus('Could not calculate a route. Check the Mapbox token, network, or destination coverage.');
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
        <button
          type="button"
          onClick={endJourney}
          className="rounded-full bg-paper-light px-4 py-3 text-sm font-semibold text-indigo shadow-lg"
        >
          End
        </button>
      </div>

      {!tracking && (
        <div className="absolute inset-x-4 top-32 z-20 mx-auto max-w-sm rounded-2xl border border-paper/20 bg-paper-light p-5 text-ink shadow-2xl">
          <p className="text-xs uppercase tracking-widest opacity-50">In-app navigation</p>
          <h2 className="mt-2 text-2xl font-semibold">Start Journey</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-75">
            Margasiri will request GPS, draw the route here, and keep turn-by-turn guidance inside this screen.
          </p>
          <button
            type="button"
            onClick={startJourney}
            className="mt-5 w-full rounded-lg bg-vermillion px-4 py-3 text-sm font-semibold text-white"
          >
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
