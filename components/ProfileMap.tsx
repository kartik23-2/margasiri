'use client';

import { useEffect, useRef, useState } from 'react';
import type { Place } from '@/lib/data/places';

declare global {
  interface Window {
    mapboxgl?: any;
  }
}

const MAPBOX_CSS = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css';
const MAPBOX_JS = 'https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js';

function loadMapbox() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);

  return new Promise<any>((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPBOX_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPBOX_CSS;
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = MAPBOX_JS;
    script.async = true;
    script.onload = () => resolve(window.mapboxgl);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function mapStyle(): any {
  return {
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: {
      composite: { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' }
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#e9e0c9' } },
      { id: 'water', type: 'fill', source: 'composite', 'source-layer': 'water', paint: { 'fill-color': '#8db8bd' } },
      { id: 'roads', type: 'line', source: 'composite', 'source-layer': 'road', paint: { 'line-color': '#fdfaf1', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 14, 5] } },
      { id: 'labels', type: 'symbol', source: 'composite', 'source-layer': 'place_label', layout: { 'text-field': ['get', 'name'], 'text-size': 12 }, paint: { 'text-color': '#1b2a4a', 'text-halo-color': '#e9e0c9', 'text-halo-width': 1 } }
    ]
  };
}

export default function ProfileMap({ saved, visited }: { saved: Place[]; visited: Place[] }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState('Loading your map...');
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token) {
      setStatus('Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to render My Map.');
      return undefined;
    }

    let disposed = false;
    loadMapbox().then((mapboxgl) => {
      if (disposed || !mapNodeRef.current) return;
      mapboxgl.accessToken = token;

      const all = [...saved, ...visited];
      const center = all[0] ? [all[0].lng, all[0].lat] : [78.9629, 22.5937];
      const map = new mapboxgl.Map({
        container: mapNodeRef.current,
        style: mapStyle(),
        center,
        zoom: all.length ? 6 : 4,
        attributionControl: false
      });
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      mapRef.current = map;

      map.on('load', () => {
        const addPin = (place: Place, kind: 'saved' | 'visited') => {
          const el = document.createElement('div');
          el.className = `h-5 w-5 rounded-full border-[3px] border-paper-light shadow-lg ${kind === 'saved' ? 'bg-vermillion' : 'bg-pine'}`;
          new mapboxgl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>${place.name}</strong><br/><a href="/place/${place.slug}">Open place</a>`))
            .addTo(map);
        };

        saved.forEach((place) => addPin(place, 'saved'));
        visited.forEach((place) => addPin(place, 'visited'));
        setStatus(all.length ? 'Saved and visited places are pinned.' : 'Save or mark places visited to build your map.');
      });
    }).catch(() => setStatus('Could not load the map.'));

    return () => {
      disposed = true;
      mapRef.current?.remove();
    };
  }, [saved, token, visited]);

  return (
    <div className="relative h-[calc(100vh-65px)] bg-indigo">
      <div ref={mapNodeRef} className="absolute inset-0" />
      <div className="absolute left-4 top-4 z-10 rounded-xl bg-paper-light px-4 py-3 text-sm text-ink shadow">
        <p className="font-semibold">My Map</p>
        <p className="mt-1 text-xs opacity-70">{status}</p>
        <div className="mt-3 flex gap-3 text-xs">
          <span><span className="inline-block h-2.5 w-2.5 rounded-full bg-vermillion" /> Saved</span>
          <span><span className="inline-block h-2.5 w-2.5 rounded-full bg-pine" /> Visited</span>
        </div>
      </div>
    </div>
  );
}
