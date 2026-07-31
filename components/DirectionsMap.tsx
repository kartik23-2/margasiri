'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Feature, LineString, Point } from 'geojson';
import { ChevronLeft, LocateFixed } from 'lucide-react';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { haversineKm, type Coords } from '@/lib/geo';
import { readLastLocation, saveLastLocation } from '@/lib/lastLocation';
import { osmStyleUrl } from '@/lib/mapLibre';

interface RouteSummary {
  distanceKm: number;
  durationMin: number;
}

interface LivePositionMeta {
  accuracy: number | null;
  updatedAt: number | null;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
}

function formatTime(value: number | null) {
  if (!value) return '--';
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(value);
}

function routeUrl(origin: Coords, destination: Coords) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  return `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
}

function fitJourneyBounds(map: MapLibreMap, origin: Coords | null, destination: Coords) {
  if (!origin) {
    map.easeTo({ center: [destination.lng, destination.lat], zoom: 12 });
    return;
  }

  const bounds = new maplibregl.LngLatBounds([origin.lng, origin.lat], [origin.lng, origin.lat]);
  bounds.extend([destination.lng, destination.lat]);
  map.fitBounds(bounds, { padding: { top: 92, bottom: 300, left: 42, right: 42 }, maxZoom: 14 });
}

function upsertOriginSource(map: MapLibreMap, origin: Coords, accuracy: number | null) {
  const data = {
    type: 'Feature',
    properties: { accuracy: accuracy ?? 0 },
    geometry: { type: 'Point', coordinates: [origin.lng, origin.lat] }
  } as Feature<Point>;
  const source = map.getSource('origin') as any;

  if (source) {
    source.setData(data);
    return;
  }

  map.addSource('origin', { type: 'geojson', data });
  map.addLayer({
    id: 'origin-accuracy',
    type: 'circle',
    source: 'origin',
    paint: {
      'circle-color': '#1b2a4a',
      'circle-radius': ['interpolate', ['linear'], ['get', 'accuracy'], 0, 18, 100, 34, 500, 52],
      'circle-opacity': 0.14,
      'circle-stroke-color': '#1b2a4a',
      'circle-stroke-width': 1,
      'circle-stroke-opacity': 0.18
    }
  });
  map.addLayer({
    id: 'origin-dot',
    type: 'circle',
    source: 'origin',
    paint: {
      'circle-color': '#1b2a4a',
      'circle-radius': 8,
      'circle-stroke-color': '#fdfaf1',
      'circle-stroke-width': 3
    }
  });
}

export default function DirectionsMap({ place }: { place: Place }) {
  const { tr } = useLanguage();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [status, setStatus] = useState('Loading MapTiler map...');
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [liveMeta, setLiveMeta] = useState<LivePositionMeta>({ accuracy: null, updatedAt: null });
  const tileStyleUrl = osmStyleUrl();
  const destination = useMemo(() => ({ lat: place.lat, lng: place.lng }), [place.lat, place.lng]);

  useEffect(() => {
    setOrigin(readLastLocation());
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!tileStyleUrl) {
      setStatus(tr('mapStyleMissing'));
      return undefined;
    }

    let disposed = false;
    setMapReady(false);

    try {
      if (disposed || !nodeRef.current) return undefined;

        const map = new maplibregl.Map({
          container: nodeRef.current,
          style: tileStyleUrl,
          center: [place.lng, place.lat],
          zoom: 10
        });

        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        mapRef.current = map;

        map.on('load', () => {
          const el = document.createElement('div');
          el.className = 'h-5 w-5 rounded-full border-2 border-paper-light bg-vermillion shadow-lg';
          new maplibregl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .setPopup(new maplibregl.Popup().setHTML(`<strong>${place.name}</strong><br/>${place.district}, ${place.state}`))
            .addTo(map);

          setStatus(origin ? 'Finding route...' : 'Turn on your location to draw directions inside Margasiri.');
          setMapReady(true);
        });
    } catch {
      setStatus(tr('mapLoadFailed'));
    }

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [place.district, place.lat, place.lng, place.name, place.state, tileStyleUrl, tr]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !origin) return;

    upsertOriginSource(map, origin, liveMeta.accuracy);
  }, [liveMeta.accuracy, mapReady, origin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !origin) return;

    let disposed = false;
    setStatus('Finding route...');

    fetch(routeUrl(origin, destination))
      .then((res) => {
        if (!res.ok) throw new Error('Route request failed');
        return res.json();
      })
      .then((data) => {
        if (disposed) return;
        const route = data.routes?.[0];
        if (!route?.geometry) throw new Error('Route unavailable');

        const sourceData: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        };

        const routeSource = map.getSource('route') as any;
        if (routeSource) {
          routeSource.setData(sourceData);
        } else {
          map.addSource('route', { type: 'geojson', data: sourceData });
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#b23a2f', 'line-width': 5, 'line-opacity': 0.9 }
          });
        }

        const bounds = new maplibregl.LngLatBounds([origin.lng, origin.lat], [origin.lng, origin.lat]);
        for (const [lng, lat] of route.geometry.coordinates) bounds.extend([lng, lat]);
        bounds.extend([place.lng, place.lat]);
        map.fitBounds(bounds, { padding: { top: 92, bottom: 300, left: 42, right: 42 }, maxZoom: 13 });

        setSummary({ distanceKm: route.distance / 1000, durationMin: route.duration / 60 });
        setStatus(tracking ? 'Live journey tracking is on. Route updated from your current location.' : 'Route ready inside Margasiri.');
      })
      .catch(() => {
        const straightKm = haversineKm(origin, destination);
        const sourceData: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[origin.lng, origin.lat], [destination.lng, destination.lat]]
          }
        };

        const routeSource = map.getSource('route') as any;
        if (routeSource) {
          routeSource.setData(sourceData);
        } else {
          map.addSource('route', { type: 'geojson', data: sourceData });
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#b23a2f', 'line-width': 4, 'line-dasharray': [2, 2], 'line-opacity': 0.8 }
          });
        }

        setSummary({ distanceKm: straightKm, durationMin: straightKm * 2 });
        setStatus('Road route is unavailable right now, showing approximate distance.');
      });

    return () => {
      disposed = true;
    };
  }, [destination, mapReady, origin, place.lat, place.lng, tracking]);

  function updateLivePosition(position: GeolocationPosition) {
    const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
    saveLastLocation(coords);
    setOrigin(coords);
    setLiveMeta({
      accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
      updatedAt: Date.now()
    });
  }

  function startJourney() {
    if (!navigator.geolocation) {
      setStatus('Location is not available in this browser.');
      return;
    }

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setGeoBusy(true);
    setStatus('Starting live journey tracking...');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLivePosition(position);
        setGeoBusy(false);
        setTracking(true);
      },
      () => {
        setGeoBusy(false);
        setTracking(false);
        setStatus('Location permission was blocked. Turn it on to track your journey.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  function stopJourney() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setGeoBusy(false);
    setStatus(origin ? 'Live journey paused. Your last known location is still shown.' : 'Live journey paused.');
  }

  function recenterJourney() {
    const map = mapRef.current;
    if (!map) return;
    fitJourneyBounds(map, origin, destination);
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-indigo">
      <div ref={nodeRef} className="absolute inset-0" />

      <div className="absolute left-3 right-3 top-[max(env(safe-area-inset-top),0.75rem)] z-20 flex items-center gap-2 md:left-4 md:right-auto md:w-[430px]">
        <Link
          href={`/place/${place.slug}`}
          aria-label="Back to place"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-light text-ink shadow-xl"
        >
          <ChevronLeft size={24} />
        </Link>
        <div className="min-w-0 flex-1 rounded-full bg-paper-light px-4 py-2 text-ink shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink/45">{tracking ? 'Live journey' : tr('directions')}</p>
          <p className="truncate text-sm font-semibold">{place.name}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={recenterJourney}
        className="absolute bottom-[330px] right-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-paper-light text-ink shadow-xl md:bottom-8"
        aria-label="Recenter map"
      >
        <LocateFixed size={22} />
      </button>

      <section className="absolute inset-x-0 bottom-0 z-20 rounded-t-[28px] border border-black/10 bg-paper-light/95 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-ink shadow-2xl backdrop-blur md:inset-auto md:left-4 md:top-20 md:w-[430px] md:rounded-2xl md:p-4">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-black/15 md:hidden" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest opacity-50">To</p>
            <h1 className="truncate font-display text-2xl leading-tight md:text-3xl">{place.name}</h1>
            <p className="mt-0.5 truncate text-xs opacity-65">{place.district}, {place.state}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-paper-light ${tracking ? 'bg-pine' : 'bg-indigo'}`}>
            {tracking ? 'Live' : 'MapTiler'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Distance</p>
            <p className="font-mono text-lg font-semibold">{summary ? `${summary.distanceKm.toFixed(1)} km` : '--'}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Time</p>
            <p className="font-mono text-lg font-semibold">{summary ? formatDuration(summary.durationMin) : '--'}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Accuracy</p>
            <p className="font-mono text-sm font-semibold">{liveMeta.accuracy ? `${Math.round(liveMeta.accuracy)} m` : '--'}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Updated</p>
            <p className="font-mono text-sm font-semibold">{formatTime(liveMeta.updatedAt)}</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed opacity-70">{status}</p>
        <button
          type="button"
          onClick={tracking ? stopJourney : startJourney}
          disabled={geoBusy}
          className={`mt-4 h-14 w-full rounded-2xl px-4 text-base font-bold text-paper-light shadow-lg disabled:opacity-60 ${tracking ? 'bg-indigo' : 'bg-vermillion'}`}
        >
          {geoBusy ? 'Getting location...' : tracking ? 'Stop journey' : 'Start journey'}
        </button>
      </section>
    </main>
  );
}
