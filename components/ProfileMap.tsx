'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Place } from '@/lib/data/places';
import { googleMapsApiKey, loadGoogleMaps, missingGoogleMapsMessage } from '@/lib/googleMaps';

export default function ProfileMap({ saved, visited }: { saved: Place[]; visited: Place[] }) {
  const { tr } = useLanguage();
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<any[]>([]);
  const [status, setStatus] = useState('');
  const apiKey = googleMapsApiKey();

  useEffect(() => {
    if (!apiKey) {
      setStatus(missingGoogleMapsMessage('your profile map'));
      return undefined;
    }

    let disposed = false;

    loadGoogleMaps()
      .then((maps) => {
        if (disposed || !mapNodeRef.current) return;

        const all = [...saved, ...visited];
        const center = all[0] ? { lat: all[0].lat, lng: all[0].lng } : { lat: 22.5937, lng: 78.9629 };
        const map = new maps.Map(mapNodeRef.current, {
          center,
          zoom: all.length ? 6 : 4,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        const info = new maps.InfoWindow();
        markersRef.current = all.map((place) => {
          const kind = saved.some((savedPlace) => savedPlace.slug === place.slug) ? 'saved' : 'visited';
          const marker = new maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map,
            title: place.name,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: kind === 'saved' ? '#b23a2f' : '#2f6f4f',
              fillOpacity: 1,
              strokeColor: '#fdfaf1',
              strokeWeight: 3
            }
          });

          marker.addListener('click', () => {
            info.setContent(`<strong>${place.name}</strong><br/><a href="/place/${place.slug}">${tr('openDetails')}</a>`);
            info.open({ map, anchor: marker });
          });

          return marker;
        });

        setStatus(all.length ? tr('profileMapPinned') : tr('profileMapEmpty'));
      })
      .catch(() => setStatus('Could not load Google Maps.'));

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [apiKey, saved, tr, visited]);

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
