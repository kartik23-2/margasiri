'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Feature, LineString, Point } from 'geojson';
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

function formatDuration(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
}

function routeUrl(origin: Coords, destination: Coords) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  return `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
}

export default function DirectionsMap({ place }: { place: Place }) {
  const { tr } = useLanguage();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [status, setStatus] = useState('Loading MapTiler map...');
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const tileStyleUrl = osmStyleUrl();
  const destination = useMemo(() => ({ lat: place.lat, lng: place.lng }), [place.lat, place.lng]);

  useEffect(() => {
    setOrigin(readLastLocation());
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

        const originSource = map.getSource('origin') as any;
        if (!originSource) {
          map.addSource('origin', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [origin.lng, origin.lat] } } as Feature<Point>
          });
          map.addLayer({
            id: 'origin-dot',
            type: 'circle',
            source: 'origin',
            paint: {
              'circle-color': '#1b2a4a',
              'circle-radius': 7,
              'circle-stroke-color': '#fdfaf1',
              'circle-stroke-width': 2
            }
          });
        } else {
          originSource.setData({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [origin.lng, origin.lat] } } as Feature<Point>);
        }

        const bounds = new maplibregl.LngLatBounds([origin.lng, origin.lat], [origin.lng, origin.lat]);
        for (const [lng, lat] of route.geometry.coordinates) bounds.extend([lng, lat]);
        bounds.extend([place.lng, place.lat]);
        map.fitBounds(bounds, { padding: 64, maxZoom: 13 });

        setSummary({ distanceKm: route.distance / 1000, durationMin: route.duration / 60 });
        setStatus('Route ready inside Margasiri.');
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
  }, [destination, mapReady, origin, place.lat, place.lng]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus('Location is not available in this browser.');
      return;
    }

    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        saveLastLocation(coords);
        setOrigin(coords);
        setGeoBusy(false);
      },
      () => {
        setGeoBusy(false);
        setStatus('Location permission was blocked. Turn it on to draw the route.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-indigo">
      <div ref={nodeRef} className="absolute inset-0" />

      <section className="absolute left-4 right-4 top-4 z-10 max-w-md rounded-2xl border border-black/10 bg-paper-light/95 p-4 text-ink shadow-xl backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href={`/place/${place.slug}`} className="text-xs font-semibold text-vermillion">
            Back to place
          </Link>
          <span className="rounded-full bg-indigo px-2 py-1 text-[10px] uppercase tracking-wide text-paper-light">MapTiler</span>
        </div>
        <p className="text-xs uppercase tracking-widest opacity-50">{tr('directions')}</p>
        <h1 className="font-display text-3xl leading-tight">{place.name}</h1>
        <p className="mt-1 text-xs opacity-65">{place.district}, {place.state}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Distance</p>
            <p className="font-mono text-sm font-semibold">{summary ? `${summary.distanceKm.toFixed(1)} km` : '--'}</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-paper p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-50">Time</p>
            <p className="font-mono text-sm font-semibold">{summary ? formatDuration(summary.durationMin) : '--'}</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed opacity-70">{status}</p>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={geoBusy}
          className="mt-4 w-full rounded-xl bg-vermillion px-4 py-3 text-sm font-semibold text-paper-light disabled:opacity-60"
        >
          {geoBusy ? 'Getting location...' : origin ? 'Refresh current location' : 'Use my current location'}
        </button>
      </section>
    </main>
  );
}
