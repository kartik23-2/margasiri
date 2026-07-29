'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { MAPLIBRE_CSS, MAPLIBRE_JS, osmStyleUrl } from '@/lib/mapLibre';

declare global {
  interface Window {
    maplibregl?: any;
  }
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

export default function ProfileMap({ saved, visited }: { saved: Place[]; visited: Place[] }) {
  const { tr } = useLanguage();
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState('');
  const tileStyleUrl = osmStyleUrl();

  useEffect(() => {
    if (!tileStyleUrl) {
      setStatus(tr('mapStyleMissing'));
      return undefined;
    }

    let disposed = false;
    loadMapLibre().then((maplibregl) => {
      if (disposed || !mapNodeRef.current) return;

      const all = [...saved, ...visited];
      const center = all[0] ? [all[0].lng, all[0].lat] : [78.9629, 22.5937];
      const map = new maplibregl.Map({
        container: mapNodeRef.current,
        style: tileStyleUrl,
        center,
        zoom: all.length ? 6 : 4,
        attributionControl: true
      });
      map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
      mapRef.current = map;

      map.on('load', () => {
        const addPin = (place: Place, kind: 'saved' | 'visited') => {
          const el = document.createElement('div');
          el.className = `h-5 w-5 rounded-full border-[3px] border-paper-light shadow-lg ${kind === 'saved' ? 'bg-vermillion' : 'bg-pine'}`;
          new maplibregl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .setPopup(new maplibregl.Popup().setHTML(`<strong>${place.name}</strong><br/><a href="/place/${place.slug}">${tr('openDetails')}</a>`))
            .addTo(map);
        };

        saved.forEach((place) => addPin(place, 'saved'));
        visited.forEach((place) => addPin(place, 'visited'));
        setStatus(all.length ? tr('profileMapPinned') : tr('profileMapEmpty'));
      });
    }).catch(() => setStatus(tr('mapLoadFailed')));

    return () => {
      disposed = true;
      mapRef.current?.remove();
    };
  }, [saved, tileStyleUrl, tr, visited]);

  return (
    <div className="relative h-[calc(100vh-65px)] bg-indigo">
      <div ref={mapNodeRef} className="absolute inset-0" />
      <div className="absolute left-4 top-4 z-10 rounded-xl bg-paper-light px-4 py-3 text-sm text-ink shadow">
        <p className="font-semibold">{tr('myMap')}</p>
        <p className="mt-1 text-xs opacity-70">{status || tr('loadingMap')}</p>
        <div className="mt-3 flex gap-3 text-xs">
          <span><span className="inline-block h-2.5 w-2.5 rounded-full bg-vermillion" /> {tr('saved')}</span>
          <span><span className="inline-block h-2.5 w-2.5 rounded-full bg-pine" /> {tr('visited')}</span>
        </div>
      </div>
    </div>
  );
}
